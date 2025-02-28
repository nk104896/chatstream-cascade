
# Connecting Frontend with Backend

## Introduction

This guide explains how to connect the React frontend with the FastAPI backend.

## Setup

1. Make sure both the backend and frontend are running:
   - Backend: `cd backend && python run.py` (running on http://localhost:8000)
   - Frontend: Your React application (running on your development server)

2. Configure CORS in the backend:
   - The backend is already configured to accept requests from any origin in development mode.
   - For production, you should specify the exact frontend origin in the `allow_origins` parameter in `main.py`.

3. Configure the API base URL in the frontend:
   - In `src/hooks/use-api.ts`, ensure `API_BASE_URL` is set to `http://localhost:8000/api`.

## Authentication Flow

1. User Registration:
   - Frontend calls `POST /api/signup` with name, email, and password.
   - Backend creates the user and returns user data.

2. User Login:
   - Frontend calls `POST /api/login` with email and password.
   - Backend authenticates and returns JWT token.
   - Frontend stores the token in localStorage and includes it in subsequent requests.

3. Session Management:
   - Frontend includes the JWT token in the Authorization header.
   - Backend validates the token for protected routes.

## API Integration

The frontend is set up to communicate with these backend endpoints:

1. Authentication:
   - `/api/signup` - Register a new user
   - `/api/login` - User login
   - `/api/users/me` - Get current user profile

2. Chat:
   - `/api/threads` - Create/get chat threads
   - `/api/threads/{thread_id}` - Get/update/delete specific thread
   - `/api/threads/{thread_id}/messages` - Add messages to a thread
   - `/api/history` - Get chat history grouped by date
   - `/api/process-message` - Process a message and get AI response

3. Files:
   - `/api/upload` - Upload files
   - `/api/files/{file_id}` - Delete files

## File Handling

1. File Upload:
   - Frontend collects files from the user.
   - Files are sent to `/api/upload` endpoint.
   - Backend saves files and returns metadata.
   - File metadata is included when creating a message.

2. File Preview:
   - Images are previewed directly using the URL from the backend.
   - Other files are represented with appropriate icons.

## Testing the Integration

1. User Registration:
   - Create a new account through the UI.
   - Verify the user is created in the database.

2. Sending Messages:
   - Create a new chat thread.
   - Send a message with or without file attachments.
   - Verify the message appears in the UI and is stored in the database.

3. Chat History:
   - Verify that chat history is grouped by date.
   - Test selecting and continuing previous conversations.
