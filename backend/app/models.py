"""
Database Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.database import Base


class ReminderStatus(str, enum.Enum):
    """Reminder status enumeration"""
    SCHEDULED = "scheduled"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Reminder(Base):
    """Reminder model"""
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Reminder content
    title = Column(String(255), nullable=False, index=True)
    message = Column(Text, nullable=False)
    
    # Contact information
    phone_number = Column(String(20), nullable=False)
    
    # Scheduling
    scheduled_at = Column(DateTime(timezone=True), nullable=False, index=True)
    timezone = Column(String(50), nullable=False, default="UTC")
    
    # Status tracking
    status = Column(
        SQLEnum(ReminderStatus), 
        nullable=False, 
        default=ReminderStatus.SCHEDULED,
        index=True
    )
    
    # Call tracking
    call_id = Column(String(255), nullable=True)  # Vapi call ID
    call_started_at = Column(DateTime(timezone=True), nullable=True)
    call_ended_at = Column(DateTime(timezone=True), nullable=True)
    call_duration = Column(Integer, nullable=True)  # Duration in seconds
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False
    )
    
    def __repr__(self):
        return f"<Reminder(id={self.id}, title='{self.title}', status={self.status})>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "phone_number": self.phone_number,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "timezone": self.timezone,
            "status": self.status.value,
            "call_id": self.call_id,
            "call_started_at": self.call_started_at.isoformat() if self.call_started_at else None,
            "call_ended_at": self.call_ended_at.isoformat() if self.call_ended_at else None,
            "call_duration": self.call_duration,
            "error_message": self.error_message,
            "retry_count": self.retry_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
