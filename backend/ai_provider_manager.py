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
            "mistral": os.getenv("MISTRAL_API_KEY")
        }

    def _load_config(self) -> List[Dict[str, Any]]:
        """Load the provider configuration from JSON file"""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading AI provider configuration: {str(e)}")
            return []

    def has_valid_api_key(self, provider_id: str) -> bool:
        """Check if a provider has a valid API key configured"""
        api_key = self.api_keys.get(provider_id)
        return api_key is not None and len(api_key) > 0 and api_key != f"your_{provider_id}_api_key_here"

    def get_model_details(self, provider_id: str, model_id: str) -> Tuple[str, str, bool]:
        """
        Get model details and determine if fallback is needed
        Returns: (provider_id, model_id, use_fallback)
        """
        # Check if the primary provider has a valid API key
        if not self.has_valid_api_key(provider_id):
            logger.warning(f"No valid API key for {provider_id}")
            return provider_id, model_id, False
        
        return provider_id, model_id, False

    def execute_with_fallback(self, provider_id: str, model_id: str, execution_func, *args, **kwargs):
        """Execute a function with the specified provider"""
        effective_provider, effective_model, _ = self.get_model_details(provider_id, model_id)
        
        try:
            return execution_func(effective_provider, effective_model, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error executing with provider {effective_provider}, model {effective_model}: {str(e)}")
            raise
