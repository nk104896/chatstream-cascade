
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Body
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import User
from utils import get_current_user
from dotenv import load_dotenv
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel, EmailStr, Field

# Load environment variables
load_dotenv()

router = APIRouter()

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "True").lower() in ["true", "1", "yes"]
DEFAULT_SENDER = SMTP_USER

# Email schemas
class EmailContent(BaseModel):
    recipient: EmailStr
    subject: str
    body_html: str
    body_text: Optional[str] = None
    sender: Optional[EmailStr] = None

# Send email function
def send_email_background(
    recipient: str,
    subject: str,
    body_html: str,
    body_text: str = None,
    sender: str = DEFAULT_SENDER
):
    """Send email in background task"""
    try:
        # Create MIME message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = sender
        message["To"] = recipient
        
        # Add plain text part if provided, otherwise use a default
        if not body_text:
            body_text = "Please view this email in an HTML compatible client."
        
        # Attach parts
        part1 = MIMEText(body_text, "plain")
        part2 = MIMEText(body_html, "html")
        message.attach(part1)
        message.attach(part2)
        
        # Connect to SMTP server
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            if SMTP_USE_TLS:
                server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(sender, recipient, message.as_string())
            
        print(f"Successfully sent email to {recipient}")
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False

# Email templates
def get_verification_email(name: str, verification_link: str) -> tuple:
    """Generate verification email HTML and text versions"""
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #2c3e50;">Verify Your Email Address</h2>
        <p>Hello {name},</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{verification_link}" 
               style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
               Verify Email
            </a>
        </p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 14px; color: #7f8c8d;">{verification_link}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
        <p style="font-size: 12px; color: #7f8c8d; text-align: center;">
            © Multi-Chat AI Platform
        </p>
    </body>
    </html>
    """
    
    text = f"""
    Verify Your Email Address
    
    Hello {name},
    
    Thank you for signing up! Please verify your email address by clicking the link below:
    
    {verification_link}
    
    This link will expire in 24 hours.
    
    If you didn't create this account, you can safely ignore this email.
    
    © Multi-Chat AI Platform
    """
    
    return html, text

def get_password_reset_email(name: str, reset_link: str) -> tuple:
    """Generate password reset email HTML and text versions"""
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #2c3e50;">Reset Your Password</h2>
        <p>Hello {name},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" 
               style="background-color: #e74c3c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
               Reset Password
            </a>
        </p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 14px; color: #7f8c8d;">{reset_link}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
        <p style="font-size: 12px; color: #7f8c8d; text-align: center;">
            © Multi-Chat AI Platform
        </p>
    </body>
    </html>
    """
    
    text = f"""
    Reset Your Password
    
    Hello {name},
    
    We received a request to reset your password. Click the link below to set a new password:
    
    {reset_link}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, you can safely ignore this email.
    
    © Multi-Chat AI Platform
    """
    
    return html, text

# API Endpoints
@router.post("/send-verification", status_code=status.HTTP_202_ACCEPTED)
async def send_verification_email(
    background_tasks: BackgroundTasks,
    email: EmailStr = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Send a verification email to a user"""
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate verification link (in a real app, this would include a token)
    verification_link = f"http://localhost:3000/verify?token=verification_token_here&email={email}"
    
    # Generate email content
    html_content, text_content = get_verification_email(user.name, verification_link)
    
    # Send email in background
    background_tasks.add_task(
        send_email_background,
        recipient=email,
        subject="Verify Your Email Address",
        body_html=html_content,
        body_text=text_content
    )
    
    return {"message": "Verification email sent"}

@router.post("/send-password-reset", status_code=status.HTTP_202_ACCEPTED)
async def send_password_reset_email(
    background_tasks: BackgroundTasks,
    email: EmailStr = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Send a password reset email to a user"""
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate reset link (in a real app, this would include a token)
    reset_link = f"http://localhost:3000/reset-password?token=reset_token_here&email={email}"
    
    # Generate email content
    html_content, text_content = get_password_reset_email(user.name, reset_link)
    
    # Send email in background
    background_tasks.add_task(
        send_email_background,
        recipient=email,
        subject="Reset Your Password",
        body_html=html_content,
        body_text=text_content
    )
    
    return {"message": "Password reset email sent"}

@router.post("/send", status_code=status.HTTP_202_ACCEPTED)
async def send_custom_email(
    background_tasks: BackgroundTasks,
    email_content: EmailContent,
    current_user: User = Depends(get_current_user)
):
    """Send a custom email (requires authentication)"""
    # Use default sender if not provided
    sender = email_content.sender or DEFAULT_SENDER
    
    # Send email in background
    background_tasks.add_task(
        send_email_background,
        recipient=email_content.recipient,
        subject=email_content.subject,
        body_html=email_content.body_html,
        body_text=email_content.body_text,
        sender=sender
    )
    
    return {"message": "Email sent successfully"}
