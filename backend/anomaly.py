import statistics
from typing import List, Dict, Optional


def detect_anomalies(account_data: Dict, peer_scores: List[float]) -> Optional[Dict]:
    """Detect anomalies for an account based on metrics and peer comparison."""
    metrics = account_data.get("metrics", [])
    if len(metrics) < 14:
        return None

    composite = account_data.get("composite", 50.0)
    seats = account_data.get("seats", 1)

    # Z-score on logins (last 30 vs prior 30)
    recent_logins = [m.get("logins", 0) for m in metrics[-30:]]
    prior_logins = [m.get("logins", 0) for m in metrics[-60:-30]] if len(metrics) >= 60 else []

    login_z_score = None
    if prior_logins and len(prior_logins) > 1:
        mean = statistics.mean(prior_logins)
        std = max(statistics.stdev(prior_logins), 0.01)
        recent_mean = statistics.mean(recent_logins)
        login_z_score = (recent_mean - mean) / std

    # Z-score on API volume
    recent_api = [m.get("api_calls", 0) for m in metrics[-30:]]
    prior_api = [m.get("api_calls", 0) for m in metrics[-60:-30]] if len(metrics) >= 60 else []

    volume_z_score = None
    if prior_api and len(prior_api) > 1:
        mean = statistics.mean(prior_api)
        std = max(statistics.stdev(prior_api), 0.01)
        recent_mean = statistics.mean(recent_api)
        volume_z_score = (recent_mean - mean) / std

    # Peer comparison
    peer_delta = None
    if peer_scores:
        peer_mean = statistics.mean(peer_scores)
        peer_delta = composite - peer_mean

    # Aggregate z-score
    z_score = None
    if login_z_score is not None and volume_z_score is not None:
        z_score = min(login_z_score, volume_z_score)
    elif login_z_score is not None:
        z_score = login_z_score
    elif volume_z_score is not None:
        z_score = volume_z_score

    is_anomaly = False
    pattern = None
    severity = "low"

    if z_score is not None and z_score < -1.5:
        is_anomaly = True

        # Classify pattern
        last_7_dau = [m.get("dau", 0) for m in metrics[-7:]]
        prior_7_dau = [m.get("dau", 0) for m in metrics[-14:-7]]

        if last_7_dau and prior_7_dau:
            last_mean = statistics.mean(last_7_dau)
            prior_mean = statistics.mean(prior_7_dau)
            if prior_mean > 0:
                drop_pct = (last_mean - prior_mean) / prior_mean
                if drop_pct < -0.3:
                    pattern = "sudden_drop"
                else:
                    pattern = "slow_erosion"
            else:
                pattern = "slow_erosion"
        else:
            pattern = "slow_erosion"

        # Check seat collapse
        active_seats_avg = statistics.mean([m.get("active_seats", 0) for m in metrics[-30:]])
        if active_seats_avg < seats * 0.3:
            pattern = "seat_collapse"

        # Severity from z-score
        if z_score < -3:
            severity = "critical"
        elif z_score < -2:
            severity = "high"
        else:
            severity = "medium"

    # Peer comparison anomaly
    if peer_delta is not None and peer_delta < -20:
        is_anomaly = True
        if pattern is None:
            pattern = "parallel_collapse"
        sev_order = ["low", "medium", "high", "critical"]
        if sev_order.index("medium") > sev_order.index(severity):
            severity = "medium"

    # Also flag critically low scores directly
    if not is_anomaly:
        if composite < 30:
            is_anomaly = True
            pattern = pattern or "sudden_drop"
            severity = "critical"
        elif composite < 50:
            is_anomaly = True
            pattern = pattern or "slow_erosion"
            if severity == "low":
                severity = "medium"

    if not is_anomaly:
        return None

    return {
        "pattern": pattern or "slow_erosion",
        "severity": severity,
        "z_score": round(z_score, 2) if z_score is not None else None,
        "delta_from_peer": round(peer_delta, 1) if peer_delta is not None else None,
    }
