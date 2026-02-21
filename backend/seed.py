import random
from datetime import datetime, timedelta


def seed_data():
    """Seed the database with 30 accounts and 90 days of synthetic usage data."""
    random.seed(42)

    from database import SessionLocal
    from models import Account, UsageMetric, Company

    db = SessionLocal()
    try:
        if db.query(Account).count() > 0:
            return

        company = Company(
            name="Demo Company",
            onboarding_complete=False,
            autonomy_mode="approval",
            weight_engagement=30.0,
            weight_adoption=25.0,
            weight_health=25.0,
            weight_support=20.0,
            critical_threshold=40.0,
            at_risk_threshold=70.0,
        )
        db.add(company)
        db.flush()

        today = datetime.now().date()

        accounts_config = [
            # ── CRITICAL (5) ────────────────────────────────────────────────
            {
                "name": "AcmeCorp",
                "tier": "growth",
                "seats": 12,
                "mrr": 2400.0,
                "renewal_date": (today + timedelta(days=45)).isoformat(),
                "csm_name": "Sarah Chen",
                "pattern": "sudden_drop",
                "drop_day": 62,
            },
            {
                "name": "BuildRight",
                "tier": "scale",
                "seats": 30,
                "mrr": 8500.0,
                "renewal_date": (today + timedelta(days=60)).isoformat(),
                "csm_name": "Mike Torres",
                "pattern": "cliff_fall",
                "drop_day": 76,
            },
            {
                "name": "NovaBridge",
                "tier": "starter",
                "seats": 6,
                "mrr": 1200.0,
                "renewal_date": (today + timedelta(days=14)).isoformat(),
                "csm_name": "Priya Patel",
                "pattern": "abandoned",
            },
            {
                "name": "Orbitas",
                "tier": "growth",
                "seats": 10,
                "mrr": 2100.0,
                "renewal_date": (today + timedelta(days=38)).isoformat(),
                "csm_name": "Jordan Lee",
                "pattern": "sudden_drop",
                "drop_day": 50,
            },
            {
                "name": "PixelForge",
                "tier": "scale",
                "seats": 25,
                "mrr": 7200.0,
                "renewal_date": (today + timedelta(days=52)).isoformat(),
                "csm_name": "Marcus Webb",
                "pattern": "cliff_fall",
                "drop_day": 55,
            },

            # ── AT RISK (8) ─────────────────────────────────────────────────
            {
                "name": "CloudPeak",
                "tier": "starter",
                "seats": 3,
                "mrr": 599.0,
                "renewal_date": (today + timedelta(days=22)).isoformat(),
                "csm_name": "Sarah Chen",
                "pattern": "slow_erosion",
            },
            {
                "name": "FlowBase",
                "tier": "starter",
                "seats": 4,
                "mrr": 799.0,
                "renewal_date": (today + timedelta(days=18)).isoformat(),
                "csm_name": "Mike Torres",
                "pattern": "seat_collapse",
            },
            {
                "name": "QuantumLeap",
                "tier": "starter",
                "seats": 4,
                "mrr": 899.0,
                "renewal_date": (today + timedelta(days=12)).isoformat(),
                "csm_name": "Priya Patel",
                "pattern": "slow_erosion",
            },
            {
                "name": "Riveron",
                "tier": "growth",
                "seats": 14,
                "mrr": 2800.0,
                "renewal_date": (today + timedelta(days=41)).isoformat(),
                "csm_name": "Nina Okafor",
                "pattern": "partial_seat_collapse",
                "active_seats_count": 3,
            },
            {
                "name": "Solarix",
                "tier": "starter",
                "seats": 5,
                "mrr": 949.0,
                "renewal_date": (today + timedelta(days=15)).isoformat(),
                "csm_name": "Jordan Lee",
                "pattern": "slow_erosion",
            },
            {
                "name": "TechNest",
                "tier": "growth",
                "seats": 20,
                "mrr": 3800.0,
                "renewal_date": (today + timedelta(days=70)).isoformat(),
                "csm_name": "David Park",
                "pattern": "engagement_drop",
            },
            {
                "name": "Unfold",
                "tier": "starter",
                "seats": 3,
                "mrr": 549.0,
                "renewal_date": (today + timedelta(days=28)).isoformat(),
                "csm_name": "Marcus Webb",
                "pattern": "seat_collapse",
            },
            {
                "name": "Vaultly",
                "tier": "scale",
                "seats": 40,
                "mrr": 11000.0,
                "renewal_date": (today + timedelta(days=10)).isoformat(),
                "csm_name": "Sarah Chen",
                "pattern": "slow_erosion",
            },

            # ── GOOD (9) ────────────────────────────────────────────────────
            {
                "name": "HubLink",
                "tier": "starter",
                "seats": 5,
                "mrr": 999.0,
                "renewal_date": (today + timedelta(days=55)).isoformat(),
                "csm_name": "Alex Kim",
                "pattern": "slight_decline",
            },
            {
                "name": "WaveForm",
                "tier": "growth",
                "seats": 12,
                "mrr": 2600.0,
                "renewal_date": (today + timedelta(days=80)).isoformat(),
                "csm_name": "Nina Okafor",
                "pattern": "recovery",
            },
            {
                "name": "Xenova",
                "tier": "starter",
                "seats": 6,
                "mrr": 1100.0,
                "renewal_date": (today + timedelta(days=95)).isoformat(),
                "csm_name": "David Park",
                "pattern": "stable_good",
                "score_target": 74,
            },
            {
                "name": "YieldBase",
                "tier": "growth",
                "seats": 16,
                "mrr": 3400.0,
                "renewal_date": (today + timedelta(days=110)).isoformat(),
                "csm_name": "Priya Patel",
                "pattern": "stable_good",
                "score_target": 78,
            },
            {
                "name": "Zephyr",
                "tier": "scale",
                "seats": 28,
                "mrr": 7800.0,
                "renewal_date": (today + timedelta(days=88)).isoformat(),
                "csm_name": "Jordan Lee",
                "pattern": "stable_good",
                "score_target": 80,
            },
            {
                "name": "Archon",
                "tier": "starter",
                "seats": 4,
                "mrr": 749.0,
                "renewal_date": (today + timedelta(days=63)).isoformat(),
                "csm_name": "Marcus Webb",
                "pattern": "stable_good",
                "score_target": 74,
            },
            {
                "name": "BlueSpark",
                "tier": "growth",
                "seats": 11,
                "mrr": 2200.0,
                "renewal_date": (today + timedelta(days=77)).isoformat(),
                "csm_name": "Alex Kim",
                "pattern": "stable_good",
                "score_target": 77,
            },
            {
                "name": "Capsule",
                "tier": "scale",
                "seats": 18,
                "mrr": 5200.0,
                "renewal_date": (today + timedelta(days=102)).isoformat(),
                "csm_name": "Nina Okafor",
                "pattern": "stable_good",
                "score_target": 82,
            },
            {
                "name": "Driftly",
                "tier": "growth",
                "seats": 9,
                "mrr": 1900.0,
                "renewal_date": (today + timedelta(days=58)).isoformat(),
                "csm_name": "David Park",
                "pattern": "stable_good",
                "score_target": 79,
            },

            # ── HEALTHY (8) ─────────────────────────────────────────────────
            {
                "name": "DataFusion",
                "tier": "growth",
                "seats": 15,
                "mrr": 3200.0,
                "renewal_date": (today + timedelta(days=90)).isoformat(),
                "csm_name": "Alex Kim",
                "pattern": "growing",
            },
            {
                "name": "EdgeSync",
                "tier": "scale",
                "seats": 22,
                "mrr": 6000.0,
                "renewal_date": (today + timedelta(days=120)).isoformat(),
                "csm_name": "Alex Kim",
                "pattern": "stable_high",
            },
            {
                "name": "GridPoint",
                "tier": "growth",
                "seats": 18,
                "mrr": 4100.0,
                "renewal_date": (today + timedelta(days=75)).isoformat(),
                "csm_name": "Sarah Chen",
                "pattern": "upsell",
            },
            {
                "name": "DawnPath",
                "tier": "growth",
                "seats": 13,
                "mrr": 2900.0,
                "renewal_date": (today + timedelta(days=115)).isoformat(),
                "csm_name": "Marcus Webb",
                "pattern": "growing",
            },
            {
                "name": "EagleView",
                "tier": "scale",
                "seats": 35,
                "mrr": 9500.0,
                "renewal_date": (today + timedelta(days=140)).isoformat(),
                "csm_name": "Jordan Lee",
                "pattern": "stable_high",
            },
            {
                "name": "FrontierX",
                "tier": "growth",
                "seats": 20,
                "mrr": 4400.0,
                "renewal_date": (today + timedelta(days=130)).isoformat(),
                "csm_name": "David Park",
                "pattern": "stable_high",
            },
            {
                "name": "GlowLink",
                "tier": "starter",
                "seats": 7,
                "mrr": 1499.0,
                "renewal_date": (today + timedelta(days=145)).isoformat(),
                "csm_name": "Priya Patel",
                "pattern": "stable_high",
            },
            {
                "name": "HelixIO",
                "tier": "scale",
                "seats": 30,
                "mrr": 8200.0,
                "renewal_date": (today + timedelta(days=160)).isoformat(),
                "csm_name": "Nina Okafor",
                "pattern": "upsell",
            },
        ]

        for config in accounts_config:
            account = Account(
                name=config["name"],
                tier=config["tier"],
                seats=config["seats"],
                mrr=config["mrr"],
                renewal_date=config["renewal_date"],
                csm_name=config["csm_name"],
            )
            db.add(account)
            db.flush()

            metrics = _generate_metrics(config, today)

            for day_offset, day_metrics in enumerate(metrics):
                date = (today - timedelta(days=89) + timedelta(days=day_offset)).isoformat()
                metric = UsageMetric(account_id=account.id, date=date, **day_metrics)
                db.add(metric)

        db.commit()
    finally:
        db.close()


