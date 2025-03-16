
import os
import json
import logging
from dotenv import load_dotenv
import requests
from typing import Dict, List, Optional, Any, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class AIProviderManager:
    def __init__(self, config_path: str = "ai_providers_config.json"):
        """Initialize the AI Provider Manager with the configuration file"""
        self.config_path = config_path
        self.providers_config = self._load_config()
        self.api_keys = {
            "openai": os.getenv("OPENAI_API_KEY"),
            "gemini": os.getenv("GEMINI_API_KEY"),
            "deepseek": os.getenv("DEEPSEEK_API_KEY"),
            "mistral": os.getenv("MISTRAL_API_KEY"),
            "huggingface": os.getenv("HUGGINGFACE_API_KEY")
        }

    def _load_config(self) -> List[Dict[str, Any]]:
        """Load the provider configuration from JSON file"""
        try:
            # First try direct path
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    return json.load(f)
            
            # Then try with backend prefix
            backend_path = os.path.join("backend", self.config_path)
            if os.path.exists(backend_path):
                with open(backend_path, 'r') as f:
                    return json.load(f)
                
            # If still not found, try to find it relative to the current file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            relative_path = os.path.join(current_dir, self.config_path)
            if os.path.exists(relative_path):
                with open(relative_path, 'r') as f:
                    return json.load(f)
            
            # If we get here, we couldn't find the file
            logger.error(f"Could not find configuration file at: {self.config_path}")
            return []
        except Exception as e:
            logger.error(f"Error loading AI provider configuration: {str(e)}")
            return []

    def has_valid_api_key(self, provider_id: str) -> bool:
        """Check if a provider has a valid API key configured"""
        api_key = self.api_keys.get(provider_id)
        return api_key is not None and len(api_key) > 0 and api_key != f"your_{provider_id}_api_key_here"

    def get_fallback_model(self, provider_id: str, model_id: str) -> Optional[str]:
        """Get the Hugging Face fallback model for a given provider and model"""
        for provider in self.providers_config:
            if provider["id"] == provider_id:
                for model in provider["models"]:
                    if model["id"] == model_id:
                        return model.get("hugging_face_alternative")
        return None

    def get_model_details(self, provider_id: str, model_id: str) -> Tuple[str, str, bool]:
        """
        Get model details and determine if fallback is needed
        Returns: (provider_id, model_id, use_fallback)
        """
        # Check if the primary provider has a valid API key
        if not self.has_valid_api_key(provider_id):
            logger.warning(f"No valid API key for {provider_id}, switching to Hugging Face fallback")
            fallback_model = self.get_fallback_model(provider_id, model_id)
            if fallback_model and self.has_valid_api_key("huggingface"):
                return "huggingface", fallback_model, True
            else:
                logger.error(f"No fallback model found or no Hugging Face API key for {provider_id}/{model_id}")
                return provider_id, model_id, False
        
        return provider_id, model_id, False

    def execute_with_fallback(self, provider_id: str, model_id: str, execution_func, *args, **kwargs):
        """
        Execute a function with automatic fallback to Hugging Face
        execution_func should be a function that takes provider_id and model_id as first parameters
        """
        effective_provider, effective_model, using_fallback = self.get_model_details(provider_id, model_id)
        
        try:
            return execution_func(effective_provider, effective_model, *args, **kwargs)
        except Exception as e:
            # If already using fallback, or there's no fallback available, raise the error
            if using_fallback or not self.has_valid_api_key("huggingface"):
                logger.error(f"Error executing with provider {effective_provider}, model {effective_model}: {str(e)}")
                raise
            
            # Try with Hugging Face fallback
            logger.warning(f"Error with {provider_id}/{model_id}, trying Hugging Face fallback: {str(e)}")
            fallback_model = self.get_fallback_model(provider_id, model_id)
            if fallback_model:
                return execution_func("huggingface", fallback_model, *args, **kwargs)
            else:
                logger.error(f"No fallback model found for {provider_id}/{model_id}")
                raise
