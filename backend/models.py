
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

# Association table for user-thread relationship
user_thread = Table(
    "user_thread",
    Base.metadata,
    Column("user_id", String(36), ForeignKey("users.id")),
    Column("thread_id", String(36), ForeignKey("chat_threads.id"))
)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    threads = relationship("ChatThread", secondary=user_thread, back_populates="users")
    messages = relationship("Message", back_populates="user")

class ChatThread(Base):
    __tablename__ = "chat_threads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    users = relationship("User", secondary=user_thread, back_populates="threads")
    messages = relationship("Message", back_populates="thread", cascade="all, delete-orphan", order_by="Message.timestamp")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    content = Column(Text, nullable=True)
    sender = Column(String(50), nullable=False)  # "user" or "assistant"
    timestamp = Column(DateTime, server_default=func.now())
    
    # Foreign keys
    thread_id = Column(String(36), ForeignKey("chat_threads.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    thread = relationship("ChatThread", back_populates="messages")
    user = relationship("User", back_populates="messages")
    files = relationship("FileAttachment", back_populates="message", cascade="all, delete-orphan")

class FileAttachment(Base):
    __tablename__ = "file_attachments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)
    size = Column(Float, nullable=False)
    url = Column(String(255), nullable=False)
    preview = Column(String(255), nullable=True)
    
    # Foreign key
    message_id = Column(String(36), ForeignKey("messages.id"), nullable=False)
    
    # Relationship
    message = relationship("Message", back_populates="files")
