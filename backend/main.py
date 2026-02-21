import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, date, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from database import get_db, init_db, SessionLocal
from models import (
    Account,
    UsageMetric,
    HealthScore,
    Anomaly,
    ActivityEvent,
    Alert,
    Company,
    RenewalNotificationPreference,
    RenewalNotificationSettings,
)
from schemas import (
    CompanyOut, CompanyUpdate, OnboardingPayload, AccountListItem, AccountDetail,
    MetricPoint, AnomalyOut, ActivityEventOut, AlertOut, StatsOut, RevenueForecastOut,
    RevenueForecastPointOut, RenewalCalendarItemOut,
    RenewalNotificationSettingsOut, RenewalNotificationSettingsUpdate,
)
from scoring import compute_health_score, get_state
from seed import seed_data
from scheduler import run_full_scan, start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_data()

    db = SessionLocal()
    try:
        run_full_scan(db)
    except Exception as e:
        logger.error(f"Initial scan failed: {e}")
    finally:
        db.close()

    scheduler = start_scheduler(SessionLocal)
    yield
    scheduler.shutdown()


app = FastAPI(title="PulseScore API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_weights(db: Session) -> dict:
    company = db.query(Company).first()
    if not company:
        return {"engagement": 30, "adoption": 25, "health": 25, "support": 20,
                "critical_threshold": 40.0, "at_risk_threshold": 70.0}
    return {
        "engagement": company.weight_engagement,
        "adoption": company.weight_adoption,
        "health": company.weight_health,
        "support": company.weight_support,
        "critical_threshold": company.critical_threshold,
        "at_risk_threshold": company.at_risk_threshold,
    }


def _month_start(d: date) -> date:
    return date(d.year, d.month, 1)


def _add_months(d: date, months: int) -> date:
    month_index = (d.year * 12 + (d.month - 1)) + months
    year = month_index // 12
    month = (month_index % 12) + 1
    return date(year, month, 1)


def _parse_iso_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).date()
    except ValueError:
        return None


def _get_or_create_renewal_settings(db: Session) -> RenewalNotificationSettings:
    settings = db.query(RenewalNotificationSettings).first()
    if settings:
        return settings
    settings = RenewalNotificationSettings(
        enabled=False,
        notify_90_days=False,
        notify_30_days=True,
        notify_14_days=False,
        notify_7_days=False,
    )
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def _lead_times_from_settings(settings: RenewalNotificationSettings) -> List[int]:
    lead_times = []
    if settings.notify_90_days:
        lead_times.append(90)
    if settings.notify_30_days:
        lead_times.append(30)
    if settings.notify_14_days:
        lead_times.append(14)
    if settings.notify_7_days:
        lead_times.append(7)
    return lead_times


# ── Company ────────────────────────────────────────────────────────────────────

@app.get("/api/company", response_model=CompanyOut)
def get_company(db: Session = Depends(get_db)):
    company = db.query(Company).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@app.put("/api/company", response_model=CompanyOut)
def update_company(payload: CompanyUpdate, db: Session = Depends(get_db)):
    company = db.query(Company).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company


@app.post("/api/onboarding")
def complete_onboarding(payload: OnboardingPayload, db: Session = Depends(get_db)):
    company = db.query(Company).first()
    if not company:
        company = Company()
        db.add(company)
    company.name = payload.company_name
    company.autonomy_mode = payload.autonomy_mode
    company.slack_channel = payload.slack_channel
    company.alert_email = payload.alert_email
    company.weight_engagement = payload.weight_engagement
    company.weight_adoption = payload.weight_adoption
    company.weight_health = payload.weight_health
    company.weight_support = payload.weight_support
    company.critical_threshold = payload.critical_threshold
    company.at_risk_threshold = payload.at_risk_threshold
    company.onboarding_complete = True
    db.commit()
    db.refresh(company)
    return {"status": "ok", "company_id": company.id}


# ── Accounts ───────────────────────────────────────────────────────────────────

