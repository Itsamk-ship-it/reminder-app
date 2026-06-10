"""
Vapi Service for Voice Calls
"""
import httpx
import logging
from datetime import datetime
from typing import Optional, Dict, Any

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class VapiService:
    """Service for interacting with Vapi API"""
    
    BASE_URL = "https://api.vapi.ai"
    
    def __init__(self):
        self.api_key = settings.VAPI_API_KEY
        self.phone_number_id = settings.VAPI_PHONE_NUMBER_ID
        self.assistant_id = settings.VAPI_ASSISTANT_ID

    @staticmethod
    def _extract_error_message(response: httpx.Response) -> str:
        """Extract provider error in a user-friendly format."""
        try:
            data = response.json()
            message = data.get("message") or data.get("error") or response.text
        except Exception:
            message = response.text

        lower_msg = message.lower()
        if (
            "verified" in lower_msg
            and "number" in lower_msg
            and ("twilio" in lower_msg or "trial" in lower_msg)
        ):
            return (
                "Destination number is not allowed by your telephony provider. "
                "If you are on a Twilio trial account, verify the destination number "
                "or upgrade the account to call unverified numbers."
            )

        return message
        
    @property
    def headers(self) -> Dict[str, str]:
        """Get request headers"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def create_call(
        self, 
        to_number: str, 
        message: str,
        reminder_title: str = "Reminder"
    ) -> Dict[str, Any]:
        """
        Create an outbound call using Vapi
        
        Args:
            to_number: Phone number to call in E.164 format
            message: Message to speak during the call
            reminder_title: Title of the reminder for context
            
        Returns:
            Dict containing call information including call_id
        """
        # Use the pre-configured assistant with override for the message
        payload = {
            "phoneNumberId": self.phone_number_id,
            "assistantId": self.assistant_id,
            "customer": {
                "number": to_number
            },
            "assistantOverrides": {
                "firstMessage": f"Hi! This is Riley, your reminder assistant. I'm calling to remind you about: {reminder_title}. Here are the details: {message}. Did you get that?",
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.BASE_URL}/call/phone",
                    headers=self.headers,
                    json=payload
                )
                
                if response.status_code == 201:
                    data = response.json()
                    logger.info(f"Call created successfully: {data.get('id')}")
                    return {
                        "success": True,
                        "call_id": data.get("id"),
                        "status": data.get("status"),
                        "data": data
                    }
                else:
                    error_msg = self._extract_error_message(response)
                    logger.error(f"Failed to create call: {response.status_code} - {error_msg}")
                    return {
                        "success": False,
                        "error": error_msg,
                        "status_code": response.status_code
                    }
                    
        except httpx.TimeoutException:
            logger.error("Timeout while creating call")
            return {
                "success": False,
                "error": "Request timeout"
            }
        except Exception as e:
            logger.error(f"Error creating call: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """
        Get the status of a call
        
        Args:
            call_id: The Vapi call ID
            
        Returns:
            Dict containing call status information
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.BASE_URL}/call/{call_id}",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "call_id": call_id,
                        "status": data.get("status"),
                        "started_at": data.get("startedAt"),
                        "ended_at": data.get("endedAt"),
                        "duration": data.get("duration"),
                        "data": data
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text,
                        "status_code": response.status_code
                    }
                    
        except Exception as e:
            logger.error(f"Error getting call status: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def end_call(self, call_id: str) -> Dict[str, Any]:
        """
        End an active call
        
        Args:
            call_id: The Vapi call ID
            
        Returns:
            Dict containing result of end call request
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.BASE_URL}/call/{call_id}/stop",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    return {
                        "success": True,
                        "call_id": call_id,
                        "message": "Call ended successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": response.text,
                        "status_code": response.status_code
                    }
                    
        except Exception as e:
            logger.error(f"Error ending call: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }


# Singleton instance
vapi_service = VapiService()
