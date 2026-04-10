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
Task: Convert raw text into a structured recipe JSON object with smart grouping and ingredient injection.

Language Rule: 
IMPORTANT: Maintain the original language of the input text (usually Hebrew). Use it for all text fields.

Core Logic Rules:
1. Grouping: Identify subheaders in the ingredient list (e.g., "לבצק", "למלית"). Assign these to the "group" field. If no subheader exists, leave "group" empty ("").
2. Smart Ingredient Injection: In the "steps" array, wrap every mention of an ingredient from the list in double brackets.
   - If the ingredient has a group: Use [[group:item]] (e.g., [[בצק:חמאה]]).
   - If the ingredient has no group: Use [[item]] (e.g., [[מלח]]).
3. Consistency: The name inside [[ ]] must match the "item" field EXACTLY.
4. Cleaning: Remove social media tags, sponsors, and emojis from the recipe content.
5. Standardize: Units should be consistent (g, ml, cups, tsp, tbsp).

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
                group: { type: Type.STRING, description: "Subsection like 'Dough' or 'Filling'. Empty if none." },
              },
              required: ["item", "amount", "unit"],
            },
          },
          steps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Steps with injected ingredients in [[group:item]] or [[item]] format"
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
