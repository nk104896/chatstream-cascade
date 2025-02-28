
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
from typing import List
from database import get_db
from models import User, FileAttachment
from schemas import FileAttachmentResponse
from utils import get_current_user, save_file, is_image_file
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

@router.post("/upload", response_model=List[FileAttachmentResponse])
async def upload_files(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload_dir = os.getenv("UPLOAD_DIRECTORY", "uploads")
    response_files = []
    
    for file in files:
        # Save file
        file_url = save_file(file, upload_dir)
        
        # Create preview URL for images
        preview_url = None
        if is_image_file(file.content_type):
            preview_url = file_url
        
        # Create file record
        file_record = FileAttachment(
            name=file.filename,
            type=file.content_type,
            size=os.path.getsize(os.path.join(upload_dir, os.path.basename(file_url))),
            url=file_url,
            preview=preview_url,
            # At this point, we don't associate it with a message
            # This will be done when the message is created
            message_id=None  
        )
        
        response_files.append({
            "id": file_record.id,
            "name": file_record.name,
            "type": file_record.type,
            "size": file_record.size,
            "url": file_record.url,
            "preview": file_record.preview
        })
    
    return response_files

@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find file by ID
    file = db.query(FileAttachment).filter(FileAttachment.id == file_id).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Check if file belongs to user's message
    message = file.message
    if message and message.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this file"
        )
    
    # Delete file from disk
    file_path = os.path.join(os.getcwd(), file.url.lstrip("/"))
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete file record
    db.delete(file)
    db.commit()
    
    return None
