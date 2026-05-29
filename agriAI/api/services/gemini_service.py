from __future__ import annotations

import os
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv
import google.generativeai as genai

from .function_executor import get_tool_definitions, execute_function

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️  GEMINI_API_KEY not set. Gemini service will not work.")

SYSTEM_PROMPT = """You are AgriAI, an expert agricultural assistant for Ethiopian farmers and traders.
You help with:
1. Crop recommendations based on soil and climate data
2. Price forecasting for agricultural products
3. Weather information and farming advice
4. Market trends and analysis
5. Soil analysis and improvement suggestions

You have access to tools that can provide real data. When a user asks about:
- What to plant or crop recommendations → use get_crop_recommendation
- Price predictions or forecasts → use get_price_forecast
- Weather → use get_weather_forecast
- Market data or trends → use get_market_trends
- Soil analysis → use get_soil_analysis

Always use the appropriate tool when needed. If the user doesn't provide enough parameters,
ask them for the missing information. Respond in a friendly, conversational manner.
Format prices in ETB (Ethiopian Birr). Be concise but helpful."""


def _convert_history_to_gemini(conversation_history: List[Dict]) -> List[Dict]:
    contents = []
    for msg in conversation_history:
        role = msg.get("role", "user")
        if role == "assistant":
            role = "model"
        content = msg.get("content", "")
        if content.strip():
            contents.append({"role": role, "parts": [{"text": content}]})
    return contents


def send_message(
    message: str,
    conversation_history: Optional[List[Dict]] = None,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        return {
            "text": "AI service is not configured. Please set up the GEMINI_API_KEY.",
            "functionCalls": [],
        }

    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SYSTEM_PROMPT,
            tools=get_tool_definitions(),
        )

        chat = model.start_chat(history=[])
        history = _convert_history_to_gemini(conversation_history or [])

        if history:
            chat.history = history

        response = chat.send_message(message)
        function_calls = []

        for part in response.parts or []:
            if part.function_call:
                fn_name = part.function_call.name
                fn_args = {k: v for k, v in part.function_call.args.items()}
                fn_result = execute_function(fn_name, fn_args)

                function_calls.append({
                    "name": fn_name,
                    "args": fn_args,
                    "result": fn_result,
                })

                response = chat.send_message(
                    genai.protos.Content(
                        parts=[genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=fn_name,
                                response={"result": fn_result.get("result", fn_result)},
                            )
                        )]
                    )
                )

        text = ""
        for part in response.parts or []:
            if part.text:
                text += part.text

        if not text:
            text = "I'm processing your request. Let me know if you need more specific information."

        return {"text": text, "functionCalls": function_calls}

    except Exception as e:
        return {
            "text": f"I encountered an error: {str(e)}. Please try rephrasing your question.",
            "functionCalls": [],
        }
