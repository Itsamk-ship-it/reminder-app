"""
Pydantic Schemas for Request/Response Validation
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum
import phonenumbers
import pytz

from app.config import get_settings

settings = get_settings()


def normalize_phone_number(value: str) -> str:
    """Normalize local or E.164 input into E.164 format."""
    region = None if value.strip().startswith("+") else settings.DEFAULT_PHONE_REGION

    try:
        parsed = phonenumbers.parse(value, region)
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError("Invalid phone number")
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except phonenumbers.NumberParseException:
        raise ValueError(
            "Invalid phone number format. Use an international format like +923001234567 or a valid local number"
        )


class ReminderStatus(str, Enum):
    """Reminder status enumeration"""
    SCHEDULED = "scheduled"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ReminderBase(BaseModel):
    """Base schema for reminder"""
    title: str = Field(..., min_length=1, max_length=255, description="Reminder title")
    message: str = Field(..., min_length=1, description="Message to be spoken")
    phone_number: str = Field(..., description="Phone number in E.164 format")
    scheduled_at: datetime = Field(..., description="Scheduled date and time")
    timezone: str = Field(default="UTC", description="Timezone for the reminder")
    
    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        """Validate phone number format"""
        return normalize_phone_number(v)
    
    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, v: str) -> str:
        """Validate timezone"""
        if v not in pytz.all_timezones:
            raise ValueError(f"Invalid timezone: {v}")
        return v
    
    @field_validator("scheduled_at")
    @classmethod
    def validate_scheduled_at(cls, v: datetime) -> datetime:
        """Ensure scheduled time is in the future"""
        now = datetime.now(v.tzinfo) if v.tzinfo else datetime.utcnow()
        if v.replace(tzinfo=None) < now.replace(tzinfo=None):
            raise ValueError("Scheduled time must be in the future")
        return v


class ReminderCreate(ReminderBase):
    """Schema for creating a reminder"""
    pass


class ReminderUpdate(BaseModel):
    """Schema for updating a reminder"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    message: Optional[str] = Field(None, min_length=1)
    phone_number: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    timezone: Optional[str] = None
    
    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: Optional[str]) -> Optional[str]:
        """Validate phone number format"""
        if v is None:
            return v
        return normalize_phone_number(v)
    
    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, v: Optional[str]) -> Optional[str]:
        """Validate timezone"""
        if v is None:
            return v
        if v not in pytz.all_timezones:
            raise ValueError(f"Invalid timezone: {v}")
        return v


class ReminderResponse(BaseModel):
    """Schema for reminder response"""
    id: int
    title: str
    message: str
    phone_number: str
    scheduled_at: datetime
    timezone: str
    status: ReminderStatus
    call_id: Optional[str] = None
    call_started_at: Optional[datetime] = None
    call_ended_at: Optional[datetime] = None
    call_duration: Optional[int] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ReminderListResponse(BaseModel):
    """Schema for paginated reminder list"""
    items: List[ReminderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ReminderFilter(BaseModel):
    """Schema for filtering reminders"""
    status: Optional[ReminderStatus] = None
    search: Optional[str] = None
    sort_by: str = Field(default="scheduled_at", description="Field to sort by")
    sort_order: str = Field(default="asc", description="Sort order: asc or desc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)


class TimezoneResponse(BaseModel):
    """Schema for timezone response"""
    timezones: List[str]


class HealthResponse(BaseModel):
    """Schema for health check response"""
    status: str
    timestamp: datetime
    version: str


class ErrorResponse(BaseModel):
    """Schema for error response"""
    detail: str
    code: Optional[str] = None
