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

  const systemInstruction = `Role: Expert Culinary Data Architect & Professional Translator.
Task: Convert raw text (English or Hebrew) into a structured recipe JSON object strictly in HEBREW.

Language Rule: 
IMPORTANT: The entire output MUST be in HEBREW. If the source text is in English, translate the title, ingredients, groups, and steps to natural-sounding culinary Hebrew.

Measurement & Unit Rules (Force Metric):
1. Convert all Imperial measurements to Metric (e.g., lbs/oz to grams/kg).
2. Use Hebrew unit names: "גרם" (g), "מ\"ל" (ml), "כוס" (cup), "כף" (tbsp), "כפית" (tsp), "יחידה" (unit).
3. Temperature: Always convert Fahrenheit to Celsius (צלזיוס).

Core Logic Rules:
1. Ingredient Grouping: Identify subheaders (e.g., "For the dough") and assign these to the "group" field in Hebrew (e.g., "בצק"). If no subheader exists, leave "group" empty ("").
2. Plain Text Steps (CRITICAL): Extract the preparation steps as CLEAN, PLAIN TEXT only in Hebrew. 
   - ABSOLUTELY NO double brackets [[ ]] anywhere in the steps.
   - DO NOT inject ingredients, amounts, or units into the steps text.
3. Data Cleaning: Remove social media tags, sponsors, credits, and emojis.

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
          title: { type: Type.STRING, description: "Recipe Name in Hebrew" },
          servings: { type: Type.INTEGER },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING, description: "Ingredient name in Hebrew" },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING, description: "Metric unit in Hebrew (גרם, כוס, כף, וכו')" },
                group: { type: Type.STRING, description: "Subsection title in Hebrew (e.g., 'בצק')" },
              },
              required: ["item", "amount", "unit"],
            },
          },
          steps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Plain text steps in Hebrew. No brackets, no ingredient injection."
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
