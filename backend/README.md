
# Chat Application Backend

This is the backend for a modern multi-modal chat application built with FastAPI, SQLAlchemy, and MySQL.

## Features

- User authentication with JWT
- Chat threading
- Message management
- File uploads and storage
- File previews for images

## Requirements

- Python 3.7+
- MySQL 5.7+ or MariaDB 10.2+

## Installation

1. Clone the repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your configuration (see `.env.example`)
4. Initialize the database:

```bash
python create_database.py
```

5. (Optional) Generate test data:

```bash
python generate_test_data.py
```

## Running the Application

Start the FastAPI server:

```bash
python run.py
```

or

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the Swagger documentation at:

http://localhost:8000/docs

## API Endpoints

### Authentication

- `POST /api/signup`: Register a new user
- `POST /api/login`: User login
- `GET /api/users/me`: Get current user profile

### Chat

- `POST /api/threads`: Create a new chat thread
- `GET /api/threads`: Get all threads for current user
- `GET /api/threads/{thread_id}`: Get a specific thread
- `DELETE /api/threads/{thread_id}`: Delete a thread
- `POST /api/threads/{thread_id}/messages`: Create a new message in a thread
- `GET /api/history`: Get chat history grouped by date
- `POST /api/process-message`: Process a user message and generate AI response

### Files

- `POST /api/upload`: Upload files
- `DELETE /api/files/{file_id}`: Delete a file

## Database Schema

- `users`: User information
- `chat_threads`: Chat conversation threads
- `user_thread`: Association table for users and threads
- `messages`: Individual chat messages
- `file_attachments`: Files attached to messages

## File Storage

Files are stored in the `uploads` directory by default. You can change this in the `.env` file.
