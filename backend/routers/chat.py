from fastapi import APIRouter, Depends, HTTPException, status, Body, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any, Optional
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
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

# Load environment variables
load_dotenv()

router = APIRouter()

# Create a new chat thread
@router.post("/threads", response_model=ChatThreadResponse)
async def create_thread(
    thread: ChatThreadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new chat thread for the current user"""
    new_thread = ChatThread(
        title=thread.title
    )
    
    # Add user to the thread
    new_thread.users.append(current_user)
    
    # Add to database
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    
    return new_thread

# Get all threads for the current user
@router.get("/threads", response_model=List[ChatThreadResponse])
async def get_threads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all chat threads for the current user"""
    threads = db.query(ChatThread).filter(
        ChatThread.users.any(id=current_user.id)
    ).order_by(desc(ChatThread.updated_at)).all()
    
    return threads

# Get a specific thread by ID
@router.get("/threads/{thread_id}", response_model=ChatThreadResponse)
async def get_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific chat thread by ID"""
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

# Update a thread (e.g., change title)
@router.put("/threads/{thread_id}", response_model=ChatThreadResponse)
async def update_thread(
    thread_id: str,
    thread_update: ChatThreadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a chat thread's title"""
    thread = db.query(ChatThread).filter(
        ChatThread.id == thread_id,
        ChatThread.users.any(id=current_user.id)
    ).first()
    
    if thread is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )
    
    # Update thread
    thread.title = thread_update.title
    thread.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(thread)
    
    return thread

# Delete a thread
@router.delete("/threads/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a chat thread"""
    thread = db.query(ChatThread).filter(
        ChatThread.id == thread_id,
        ChatThread.users.any(id=current_user.id)
    ).first()
    
    if thread is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )
    
    # Delete the thread
    db.delete(thread)
    db.commit()
    
    return None

# Add a message to a thread
@router.post("/threads/{thread_id}/messages", response_model=MessageResponse)
async def create_message(
    thread_id: str,
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a message to a chat thread"""
    # Verify thread exists and user has access
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
    
    # Process file attachments if any
    if message.files and len(message.files) > 0:
        for file_data in message.files:
            file_attachment = FileAttachment(
                name=file_data.name,
                type=file_data.type,
                size=file_data.size,
                url=file_data.url,
                preview=file_data.preview,
                message_id=new_message.id
            )
            db.add(file_attachment)
        
        db.commit()
        db.refresh(new_message)
    
    # Update thread's updated_at timestamp
    thread.updated_at = datetime.utcnow()
    db.commit()
    
    return new_message

# Get chat history grouped by date
@router.get("/history", response_model=Dict[str, List[ChatThreadResponse]])
async def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat history grouped by date"""
    # Get all user threads
    threads = db.query(ChatThread).filter(
        ChatThread.users.any(id=current_user.id)
    ).order_by(desc(ChatThread.updated_at)).all()
    
    # Group by date
    history_by_date = {}
    
    for thread in threads:
        date_str = thread.created_at.strftime("%B %d, %Y")
        
        if date_str not in history_by_date:
            history_by_date[date_str] = []
            
        history_by_date[date_str].append(thread)
    
    return history_by_date

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
    has_images = message_content.get("has_images", False)
    
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
        response_text = get_ai_response(messages, provider, model, files_content, has_images)
        
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

# AI Provider API Handlers
def process_openai_request(messages, model, files=None, has_images=False):
    """Process request using OpenAI API with message history and files"""
    api_key = os.getenv("OPENAI_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Format messages for OpenAI
    formatted_messages = messages.copy()
    
    # Determine the right model based on image presence
    if has_images and files and any(f.get('is_image', False) for f in files):
        # Use the GPT-4o model for image inputs
        vision_model = "gpt-4o"
        
        # Format message content for vision model
        updated_messages = []
        
        # Include all previous messages except the last user message
        for i, msg in enumerate(formatted_messages[:-1]):
            updated_messages.append(msg)
        
        # Get the last user message
        last_message = formatted_messages[-1]
        
        # Create a new content object with text and images
        content_parts = []
        
        # Add the user's text message
        content_parts.append({"type": "text", "text": last_message["content"]})
        
        # Add image parts if available
        if files:
            for file in files:
                if file.get('is_image') and file.get('base64'):
                    content_parts.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{file['type']};base64,{file['base64']}"
                        }
                    })
        
        # Create the new user message with multi-modal content
        updated_messages.append({
            "role": "user",
            "content": content_parts
        })
        
        formatted_messages = updated_messages
        model = vision_model
    else:
        # If there are non-image files, add their content to the first user message
        if files:
            text_files = [f for f in files if not f.get('is_image', False)]
            if text_files:
                file_content = "\n\n".join([f"--- File: {file['name']} ---\n{file['content']}" for file in text_files])
                
                # Find the last user message and add file content
                for i in range(len(formatted_messages) - 1, -1, -1):
                    if formatted_messages[i]["role"] == "user":
                        formatted_messages[i]["content"] = f"{file_content}\n\n{formatted_messages[i]['content']}"
                        break
    
    # Create the payload
    payload = {
        "model": model,
        "messages": formatted_messages,
        "max_tokens": 1500
    }
    
    # Make the API request
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

