
from fastapi import APIRouter, Depends, HTTPException, status, Body, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json
import os
import requests
from database import get_db
from models import User, ChatThread, Message, FileAttachment
from schemas import ChatThreadCreate, ChatThreadResponse, MessageCreate, MessageResponse, ChatHistoryByDate
from utils import get_current_user
from dotenv import load_dotenv
from file_processors import prepare_files_for_ai, format_files_for_provider

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
    new_thread = ChatThread(
        title=thread.title,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
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

@router.put("/threads/{thread_id}", response_model=ChatThreadResponse)
async def update_thread(
    thread_id: str,
    thread_data: ChatThreadCreate,
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
    
    # Update thread data
    thread.title = thread_data.title
    thread.updated_at = datetime.utcnow()
    
    # Commit changes
    db.commit()
    db.refresh(thread)
    
    return thread

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
    
    # Process files if any
    if message.files:
        for file_data in message.files:
            file_attachment = FileAttachment(
                id=file_data.id,
                name=file_data.name,
                type=file_data.type,
                size=file_data.size,
                url=file_data.url,
                preview=file_data.preview,
                message_id=new_message.id
            )
            db.add(file_attachment)
        
        db.commit()
    
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
        # Format date as YYYY-MM-DD
        date_str = thread.updated_at.strftime("%Y-%m-%d")
        
        # Format date for display (e.g., "Today", "Yesterday", or "Month Day")
        today = datetime.utcnow().date()
        thread_date = thread.updated_at.date()
        
        if thread_date == today:
            display_date = "Today"
        elif thread_date == (today - timedelta(days=1)):
            display_date = "Yesterday"
        else:
            # Format as "Month Day" (e.g., "June 15")
            display_date = thread.updated_at.strftime("%B %d")
        
        # Add thread to appropriate date group
        if display_date not in history_by_date:
            history_by_date[display_date] = []
        
        history_by_date[display_date].append(thread)
    
    return history_by_date

# AI Provider API Handlers
def process_openai_request(messages, model, files=None):
    """Process request using OpenAI API with message history and files"""
    api_key = os.getenv("OPENAI_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Format messages for OpenAI
    formatted_messages = messages
    
    # If there are files, add their content to the first user message
    if files and len(files) > 0:
        file_content = format_files_for_provider(files, "openai")
        
        # Find the last user message and add file content
        for i in range(len(formatted_messages) - 1, -1, -1):
            if formatted_messages[i]["role"] == "user":
                formatted_messages[i]["content"] = f"{file_content}\n\n{formatted_messages[i]['content']}"
                break
    
    payload = {
        "model": model,
        "messages": formatted_messages,
        "max_tokens": 1500
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

def process_gemini_request(messages, model, files=None):
    """Process request using Google's Gemini API with message history and files"""
    api_key = os.getenv("GEMINI_API_KEY")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    # Format messages for Gemini
    formatted_contents = []
    
    # Gemini uses a different format, so we need to convert our messages
    for msg in messages:
        if msg["role"] == "user":
            role = "user"
        elif msg["role"] == "assistant" or msg["role"] == "model":
            role = "model"
        else:
            role = "user"  # Default to user for system messages
        
        formatted_contents.append({
            "role": role,
            "parts": [{"text": msg["content"]}]
        })
    
    # If there are files, add their content to the latest user message
    if files and len(files) > 0:
        file_content = format_files_for_provider(files, "gemini")
        
        # Find the last user message and add file content
        for i in range(len(formatted_contents) - 1, -1, -1):
            if formatted_contents[i]["role"] == "user":
                current_text = formatted_contents[i]["parts"][0]["text"]
                formatted_contents[i]["parts"][0]["text"] = f"{file_content}\n\n{current_text}"
                break
    
    payload = {
        "contents": formatted_contents,
        "generationConfig": {
            "maxOutputTokens": 1500,
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

def process_mistral_request(messages, model, files=None):
    """Process request using Mistral API with message history and files"""
    # Placeholder for Mistral API integration
    return f"Mistral response using {model}: This is a simulated response"

def get_ai_response(messages, provider, model, files=None):
    """Route the request to the appropriate AI provider with message history and files"""
    if provider == "openai":
        return process_openai_request(messages, model, files)
    elif provider == "gemini":
        return process_gemini_request(messages, model, files)
    elif provider == "mistral":
        return process_mistral_request(messages, model, files)
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
    Process a user message with context history and generate an AI response
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
        # Get message history and format for AI
        messages = []
        
        # Include system instruction for better response quality
        system_message = {
            "role": "system",
            "content": "You are a helpful assistant that provides accurate, informative, and friendly responses."
        }
        messages.append(system_message)
        
        # Get the thread's message history (limited to last 10 messages for context)
        thread_messages = db.query(Message).filter(
            Message.thread_id == thread_id
        ).order_by(Message.timestamp.desc()).limit(10).all()
        
        # Reverse to get chronological order
        thread_messages.reverse()
        
        # Convert to AI format
        for msg in thread_messages:
            messages.append({
                "role": "user" if msg.sender == "user" else "assistant",
                "content": msg.content
            })
        
        # Add the current message
        messages.append({
            "role": "user",
            "content": content
        })
        
        # Process file attachments if any
        files_content = None
        last_message = db.query(Message).filter(
            Message.thread_id == thread_id,
            Message.sender == "user"
        ).order_by(Message.timestamp.desc()).first()
        
        if last_message and last_message.files:
            files_content = prepare_files_for_ai(last_message.files)
        
        # Get response from the selected AI provider and model
        response_text = get_ai_response(messages, provider, model, files_content)
        
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
