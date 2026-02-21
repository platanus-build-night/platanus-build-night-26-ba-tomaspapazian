import os
import json
import re
from anthropic import Anthropic

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def generate_anomaly_explanation(
    account_name: str,
    pattern: str,
    severity: str,
    metrics_summary: dict,
    z_score: float = None,
    peer_delta: float = None,
) -> str:
    """Generate a 2-3 paragraph plain-English explanation of the anomaly."""
    context = (
        f"Account: {account_name}\n"
        f"Pattern: {pattern}\n"
        f"Severity: {severity}\n"
        f"Recent metrics: DAU={metrics_summary.get('avg_dau', 0):.1f}, "
        f"Active seats={metrics_summary.get('active_seats', 0):.0f}/{metrics_summary.get('total_seats', 0)}, "
        f"Feature count={metrics_summary.get('feature_count', 0):.0f}, "
        f"API calls/day={metrics_summary.get('avg_api_calls', 0):.0f}"
    )
    if z_score is not None:
        context += f"\nZ-score (login anomaly): {z_score:.2f}"
    if peer_delta is not None:
        context += f"\nDelta from peer average: {peer_delta:.1f} points"

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": (
                f"You are a Customer Success AI analyzing account health anomalies.\n\n"
                f"{context}\n\n"
                f"Write a 2-3 paragraph plain-English explanation of what's happening with this account. "
                f"Be specific with the numbers. Focus on:\n"
                f"1. What the anomaly looks like (specific metrics, what changed)\n"
                f"2. Likely business impact or root cause\n"
                f"3. Urgency and recommended next step\n\n"
                f"Keep it professional and data-driven. No bullet points, just paragraphs."
            ),
        }],
    )
    return response.content[0].text


def generate_outreach_draft(
    account_name: str,
    pattern: str,
    severity: str,
    csm_name: str,
    metrics_summary: dict,
    renewal_days: int = None,
) -> str:
    """Generate a personalized outreach email draft."""
    context = (
        f"Account: {account_name}\n"
        f"CSM: {csm_name}\n"
        f"Pattern: {pattern}\n"
        f"Severity: {severity}\n"
        f"Active seats: {metrics_summary.get('active_seats', 0):.0f}/{metrics_summary.get('total_seats', 0)}\n"
        f"Feature usage: {metrics_summary.get('feature_count', 0):.0f}/10 features"
    )
    if renewal_days is not None:
        context += f"\nRenewal in: {renewal_days} days"

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        messages=[{
            "role": "user",
            "content": (
                f"You are a Customer Success Manager drafting an outreach email.\n\n"
                f"{context}\n\n"
                f"Write a personalized outreach email. Format exactly as:\n"
                f"Subject: [your subject line]\n\n"
                f"[email body]\n\n"
                f"The email should:\n"
                f"- Be warm but professional\n"
                f"- Reference specific metrics without being alarming\n"
                f"- Offer a clear next step (call, check-in)\n"
                f"- Be concise (3-4 short paragraphs)\n"
                f"- Sign off as {csm_name}"
            ),
        }],
    )
    return response.content[0].text


def executor_decide(
    account_name: str,
    pattern: str,
    severity: str,
    autonomy_mode: str,
    outreach_draft: str,
) -> dict:
    """Decide whether to auto-send, wait, or escalate."""
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=200,
        messages=[{
            "role": "user",
            "content": (
                f"You are an autonomous CS executor deciding on an action.\n\n"
                f"Account: {account_name}\n"
                f"Pattern: {pattern}\n"
                f"Severity: {severity}\n"
                f"Mode: {autonomy_mode}\n"
                f"Draft email preview: {outreach_draft[:200]}...\n\n"
                f"Respond with ONLY valid JSON (no markdown, no explanation):\n"
                f'{{\"action\": \"send\" or \"wait\" or \"escalate\", \"reason\": \"one sentence\", \"wait_days\": 0}}\n\n'
                f"Rules:\n"
                f'- "send" if severity is critical or high and mode is executor\n'
                f'- "escalate" if pattern is unusual or needs human judgment\n'
                f'- "wait" if severity is low or medium and no immediate urgency\n'
                f"- wait_days: how many days to wait before re-evaluation (0 if sending now)"
            ),
        }],
    )

    text = response.content[0].text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
    text = text.strip()

    try:
        result = json.loads(text)
        if "action" not in result:
            result["action"] = "wait"
        if "reason" not in result:
            result["reason"] = "Insufficient data for decision"
        if "wait_days" not in result:
            result["wait_days"] = 3
        return result
    except json.JSONDecodeError:
        return {
            "action": "wait",
            "reason": "Could not parse decision, defaulting to wait for human review",
            "wait_days": 3,
        }
