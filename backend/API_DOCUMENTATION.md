
# Chat Application API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

### Register a new user

```
POST /signup
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": null,
  "created_at": "2023-10-15T12:30:45"
}
```

### Login

```
POST /login
```

Request body:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer"
}
```

### Get current user

```
GET /users/me
```

Headers:
```
Authorization: Bearer jwt-token-here
```

Response:
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": null,
  "created_at": "2023-10-15T12:30:45"
}
```

## Chat Threads

### Create a new thread

```
POST /threads
```

Headers:
```
Authorization: Bearer jwt-token-here
```

Request body:
```json
{
  "title": "New Conversation"
}
```

Response:
```json
{
  "id": "thread-uuid",
  "title": "New Conversation",
  "created_at": "2023-10-15T14:20:30",
  "updated_at": "2023-10-15T14:20:30",
  "messages": []
}
```

### Get all threads

```
GET /threads
```

Headers:
```
Authorization: Bearer jwt-token-here
```

Response:
```json
[
  {
    "id": "thread-uuid-1",
    "title": "First Conversation",
    "created_at": "2023-10-15T14:20:30",
    "updated_at": "2023-10-15T14:25:30",
    "messages": [...]
  },
  {
    "id": "thread-uuid-2",
    "title": "Second Conversation",
    "created_at": "2023-10-16T10:10:10",
    "updated_at": "2023-10-16T10:15:10",
    "messages": [...]
  }
]
```

### Get a specific thread

```
GET /threads/{thread_id}
```

Headers:
```
Authorization: Bearer jwt-token-here
```

Response:
```json
{
  "id": "thread-uuid",
  "title": "Conversation Title",
  "created_at": "2023-10-15T14:20:30",
  "updated_at": "2023-10-15T14:25:30",
  "messages": [
    {
      "id": "message-uuid-1",
      "content": "User message",
      "sender": "user",
      "timestamp": "2023-10-15T14:20:30",
      "files": []
    },
    {
      "id": "message-uuid-2",
      "content": "Assistant response",
      "sender": "assistant",
      "timestamp": "2023-10-15T14:21:30",
      "files": []
    }
  ]
}
```

### Delete a thread

```
DELETE /threads/{thread_id}
```

Headers:
```
Authorization: Bearer jwt-token-here
```

Response: 204 No Content

## Messages

### Create a new message

```
POST /threads/{thread_id}/messages
```

Headers:
```
Authorization: Bearer jwt-token-here
```

Request body:
```json
{
  "content": "Hello, how are you?",
  "sender": "user",
  "files": [
    {
      "name": "image.jpg",
      "type": "image/jpeg",
      "size": 123456,
      "url": "/uploads/file-uuid.jpg",
      "preview": "/uploads/file-uuid.jpg"
    }
  ]
}
```

Response:
```json
{
  "id": "message-uuid",
  "content": "Hello, how are you?",
  "sender": "user",
  "timestamp": "2023-10-15T14:20:30",
  "files": [
    {
      "id": "file-uuid",
      "name": "image.jpg",
      "type": "image/jpeg",
      "size": 123456,
      "url": "/uploads/file-uuid.jpg",
      "preview": "/uploads/file-uuid.jpg"
    }
  ]
}
```

### Process a message (get AI response)

```
POST /process-message
```

Headers:
```
Authorization: Bearer jwt-token-here
```

Request body:
```json
{
  "content": "What is the weather like today?",
  "thread_id": "thread-uuid"
}
```

Response:
```json
{
  "id": "message-uuid",
  "content": "I don't have access to real-time weather data, but I can help you find that information on a weather website.",
  "sender": "assistant",
  "timestamp": "2023-10-15T14:21:30",
  "files": []
}
```

## Chat History

### Get history by date

```
GET /history
```

Headers:
```
Authorization: Bearer jwt-token-here
```

Response:
```json
{
  "October 15, 2023": [
    {
      "id": "thread-uuid-1",
      "title": "First Conversation",
      "created_at": "2023-10-15T14:20:30",
      "updated_at": "2023-10-15T14:25:30",
      "messages": [...]
    },
    {
      "id": "thread-uuid-2",
      "title": "Second Conversation",
      "created_at": "2023-10-15T16:10:30",
      "updated_at": "2023-10-15T16:15:30",
      "messages": [...]
    }
  ],
  "October 16, 2023": [
    {
      "id": "thread-uuid-3",
      "title": "Third Conversation",
      "created_at": "2023-10-16T10:10:10",
      "updated_at": "2023-10-16T10:15:10",
      "messages": [...]
    }
  ]
}
```

## Files

### Upload files

```
POST /upload
```

Headers:
```
Authorization: Bearer jwt-token-here
Content-Type: multipart/form-data
```

Request body:
```
files: [File1, File2, ...]
```

Response:
```json
[
  {
    "id": "file-uuid-1",
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 123456,
    "url": "/uploads/file-uuid-1.pdf",
    "preview": null
  },
  {
    "id": "file-uuid-2",
    "name": "image.jpg",
    "type": "image/jpeg",
    "size": 78910,
    "url": "/uploads/file-uuid-2.jpg",
    "preview": "/uploads/file-uuid-2.jpg"
  }
]
```

### Delete a file

```
DELETE /files/{file_id}
```

Headers:
```
Authorization: Bearer jwt-token-here
```

Response: 204 No Content

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "detail": "Error message explaining what went wrong"
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error
