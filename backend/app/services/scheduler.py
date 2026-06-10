"""
Scheduler Service for Processing Due Reminders
"""
import asyncio
import logging
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.database import SessionLocal
from app.models import Reminder, ReminderStatus
from app.services.vapi_service import vapi_service
from app.services.reminder_service import reminder_service

logger = logging.getLogger(__name__)

# Maximum retry attempts
MAX_RETRIES = 3


class ReminderScheduler:
    """Scheduler for processing due reminders"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self._is_running = False
    
    def start(self):
        """Start the scheduler"""
        if not self._is_running:
            # Check for due reminders every 30 seconds
            self.scheduler.add_job(
                self.process_due_reminders,
                IntervalTrigger(seconds=30),
                id="process_due_reminders",
                replace_existing=True
            )
            
            self.scheduler.start()
            self._is_running = True
            logger.info("Reminder scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        if self._is_running:
            self.scheduler.shutdown()
            self._is_running = False
            logger.info("Reminder scheduler stopped")
    
    async def process_due_reminders(self):
        """Process all due reminders"""
        db = SessionLocal()
        try:
            due_reminders = reminder_service.get_due_reminders(db)
            active_call_reminders = reminder_service.get_active_call_reminders(db)
            
            if due_reminders:
                logger.info(f"Found {len(due_reminders)} due reminders")
            if active_call_reminders:
                logger.info(f"Found {len(active_call_reminders)} active calls to reconcile")
            
            for reminder in due_reminders:
                await self.process_reminder(db, reminder)

            for reminder in active_call_reminders:
                await self.reconcile_call_status(db, reminder)
                
        except Exception as e:
            logger.error(f"Error processing due reminders: {str(e)}")
        finally:
            db.close()
    
    async def process_reminder(self, db, reminder: Reminder):
        """Process a single reminder by triggering a call"""
        logger.info(f"Processing reminder {reminder.id}: {reminder.title}")
        
        try:
            # Trigger the call via Vapi
            result = await vapi_service.create_call(
                to_number=reminder.phone_number,
                message=reminder.message,
                reminder_title=reminder.title
            )
            
            if result.get("success"):
                # Call initiated successfully
                call_id = result.get("call_id")
                logger.info(f"Call initiated for reminder {reminder.id}: {call_id}")
                
                # Store call id; final state is reconciled later from provider status.
                reminder_service.update_reminder_status(
                    db=db,
                    reminder_id=reminder.id,
                    status=ReminderStatus.SCHEDULED,
                    call_id=call_id,
                    call_started_at=datetime.now(timezone.utc)
                )
                
            else:
                # Call failed
                error = result.get("error", "Unknown error")
                logger.error(f"Call failed for reminder {reminder.id}: {error}")
                
                # Increment retry count
                reminder_service.increment_retry_count(db, reminder.id)
                
                # Check if max retries exceeded
                if reminder.retry_count >= MAX_RETRIES:
                    reminder_service.update_reminder_status(
                        db=db,
                        reminder_id=reminder.id,
                        status=ReminderStatus.FAILED,
                        error_message=f"Max retries exceeded. Last error: {error}"
                    )
                else:
                    reminder_service.update_reminder_status(
                        db=db,
                        reminder_id=reminder.id,
                        status=ReminderStatus.SCHEDULED,  # Keep scheduled for retry
                        error_message=error
                    )
                    
        except Exception as e:
            logger.error(f"Exception processing reminder {reminder.id}: {str(e)}")
            
            reminder_service.increment_retry_count(db, reminder.id)

            if reminder.retry_count >= MAX_RETRIES:
                reminder_service.update_reminder_status(
                    db=db,
                    reminder_id=reminder.id,
                    status=ReminderStatus.FAILED,
                    error_message=str(e)
                )

    async def reconcile_call_status(self, db, reminder: Reminder):
        """Sync reminder status with provider call state."""
        if not reminder.call_id:
            return

        status_result = await vapi_service.get_call_status(reminder.call_id)
        if not status_result.get("success"):
            logger.warning(
                f"Could not fetch status for reminder {reminder.id} call {reminder.call_id}: "
                f"{status_result.get('error')}"
            )
            return

        provider_status = (status_result.get("status") or "").lower()
        if provider_status in {"queued", "ringing", "in-progress", "in_progress", "started"}:
            return

        if provider_status in {"ended", "completed", "succeeded", "success"}:
            reminder_service.update_reminder_status(
                db=db,
                reminder_id=reminder.id,
                status=ReminderStatus.COMPLETED,
                call_ended_at=datetime.now(timezone.utc)
            )
            return

        if provider_status in {"failed", "no-answer", "no_answer", "busy", "canceled", "cancelled"}:
            reminder_service.increment_retry_count(db, reminder.id)

            if reminder.retry_count >= MAX_RETRIES:
                reminder_service.update_reminder_status(
                    db=db,
                    reminder_id=reminder.id,
                    status=ReminderStatus.FAILED,
                    error_message=f"Call {provider_status}"
                )
            else:
                reminder_service.update_reminder_status(
                    db=db,
                    reminder_id=reminder.id,
                    status=ReminderStatus.SCHEDULED,
                    reset_call_id=True,
                    error_message=f"Call {provider_status}"
                )


# Singleton instance
reminder_scheduler = ReminderScheduler()
