
import os
from PyPDF2 import PdfReader
from docx import Document
from PIL import Image
import pytesseract
import io
import base64
import json

def extract_text_from_pdf(file_path):
    """Extract text from PDF files"""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return f"[Error processing PDF: {str(e)}]"

def extract_text_from_docx(file_path):
    """Extract text from Word documents"""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        
        # Also extract from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    text += cell.text + " "
                text += "\n"
                
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from DOCX: {str(e)}")
        return f"[Error processing DOCX: {str(e)}]"

def extract_text_from_image(file_path):
    """Extract text from images using OCR"""
    try:
        # Check if pytesseract can be used
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as ocr_error:
            # If OCR fails, just return image description
            return f"[Image file: {os.path.basename(file_path)}]"
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return f"[Error processing image: {str(e)}]"

def read_text_file(file_path):
    """Read content from text files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except UnicodeDecodeError:
        # Try again with a different encoding
        try:
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read().strip()
        except Exception as e:
            return f"[Error reading text file: {str(e)}]"
    except Exception as e:
        print(f"Error reading text file: {str(e)}")
        return f"[Error reading text file: {str(e)}]"

def get_file_content(file_path, file_type):
    """Extract content from file based on its type"""
    if not os.path.exists(file_path):
        return f"[File not found: {file_path}]"
    
    lower_type = file_type.lower()
    
    if "pdf" in lower_type:
        return extract_text_from_pdf(file_path)
    elif "word" in lower_type or "docx" in lower_type or "doc" in lower_type:
        return extract_text_from_docx(file_path)
    elif "image" in lower_type or "jpeg" in lower_type or "jpg" in lower_type or "png" in lower_type:
        return extract_text_from_image(file_path)
    elif "text" in lower_type or "txt" in lower_type:
        return read_text_file(file_path)
    else:
        # For unknown types, try to read as text
        try:
            return read_text_file(file_path)
        except:
            return f"[Unsupported file type: {file_type}]"

def encode_image_to_base64(file_path):
    """Convert image to base64 for AI models that accept base64 images"""
    try:
        with open(file_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            return encoded_string
    except Exception as e:
        print(f"Error encoding image: {str(e)}")
        return None

def prepare_files_for_ai(files):
    """Prepare file attachments for AI processing"""
    processed_files = []
    
    for file in files:
        file_path = os.path.join(os.getcwd(), file.url.lstrip("/"))
        content = get_file_content(file_path, file.type)
        
        file_data = {
            "name": file.name,
            "type": file.type,
            "content": content
        }
        
        # For images, also include base64 encoding for vision models
        if file.type.startswith('image/'):
            file_data["base64"] = encode_image_to_base64(file_path)
            file_data["is_image"] = True
        else:
            file_data["is_image"] = False
        
        processed_files.append(file_data)
    
    return processed_files

def format_files_for_provider(files, provider):
    """Format file content based on AI provider"""
    if not files:
        return []
    
    if provider.lower() == "openai":
        # OpenAI can handle both text and images
        messages = []
        
        # First, handle text files as part of the message content
        text_files = [f for f in files if not f.get('is_image', False)]
        if text_files:
            text_contents = []
            for file in text_files:
                text_contents.append(f"--- File: {file['name']} ---\n{file['content']}\n")
            
            if text_contents:
                messages.append({
                    "text_content": "\n".join(text_contents)
                })
        
        # Then, handle images as separate content items for GPT-4 Vision
        image_files = [f for f in files if f.get('is_image', False)]
        for file in image_files:
            if file.get('base64'):
                messages.append({
                    "image_url": {
                        "url": f"data:{file['type']};base64,{file['base64']}"
                    }
                })
        
        return messages
    
    elif provider.lower() == "gemini":
        # Gemini can handle text and images
        parts = []
        
        # Text content
        text_files = [f for f in files if not f.get('is_image', False)]
        if text_files:
            text_contents = []
            for file in text_files:
                text_contents.append(f"Content from {file['name']}:\n{file['content']}")
            
            if text_contents:
                parts.append({
                    "text": "\n\n".join(text_contents)
                })
        
        # Image content
        image_files = [f for f in files if f.get('is_image', False)]
        for file in image_files:
            if file.get('base64'):
                parts.append({
                    "inline_data": {
                        "mime_type": file['type'],
                        "data": file['base64']
                    }
                })
        
        return parts
    
    else:
        # Generic format for other providers
        file_contents = []
        for file in files:
            file_contents.append(f"--- {file['name']} ---\n{file['content']}\n")
        
        return "\n".join(file_contents)
