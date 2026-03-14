import os


def pytest_sessionstart(session):
    del session
    os.environ.setdefault(
        "DATABASE_URL", "postgresql+asyncpg://username@localhost:5432/weave_dev"
    )
    os.environ.setdefault("JWT_SECRET", "dummy")
    os.environ.setdefault("JWT_PUBLIC_KEY", "dummy")
    os.environ.setdefault("JWT_ACCESS_EXPIRY_MINUTES", "15")
    os.environ.setdefault("JWT_REFRESH_EXPIRY_DAYS", "30")
    os.environ.setdefault(
        "ENCRYPTION_KEY",
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    )
    os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
    os.environ.setdefault("AWS_REGION", "eu-west-2")
    os.environ.setdefault("AWS_ACCESS_KEY_ID", "test")
    os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "test")
    os.environ.setdefault("SQS_CALENDAR_SYNC_URL", "https://example.com/calendar")
    os.environ.setdefault("SQS_INSIGHT_RECALC_URL", "https://example.com/insight")
    os.environ.setdefault("SQS_WEEKLY_DIGEST_URL", "https://example.com/digest")
    os.environ.setdefault("SQS_TAX_DEADLINE_URL", "https://example.com/tax")
    os.environ.setdefault("SES_FROM_EMAIL", "test@example.com")
    os.environ.setdefault("GOOGLE_CLIENT_ID", "test")
    os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test")
    os.environ.setdefault("GOOGLE_REDIRECT_URI", "http://localhost:8000/callback")
    os.environ.setdefault("SENTRY_DSN", "test")
    os.environ.setdefault("PORT", "8000")
    os.environ.setdefault("ENVIRONMENT", "test")