def process_gemini_request(messages, model, files=None, has_images=False):
    """Process request using Google's Gemini API with message history and files"""
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Determine the model to use based on image presence
    if has_images and files and any(f.get('is_image', False) for f in files):
        # Use Gemini Pro Vision for image inputs
        gemini_model = "gemini-pro-vision"
    else:
        # Use standard Gemini Pro
        gemini_model = "gemini-pro"
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={api_key}"
    
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
    if files and formatted_contents:
        # Find the last user message
        last_user_idx = -1
        for i in range(len(formatted_contents) - 1, -1, -1):
            if formatted_contents[i]["role"] == "user":
                last_user_idx = i
                break
        
        if last_user_idx != -1:
            # Replace the parts with our new parts that include files
            user_message = formatted_contents[last_user_idx]["parts"][0]["text"]
            new_parts = []
            
            # Add text content from non-image files
            text_files = [f for f in files if not f.get('is_image', False)]
            if text_files:
                file_content = "\n\n".join([f"Content from {file['name']}:\n{file['content']}" for file in text_files])
                new_parts.append({"text": f"{file_content}\n\n{user_message}"})
            else:
                new_parts.append({"text": user_message})
            
            # Add image content
            image_files = [f for f in files if f.get('is_image', False)]
            for file in image_files:
                if file.get('base64'):
                    new_parts.append({
                        "inline_data": {
                            "mime_type": file['type'],
                            "data": file['base64']
                        }
                    })
            
            formatted_contents[last_user_idx]["parts"] = new_parts
    
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

def process_mistral_request(messages, model, files=None, has_images=False):
    """Process request using Mistral API with message history and files"""
    api_key = os.getenv("MISTRAL_API_KEY")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Format messages for Mistral (similar to OpenAI format)
    formatted_messages = []
    
    for msg in messages:
        formatted_msg = {
            "role": msg["role"],
            "content": msg["content"]
        }
        formatted_messages.append(formatted_msg)
    
    # Add file content to the user message if available
    if files:
        text_files = [f for f in files if not f.get('is_image', False)]
        if text_files:
            file_content = "\n\n".join([f"--- File: {file['name']} ---\n{file['content']}" for file in text_files])
            
            # Find the last user message and add file content
            for i in range(len(formatted_messages) - 1, -1, -1):
                if formatted_messages[i]["role"] == "user":
                    formatted_messages[i]["content"] = f"{file_content}\n\n{formatted_messages[i]['content']}"
                    break
    
    # Create the payload
    payload = {
        "model": model if model.startswith("mistral-") else "mistral-large-latest",
        "messages": formatted_messages,
        "max_tokens": 1500
    }
    
    # Make the API request
    response = requests.post(
        "https://api.mistral.ai/v1/chat/completions",
        headers=headers,
        json=payload
    )
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mistral API error: {response.text}"
        )
    
    response_data = response.json()
    return response_data["choices"][0]["message"]["content"]

def process_huggingface_request(messages, model, files=None, has_images=False):
    """Process request using Hugging Face models"""
    api_key = os.getenv("HUGGINGFACE_API_KEY")
    
    # Map model IDs to Hugging Face model names
    model_mapping = {
        "huggingface-llama3": "meta-llama/Llama-3-8b-chat-hf",
        "huggingface-phi3": "microsoft/phi-3-mini-4k-instruct",
        "huggingface-mixtral": "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "huggingface-falcon": "tiiuae/falcon-7b-instruct"
    }
    
    # Get the appropriate model name
    hf_model_name = model_mapping.get(model)
    if not hf_model_name:
        hf_model_name = "microsoft/phi-3-mini-4k-instruct"  # Default fallback
    
    # For API-based inference
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Format conversation for Hugging Face API
    conversation = ""
    for msg in messages:
        role = "User: " if msg["role"] == "user" else "Assistant: "
        conversation += f"{role}{msg['content']}\n"
    
    conversation += "Assistant: "
    
    # If there are files, add their content to the prompt
    if files:
        text_files = [f for f in files if not f.get('is_image', False)]
        if text_files:
            file_content = "\n\n".join([f"Content from {file['name']}:\n{file['content']}" for file in text_files])
            conversation = f"The following files were provided:\n{file_content}\n\n{conversation}"

    # Make API request to Hugging Face Inference API
    payload = {
        "inputs": conversation,
        "parameters": {
            "max_new_tokens": 500,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True
        }
    }
    
    try:
        response = requests.post(
            f"https://api-inference.huggingface.co/models/{hf_model_name}",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get('generated_text', '').replace(conversation, '')
            return result.get('generated_text', '').replace(conversation, '')
        else:
            # Return error message
            return f"Error from Hugging Face API: {response.text}"
    except Exception as e:
        return f"Error calling Hugging Face API: {str(e)}"

def get_ai_response(messages, provider, model, files=None, has_images=False):
    """Route the request to the appropriate AI provider with message history and files"""
    if provider == "openai":
        return process_openai_request(messages, model, files, has_images)
    elif provider == "gemini":
        return process_gemini_request(messages, model, files, has_images)
    elif provider == "mistral":
        return process_mistral_request(messages, model, files, has_images)
    elif provider == "huggingface":
        return process_huggingface_request(messages, model, files, has_images)
    else:
        # Fallback to a generic response if provider not supported
        return f"Using {provider}'s {model}: I understand your message and am here to help."
