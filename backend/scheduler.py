import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def run_full_scan(db: Session):
    """Run a full health scan on all accounts and return a summary."""
    from models import (
        Account,
        UsageMetric,
        HealthScore,
        Anomaly,
        ActivityEvent,
        Alert,
        Company,
        RenewalNotificationSettings,
    )
    from scoring import compute_health_score, get_state
    from anomaly import detect_anomalies
    try:
        from ai_engine import generate_anomaly_explanation, generate_outreach_draft, executor_decide
        ai_available = True
    except Exception as e:
        logger.warning(f"AI engine unavailable, using fallback text: {e}")
        ai_available = False

    logger.info("Starting full scan...")
    summary = {
        "accounts_scanned": 0,
        "health_scores_created": 0,
        "health_scores_updated": 0,
        "anomalies_created": 0,
        "anomalies_skipped_recent": 0,
        "alerts_created": 0,
        "renewal_alerts_created": 0,
        "outreach_auto_sent": 0,
        "scan_completed_at": None,
    }

    company = db.query(Company).first()
    if not company:
        logger.warning("No company found, skipping scan")
        summary["scan_completed_at"] = datetime.now().isoformat(timespec="seconds")
        return summary

    weights = {
        "engagement": company.weight_engagement,
        "adoption": company.weight_adoption,
        "health": company.weight_health,
        "support": company.weight_support,
    }

    accounts = db.query(Account).all()
    today = datetime.now().date().isoformat()

    # Compute and upsert health scores
    account_scores = {}
    for account in accounts:
        summary["accounts_scanned"] += 1
        raw_metrics = (
            db.query(UsageMetric)
            .filter(UsageMetric.account_id == account.id)
            .order_by(UsageMetric.date)
            .all()
        )
        metrics_dicts = [
            {
                "dau": m.dau,
                "wau": m.wau,
                "mau": m.mau,
                "active_seats": m.active_seats,
                "feature_count": m.feature_count,
                "api_calls": m.api_calls,
                "support_tickets": m.support_tickets,
                "logins": m.logins,
            }
            for m in raw_metrics
        ]

        score = compute_health_score(metrics_dicts, account.seats, weights)
        account_scores[account.id] = {
            "score": score,
            "metrics": metrics_dicts,
            "account": account,
        }

        # Upsert health score
        existing = (
            db.query(HealthScore)
            .filter(HealthScore.account_id == account.id, HealthScore.date == today)
            .first()
        )
        if existing:
            summary["health_scores_updated"] += 1
            existing.composite = score["composite"]
            existing.engagement_score = score["engagement_score"]
            existing.adoption_score = score["adoption_score"]
            existing.health_score = score["health_score"]
            existing.support_score = score["support_score"]
            existing.trend_delta = score["trend_delta"]
        else:
            summary["health_scores_created"] += 1
            hs = HealthScore(
                account_id=account.id,
                date=today,
                composite=score["composite"],
                engagement_score=score["engagement_score"],
                adoption_score=score["adoption_score"],
                health_score=score["health_score"],
                support_score=score["support_score"],
                trend_delta=score["trend_delta"],
            )
            db.add(hs)
    db.commit()

    peer_scores = [d["score"]["composite"] for d in account_scores.values()]
    renewal_settings = db.query(RenewalNotificationSettings).first()
    notification_enabled = bool(renewal_settings and renewal_settings.enabled)
    lead_times = set()
    if renewal_settings:
        if renewal_settings.notify_90_days:
            lead_times.add(90)
        if renewal_settings.notify_30_days:
            lead_times.add(30)
        if renewal_settings.notify_14_days:
            lead_times.add(14)
        if renewal_settings.notify_7_days:
            lead_times.add(7)

    for account in accounts:
        if not notification_enabled or not lead_times or not account.renewal_date:
            continue

        try:
            renewal_date = datetime.fromisoformat(account.renewal_date).date()
        except ValueError:
            continue

        days_until_renewal = (renewal_date - datetime.now().date()).days
        if days_until_renewal < 0 or days_until_renewal not in lead_times:
            continue

        existing_renewal_alert = (
            db.query(Alert)
            .filter(
                Alert.account_id == account.id,
                Alert.alert_type == "renewal_reminder",
                Alert.resolved.is_(False),
            )
            .first()
        )
        if existing_renewal_alert:
            continue

        db.add(Alert(
            account_id=account.id,
            alert_type="renewal_reminder",
            message=(
                f"{account.name} renewal is in {days_until_renewal} days "
                f"({renewal_date.isoformat()})."
            ),
            severity="medium" if days_until_renewal > 14 else "high",
        ))
        summary["renewal_alerts_created"] += 1

    db.commit()

    # Detect anomalies and generate AI content
    for account in accounts:
        data = account_scores[account.id]
        score = data["score"]
        metrics = data["metrics"]

        # Skip if anomaly already detected in last 12 hours
        existing_anomaly = (
            db.query(Anomaly)
            .filter(
                Anomaly.account_id == account.id,
                Anomaly.detected_at >= datetime.now() - timedelta(hours=12),
            )
            .first()
        )
        if existing_anomaly:
            summary["anomalies_skipped_recent"] += 1
            continue

        account_data = {
            "composite": score["composite"],
            "seats": account.seats,
            "metrics": metrics,
        }
        anomaly_info = detect_anomalies(account_data, peer_scores)

        if not anomaly_info:
            continue

        recent_metrics = metrics[-30:] if len(metrics) >= 30 else metrics
        avg_dau = sum(m["dau"] for m in recent_metrics) / max(len(recent_metrics), 1)
        avg_api = sum(m["api_calls"] for m in recent_metrics) / max(len(recent_metrics), 1)
        avg_active = sum(m["active_seats"] for m in recent_metrics) / max(len(recent_metrics), 1)
        avg_features = sum(m["feature_count"] for m in recent_metrics) / max(len(recent_metrics), 1)

        metrics_summary = {
            "avg_dau": avg_dau,
            "avg_api_calls": avg_api,
            "active_seats": avg_active,
            "total_seats": account.seats,
            "feature_count": avg_features,
        }

        renewal_days = None
        if account.renewal_date:
            renewal_date = datetime.fromisoformat(account.renewal_date).date()
            renewal_days = (renewal_date - datetime.now().date()).days

        explanation = (
            f"Anomaly detected: {anomaly_info['pattern']} pattern "
            f"with {anomaly_info['severity']} severity."
        )
        if ai_available:
            try:
                explanation = generate_anomaly_explanation(
                    account.name,
                    anomaly_info["pattern"],
                    anomaly_info["severity"],
                    metrics_summary,
                    anomaly_info.get("z_score"),
                    anomaly_info.get("delta_from_peer"),
                )
            except Exception as e:
                logger.error(f"Explanation generation failed for {account.name}: {e}")

        outreach_draft = (
            f"Subject: Checking in on {account.name}\n\n"
            f"Hi team, I wanted to reach out to see how things are going."
        )
        if ai_available:
            try:
                outreach_draft = generate_outreach_draft(
                    account.name,
                    anomaly_info["pattern"],
                    anomaly_info["severity"],
                    account.csm_name or "Your CSM",
                    metrics_summary,
                    renewal_days,
                )
            except Exception as e:
                logger.error(f"Outreach generation failed for {account.name}: {e}")

        outreach_status = "pending"
        if company.autonomy_mode == "executor" and ai_available:
            try:
                decision = executor_decide(
                    account.name,
                    anomaly_info["pattern"],
                    anomaly_info["severity"],
                    company.autonomy_mode,
                    outreach_draft,
                )
                if decision.get("action") == "send":
                    outreach_status = "sent"
            except Exception as e:
                logger.error(f"Executor decision failed for {account.name}: {e}")

        anomaly = Anomaly(
            account_id=account.id,
            pattern=anomaly_info["pattern"],
            severity=anomaly_info["severity"],
            explanation=explanation,
            outreach_draft=outreach_draft,
            outreach_status=outreach_status,
            z_score=anomaly_info.get("z_score"),
            delta_from_peer=anomaly_info.get("delta_from_peer"),
        )
        db.add(anomaly)
        summary["anomalies_created"] += 1

        db.add(ActivityEvent(
            account_id=account.id,
            event_type="anomaly_detected",
            description=(
                f"Anomaly detected: {anomaly_info['pattern']} "
                f"({anomaly_info['severity']} severity)"
            ),
        ))

        if outreach_status == "sent":
            summary["outreach_auto_sent"] += 1
            db.add(ActivityEvent(
                account_id=account.id,
                event_type="outreach_sent",
                description="Auto-sent outreach email (executor mode)",
            ))

        if anomaly_info["severity"] in ["critical", "high"]:
            summary["alerts_created"] += 1
            db.add(Alert(
                account_id=account.id,
                alert_type="anomaly",
                message=(
                    f"{account.name}: {anomaly_info['pattern']} anomaly detected. "
                    f"Score: {score['composite']}"
                ),
                severity=anomaly_info["severity"],
            ))

        db.commit()
        logger.info(f"Processed anomaly for {account.name}: {anomaly_info['pattern']}")

    logger.info("Full scan complete.")
    summary["scan_completed_at"] = datetime.now().isoformat(timespec="seconds")
    return summary


def start_scheduler(db_factory):
    """Start the APScheduler with a 6-hour scan cycle."""
    scheduler = BackgroundScheduler()

    def scan_job():
        db = db_factory()
        try:
            run_full_scan(db)
        except Exception as e:
            logger.error(f"Scheduled scan failed: {e}")
        finally:
            db.close()

    scheduler.add_job(scan_job, "interval", hours=6, id="full_scan")
    scheduler.start()
    logger.info("Scheduler started (6-hour interval)")
    return scheduler
