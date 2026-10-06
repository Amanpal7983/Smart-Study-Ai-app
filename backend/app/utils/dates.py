from datetime import date, datetime, timedelta, timezone


def today_str(tz_offset: int = 0) -> str:
    return (datetime.now(timezone.utc) - timedelta(minutes=tz_offset)).date().isoformat()


def validate_iso_date(value: str | None, field: str, required: bool = True) -> str:
    if not value:
        if required:
            raise ValueError(f"{field} is required")
        return ""
    try:
        date.fromisoformat(value)
    except ValueError:
        raise ValueError(f"{field} must be YYYY-MM-DD")
    return value


def days_between(a: str, b: str) -> int:
    return (date.fromisoformat(b) - date.fromisoformat(a)).days


def parse_created_at(value: datetime) -> str:
    return value.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
