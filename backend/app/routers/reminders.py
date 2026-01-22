"""
Reminder API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone
import pytz
import math

from app.database import get_db
from app.schemas import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
    ReminderListResponse,
    ReminderFilter,
    ReminderStatus,
    TimezoneResponse
)
from app.services.reminder_service import reminder_service

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    reminder_data: ReminderCreate,
    db: Session = Depends(get_db)
):
    """Create a new reminder"""
    try:
        reminder = reminder_service.create_reminder(db, reminder_data)
        return ReminderResponse.model_validate(reminder)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=ReminderListResponse)
async def list_reminders(
    status: Optional[ReminderStatus] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in title and message"),
    sort_by: str = Query("scheduled_at", description="Field to sort by"),
    sort_order: str = Query("asc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db)
):
    """List reminders with filtering and pagination"""
    filters = ReminderFilter(
        status=status,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    
    reminders, total = reminder_service.get_reminders(db, filters)
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return ReminderListResponse(
        items=[ReminderResponse.model_validate(r) for r in reminders],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/timezones", response_model=TimezoneResponse)
async def get_timezones():
    """Get list of all timezones"""
    # Return all valid timezones from pytz
    import pytz
    all_timezones = sorted(pytz.all_timezones)
    return TimezoneResponse(timezones=all_timezones)


@router.get("/{reminder_id}", response_model=ReminderResponse)
async def get_reminder(
    reminder_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific reminder by ID"""
    reminder = reminder_service.get_reminder(db, reminder_id)
    
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    
    return ReminderResponse.model_validate(reminder)


@router.put("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: int,
    update_data: ReminderUpdate,
    db: Session = Depends(get_db)
):
    """Update a reminder"""
    try:
        reminder = reminder_service.update_reminder(db, reminder_id, update_data)
        
        if not reminder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reminder not found"
            )
        
        return ReminderResponse.model_validate(reminder)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db)
):
    """Delete a reminder"""
    success = reminder_service.delete_reminder(db, reminder_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
