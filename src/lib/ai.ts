import { GoogleGenAI, Type } from "@google/genai";

export interface AIParsedRecipe {
  title: string;
  servings: number;
  ingredients: { item: string; amount: number; unit: string; group?: string }[];
  steps: string[];
  culinary_notes?: string;
  prep_info?: string;
  reference_videos?: { url: string; note: string }[];
}

export async function parseRecipeWithAI(rawText: string): Promise<AIParsedRecipe> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `Role: Expert Culinary Data Architect.
Task: Convert raw text into a structured recipe JSON object with smart ingredient grouping.

Language Rule: 
IMPORTANT: Maintain the original language of the input text (usually Hebrew). Use it for all text fields.

Core Logic Rules:
1. Grouping: Identify subheaders in the ingredient list (e.g., "לבצק", "למלית", "לציפוי"). Assign these to the "group" field for each related ingredient. If no subheader exists for an ingredient, leave the "group" field empty ("").
2. Steps: Extract the preparation steps as clean text. DO NOT add any special formatting, double brackets, or tags.
3. Cleaning: Remove social media tags, sponsors, and emojis from the recipe content.
4. Standardize: Units should be consistent (g, ml, cups, tsp, tbsp).

Constraint: Return ONLY the JSON object. No conversational text.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: rawText,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Recipe Name in the original language" },
          servings: { type: Type.INTEGER, description: "Number of servings" },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING, description: "Name of the ingredient" },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                group: { type: Type.STRING, description: "Subsection title if exists (e.g., 'Dough', 'Filling')." },
              },
              required: ["item", "amount", "unit"],
            },
          },
          steps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Clean preparation steps as strings"
          },
          culinary_notes: { type: Type.STRING },
          prep_info: { type: Type.STRING },
          reference_videos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                note: { type: Type.STRING },
              },
              required: ["url", "note"],
            },
          },
        },
        required: ["title", "servings", "ingredients", "steps"],
      },
    },
  });

  const jsonStr = response.text?.trim();
  if (!jsonStr) {
    throw new Error("Failed to parse recipe.");
  }

  return JSON.parse(jsonStr);
}
