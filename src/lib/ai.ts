import { GoogleGenAI, Type } from "@google/genai";

export interface AIParsedRecipe {
  title: string;
  servings: number;
  ingredients: { item: string; amount: number; unit: string }[];
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

  // עדכנתי את ההנחיה שתהיה קשיחה יותר לגבי שפת המקור
  const systemInstruction = `Role: Expert Culinary Data Architect.
Task: Convert raw text into a structured recipe JSON object.

Language Rule: 
IMPORTANT: Maintain the original language of the input text. 
- If the input is in HEBREW, the JSON response MUST be in HEBREW (title, ingredients, steps, notes).
- Do not translate Hebrew to English.
- Keep professional culinary terms in the original language.

Input Handling:
1. Clean the text from social media/sponsors.
2. Standardize units (g, ml, cups, tsp, tbsp).
3. Extract crucial preparation info and YouTube reference links.

Constraint: Return ONLY the JSON object. No conversational text.`;

  const response = await ai.models.generateContent({
    // חזרנו למודל המקורי שזוהה במערכת שלך, אך עם ההוראות החדשות
    model: "gemini-3-flash-preview", 
    contents: rawText,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Recipe Name in the input language" },
          servings: { type: Type.INTEGER, description: "Number of servings" },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
              },
              required: ["item", "amount", "unit"],
            },
          },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
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
