"""
Reminder Service - Business Logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from datetime import datetime, timezone
from typing import Optional, List, Tuple
import logging

from app.models import Reminder, ReminderStatus
from app.schemas import ReminderCreate, ReminderUpdate, ReminderFilter

logger = logging.getLogger(__name__)


class ReminderService:
    """Service for managing reminders"""
    
    @staticmethod
    def create_reminder(db: Session, reminder_data: ReminderCreate) -> Reminder:
        """Create a new reminder"""
        db_reminder = Reminder(
            title=reminder_data.title,
            message=reminder_data.message,
            phone_number=reminder_data.phone_number,
            scheduled_at=reminder_data.scheduled_at,
            timezone=reminder_data.timezone,
            status=ReminderStatus.SCHEDULED
        )
        
        db.add(db_reminder)
        db.commit()
        db.refresh(db_reminder)
        
        logger.info(f"Created reminder: {db_reminder.id}")
        return db_reminder
    
    @staticmethod
    def get_reminder(db: Session, reminder_id: int) -> Optional[Reminder]:
        """Get a reminder by ID"""
        return db.query(Reminder).filter(Reminder.id == reminder_id).first()
    
    @staticmethod
    def get_reminders(
        db: Session, 
        filters: ReminderFilter
    ) -> Tuple[List[Reminder], int]:
        """Get reminders with filtering and pagination"""
        query = db.query(Reminder)
        
        # Apply status filter
        if filters.status:
            query = query.filter(Reminder.status == filters.status)
        
        # Apply search filter
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Reminder.title.ilike(search_term),
                    Reminder.message.ilike(search_term)
                )
            )
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        sort_column = getattr(Reminder, filters.sort_by, Reminder.scheduled_at)
        if filters.sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        reminders = query.offset(offset).limit(filters.page_size).all()
        
        return reminders, total
    
    @staticmethod
    def update_reminder(
        db: Session, 
        reminder_id: int, 
        update_data: ReminderUpdate
    ) -> Optional[Reminder]:
        """Update a reminder"""
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        
        if not reminder:
            return None
        
        # Only allow updates if reminder is scheduled
        if reminder.status != ReminderStatus.SCHEDULED:
            raise ValueError("Cannot update a reminder that is not scheduled")
        
        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            if value is not None:
                setattr(reminder, field, value)
        
        db.commit()
        db.refresh(reminder)
        
        logger.info(f"Updated reminder: {reminder_id}")
        return reminder
    
    @staticmethod
    def delete_reminder(db: Session, reminder_id: int) -> bool:
        """Delete a reminder"""
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        
        if not reminder:
            return False
        
        db.delete(reminder)
        db.commit()
        
        logger.info(f"Deleted reminder: {reminder_id}")
        return True
    
    @staticmethod
    def get_due_reminders(db: Session) -> List[Reminder]:
        """Get all reminders that are due for processing"""
        now = datetime.now(timezone.utc)
        
        return db.query(Reminder).filter(
            Reminder.status == ReminderStatus.SCHEDULED,
            Reminder.scheduled_at <= now,
            Reminder.call_id.is_(None)
        ).all()

    @staticmethod
    def get_active_call_reminders(db: Session) -> List[Reminder]:
        """Get reminders with initiated calls awaiting final status."""
        return db.query(Reminder).filter(
            Reminder.status == ReminderStatus.SCHEDULED,
            Reminder.call_id.is_not(None)
        ).all()
    
    @staticmethod
    def update_reminder_status(
        db: Session,
        reminder_id: int,
        status: ReminderStatus,
        call_id: Optional[str] = None,
        reset_call_id: bool = False,
        error_message: Optional[str] = None,
        call_started_at: Optional[datetime] = None,
        call_ended_at: Optional[datetime] = None,
        call_duration: Optional[int] = None
    ) -> Optional[Reminder]:
        """Update reminder status after call attempt"""
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        
        if not reminder:
            return None
        
        reminder.status = status
        
        if reset_call_id:
            reminder.call_id = None
        elif call_id is not None:
            reminder.call_id = call_id
        if error_message:
            reminder.error_message = error_message
        if call_started_at:
            reminder.call_started_at = call_started_at
        if call_ended_at:
            reminder.call_ended_at = call_ended_at
        if call_duration:
            reminder.call_duration = call_duration
        
        db.commit()
        db.refresh(reminder)
        
        return reminder
    
    @staticmethod
    def increment_retry_count(db: Session, reminder_id: int) -> Optional[Reminder]:
        """Increment retry count for a reminder"""
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        
        if not reminder:
            return None
        
        reminder.retry_count += 1
        db.commit()
        db.refresh(reminder)
        
        return reminder


# Singleton instance
reminder_service = ReminderService()
