
import os
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, ChatThread, Message, FileAttachment
from utils import get_password_hash
import random

def generate_test_data():
    db = SessionLocal()
    
    try:
        # Create test users
        test_users = [
            {
                "name": "John Doe",
                "email": "john@example.com",
                "password": get_password_hash("password123"),
                "avatar": None
            },
            {
                "name": "Jane Smith",
                "email": "jane@example.com",
                "password": get_password_hash("password123"),
                "avatar": None
            }
        ]
        
        db_users = []
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if existing_user:
                db_users.append(existing_user)
                continue
                
            user = User(**user_data)
            db.add(user)
            db.commit()
            db.refresh(user)
            db_users.append(user)
        
        # Create test threads
        test_threads = [
            {
                "title": "Understanding AI capabilities",
                "created_at": datetime.now() - timedelta(days=2),
                "updated_at": datetime.now() - timedelta(days=2),
                "user": db_users[0]
            },
            {
                "title": "Web development help",
                "created_at": datetime.now() - timedelta(days=1),
                "updated_at": datetime.now() - timedelta(days=1),
                "user": db_users[0]
            },
            {
                "title": "Image editing question",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "user": db_users[0]
            }
        ]
        
        db_threads = []
        for thread_data in test_threads:
            user = thread_data.pop("user")
            thread = ChatThread(**thread_data)
            thread.users.append(user)
            db.add(thread)
            db.commit()
            db.refresh(thread)
            db_threads.append(thread)
        
        # Create test messages
        test_messages = [
            {
                "content": "What can you help me with?",
                "sender": "user",
                "timestamp": db_threads[0].created_at,
                "thread_id": db_threads[0].id,
                "user_id": db_users[0].id
            },
            {
                "content": "I can assist with a wide range of tasks including answering questions, drafting content, generating creative ideas, explaining complex topics, helping with code, and much more. Feel free to ask me anything!",
                "sender": "assistant",
                "timestamp": db_threads[0].created_at + timedelta(minutes=1),
                "thread_id": db_threads[0].id,
                "user_id": None
            },
            {
                "content": "Can you help me understand how React hooks work?",
                "sender": "user",
                "timestamp": db_threads[1].created_at,
                "thread_id": db_threads[1].id,
                "user_id": db_users[0].id
            },
            {
                "content": "React hooks are functions that let you use state and other React features in functional components. The most common hooks are useState for managing state, useEffect for side effects, useContext for context API, and useRef for references. Would you like me to explain any specific hook in more detail?",
                "sender": "assistant",
                "timestamp": db_threads[1].created_at + timedelta(minutes=1),
                "thread_id": db_threads[1].id,
                "user_id": None
            },
            {
                "content": "What's the best software for photo editing?",
                "sender": "user",
                "timestamp": db_threads[2].created_at,
                "thread_id": db_threads[2].id,
                "user_id": db_users[0].id
            },
            {
                "content": "For professional photo editing, Adobe Photoshop is the industry standard with comprehensive tools for manipulating images. Adobe Lightroom is excellent for photographers who need to manage and edit large collections of photos. For free alternatives, GIMP provides powerful features similar to Photoshop, while Darktable is a good open-source alternative to Lightroom. Your choice depends on your specific needs, budget, and level of expertise.",
                "sender": "assistant",
                "timestamp": db_threads[2].created_at + timedelta(minutes=2),
                "thread_id": db_threads[2].id,
                "user_id": None
            }
        ]
        
        for message_data in test_messages:
            message = Message(**message_data)
            db.add(message)
        
        db.commit()
        
        print("Test data generated successfully!")
    
    except Exception as e:
        print(f"Error generating test data: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    generate_test_data()
