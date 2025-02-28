
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict
from datetime import datetime
import json
from database import get_db
from models import User, ChatThread, Message
from schemas import ChatThreadCreate, ChatThreadResponse, MessageCreate, MessageResponse, ChatHistoryByDate
from utils import get_current_user

router = APIRouter()

@router.post("/threads", response_model=ChatThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_thread(
    thread: ChatThreadCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create new thread
    new_thread = ChatThread(title=thread.title)
    new_thread.users.append(current_user)
    
    # Add to database
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    
    return new_thread

@router.get("/threads", response_model=List[ChatThreadResponse])
async def get_threads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get all threads for current user
    threads = db.query(ChatThread).filter(
        ChatThread.users.any(id=current_user.id)
    ).order_by(desc(ChatThread.updated_at)).all()
    
    return threads

@router.get("/threads/{thread_id}", response_model=ChatThreadResponse)
async def get_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get thread by ID
    thread = db.query(ChatThread).filter(
        ChatThread.id == thread_id,
        ChatThread.users.any(id=current_user.id)
    ).first()
    
    if thread is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )
    
    return thread

@router.delete("/threads/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get thread by ID
    thread = db.query(ChatThread).filter(
        ChatThread.id == thread_id,
        ChatThread.users.any(id=current_user.id)
    ).first()
    
    if thread is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )
    
    # Delete thread
    db.delete(thread)
    db.commit()
    
    return None

@router.post("/threads/{thread_id}/messages", response_model=MessageResponse)
async def create_message(
    thread_id: str,
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get thread by ID
    thread = db.query(ChatThread).filter(
        ChatThread.id == thread_id,
        ChatThread.users.any(id=current_user.id)
    ).first()
    
    if thread is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )
    
    # Create new message
    new_message = Message(
        content=message.content,
        sender=message.sender,
        thread_id=thread.id,
        user_id=current_user.id if message.sender == "user" else None
    )
    
    # Add to database
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    # Create files if any
    if message.files:
        from models import FileAttachment
        for file_data in message.files:
            new_file = FileAttachment(
                name=file_data.name,
                type=file_data.type,
                size=file_data.size,
                url=file_data.url,
                preview=file_data.preview,
                message_id=new_message.id
            )
            db.add(new_file)
        
        db.commit()
        db.refresh(new_message)
    
    # Update thread's updated_at timestamp
    thread.updated_at = datetime.utcnow()
    db.commit()
    
    return new_message

@router.get("/history", response_model=Dict[str, List[ChatThreadResponse]])
async def get_history_by_date(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get all threads for current user
    threads = db.query(ChatThread).filter(
        ChatThread.users.any(id=current_user.id)
    ).order_by(desc(ChatThread.updated_at)).all()
    
    # Group threads by date
    history_by_date = {}
    for thread in threads:
        date_str = thread.created_at.strftime("%B %d, %Y")
        if date_str not in history_by_date:
            history_by_date[date_str] = []
        history_by_date[date_str].append(thread)
    
    return history_by_date

@router.post("/process-message", response_model=MessageResponse)
async def process_message(
    message_content: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process a user message and generate an AI response.
    In a real application, this would involve calling an AI service.
    """
    content = message_content.get("content", "")
    thread_id = message_content.get("thread_id")
    
    # Validate thread
    thread = db.query(ChatThread).filter(
        ChatThread.id == thread_id,
        ChatThread.users.any(id=current_user.id)
    ).first()
    
    if thread is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )
    
    # In a real app, call your AI service here
    # For now, simulate a simple response
    if "hello" in content.lower() or "hi" in content.lower():
        response_text = "Hello! How can I assist you today?"
    elif "help" in content.lower():
        response_text = "I'm here to help! What do you need assistance with?"
    elif "thanks" in content.lower() or "thank you" in content.lower():
        response_text = "You're welcome! Is there anything else you'd like to know?"
    elif "feature" in content.lower():
        response_text = "This chat application supports text messaging, file attachments, and conversation history. Is there a specific feature you're interested in?"
    else:
        response_text = "I understand your message. How can I help you further with that?"
    
    # Create AI response message
    ai_message = Message(
        content=response_text,
        sender="assistant",
        thread_id=thread.id
    )
    
    # Add to database
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    
    # Update thread's updated_at timestamp
    thread.updated_at = datetime.utcnow()
    db.commit()
    
    return ai_message
