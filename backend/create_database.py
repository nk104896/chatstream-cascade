
import os
import pymysql
from dotenv import load_dotenv
from models import Base
from database import engine

# Load environment variables
load_dotenv()

def create_database():
    # Database connection settings
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "your_password")
    DB_NAME = os.getenv("DB_NAME", "chat_app")
    
    # Connect to MySQL server
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD
    )
    
    try:
        # Create a cursor
        with conn.cursor() as cursor:
            # Create database if it doesn't exist
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
            print(f"Database '{DB_NAME}' created or already exists.")
        
        # Commit the changes
        conn.commit()
    finally:
        # Close the connection
        conn.close()

def create_tables():
    # Create all tables defined in models.py
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    create_database()
    create_tables()
