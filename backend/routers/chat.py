
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Optional
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
    # ... keep existing code (message creation logic)

@router.get("/history", response_model=Dict[str, List[ChatThreadResponse]])
async def get_history_by_date(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ... keep existing code (history retrieval logic)

@router.post("/process-message", response_model=MessageResponse)
async def process_message(
    message_content: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process a user message and generate an AI response.
    Now supports different AI providers and models.
    """
    content = message_content.get("content", "")
    thread_id = message_content.get("thread_id")
    provider = message_content.get("provider", "openai")
    model = message_content.get("model", "gpt-4o")
    
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
    
    # In a real app, call your AI service here based on provider and model
    # For now, simulate a simple response with provider and model info
    if "hello" in content.lower() or "hi" in content.lower():
        response_text = f"Hello! I'm using {provider}'s {model}. How can I assist you today?"
    elif "help" in content.lower():
        response_text = f"I'm here to help! I'm powered by {provider}'s {model}. What do you need assistance with?"
    elif "thanks" in content.lower() or "thank you" in content.lower():
        response_text = f"You're welcome! Using {provider}'s {model} to assist you. Is there anything else you'd like to know?"
    elif "feature" in content.lower():
        response_text = f"This chat application supports text messaging, file attachments, conversation history, and multiple AI models including {provider}'s {model}. Is there a specific feature you're interested in?"
    else:
        response_text = f"I understand your message. I'm using {provider}'s {model} to help you. How can I help you further with that?"
    
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
