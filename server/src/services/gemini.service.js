const { GoogleGenAI, createPartFromFunctionResponse } = require('@google/genai');
const { FUNCTION_DECLARATIONS, executeFunction } = require('./function-executor.service');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TEXT_MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

let ai;
function getClient() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return ai;
}

const LANGUAGE_MAP = {
  en: 'English',
  am: 'Amharic (አማርኛ)',
  om: 'Oromo (Afaan Oromoo)',
  ti: 'Tigrinya (ትግርኛ)',
  so: 'Somali (Af-Soomaali)',
};

const BASE_SYSTEM_PROMPT = `You are AgriConnect AI, an expert agricultural assistant for Ethiopian farmers and traders.

## Your Role
- Provide practical, science-based farming advice for Ethiopian conditions.
- Explain complex concepts in simple, easy-to-understand terms.
- Use local units: ETB (Birr), hectares, kg, quintals.
- Reference Ethiopian seasons: Meher (Jun-Sep), Belg (Feb-May).
- Know Ethiopian crops: Teff, Maize, Coffee, Chat, Enset, Sorghum, etc.

## Tool Usage
{farm_context}

Available tools:
- **get_price_trends(crop_name, region?)**: Queries the market database for recent prices. Use for ANY price question.
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
- Keep responses detailed but easy to understand for a farmer.`;

function buildSystemPrompt(language = 'en', userContext = null) {
  const langName = LANGUAGE_MAP[language] || 'English';
  let langInstruction;
  if (language === 'am') {
    langInstruction = 'The user prefers Amharic (አማርኛ). ALWAYS respond in Amharic using Ethiopic script (ፊደል). Use simple Amharic that farmers can understand.';
  } else if (language === 'om') {
    langInstruction = 'The user prefers Oromo (Afaan Oromoo). ALWAYS respond in Afaan Oromoo.';
  } else if (language === 'ti') {
    langInstruction = 'The user prefers Tigrinya (ትግርኛ). ALWAYS respond in Tigrinya.';
  } else {
    langInstruction = `The user prefers ${langName}. Respond in ${langName}.`;
  }

  let farmContext = '';
  if (userContext) {
    const { role, region, woreda, name, farms } = userContext;
    const parts = [];
    if (name) parts.push(`The user's name is ${name}.`);
    parts.push(`The user is a ${role || 'FARMER'}.`);
    if (region) parts.push(`They are from ${region}${woreda ? `, ${woreda}` : ''}.`);
    const userInfo = parts.join(' ');

    let farmInfo = '';
    if (farms && farms.length > 0) {
      const details = farms.map(f => {
        const fParts = [`Farm '${f.name || 'Unnamed'}'`];
        if (f.region) fParts.push(`in ${f.region}`);
        fParts.push(`(ID: ${f.id})`);
        const soil = [];
        if (f.nitrogen != null) soil.push(`N=${f.nitrogen}`);
        if (f.phosphorus != null) soil.push(`P=${f.phosphorus}`);
        if (f.potassium != null) soil.push(`K=${f.potassium}`);
        if (f.ph != null) soil.push(`pH=${f.ph}`);
        if (soil.length) fParts.push(`Soil: ${soil.join(', ')}`);
        if (f.size) fParts.push(`Size: ${f.size}`);
        return ' - ' + fParts.join(' | ');
      });
      farmInfo = `They have ${farms.length} farm(s):\n${details.join('\n')}`;
    }

    if (userInfo || farmInfo) {
      farmContext = `## User Context\n${userInfo}\n${farmInfo}`.trim();
    }
  }

  return BASE_SYSTEM_PROMPT
    .replace('{language_instruction}', langInstruction)
    .replace('{farm_context}', farmContext || 'No user context available.');
}

function buildTools() {
  return [{ functionDeclarations: FUNCTION_DECLARATIONS }];
}

async function sendMessage({ message, conversationHistory = [], language = 'en', userContext = null }) {
  const client = getClient();
  if (!GEMINI_API_KEY) {
    return { text: 'AI service is currently unavailable. Please check your API configuration.', functionCalls: [] };
  }

  try {
    const systemPrompt = buildSystemPrompt(language, userContext);

    const history = [];
    for (const msg of conversationHistory || []) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const content = (msg.content || '').trim();
      if (content) {
        history.push({ role, parts: [{ text: content }] });
      }
    }

    let modelName = TEXT_MODEL_NAME;
    let chat;
    try {
      chat = client.chats.create({
        model: modelName,
        config: {
          systemInstruction: systemPrompt,
          tools: buildTools(),
        },
        history,
      });
    } catch (modelErr) {
      const errText = (modelErr.message || '').toLowerCase();
      if (errText.includes('not found') || errText.includes('not supported')) {
        modelName = 'gemini-2.0-flash';
        chat = client.chats.create({
          model: modelName,
          config: {
            systemInstruction: systemPrompt,
            tools: buildTools(),
          },
          history,
        });
      } else {
        throw modelErr;
      }
    }

    let response = await chat.sendMessage({ message });
    const functionCalls = [];

    const maxRounds = 5;
    for (let round = 0; round < maxRounds; round++) {
      const calls = response.functionCalls;
      if (!calls || calls.length === 0) break;

      const roundCalls = [];
      for (const fc of calls) {
        const fnName = fc.name;
        const fnArgs = fc.args || {};
        const fnResult = await executeFunction(fnName, fnArgs, userContext);
        roundCalls.push({ name: fnName, args: fnArgs, result: fnResult });
        response = await chat.sendMessage({
          message: createPartFromFunctionResponse(
            fc.id,
            fnName,
            { result: fnResult.result || fnResult }
          ),
        });
      }
      functionCalls.push(...roundCalls);
    }

    const text = response.text || "I've looked into your question. What else can I help you with?";
    return { text, functionCalls };
  } catch (err) {
    console.error('[Gemini Service Error]', err.message);

    const client2 = getClient();
    try {
      const fallback = await client2.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: `The user asked: '${message}'. Respond helpfully as an Ethiopian agricultural assistant. Be concise and warm.`,
        config: {
          systemInstruction: 'You are an expert Ethiopian agricultural assistant. Answer helpfully and simply.',
        },
      });
      const fallbackText = fallback.text || '';
      if (fallbackText) return { text: fallbackText, functionCalls: [] };
    } catch (_) {}

    return {
      text: "I'm sorry, I'm having trouble processing your request right now. Could you please try rephrasing your question or ask something else?",
      functionCalls: [],
    };
  }
}

module.exports = { sendMessage };
