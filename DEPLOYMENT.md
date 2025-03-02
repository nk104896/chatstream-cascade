
# Deployment Guide

This document explains how to build and deploy the React frontend with the Python FastAPI backend.

## Development Setup

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up your database by creating a `.env` file based on the provided example:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=chat_app

   # JWT Settings
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # File Storage
   UPLOAD_DIRECTORY=uploads
   ```

4. Run the backend server:
   ```
   python run.py
   ```
   The API will be available at http://localhost:8000/api

### Frontend Setup
1. Create a `.env` file in the root directory with the following content:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## Production Deployment

### Building the Frontend
1. Set the production API URL in your `.env` file:
   ```
   VITE_API_URL=https://your-api-domain.com/api
   ```

2. Build the React application:
   ```
   npm run build
   ```
   This will create a `dist` directory with the optimized build.

### Serving the Frontend with the Backend
1. Copy the contents of the `dist` directory to the `static` folder in your backend:
   ```
   mkdir -p backend/static
   cp -r dist/* backend/static/
   ```

2. Update the FastAPI app to serve the static files:

```python
# In main.py
from fastapi.staticfiles import StaticFiles

# Mount uploads directory (already in your code)
uploads_dir = os.path.join(os.getcwd(), os.getenv("UPLOAD_DIRECTORY", "uploads"))
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Mount the static files directory for the React app
static_dir = os.path.join(os.getcwd(), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

# Optional: Redirect root to static index.html
@app.get("/", include_in_schema=False)
async def redirect_to_index():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/index.html")
```

3. Deploy your FastAPI application using a production ASGI server like Uvicorn or Gunicorn:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Docker Deployment (Optional)
You can also containerize both the frontend and backend:

1. Create a Dockerfile in the root directory:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend build
COPY dist/ static/

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. Build and run the Docker container:
```
docker build -t chat-app .
docker run -p 8000:8000 chat-app
```

The application will be available at http://localhost:8000
