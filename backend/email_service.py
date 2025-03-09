
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("email_service.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("email_service")

# Load environment variables
load_dotenv()

class EmailService:
    def __init__(
        self, 
        smtp_host=None, 
        smtp_port=None, 
        smtp_user=None, 
        smtp_password=None, 
        use_tls=True
    ):
        # Use provided values or fall back to environment variables
        self.smtp_host = smtp_host or os.getenv("SMTP_HOST")
        self.smtp_port = smtp_port or int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = smtp_user or os.getenv("SMTP_USER")
        self.smtp_password = smtp_password or os.getenv("SMTP_PASSWORD")
        self.use_tls = use_tls if use_tls is not None else os.getenv("SMTP_USE_TLS", "True").lower() == "true"
        
        # Validate required settings
        if not all([self.smtp_host, self.smtp_port, self.smtp_user, self.smtp_password]):
            logger.warning("SMTP configuration incomplete, email sending may fail")
    
    def send_email(self, 
                  recipient_email, 
                  subject, 
                  html_content,
                  text_content=None, 
                  sender_email=None,
                  reply_to=None,
                  max_retries=3):
        """
        Send an email using configured SMTP settings
        
        Args:
            recipient_email: Email address of the recipient
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content (fallback if HTML not supported)
            sender_email: Email address of the sender (falls back to SMTP_USER if not provided)
            reply_to: Reply-to email address
            max_retries: Maximum number of retry attempts if sending fails
        
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        if not all([self.smtp_host, self.smtp_port, self.smtp_user, self.smtp_password]):
            logger.error("SMTP configuration incomplete, cannot send email")
            return False
            
        # Use SMTP user as sender if not specified
        sender_email = sender_email or self.smtp_user
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = recipient_email
        
        if reply_to:
            msg['Reply-To'] = reply_to
            
        # Attach text content as fallback
        if text_content:
            msg.attach(MIMEText(text_content, 'plain'))
        else:
            # Generate simple text version from HTML if not provided
            simple_text = html_content.replace('<br>', '\n').replace('</p>', '\n\n')
            # Very basic HTML tag removal
            import re
            simple_text = re.sub(r'<[^>]+>', '', simple_text)
            msg.attach(MIMEText(simple_text, 'plain'))
            
        # Attach HTML content
        msg.attach(MIMEText(html_content, 'html'))
        
        # Try sending, with retries
        for attempt in range(max_retries):
            try:
                # Connect to SMTP server
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    if self.use_tls:
                        server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(msg)
                
                logger.info(f"Email sent to {recipient_email} successfully")
                return True
                
            except Exception as e:
                logger.error(f"Error sending email (attempt {attempt+1}/{max_retries}): {e}")
                if attempt == max_retries - 1:
                    logger.error(f"Max retries reached, email to {recipient_email} not sent")
                    return False
        
        return False
    
    def send_verification_email(self, user_email, verification_link):
        """Send a verification email to a new user"""
        subject = "Verify Your Multi-Chat AI Account"
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">Welcome to Multi-Chat AI!</h2>
            <p>Thank you for registering. Please verify your email address to activate your account.</p>
            <div style="margin: 30px 0;">
                <a href="{verification_link}" style="background-color: #3182ce; color: white; padding: 12px 24px; 
                   text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; color: #718096;">{verification_link}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        </div>
        """
        
        return self.send_email(user_email, subject, html_content)
    
    def send_password_reset_email(self, user_email, reset_link):
        """Send a password reset email"""
        subject = "Reset Your Multi-Chat AI Password"
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #3182ce; color: white; padding: 12px 24px; 
                   text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; color: #718096;">{reset_link}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
        """
        
        return self.send_email(user_email, subject, html_content)
    
    def send_notification_email(self, user_email, subject, message):
        """Send a general notification email"""
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">{subject}</h2>
            <p>{message}</p>
            <p style="margin-top: 30px; color: #718096;">
                - The Multi-Chat AI Team
            </p>
        </div>
        """
        
        return self.send_email(user_email, subject, html_content)
