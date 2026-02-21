from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CompanyOut(BaseModel):
    id: int
    name: str
    onboarding_complete: bool
    autonomy_mode: str
    slack_channel: Optional[str]
    alert_email: Optional[str]
    weight_engagement: float
    weight_adoption: float
    weight_health: float
    weight_support: float
    critical_threshold: float
    at_risk_threshold: float

    class Config:
        from_attributes = True


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    autonomy_mode: Optional[str] = None
    slack_channel: Optional[str] = None
    alert_email: Optional[str] = None
    weight_engagement: Optional[float] = None
    weight_adoption: Optional[float] = None
    weight_health: Optional[float] = None
    weight_support: Optional[float] = None
    critical_threshold: Optional[float] = None
    at_risk_threshold: Optional[float] = None


class OnboardingPayload(BaseModel):
    company_name: str
    autonomy_mode: str
    slack_channel: Optional[str] = None
    alert_email: Optional[str] = None
    weight_engagement: float = 30.0
    weight_adoption: float = 25.0
    weight_health: float = 25.0
    weight_support: float = 20.0
    critical_threshold: float = 40.0
    at_risk_threshold: float = 70.0


class AccountListItem(BaseModel):
    id: int
    name: str
    tier: str
    seats: int
    mrr: float
    renewal_date: Optional[str]
    composite: float
    trend_delta: float
    state: str
    has_pending_anomaly: bool

    class Config:
        from_attributes = True


class MetricPoint(BaseModel):
    date: str
    dau: float
    wau: float
    mau: float
    active_seats: int
    feature_count: int
    api_calls: int
    support_tickets: int
    logins: int
    composite: float
    engagement_score: float
    adoption_score: float
    health_score: float
    support_score: float


class AnomalyOut(BaseModel):
    id: int
    pattern: str
    severity: str
    explanation: Optional[str]
    outreach_draft: Optional[str]
    outreach_status: str
    z_score: Optional[float]
    delta_from_peer: Optional[float]
    detected_at: datetime

    class Config:
        from_attributes = True


class ActivityEventOut(BaseModel):
    id: int
    event_type: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    account_id: int
    alert_type: str
    message: Optional[str]
    severity: str
    resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AccountDetail(BaseModel):
    id: int
    name: str
    tier: str
    seats: int
    mrr: float
    renewal_date: Optional[str]
    csm_name: Optional[str]
    composite: float
    engagement_score: float
    adoption_score: float
    health_score: float
    support_score: float
    trend_delta: float
    state: str
    metrics: List[MetricPoint]
    anomalies: List[AnomalyOut]
    events: List[ActivityEventOut]

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    total_accounts: int
    critical_count: int
    at_risk_count: int
    good_count: int
    healthy_count: int
    avg_health: float
    total_mrr: float
    pending_approvals: int
    last_scan: Optional[str]


class RevenueForecastPointOut(BaseModel):
    month_start: str
    label: str
    projected_mrr: float


class RevenueForecastOut(BaseModel):
    current_mrr: float
    projected_mrr_end_12m: float
    projected_revenue_12m: float
    average_monthly_growth_pct: float
    monthly_projection: List[RevenueForecastPointOut]
    assumptions_note: str


class RenewalCalendarItemOut(BaseModel):
    account_id: int
    account_name: str
    renewal_date: str
    days_until_renewal: int
    composite: float
    health_state: str


class RenewalNotificationSettingsOut(BaseModel):
    enabled: bool
    lead_times_days: List[int]


class RenewalNotificationSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    lead_times_days: Optional[List[int]] = None