@app.get("/api/accounts", response_model=List[AccountListItem])
def list_accounts(db: Session = Depends(get_db)):
    settings = _get_weights(db)
    accounts = db.query(Account).all()

    result = []
    for account in accounts:
        latest_hs = (
            db.query(HealthScore)
            .filter(HealthScore.account_id == account.id)
            .order_by(HealthScore.date.desc())
            .first()
        )
        composite = latest_hs.composite if latest_hs else 0.0
        trend_delta = latest_hs.trend_delta if latest_hs else 0.0
        state = get_state(composite, settings["critical_threshold"], settings["at_risk_threshold"])

        pending = (
            db.query(Anomaly)
            .filter(Anomaly.account_id == account.id, Anomaly.outreach_status == "pending")
            .first()
        )

        result.append(AccountListItem(
            id=account.id,
            name=account.name,
            tier=account.tier,
            seats=account.seats,
            mrr=account.mrr,
            renewal_date=account.renewal_date,
            composite=composite,
            trend_delta=trend_delta,
            state=state,
            has_pending_anomaly=pending is not None,
        ))

    state_order = {"critical": 0, "at_risk": 1, "good": 2, "healthy": 3}
    result.sort(key=lambda a: (state_order.get(a.state, 4), a.composite))
    return result


@app.get("/api/accounts/{account_id}", response_model=AccountDetail)
def get_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    settings = _get_weights(db)
    weights = {k: settings[k] for k in ("engagement", "adoption", "health", "support")}

    raw_metrics = (
        db.query(UsageMetric)
        .filter(UsageMetric.account_id == account_id)
        .order_by(UsageMetric.date)
        .all()
    )

    hs_map = {
        hs.date: hs
        for hs in db.query(HealthScore).filter(HealthScore.account_id == account_id).all()
    }

    metric_points = []
    for m in raw_metrics:
        hs = hs_map.get(m.date)
        if hs:
            composite, eng, adp, hlt, sup = (
                hs.composite, hs.engagement_score,
                hs.adoption_score, hs.health_score, hs.support_score,
            )
        else:
            s = compute_health_score(
                [{"dau": m.dau, "wau": m.wau, "mau": m.mau,
                  "active_seats": m.active_seats, "feature_count": m.feature_count,
                  "api_calls": m.api_calls, "support_tickets": m.support_tickets,
                  "logins": m.logins}],
                account.seats, weights, compute_trend=False,
            )
            composite, eng, adp, hlt, sup = (
                s["composite"], s["engagement_score"],
                s["adoption_score"], s["health_score"], s["support_score"],
            )

        metric_points.append(MetricPoint(
            date=m.date, dau=m.dau, wau=m.wau, mau=m.mau,
            active_seats=m.active_seats, feature_count=m.feature_count,
            api_calls=m.api_calls, support_tickets=m.support_tickets, logins=m.logins,
            composite=composite, engagement_score=eng,
            adoption_score=adp, health_score=hlt, support_score=sup,
        ))

    latest_hs = (
        db.query(HealthScore)
        .filter(HealthScore.account_id == account_id)
        .order_by(HealthScore.date.desc())
        .first()
    )
    composite = latest_hs.composite if latest_hs else 0.0
    trend_delta = latest_hs.trend_delta if latest_hs else 0.0
    eng = latest_hs.engagement_score if latest_hs else 0.0
    adp = latest_hs.adoption_score if latest_hs else 0.0
    hlt = latest_hs.health_score if latest_hs else 0.0
    sup = latest_hs.support_score if latest_hs else 0.0
    state = get_state(composite, settings["critical_threshold"], settings["at_risk_threshold"])

    anomalies = (
        db.query(Anomaly)
        .filter(Anomaly.account_id == account_id)
        .order_by(Anomaly.detected_at.desc())
        .limit(10)
        .all()
    )
    events = (
        db.query(ActivityEvent)
        .filter(ActivityEvent.account_id == account_id)
        .order_by(ActivityEvent.created_at.desc())
        .limit(50)
        .all()
    )

    return AccountDetail(
        id=account.id, name=account.name, tier=account.tier,
        seats=account.seats, mrr=account.mrr, renewal_date=account.renewal_date,
        csm_name=account.csm_name, composite=composite,
        engagement_score=eng, adoption_score=adp, health_score=hlt, support_score=sup,
        trend_delta=trend_delta, state=state, metrics=metric_points,
        anomalies=[AnomalyOut.model_validate(a) for a in anomalies],
        events=[ActivityEventOut.model_validate(e) for e in events],
    )


# ── Stats ──────────────────────────────────────────────────────────────────────

