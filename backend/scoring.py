import statistics
from typing import List, Dict


def compute_health_score(
    metrics: List[Dict],
    seats: int,
    weights: Dict[str, float],
    compute_trend: bool = True
) -> Dict:
    if not metrics:
        return {
            "composite": 0.0,
            "engagement_score": 0.0,
            "adoption_score": 0.0,
            "health_score": 0.0,
            "support_score": 0.0,
            "trend_delta": 0.0
        }

    recent = metrics[-30:] if len(metrics) >= 30 else metrics

    def engagement_score() -> float:
        scores = []
        for m in recent:
            dau = m.get("dau", 0)
            mau = max(m.get("mau", 1), 1)
            ratio = min(dau / mau, 1.0)
            logins = min(m.get("logins", 0) / 10.0, 1.0)
            scores.append((ratio * 0.6 + logins * 0.4) * 100)
        return statistics.mean(scores) if scores else 0.0

    def adoption_score() -> float:
        scores = []
        for m in recent:
            features = m.get("feature_count", 0)
            feature_ratio = min(features / 10.0, 1.0)
            active = m.get("active_seats", 0)
            seat_ratio = min(active / max(seats, 1), 1.0)
            scores.append((feature_ratio * 0.5 + seat_ratio * 0.5) * 100)
        return statistics.mean(scores) if scores else 0.0

    def health_score_fn() -> float:
        scores = []
        for m in recent:
            api = min(m.get("api_calls", 0) / 1000.0, 1.0)
            wau = m.get("wau", 0)
            mau = max(m.get("mau", 1), 1)
            wau_ratio = min(wau / mau, 1.0)
            scores.append((api * 0.4 + wau_ratio * 0.6) * 100)
        return statistics.mean(scores) if scores else 0.0

    def support_score() -> float:
        scores = []
        for m in recent:
            tickets = m.get("support_tickets", 0)
            score = max(0.0, 100.0 - (tickets * 20.0))
            scores.append(score)
        return statistics.mean(scores) if scores else 100.0

    w = weights
    total_weight = (
        w.get("engagement", 30) + w.get("adoption", 25) +
        w.get("health", 25) + w.get("support", 20)
    )
    if total_weight == 0:
        total_weight = 100

    eng = engagement_score()
    adp = adoption_score()
    hlt = health_score_fn()
    sup = support_score()

    composite = (
        eng * w.get("engagement", 30) +
        adp * w.get("adoption", 25) +
        hlt * w.get("health", 25) +
        sup * w.get("support", 20)
    ) / total_weight

    trend_delta = 0.0
    if compute_trend and len(metrics) >= 14:
        recent_7 = metrics[-7:]
        prior_7 = metrics[-14:-7]
        recent_score = compute_health_score(recent_7, seats, weights, compute_trend=False)["composite"]
        prior_score = compute_health_score(prior_7, seats, weights, compute_trend=False)["composite"]
        trend_delta = recent_score - prior_score

    return {
        "composite": round(composite, 1),
        "engagement_score": round(eng, 1),
        "adoption_score": round(adp, 1),
        "health_score": round(hlt, 1),
        "support_score": round(sup, 1),
        "trend_delta": round(trend_delta, 1)
    }


def get_state(
    composite: float,
    critical_threshold: float = 40.0,
    at_risk_threshold: float = 70.0
) -> str:
    if composite < critical_threshold:
        return "critical"
    elif composite < at_risk_threshold:
        return "at_risk"
    elif composite < 85:
        return "good"
    else:
        return "healthy"
