'use client';

import type { ToolName } from '@/types/real-time';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
}

export interface ToolResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchToolDefinitions(): Promise<ToolDefinition[]> {
  try {
    const res = await fetch(`${API_URL}/agriai/tools`, {
      credentials: 'include',
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return [];
  } catch {
    return [];
  }
}

export async function executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  try {
    const res = await fetch(`${API_URL}/agriai/tools/execute`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, args }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || 'Tool execution failed' };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export const BUILTIN_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'get_crop_recommendation',
    description: 'Recommend the best crops to plant based on soil nutrients and climate conditions',
    parameters: {
      type: 'OBJECT',
      properties: {
        nitrogen: { type: 'INTEGER', description: 'Nitrogen level in soil (0-150)' },
        phosphorus: { type: 'INTEGER', description: 'Phosphorus level in soil (0-150)' },
        potassium: { type: 'INTEGER', description: 'Potassium level in soil (0-200)' },
        temperature: { type: 'NUMBER', description: 'Temperature in Celsius (0-50)' },
        humidity: { type: 'NUMBER', description: 'Humidity percentage (0-100)' },
        ph: { type: 'NUMBER', description: 'Soil pH level (0-14)' },
        rainfall: { type: 'NUMBER', description: 'Rainfall in mm (0-500)' },
        soil_color: { type: 'STRING', description: 'Soil color', enum: ['brown', 'black', 'red', 'gray'] },
      },
      required: ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall'],
    },
  },
  {
    name: 'get_price_forecast',
    description: 'Predict future prices for a specific crop in a region',
    parameters: {
      type: 'OBJECT',
      properties: {
        crop_name: { type: 'STRING', description: 'Name of the crop' },
        region: { type: 'STRING', description: 'Region in Ethiopia' },
        year: { type: 'INTEGER', description: 'Target year' },
        month: { type: 'INTEGER', description: 'Target month (1-12)' },
      },
      required: ['crop_name', 'region', 'year', 'month'],
    },
  },
  {
    name: 'get_weather_forecast',
    description: 'Get 7-day weather forecast for a location',
    parameters: {
      type: 'OBJECT',
      properties: {
        latitude: { type: 'NUMBER', description: 'Latitude of the location' },
        longitude: { type: 'NUMBER', description: 'Longitude of the location' },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'get_market_trends',
    description: 'Get current market trends and pricing data for agricultural products',
    parameters: {
      type: 'OBJECT',
      properties: {
        category: { type: 'STRING', description: 'Product category to filter by' },
      },
      required: [],
    },
  },
  {
    name: 'get_soil_analysis',
    description: 'Analyze soil data including nitrogen, phosphorus, potassium, and pH levels',
    parameters: {
      type: 'OBJECT',
      properties: {
        region: { type: 'STRING', description: 'Region name' },
        nitrogen: { type: 'NUMBER', description: 'Nitrogen level' },
        phosphorus: { type: 'NUMBER', description: 'Phosphorus level' },
        potassium: { type: 'NUMBER', description: 'Potassium level' },
        ph: { type: 'NUMBER', description: 'pH level' },
      },
      required: [],
    },
  },
];