@app.get("/api/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    settings = _get_weights(db)
    accounts = db.query(Account).all()

    critical = at_risk = good = healthy = 0
    total_mrr = 0.0
    scores = []

    for account in accounts:
        latest_hs = (
            db.query(HealthScore)
            .filter(HealthScore.account_id == account.id)
            .order_by(HealthScore.date.desc())
            .first()
        )
        composite = latest_hs.composite if latest_hs else 0.0
        scores.append(composite)
        total_mrr += account.mrr

        state = get_state(composite, settings["critical_threshold"], settings["at_risk_threshold"])
        if state == "critical":
            critical += 1
        elif state == "at_risk":
            at_risk += 1
        elif state == "good":
            good += 1
        else:
            healthy += 1

    pending_approvals = db.query(Anomaly).filter(Anomaly.outreach_status == "pending").count()
    avg_health = sum(scores) / len(scores) if scores else 0.0

    latest_hs = db.query(HealthScore).order_by(HealthScore.date.desc()).first()
    last_scan = latest_hs.date if latest_hs else None

    return StatsOut(
        total_accounts=len(accounts),
        critical_count=critical,
        at_risk_count=at_risk,
        good_count=good,
        healthy_count=healthy,
        avg_health=round(avg_health, 1),
        total_mrr=total_mrr,
        pending_approvals=pending_approvals,
        last_scan=last_scan,
    )


@app.get("/api/revenue-forecast", response_model=RevenueForecastOut)
def get_revenue_forecast(db: Session = Depends(get_db)):
    settings = _get_weights(db)
    accounts = db.query(Account).all()
    if not accounts:
        return RevenueForecastOut(
            current_mrr=0.0,
            projected_mrr_end_12m=0.0,
            projected_revenue_12m=0.0,
            average_monthly_growth_pct=0.0,
            monthly_projection=[],
            assumptions_note="No accounts available to forecast.",
        )

    drift_by_state = {
        "critical": -0.015,
        "at_risk": -0.008,
        "good": 0.004,
        "healthy": 0.008,
    }
    renewal_factor_by_state = {
        "critical": 0.78,
        "at_risk": 0.90,
        "good": 1.02,
        "healthy": 1.06,
    }

    today = datetime.now().date()
    base_month = _month_start(today)

    account_profiles = []
    current_mrr = 0.0
    for account in accounts:
        latest_hs = (
            db.query(HealthScore)
            .filter(HealthScore.account_id == account.id)
            .order_by(HealthScore.date.desc())
            .first()
        )
        composite = latest_hs.composite if latest_hs else 0.0
        state = get_state(composite, settings["critical_threshold"], settings["at_risk_threshold"])
        renewal_month = None
        if account.renewal_date:
            try:
                renewal_dt = datetime.fromisoformat(account.renewal_date).date()
                renewal_month = _month_start(renewal_dt)
            except ValueError:
                renewal_month = None

        account_profiles.append({
            "id": account.id,
            "state": state,
            "renewal_month": renewal_month,
            "mrr": float(account.mrr or 0.0),
        })
        current_mrr += float(account.mrr or 0.0)

    projected_mrr_by_account = {p["id"]: p["mrr"] for p in account_profiles}
    projection_points: List[RevenueForecastPointOut] = []

    for month_index in range(1, 13):
        projection_month = _add_months(base_month, month_index)
        total_month_mrr = 0.0

        for profile in account_profiles:
            acc_id = profile["id"]
            state = profile["state"]
            renewal_month = profile["renewal_month"]
            projected = projected_mrr_by_account[acc_id]

            projected *= (1.0 + drift_by_state.get(state, 0.0))
            if renewal_month is not None and renewal_month == projection_month:
                projected *= renewal_factor_by_state.get(state, 1.0)

            projected = max(projected, 0.0)
            projected_mrr_by_account[acc_id] = projected
            total_month_mrr += projected

        projection_points.append(RevenueForecastPointOut(
            month_start=projection_month.isoformat(),
            label=projection_month.strftime("%b %Y"),
            projected_mrr=round(total_month_mrr, 2),
        ))

    end_12m = projection_points[-1].projected_mrr if projection_points else current_mrr
    annual_total = sum(p.projected_mrr for p in projection_points)
    avg_growth_pct = 0.0
    if current_mrr > 0:
        avg_growth_pct = ((end_12m / current_mrr) ** (1 / 12) - 1.0) * 100.0

    return RevenueForecastOut(
        current_mrr=round(current_mrr, 2),
        projected_mrr_end_12m=round(end_12m, 2),
        projected_revenue_12m=round(annual_total, 2),
        average_monthly_growth_pct=round(avg_growth_pct, 2),
        monthly_projection=projection_points,
        assumptions_note=(
            "Projection uses account health state for monthly drift and applies a state-based "
            "renewal impact in each account's renewal month."
        ),
    )


@app.get("/api/renewals/calendar", response_model=List[RenewalCalendarItemOut])
def get_renewals_calendar(month: Optional[str] = None, db: Session = Depends(get_db)):
    target_month = _month_start(datetime.now().date())
    if month:
        try:
            target_month = datetime.strptime(month, "%Y-%m").date().replace(day=1)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")

    next_month = _add_months(target_month, 1)
    today = datetime.now().date()
    settings = _get_weights(db)

    items: List[RenewalCalendarItemOut] = []
    for account in db.query(Account).all():
        renewal_dt = _parse_iso_date(account.renewal_date)
        if not renewal_dt:
            continue
        if renewal_dt < target_month or renewal_dt >= next_month:
            continue

        latest_hs = (
            db.query(HealthScore)
            .filter(HealthScore.account_id == account.id)
            .order_by(HealthScore.date.desc())
            .first()
        )
        composite = latest_hs.composite if latest_hs else 0.0
        state = get_state(composite, settings["critical_threshold"], settings["at_risk_threshold"])

        items.append(RenewalCalendarItemOut(
            account_id=account.id,
            account_name=account.name,
            renewal_date=renewal_dt.isoformat(),
            days_until_renewal=(renewal_dt - today).days,
            composite=round(composite, 1),
            health_state=state,
        ))

    items.sort(key=lambda x: x.renewal_date)
    return items


@app.get("/api/renewals/notification-settings", response_model=RenewalNotificationSettingsOut)
def get_renewal_notification_settings(db: Session = Depends(get_db)):
    settings = _get_or_create_renewal_settings(db)
    return RenewalNotificationSettingsOut(
        enabled=settings.enabled,
        lead_times_days=_lead_times_from_settings(settings),
    )


@app.put("/api/renewals/notification-settings", response_model=RenewalNotificationSettingsOut)
def update_renewal_notification_settings(
    payload: RenewalNotificationSettingsUpdate,
    db: Session = Depends(get_db),
):
    allowed = {90, 30, 14, 7}
    settings = _get_or_create_renewal_settings(db)

    if payload.enabled is not None:
        settings.enabled = payload.enabled

    if payload.lead_times_days is not None:
        lead_set = set(payload.lead_times_days)
        invalid = lead_set - allowed
        if invalid:
            raise HTTPException(status_code=400, detail="lead_times_days must contain only 90, 30, 14, 7")
        settings.notify_90_days = 90 in lead_set
        settings.notify_30_days = 30 in lead_set
        settings.notify_14_days = 14 in lead_set
        settings.notify_7_days = 7 in lead_set

    db.commit()
    db.refresh(settings)
    return RenewalNotificationSettingsOut(
        enabled=settings.enabled,
        lead_times_days=_lead_times_from_settings(settings),
    )


# ── Anomaly actions ────────────────────────────────────────────────────────────

@app.post("/api/anomalies/{anomaly_id}/approve")
def approve_outreach(anomaly_id: int, db: Session = Depends(get_db)):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    anomaly.outreach_status = "sent"
    db.add(ActivityEvent(
        account_id=anomaly.account_id,
        event_type="outreach_sent",
        description="Outreach email approved and sent",
    ))
    db.commit()
    return {"status": "ok", "outreach_status": "sent"}


@app.post("/api/anomalies/{anomaly_id}/reject")
def reject_outreach(anomaly_id: int, db: Session = Depends(get_db)):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    anomaly.outreach_status = "rejected"
    db.add(ActivityEvent(
        account_id=anomaly.account_id,
        event_type="outreach_rejected",
        description="Outreach email rejected",
    ))
    db.commit()
    return {"status": "ok", "outreach_status": "rejected"}


# ── Alerts ─────────────────────────────────────────────────────────────────────

@app.get("/api/alerts", response_model=List[AlertOut])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.created_at.desc()).limit(50).all()


# ── Operations ─────────────────────────────────────────────────────────────────

@app.post("/api/run-scan")
def trigger_scan(db: Session = Depends(get_db)):
    try:
        summary = run_full_scan(db)
        return {"status": "ok", "message": "Scan completed", "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/seed")
def reseed(db: Session = Depends(get_db)):
    db.query(RenewalNotificationSettings).delete()
    db.query(RenewalNotificationPreference).delete()
    db.query(Alert).delete()
    db.query(ActivityEvent).delete()
    db.query(Anomaly).delete()
    db.query(HealthScore).delete()
    db.query(UsageMetric).delete()
    db.query(Account).delete()
    db.query(Company).delete()
    db.commit()

    seed_data()
    try:
        run_full_scan(db)
    except Exception as e:
        logger.error(f"Post-seed scan failed: {e}")

    return {"status": "ok", "message": "Database reseeded"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