def _generate_metrics(config: dict, today) -> list:
    pattern = config["pattern"]
    seats = config["seats"]
    metrics = []

    # ── CRITICAL patterns ───────────────────────────────────────────────────

    if pattern == "sudden_drop":
        drop_day = config.get("drop_day", 62)
        for day in range(90):
            if day < drop_day:
                metrics.append({
                    "dau": seats * random.uniform(0.6, 0.8),
                    "wau": seats * random.uniform(0.8, 0.95),
                    "mau": seats * random.uniform(0.9, 1.0),
                    "active_seats": max(1, int(seats * random.uniform(0.7, 0.9))),
                    "feature_count": random.randint(5, 8),
                    "api_calls": random.randint(400, 700),
                    "support_tickets": random.randint(0, 1),
                    "logins": random.randint(15, 25),
                    "nps_score": random.uniform(7, 9),
                })
            else:
                decay = (day - drop_day) / max(90 - drop_day, 1)
                factor = max(0.05, 1.0 - decay * 0.95)
                metrics.append({
                    "dau": seats * random.uniform(0.05, 0.15) * factor,
                    "wau": seats * random.uniform(0.1, 0.2) * factor,
                    "mau": seats * random.uniform(0.2, 0.35) * factor,
                    "active_seats": max(0, int(seats * random.uniform(0.05, 0.15))),
                    "feature_count": random.randint(1, 3),
                    "api_calls": random.randint(20, 80),
                    "support_tickets": random.randint(2, 5),
                    "logins": random.randint(1, 4),
                    "nps_score": random.uniform(2, 5),
                })

    elif pattern == "cliff_fall":
        drop_day = config.get("drop_day", 76)
        for day in range(90):
            if day < drop_day:
                metrics.append({
                    "dau": seats * random.uniform(0.5, 0.7),
                    "wau": seats * random.uniform(0.7, 0.85),
                    "mau": seats * random.uniform(0.8, 0.95),
                    "active_seats": max(1, int(seats * random.uniform(0.55, 0.75))),
                    "feature_count": random.randint(4, 7),
                    "api_calls": random.randint(600, 1200),
                    "support_tickets": random.randint(0, 2),
                    "logins": random.randint(20, 40),
                    "nps_score": random.uniform(6, 8),
                })
            else:
                metrics.append({
                    "dau": seats * random.uniform(0.03, 0.08),
                    "wau": seats * random.uniform(0.05, 0.12),
                    "mau": seats * random.uniform(0.1, 0.2),
                    "active_seats": max(0, int(seats * random.uniform(0.03, 0.1))),
                    "feature_count": random.randint(1, 2),
                    "api_calls": random.randint(10, 50),
                    "support_tickets": random.randint(3, 7),
                    "logins": random.randint(0, 3),
                    "nps_score": random.uniform(1, 4),
                })

    elif pattern == "abandoned":
        # Account has gone dark — near-zero activity, high tickets
        for day in range(90):
            metrics.append({
                "dau": random.uniform(0.01, 0.06),
                "wau": random.uniform(0.03, 0.10),
                "mau": random.uniform(0.05, 0.20),
                "active_seats": random.choices([0, 1], weights=[70, 30])[0],
                "feature_count": random.choices([0, 1], weights=[60, 40])[0],
                "api_calls": random.randint(0, 15),
                "support_tickets": random.randint(3, 7),
                "logins": random.choices([0, 1], weights=[50, 50])[0],
                "nps_score": random.uniform(1, 3),
            })

    # ── AT RISK patterns ────────────────────────────────────────────────────

    elif pattern == "slow_erosion":
        for day in range(90):
            decay = day / 90.0
            factor = max(0.35, 1.0 - decay * 0.65)
            metrics.append({
                "dau": seats * random.uniform(0.4, 0.6) * factor,
                "wau": seats * random.uniform(0.5, 0.7) * factor,
                "mau": seats * random.uniform(0.6, 0.8) * factor,
                "active_seats": max(1, int(seats * random.uniform(0.4, 0.7) * factor)),
                "feature_count": max(1, int(random.uniform(3, 5) * factor)),
                "api_calls": int(random.randint(100, 250) * factor),
                "support_tickets": random.randint(1, 3),
                "logins": max(1, int(random.randint(5, 10) * factor)),
                "nps_score": random.uniform(4, 6) * factor + 2,
            })

    elif pattern == "seat_collapse":
        for day in range(90):
            metrics.append({
                "dau": 1 * random.uniform(0.6, 0.9),
                "wau": 1 * random.uniform(0.8, 1.0),
                "mau": 1.0,
                "active_seats": 1,
                "feature_count": random.randint(2, 4),
                "api_calls": random.randint(50, 150),
                "support_tickets": random.randint(0, 2),
                "logins": random.randint(3, 8),
                "nps_score": random.uniform(5, 7),
            })

    elif pattern == "partial_seat_collapse":
        # A few seats still active, but most have gone dark
        active = config.get("active_seats_count", 2)
        for day in range(90):
            metrics.append({
                "dau": active * random.uniform(0.5, 0.8),
                "wau": active * random.uniform(0.7, 0.95),
                "mau": active * random.uniform(0.85, 1.0),
                "active_seats": active,
                "feature_count": random.randint(3, 5),
                "api_calls": random.randint(80, 200),
                "support_tickets": random.randint(1, 2),
                "logins": random.randint(5, 12),
                "nps_score": random.uniform(5, 7),
            })

    elif pattern == "engagement_drop":
        # Good adoption + feature usage, but logins/DAU cratering
        for day in range(90):
            if day < 50:
                logins = random.randint(20, 35)
                dau_ratio = random.uniform(0.55, 0.72)
            else:
                decay = (day - 50) / 40.0
                logins = max(3, int(random.randint(20, 35) * (1 - decay * 0.75)))
                dau_ratio = random.uniform(0.55, 0.72) * max(0.3, 1 - decay * 0.7)
            metrics.append({
                "dau": seats * dau_ratio,
                "wau": seats * random.uniform(0.65, 0.80),
                "mau": seats * random.uniform(0.78, 0.92),
                "active_seats": max(1, int(seats * random.uniform(0.60, 0.78))),
                "feature_count": random.randint(5, 7),
                "api_calls": random.randint(280, 520),
                "support_tickets": random.randint(0, 1),
                "logins": logins,
                "nps_score": random.uniform(6.5, 8.0),
            })

    # ── GOOD patterns ───────────────────────────────────────────────────────

    elif pattern == "slight_decline":
        for day in range(90):
            if day < 60:
                logins = random.randint(15, 25)
            else:
                decay = (day - 60) / 30.0
                logins = max(5, int(random.randint(15, 25) * (1 - decay * 0.4)))
            metrics.append({
                "dau": seats * random.uniform(0.6, 0.78),
                "wau": seats * random.uniform(0.75, 0.88),
                "mau": seats * random.uniform(0.82, 0.95),
                "active_seats": max(1, int(seats * random.uniform(0.7, 0.88))),
                "feature_count": random.randint(5, 7),
                "api_calls": random.randint(300, 600),
                "support_tickets": random.randint(0, 1),
                "logins": logins,
                "nps_score": random.uniform(7, 8.5),
            })

    elif pattern == "recovery":
        # Was struggling, now on the mend
        for day in range(90):
            if day < 55:
                decay = day / 55.0
                factor = max(0.25, 0.65 - decay * 0.40)
            else:
                progress = (day - 55) / 35.0
                factor = 0.25 + progress * 0.50  # recovering toward ~75% of healthy
            metrics.append({
                "dau": seats * random.uniform(0.45, 0.65) * factor,
                "wau": seats * random.uniform(0.60, 0.78) * factor,
                "mau": seats * random.uniform(0.72, 0.88) * factor,
                "active_seats": max(1, int(seats * random.uniform(0.50, 0.72) * factor)),
                "feature_count": max(1, int(random.uniform(4, 7) * factor)),
                "api_calls": int(random.randint(200, 500) * factor),
                "support_tickets": max(0, int(random.randint(1, 3) * (1 - factor * 0.5))),
                "logins": max(1, int(random.randint(8, 18) * factor)),
                "nps_score": random.uniform(5, 8) * factor + 2,
            })

    elif pattern == "stable_good":
        # Steady, reliable — composite targets ~74-82 depending on score_target
        target = config.get("score_target", 77)
        # Map target 74-82 to parameter ranges
        intensity = (target - 74) / 8.0  # 0.0 = target 74, 1.0 = target 82
        for day in range(90):
            dau_r = random.uniform(0.52 + intensity * 0.12, 0.65 + intensity * 0.12)
            wau_r = random.uniform(0.68 + intensity * 0.10, 0.80 + intensity * 0.10)
            mau_r = random.uniform(0.80 + intensity * 0.08, 0.90 + intensity * 0.06)
            feat = random.randint(5 + int(intensity * 2), 7 + int(intensity * 2))
            seat_r = random.uniform(0.62 + intensity * 0.10, 0.76 + intensity * 0.10)
            logins = random.randint(10 + int(intensity * 5), 16 + int(intensity * 5))
            api = random.randint(320 + int(intensity * 150), 550 + int(intensity * 200))
            metrics.append({
                "dau": seats * dau_r,
                "wau": seats * wau_r,
                "mau": seats * mau_r,
                "active_seats": max(1, int(seats * seat_r)),
                "feature_count": min(10, feat),
                "api_calls": api,
                "support_tickets": random.choices([0, 1], weights=[70 + int(intensity * 10), 30 - int(intensity * 10)])[0],
                "logins": logins,
                "nps_score": random.uniform(6.5 + intensity, 8.0 + intensity),
            })

    # ── HEALTHY patterns ────────────────────────────────────────────────────

    elif pattern == "growing":
        for day in range(90):
            growth = 1.0 + (day / 90.0) * 0.4
            metrics.append({
                "dau": seats * random.uniform(0.7, 0.85) * growth,
                "wau": seats * random.uniform(0.85, 0.95) * growth,
                "mau": seats * min(1.2, random.uniform(0.9, 1.0) * growth),
                "active_seats": max(1, int(seats * min(1.0, random.uniform(0.8, 0.95)))),
                "feature_count": min(10, int(random.uniform(6, 8) + day / 30)),
                "api_calls": int(random.randint(700, 1200) * growth),
                "support_tickets": random.randint(0, 1),
                "logins": int(random.randint(25, 40) * growth),
                "nps_score": random.uniform(8, 10),
            })

    elif pattern == "stable_high":
        for day in range(90):
            metrics.append({
                "dau": seats * random.uniform(0.8, 0.95),
                "wau": seats * random.uniform(0.9, 1.0),
                "mau": seats * random.uniform(0.95, 1.0),
                "active_seats": max(1, int(seats * random.uniform(0.88, 0.98))),
                "feature_count": random.randint(8, 10),
                "api_calls": random.randint(1200, 2000),
                "support_tickets": random.randint(0, 1),
                "logins": random.randint(40, 60),
                "nps_score": random.uniform(8.5, 10),
            })

    elif pattern == "upsell":
        for day in range(90):
            metrics.append({
                "dau": seats * random.uniform(0.85, 0.98),
                "wau": seats * random.uniform(0.92, 1.0),
                "mau": seats * random.uniform(0.95, 1.0),
                "active_seats": max(1, int(seats * random.uniform(0.9, 1.0))),
                "feature_count": 9,
                "api_calls": random.randint(1500, 2500),
                "support_tickets": 0,
                "logins": random.randint(50, 80),
                "nps_score": random.uniform(9, 10),
            })

    return metrics
