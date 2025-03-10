
import os
import base64
from typing import List, Dict, Any, Optional
import mimetypes
from PIL import Image
from io import BytesIO
import PyPDF2
import docx
import csv

def prepare_files_for_ai(files: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Process file attachments for AI input"""
    processed_files = []
    
    for file in files:
        file_path = os.path.join(os.getenv("UPLOAD_DIRECTORY", "uploads"), os.path.basename(file.url))
        
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
        
        # Determine file type using mimetypes
        file_type, _ = mimetypes.guess_type(file_path)
        if not file_type:
            # Default to binary if can't determine
            file_type = "application/octet-stream"
        
        # Read file as binary
        with open(file_path, "rb") as f:
            file_data = f.read()
        
        # Process based on file type
        processed_file = {
            "name": file.name,
            "type": file_type,
            "is_image": file_type.startswith("image/")
        }
        
        # For images, convert to base64
        if processed_file["is_image"]:
            try:
                # Resize large images to save bandwidth
                with Image.open(BytesIO(file_data)) as img:
                    if max(img.size) > 1024:  # if either dimension is > 1024px
                        img.thumbnail((1024, 1024), Image.LANCZOS)
                        buffered = BytesIO()
                        img.save(buffered, format=img.format)
                        file_data = buffered.getvalue()
                
                # Convert to base64
                processed_file["base64"] = base64.b64encode(file_data).decode("utf-8")
            except Exception as e:
                print(f"Error processing image {file.name}: {str(e)}")
                continue
        else:
            # Extract text from documents
            content = extract_text_from_file(file_path, file_type)
            if content:
                processed_file["content"] = content
            else:
                # If text extraction failed, provide base64 for binary files
                processed_file["base64"] = base64.b64encode(file_data).decode("utf-8")
        
        processed_files.append(processed_file)
    
    return processed_files

def extract_text_from_file(file_path: str, file_type: str) -> Optional[str]:
    """Extract text content from various file types"""
    try:
        # Plain text files
        if file_type in ["text/plain", "text/markdown", "application/json", "text/html", "text/csv"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        
        # PDF files
        elif file_type == "application/pdf":
            text = ""
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page_num in range(len(reader.pages)):
                    text += reader.pages[page_num].extract_text() + "\n"
            return text
        
        # Word documents
        elif file_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
                          "application/msword"]:
            doc = docx.Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        
        # CSV files
        elif file_type == "text/csv":
            rows = []
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                csv_reader = csv.reader(f)
                for row in csv_reader:
                    rows.append(",".join(row))
            return "\n".join(rows)
        
        # Not a supported text format
        else:
            return None
            
    except Exception as e:
        print(f"Error extracting text from {file_path}: {str(e)}")
        return None

def format_files_for_provider(files: List[Dict[str, Any]], provider: str) -> List[Dict[str, Any]]:
    """Format files for a specific AI provider"""
    # Format adjustments for different providers
    if provider == "openai":
        # OpenAI expects a specific format for images
        return [
            {
                "name": file["name"],
                "type": file["type"],
                "is_image": file["is_image"],
                "base64": file.get("base64"),
                "content": file.get("content")
            }
            for file in files
        ]
    
    elif provider == "gemini":
        # Gemini uses inlineData format
        return [
            {
                "name": file["name"],
                "mime_type": file["type"],
                "is_image": file["is_image"],
                "data": file.get("base64"),
                "text": file.get("content")
            }
            for file in files
        ]
    
    # Default format (for other providers)
    return files
