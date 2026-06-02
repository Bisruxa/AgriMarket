from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, AsyncGenerator
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types

from .function_executor import get_tool_definitions, execute_function, set_user_context

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TEXT_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not set. Chat streaming will not work.")

LANGUAGE_MAP = {
    "en": "English",
    "am": "Amharic (አማርኛ)",
    "om": "Oromo (Afaan Oromoo)",
    "ti": "Tigrinya (ትግርኛ)",
    "so": "Somali (Af-Soomaali)",
}

BASE_SYSTEM_PROMPT = """You are AgriAI, an expert agricultural assistant created specifically for Ethiopian farmers, traders, and agribusinesses.

## Your Role
- You provide practical, science-based farming advice tailored to Ethiopian conditions.
- You explain complex agricultural concepts in simple, easy-to-understand terms.
- You use local Ethiopian units: ETB (Ethiopian Birr), hectares, kilograms, quintals.
- You reference Ethiopian seasons (Meher - main rainy season Jun-Sep, Belg - short rains Feb-May), known crops (Teff, Maize, Coffee, Chat, Enset, etc.), and regions.

## How You Respond
1. **Greeting**: Acknowledge the user warmly.
2. **Data**: When you have data from tools (price trends, weather, soil analysis), present it clearly and explain what it means for the user.
3. **Advice**: Give practical, actionable recommendations the user can follow.
4. **Follow-up**: End by asking a relevant follow-up question or offering to help further.

## Tool Usage Guidelines
{farm_context}

You have access to these tools:
- **get_price_trends**: Get recent price data from the market database for any crop and region. Use this when asked about prices, forecasts, or market value.
- **get_farm_details**: Look up a specific farm's soil chemistry and climate data by farm ID.
- **get_user_farms**: List all farms the user has registered.
- **get_weather_forecast**: Get 7-day weather forecast for any location (requires latitude/longitude).
- **get_market_trends**: Get current marketplace trends, category performance, and listing activity.
- **get_soil_analysis**: Analyze soil NPK and pH levels and get improvement recommendations.

Use tools when you need real data. If the user doesn't provide enough parameters (e.g., no farm ID, no crop name), ask them for the missing information politely.

## Language Preference
{language_instruction}

## Response Style
- Be conversational, warm, and encouraging.
- Break down complex topics simply. For example, explain what "pH" means and why it matters for their crops.
- When giving recommendations, explain the WHY behind them.
- For prices: always state prices in ETB, mention the trend direction, and give context (e.g., "This is 10% higher than last month").
- For weather: relate conditions to farming activities (e.g., "Good time to plant because rain is expected").
- If you don't know something, say so honestly rather than making up information.
"""

def _build_system_prompt(language: str = "en", user_context: Optional[Dict] = None) -> str:
    lang_name = LANGUAGE_MAP.get(language, "English")
    lang_instruction = f"The user prefers to communicate in {lang_name}. You MUST respond in {lang_name}."

    farm_context = ""
    if user_context:
        role = user_context.get("role", "FARMER")
        region = user_context.get("region")
        woreda = user_context.get("woreda")
        name = user_context.get("name")
        farms = user_context.get("farms", [])

        user_info = f"The user's name is {name}. " if name else ""
        user_info += f"The user is a {role}. "
        if region:
            user_info += f"They are from {region}"
            if woreda:
                user_info += f", {woreda}"
            user_info += ". "

        farm_info = ""
        if farms:
            farm_details = []
            for f in farms:
                parts = [f"Farm '{f.get('name', 'Unnamed')}'"]
                if f.get("region"):
                    parts.append(f"in {f['region']}")
                parts.append(f"(ID: {f.get('id', 'unknown')})")
                soil = []
                if f.get("nitrogen") is not None:
                    soil.append(f"N={f['nitrogen']}")
                if f.get("phosphorus") is not None:
                    soil.append(f"P={f['phosphorus']}")
                if f.get("potassium") is not None:
                    soil.append(f"K={f['potassium']}")
                if f.get("ph") is not None:
                    soil.append(f"pH={f['ph']}")
                if soil:
                    parts.append(f"Soil: {', '.join(soil)}")
                if f.get("size"):
                    parts.append(f"Size: {f['size']}")
                farm_details.append(" - " + " | ".join(parts))

            farm_info = f"They have {len(farms)} farm(s):\n" + "\n".join(farm_details)

        if user_info or farm_info:
            farm_context = f"## User Context\n{user_info}\n{farm_info}".strip()

    return BASE_SYSTEM_PROMPT.format(
        language_instruction=lang_instruction,
        farm_context=farm_context if farm_context else "No user context available.",
    )


