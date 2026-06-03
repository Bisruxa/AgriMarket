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
    print("WARNING: GEMINI_API_KEY not set. Chat will not work.")

LANGUAGE_MAP = {
    "en": "English",
    "am": "Amharic (አማርኛ)",
    "om": "Oromo (Afaan Oromoo)",
    "ti": "Tigrinya (ትግርኛ)",
    "so": "Somali (Af-Soomaali)",
}

BASE_SYSTEM_PROMPT = """You are AgriAI, an expert agricultural assistant for Ethiopian farmers and traders.

## Your Role
- Provide practical, science-based farming advice for Ethiopian conditions.
- Explain complex concepts in simple, easy-to-understand terms.
- Use local units: ETB (Birr), hectares, kg, quintals.
- Reference Ethiopian seasons: Meher (Jun-Sep), Belg (Feb-May).
- Know Ethiopian crops: Teff, Maize, Coffee, Chat, Enset, Sorghum, etc.

## Tool Usage
{farm_context}

Available tools:
- **get_price_trends(crop_name, region?)**: Queries the market database for recent prices. Use for ANY price question — the database has historical and current prices for many crops across Ethiopian regions. The data may be limited, in which case acknowledge that and provide general market knowledge.
- **get_farm_details(farm_id)**: Soil chemistry (N, P, K, pH) and climate data for a specific farm.
- **get_user_farms()**: List the user's registered farms.
- **get_weather_forecast(lat, lon)**: 7-day forecast from Open-Meteo.
- **get_market_trends(category?)**: Marketplace listing activity and price momentum.
- **get_soil_analysis(N, P, K, pH)**: Analyze soil nutrients and get improvement tips.

## How to Handle Tool Results
- If a tool returns data: Present it clearly and explain what it means.
- If a tool returns no data or an error: DO NOT show errors to the user. Instead say something like "I don't have specific data for that query right now, but here's what I can tell you based on my knowledge..." then provide helpful information from your training. Always give a useful response.
- If the user asks a price question and you cannot get DB data: Use your knowledge of Ethiopian agricultural markets to give a reasonable estimate or explanation.
- Always suggest a follow-up or better question if the user's query was unclear.

## Language
{language_instruction}

## Response Style
- Warm, conversational, encouraging. Think of yourself as a knowledgeable friend.
- For prices: State in ETB. Mention trend. Give context (e.g., "about 15% higher than last season").
- For weather: Relate to farming (e.g., "Good planting time — rain expected").
- For crop advice: Reference the user's region and farm data when available.
- If you don't have specific data: Still be helpful using general knowledge.
- Keep responses detailed but easy to understand for a farmer.
"""


def _build_system_prompt(language: str = "en", user_context: Optional[Dict] = None) -> str:
    lang_name = LANGUAGE_MAP.get(language, "English")
    if language == "am":
        lang_instruction = f"The user prefers Amharic (አማርኛ). ALWAYS respond in Amharic using Ethiopic script (ፊደል). Use simple Amharic that farmers can understand."
    elif language == "om":
        lang_instruction = f"The user prefers Oromo (Afaan Oromoo). ALWAYS respond in Afaan Oromoo."
    elif language == "ti":
        lang_instruction = f"The user prefers Tigrinya (ትግርኛ). ALWAYS respond in Tigrinya."
    else:
        lang_instruction = f"The user prefers {lang_name}. Respond in {lang_name}."

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


def _execute_tool_and_send_response(chat, fn_name, fn_args):
    """Execute a tool and send the result back to the chat session.
    Returns the response from Gemini after processing the function result."""
    fn_result = execute_function(fn_name, fn_args)
    return chat.send_message(
        types.Part.from_function_response(
            name=fn_name,
            response={"result": fn_result.get("result", fn_result)},
        )
    )


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
        function_responses = []

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
                    function_responses.append((fn_name, fn_result))

                    yield f"event: function_call\ndata: {fn_name}\n\n"

                if part.text:
                    escaped = part.text.replace("\n", "\\n")
                    yield f"event: text\ndata: {escaped}\n\n"

        # If functions were called, send responses to Gemini and stream the text back
        if function_responses:
            for fn_name, fn_result in function_responses:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=[types.Content(
                        role="user",
                        parts=[types.Part.from_function_response(
                            name=fn_name,
                            response={"result": fn_result.get("result", fn_result)},
                        )]
                    )],
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        tools=_build_tools(),
                    ),
                )
                for candidate in (resp.candidates or []):
                    for part in (candidate.content.parts or []):
                        if part.text:
                            escaped = part.text.replace("\n", "\\n")
                            yield f"event: text\ndata: {escaped}\n\n"

            yield f"event: done\ndata: {len(function_calls)} function(s) called\n\n"
        else:
            yield "event: done\ndata: \n\n"

    except Exception as e:
        import traceback
        err_msg = getattr(e, 'message', str(e))
        print(f"[Gemini Stream Error] {err_msg}\n{traceback.format_exc()}")
        yield f"event: text\ndata: I encountered an issue while processing your request. Let me try to help another way.\n\n"
        yield "event: done\ndata: \n\n"


def send_message(
    message: str,
    conversation_history: Optional[List[Dict]] = None,
    user_id: Optional[str] = None,
    language: str = "en",
    user_context: Optional[Dict] = None,
) -> Dict[str, Any]:
    if not client:
        return {
            "text": "AI service is currently unavailable. Please check your API configuration.",
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

        # Handle potential multiple rounds of function calling
        max_rounds = 5
        for _ in range(max_rounds):
            current_round_calls = []
            for candidate in (response.candidates or []):
                for part in (candidate.content.parts or []):
                    if part.function_call:
                        fn = part.function_call
                        fn_name = fn.name
                        fn_args = dict(fn.args) if fn.args else {}
                        fn_result = execute_function(fn_name, fn_args)
                        current_round_calls.append({
                            "name": fn_name,
                            "args": fn_args,
                            "result": fn_result,
                        })
                        response = chat.send_message(
                            types.Part.from_function_response(
                                name=fn_name,
                                response={"result": fn_result.get("result", fn_result)},
                            )
                        )

            if not current_round_calls:
                break
            function_calls.extend(current_round_calls)

        text = ""
        for candidate in (response.candidates or []):
            for part in (candidate.content.parts or []):
                if part.text:
                    text += part.text

        if not text:
            text = "I've looked into your question. What else can I help you with?"

        return {"text": text, "functionCalls": function_calls}

    except Exception as e:
        import traceback
        err_msg = getattr(e, 'message', str(e))
        details = traceback.format_exc()
        print(f"[Gemini Error] {err_msg}\n{details}")

        # Try one last fallback — direct generate_content without tools
        try:
            fallback = client.models.generate_content(
                model=TEXT_MODEL_NAME,
                contents=f"The user asked: '{message}'. Respond helpfully as an Ethiopian agricultural assistant. Be concise and warm.",
                config=types.GenerateContentConfig(
                    system_instruction="You are an expert Ethiopian agricultural assistant. Answer helpfully and simply.",
                ),
            )
            fallback_text = fallback.text or ""
            if fallback_text:
                return {"text": fallback_text, "functionCalls": []}
        except Exception:
            pass

        return {
            "text": "I'm sorry, I'm having trouble processing your request right now. Could you please try rephrasing your question or ask something else?",
            "functionCalls": [],
        }
