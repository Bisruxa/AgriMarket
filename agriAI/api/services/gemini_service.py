from __future__ import annotations

import os
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

from .function_executor import get_tool_definitions, execute_function

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TEXT_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", os.getenv("GEMINI_TEXT_MODEL_NAME", "gemini-3.5-flash"))
LIVE_MODEL_NAME = os.getenv("GEMINI_LIVE_MODEL_NAME", "gemini-3.1-flash-live-preview")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not set. Gemini service will not work.")

SYSTEM_PROMPT = """You are AgriAI, an expert agricultural assistant for Ethiopian farmers and traders.
You help with:
1. Crop recommendations based on soil and climate data
2. Price forecasting for agricultural products
3. Weather information and farming advice
4. Market trends and analysis
5. Soil analysis and improvement suggestions

You have access to tools that can provide real data. When a user asks about:
- What to plant or crop recommendations -> use get_crop_recommendation
- Price predictions or forecasts -> use get_price_forecast
- Weather -> use get_weather_forecast
- Market data or trends -> use get_market_trends
- Soil analysis -> use get_soil_analysis

Always use the appropriate tool when needed. If the user doesn't provide enough parameters,
ask them for the missing information. Respond in a friendly, conversational manner.
Format prices in ETB (Ethiopian Birr). Be concise but helpful."""


def _get_model_candidates() -> List[str]:
    # Try the configured text model first, then fall back to known generateContent models.
    candidates = [TEXT_MODEL_NAME, "gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash"]
    seen = set()
    deduped: List[str] = []
    for model in candidates:
        if model and model not in seen:
            seen.add(model)
            deduped.append(model)
    return deduped


def _build_tools() -> List[types.Tool]:
    tools = []
    for decl in get_tool_definitions():
        tools.append(types.Tool(function_declarations=[decl]))
    return tools


def _get_live_model_candidates() -> List[str]:
    candidates = [
        LIVE_MODEL_NAME,
        "gemini-3.1-flash-live-preview",
        "gemini-2.5-flash-native-audio-preview-12-2025",
    ]
    seen = set()
    deduped: List[str] = []
    for model in candidates:
        if model and model not in seen:
            seen.add(model)
            deduped.append(model)
    return deduped


def get_model_config() -> Dict[str, Any]:
    return {
        "text_model": TEXT_MODEL_NAME,
        "live_model": LIVE_MODEL_NAME,
        "live_model_candidates": _get_live_model_candidates(),
    }


def send_message(
    message: str,
    conversation_history: Optional[List[Dict]] = None,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    if not client:
        return {
            "text": "AI service is not configured. Please set up the GEMINI_API_KEY.",
            "functionCalls": [],
        }

    try:
        history = []
        for msg in conversation_history or []:
            role = msg.get("role", "user")
            if role == "assistant":
                role = "model"
            content = msg.get("content", "")
            if content.strip():
                history.append(types.Content(
                    role=role,
                    parts=[types.Part(text=content)],
                ))

        chat = None
        last_model_error: Optional[Exception] = None
        for model_name in _get_model_candidates():
            try:
                chat = client.chats.create(
                    model=model_name,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        tools=_build_tools(),
                    ),
                    history=history,
                )
                break
            except Exception as model_error:
                last_model_error = model_error
                err_text = str(model_error).lower()
                if "not found" in err_text or "not supported" in err_text:
                    continue
                raise

        if chat is None:
            raise RuntimeError(
                f"No compatible Gemini model available for chat. Last error: {last_model_error}"
            )

        response = chat.send_message(message)
        function_calls = []

        for candidate in (response.candidates or []):
            for part in (candidate.content.parts or []):
                if part.function_call:
                    fn = part.function_call
                    fn_name = fn.name
                    fn_args = dict(fn.args) if fn.args else {}

                    fn_result = execute_function(fn_name, fn_args)

                    function_calls.append({
                        "name": fn_name,
                        "args": fn_args,
                        "result": fn_result,
                    })

                    response = chat.send_message(
                        types.Content(
                            parts=[types.Part(
                                function_response=types.FunctionResponse(
                                    name=fn_name,
                                    response={"result": fn_result.get("result", fn_result)},
                                )
                            )]
                        )
                    )

        text = ""
        for candidate in (response.candidates or []):
            for part in (candidate.content.parts or []):
                if part.text:
                    text += part.text

        if not text:
            text = "I'm processing your request. Let me know if you need more specific information."

        return {"text": text, "functionCalls": function_calls}

    except Exception as e:
        import traceback
        err_msg = getattr(e, 'message', str(e))
        details = traceback.format_exc()
        print(f"[Gemini Error] {err_msg}\n{details}")
        return {
            "text": f"AI service error: {err_msg}. Please try again later or check your Gemini API quota.",
            "functionCalls": [],
        }
