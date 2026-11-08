import os
import json
import logging
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("aivoa.groq")

# Configurable Groq model
DEFAULT_GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Runtime in-memory config allows testing/setting Groq key from the Settings page
_runtime_groq_key: Optional[str] = None
_runtime_groq_model: str = DEFAULT_GROQ_MODEL

def get_groq_api_key() -> Optional[str]:
    """Retrieve active Groq API Key from runtime config or environment."""
    return _runtime_groq_key or os.getenv("GROQ_API_KEY") or None

def set_runtime_groq_config(api_key: Optional[str], model: Optional[str] = None):
    """Set runtime Groq API key or model without requiring server restart."""
    global _runtime_groq_key, _runtime_groq_model
    if api_key is not None:
        _runtime_groq_key = api_key.strip() if api_key.strip() else None
    if model:
        _runtime_groq_model = model

def get_active_model() -> str:
    return _runtime_groq_model or DEFAULT_GROQ_MODEL

def test_groq_connection(api_key: Optional[str] = None) -> Dict[str, Any]:
    """Test connection with the Groq API."""
    key = api_key or get_groq_api_key()
    if not key:
        return {
            "success": False,
            "message": "Groq API Key is not configured. Please provide a valid GROQ_API_KEY in .env or Settings."
        }
    try:
        from groq import Groq
        client = Groq(api_key=key)
        response = client.chat.completions.create(
            model=get_active_model(),
            messages=[
                {"role": "system", "content": "You are a pharmaceutical RCA AI assistant. Reply in JSON."},
                {"role": "user", "content": "Ping test. Respond with {\"status\": \"ok\", \"model\": \"llama-3.3-70b-versatile\"}"}
            ],
            response_format={"type": "json_object"},
            max_tokens=50,
            temperature=0.1
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return {
            "success": True,
            "message": f"Successfully connected to Groq API using {get_active_model()}",
            "response": data
        }
    except Exception as e:
        logger.error(f"Groq API connection test error: {e}")
        return {
            "success": False,
            "message": f"Groq API call failed: {str(e)}"
        }

def call_groq_json(system_prompt: str, user_prompt: str, model: Optional[str] = None) -> Dict[str, Any]:
    """
    Execute a prompt against Groq API enforcing structured JSON output.
    Raises RuntimeError if Groq key is absent or call fails.
    """
    api_key = get_groq_api_key()
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured.")

    chosen_model = model or get_active_model()

    from groq import Groq
    client = Groq(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model=chosen_model,
            messages=[
                {"role": "system", "content": f"{system_prompt}\n\nCRITICAL: Respond ONLY with valid, RFC-compliant JSON. Do not wrap in markdown quotes if possible, or return raw JSON object."},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=3000
        )
        raw_text = response.choices[0].message.content.strip()
        # Clean markdown wrappers if any
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        return json.loads(raw_text.strip())
    except Exception as e:
        logger.error(f"Groq generation failed with model {chosen_model}: {e}")
        raise RuntimeError(f"Groq LLM execution failed: {str(e)}")
