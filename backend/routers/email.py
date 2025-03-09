
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
from database import get_db
from models import User
from email_service import EmailService
from utils import get_current_user
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()
email_service = EmailService()

@router.post("/send-test-email", status_code=status.HTTP_200_OK)
async def send_test_email(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a test email to verify SMTP settings
    Only available to authenticated users
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    recipient = data.get("recipient", current_user.email)
    
    # Send test email
    success = email_service.send_email(
        recipient_email=recipient,
        subject="Test Email from Multi-Chat AI",
        html_content="""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">Test Email</h2>
            <p>This is a test email from Multi-Chat AI to verify your SMTP settings.</p>
            <p>If you received this email, your email configuration is working correctly!</p>
        </div>
        """
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send test email. Check SMTP settings and logs."
        )
    
    return {"message": "Test email sent successfully", "recipient": recipient}

@router.post("/send-password-reset", status_code=status.HTTP_200_OK)
async def send_password_reset(
    data: Dict[str, Any] = Body(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
):
    """Send a password reset email to a user"""
    email = data.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    # Find user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal if user exists, just return success
        return {"message": "If a user with this email exists, a password reset link has been sent."}
    
    # Generate reset token (you could enhance this with JWT)
    import secrets
    import time
    token = f"{secrets.token_urlsafe(32)}-{int(time.time())}"
    
    # Store token in the database (you might need to add a reset_token field to User model)
    # For this example, we're not actually storing it
    
    # Generate reset link
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    # Send email (in background if possible)
    if background_tasks:
        background_tasks.add_task(
            email_service.send_password_reset_email,
            user.email,
            reset_link
        )
    else:
        success = email_service.send_password_reset_email(user.email, reset_link)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send password reset email"
            )
    
    return {"message": "If a user with this email exists, a password reset link has been sent."}
