from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, AsyncGenerator
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types

from .function_executor import get_tool_definitions, execute_function

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TEXT_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", os.getenv("GEMINI_TEXT_MODEL_NAME", "gemini-3.5-flash"))

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not set. Chat streaming will not work.")


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
- Market data or trends -> get_market_trends
- Soil analysis -> use get_soil_analysis

Always use the appropriate tool when needed. If the user doesn't provide enough parameters,
ask them for the missing information. Respond in a friendly, conversational manner.
Format prices in ETB (Ethiopian Birr). Be concise but helpful."""


def _build_tools() -> List[types.Tool]:
    tools = []
    for decl in get_tool_definitions():
        tools.append(types.Tool(function_declarations=[decl]))
    return tools


def send_message_stream(
    message: str,
    conversation_history: Optional[List[Dict]] = None,
) -> AsyncGenerator[str, None]:
    """Yields SSE tokens from Gemini, handling function calls inline."""

    if not client:
        yield "event: error\ndata: AI service not configured.\n\n"
        return

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

        model_name = TEXT_MODEL_NAME

        try:
            response = client.models.generate_content_stream(
                model=model_name,
                contents=[types.Content(
                    role="user",
                    parts=[types.Part(text=message)],
                )],
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    tools=_build_tools(),
                    history=history if history else None,
                ),
            )
        except Exception as model_err:
            err_text = str(model_err).lower()
            if "not found" in err_text or "not supported" in err_text:
                model_name = "gemini-2.5-flash"
                response = client.models.generate_content_stream(
                    model=model_name,
                    contents=[types.Content(
                        role="user",
                        parts=[types.Part(text=message)],
                    )],
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
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
                            system_instruction=SYSTEM_PROMPT,
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

        model_name = TEXT_MODEL_NAME
        try:
            chat = client.chats.create(
                model=model_name,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    tools=_build_tools(),
                ),
                history=history,
            )
        except Exception as model_error:
            err_text = str(model_error).lower()
            if "not found" in err_text or "not supported" in err_text:
                model_name = "gemini-2.5-flash"
                chat = client.chats.create(
                    model=model_name,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
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