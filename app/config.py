from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(alias="DATABASE_URL")
    jwt_secret: str = Field(alias="JWT_SECRET")
    jwt_public_key: str = Field(alias="JWT_PUBLIC_KEY")
    jwt_access_expiry_minutes: int = Field(alias="JWT_ACCESS_EXPIRY_MINUTES")
    jwt_refresh_expiry_days: int = Field(alias="JWT_REFRESH_EXPIRY_DAYS")
    encryption_key: str = Field(alias="ENCRYPTION_KEY")
    redis_url: str = Field(alias="REDIS_URL")
    aws_region: str = Field(alias="AWS_REGION")
    aws_access_key_id: str = Field(alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(alias="AWS_SECRET_ACCESS_KEY")
    sqs_calendar_sync_url: str = Field(alias="SQS_CALENDAR_SYNC_URL")
    sqs_insight_recalc_url: str = Field(alias="SQS_INSIGHT_RECALC_URL")
    sqs_weekly_digest_url: str = Field(alias="SQS_WEEKLY_DIGEST_URL")
    sqs_tax_deadline_url: str = Field(alias="SQS_TAX_DEADLINE_URL")
    ses_from_email: str = Field(alias="SES_FROM_EMAIL")
    google_client_id: str = Field(alias="GOOGLE_CLIENT_ID")
    google_client_secret: str = Field(alias="GOOGLE_CLIENT_SECRET")
    google_redirect_uri: str = Field(alias="GOOGLE_REDIRECT_URI")
    sentry_dsn: str = Field(alias="SENTRY_DSN")
    port: int = Field(alias="PORT")
    environment: str = Field(alias="ENVIRONMENT")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
