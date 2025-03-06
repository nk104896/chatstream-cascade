
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Optional
from datetime import datetime
import json
import os
import requests
from database import get_db
from models import User, ChatThread, Message
from schemas import ChatThreadCreate, ChatThreadResponse, MessageCreate, MessageResponse, ChatHistoryByDate
from utils import get_current_user
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

# AI Provider API Handlers
def process_openai_request(content, model):
    """Process request using OpenAI API"""
    api_key = os.getenv("OPENAI_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": content}],
        "max_tokens": 1000
    }
    
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=payload
    )
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OpenAI API error: {response.text}"
        )
    
    response_data = response.json()
    return response_data["choices"][0]["message"]["content"]

def process_gemini_request(content, model):
    """Process request using Google's Gemini API"""
    api_key = os.getenv("GEMINI_API_KEY")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    payload = {
        "contents": [{"parts": [{"text": content}]}],
        "generationConfig": {
            "maxOutputTokens": 1000,
            "temperature": 0.7
        }
    }
    
    response = requests.post(
        url,
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini API error: {response.text}"
        )
    
    response_data = response.json()
    return response_data["candidates"][0]["content"]["parts"][0]["text"]

def process_deepseek_request(content, model):
    """Process request using DeepSeek API"""
    # Placeholder for DeepSeek API integration
    return f"DeepSeek response using {model}: This is a simulated response for '{content}'"

def process_mistral_request(content, model):
    """Process request using Mistral API"""
    # Placeholder for Mistral API integration
    return f"Mistral response using {model}: This is a simulated response for '{content}'"

def get_ai_response(content, provider, model):
    """Route the request to the appropriate AI provider"""
    if provider == "openai":
        return process_openai_request(content, model)
    elif provider == "gemini":
        return process_gemini_request(content, model)
    elif provider == "deepseek":
        return process_deepseek_request(content, model)
    elif provider == "mistral":
        return process_mistral_request(content, model)
    else:
        # Fallback to a generic response if provider not supported
        return f"Using {provider}'s {model}: I understand your message and am here to help."

@router.post("/process-message", response_model=MessageResponse)
async def process_message(
    message_content: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process a user message and generate an AI response based on selected provider and model.
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
    
    try:
        # Get response from the selected AI provider and model
        response_text = get_ai_response(content, provider, model)
        
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
        
    except Exception as e:
        # Handle any errors during API processing
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing message: {str(e)}"
        )