def _build_tools() -> List[types.Tool]:
    tools = []
    for decl in get_tool_definitions():
        tools.append(types.Tool(function_declarations=[decl]))
    return tools


def send_message_stream(
    message: str,
    conversation_history: Optional[List[Dict]] = None,
    language: str = "en",
    user_context: Optional[Dict] = None,
) -> AsyncGenerator[str, None]:
    if not client:
        yield "event: error\ndata: AI service not configured.\n\n"
        return

    try:
        set_user_context(user_context)
        system_prompt = _build_system_prompt(language, user_context)

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

        model_name = TEXT_MODEL_NAME

        try:
            response = client.models.generate_content_stream(
                model=model_name,
                contents=[types.Content(
                    role="user",
                    parts=[types.Part(text=message)],
                )],
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    tools=_build_tools(),
                    history=history if history else None,
                ),
            )
        except Exception as model_err:
            err_text = str(model_err).lower()
            if "not found" in err_text or "not supported" in err_text:
                model_name = "gemini-2.0-flash"
                response = client.models.generate_content_stream(
                    model=model_name,
                    contents=[types.Content(
                        role="user",
                        parts=[types.Part(text=message)],
                    )],
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        tools=_build_tools(),
                        history=history if history else None,
                    ),
                )
            else:
                raise

        function_calls = []

        for chunk in response:
            for part in (chunk.candidates or [{}])[0].content.parts:
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

                    yield f"event: function_call\ndata: {fn_name}\n\n"

                    client.models.generate_content(
                        model=model_name,
                        contents=[types.Content(
                            role="user",
                            parts=[types.Part(
                                function_response=types.FunctionResponse(
                                    name=fn_name,
                                    response={"result": fn_result.get("result", fn_result)},
                                )
                            )]
                        )],
                        config=types.GenerateContentConfig(
                            system_instruction=system_prompt,
                            tools=_build_tools(),
                        ),
                    )

                if part.text:
                    escaped = part.text.replace("\n", "\\n")
                    yield f"event: text\ndata: {escaped}\n\n"

        if function_calls:
            yield f"event: done\ndata: {len(function_calls)} function(s) called\n\n"
        else:
            yield "event: done\ndata: \n\n"

    except Exception as e:
        import traceback
        err_msg = getattr(e, 'message', str(e))
        print(f"[Gemini Stream Error] {err_msg}\n{traceback.format_exc()}")
        yield f"event: error\ndata: AI error: {err_msg}\n\n"


def send_message(
    message: str,
    conversation_history: Optional[List[Dict]] = None,
    user_id: Optional[str] = None,
    language: str = "en",
    user_context: Optional[Dict] = None,
) -> Dict[str, Any]:
    if not client:
        return {
            "text": "AI service is not configured. Please set up the GEMINI_API_KEY.",
            "functionCalls": [],
        }

    try:
        set_user_context(user_context)
        system_prompt = _build_system_prompt(language, user_context)

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

        model_name = TEXT_MODEL_NAME
        try:
            chat = client.chats.create(
                model=model_name,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    tools=_build_tools(),
                ),
                history=history,
            )
        except Exception as model_error:
            err_text = str(model_error).lower()
            if "not found" in err_text or "not supported" in err_text:
                model_name = "gemini-2.0-flash"
                chat = client.chats.create(
                    model=model_name,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        tools=_build_tools(),
                    ),
                    history=history,
                )
            else:
                raise

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
