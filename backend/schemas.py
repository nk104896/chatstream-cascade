
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import List, Optional

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    avatar: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: str

# File attachment schemas
class FileAttachmentBase(BaseModel):
    name: str
    type: str
    size: float
    url: str
    preview: Optional[str] = None

class FileAttachmentCreate(FileAttachmentBase):
    pass

class FileAttachmentResponse(FileAttachmentBase):
    id: str
    
    class Config:
        from_attributes = True

# Message schemas
class MessageBase(BaseModel):
    content: Optional[str] = None
    sender: str

class MessageCreate(MessageBase):
    files: Optional[List[FileAttachmentCreate]] = []

class MessageResponse(MessageBase):
    id: str
    timestamp: datetime
    files: Optional[List[FileAttachmentResponse]] = []
    
    class Config:
        from_attributes = True

# Chat thread schemas
class ChatThreadBase(BaseModel):
    title: str

class ChatThreadCreate(ChatThreadBase):
    pass

class ChatThreadResponse(ChatThreadBase):
    id: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True

class ChatHistoryByDate(BaseModel):
    date: str
    threads: List[ChatThreadResponse]
