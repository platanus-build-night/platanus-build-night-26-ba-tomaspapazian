from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="My Company")
    onboarding_complete = Column(Boolean, default=False)
    autonomy_mode = Column(String, default="approval")  # monitor, approval, executor
    slack_channel = Column(String, nullable=True)
    alert_email = Column(String, nullable=True)
    weight_engagement = Column(Float, default=30.0)
    weight_adoption = Column(Float, default=25.0)
    weight_health = Column(Float, default=25.0)
    weight_support = Column(Float, default=20.0)
    critical_threshold = Column(Float, default=40.0)
    at_risk_threshold = Column(Float, default=70.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    tier = Column(String, default="starter")  # starter, growth, scale
    seats = Column(Integer, default=5)
    mrr = Column(Float, default=0.0)
    renewal_date = Column(String, nullable=True)  # ISO date string
    csm_name = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    metrics = relationship("UsageMetric", back_populates="account")
    health_scores = relationship("HealthScore", back_populates="account")
    anomalies = relationship("Anomaly", back_populates="account")
    events = relationship("ActivityEvent", back_populates="account")
    renewal_notification_pref = relationship(
        "RenewalNotificationPreference",
        back_populates="account",
        uselist=False,
        cascade="all, delete-orphan",
    )


class UsageMetric(Base):
    __tablename__ = "usage_metrics"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    date = Column(String, nullable=False)  # ISO date string
    dau = Column(Float, default=0.0)
    wau = Column(Float, default=0.0)
    mau = Column(Float, default=0.0)
    active_seats = Column(Integer, default=0)
    feature_count = Column(Integer, default=0)
    api_calls = Column(Integer, default=0)
    support_tickets = Column(Integer, default=0)
    nps_score = Column(Float, nullable=True)
    logins = Column(Integer, default=0)

    account = relationship("Account", back_populates="metrics")


class HealthScore(Base):
    __tablename__ = "health_scores"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    date = Column(String, nullable=False)
    composite = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    adoption_score = Column(Float, default=0.0)
    health_score = Column(Float, default=0.0)
    support_score = Column(Float, default=0.0)
    trend_delta = Column(Float, default=0.0)

    account = relationship("Account", back_populates="health_scores")


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    detected_at = Column(DateTime, server_default=func.now())
    pattern = Column(String, nullable=False)
    severity = Column(String, default="medium")  # low, medium, high, critical
    explanation = Column(Text, nullable=True)
    outreach_draft = Column(Text, nullable=True)
    outreach_status = Column(String, default="pending")  # pending, approved, rejected, sent
    z_score = Column(Float, nullable=True)
    delta_from_peer = Column(Float, nullable=True)

    account = relationship("Account", back_populates="anomalies")


class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    event_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    account = relationship("Account", back_populates="events")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    alert_type = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    severity = Column(String, default="medium")
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


class RenewalNotificationPreference(Base):
    __tablename__ = "renewal_notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False, unique=True)
    enabled = Column(Boolean, default=False)
    lead_time_days = Column(Integer, default=30)  # allowed: 90, 30, 14, 7
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    account = relationship("Account", back_populates="renewal_notification_pref")


class RenewalNotificationSettings(Base):
    __tablename__ = "renewal_notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    enabled = Column(Boolean, default=False)
    notify_90_days = Column(Boolean, default=False)
    notify_30_days = Column(Boolean, default=True)
    notify_14_days = Column(Boolean, default=False)
    notify_7_days = Column(Boolean, default=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
