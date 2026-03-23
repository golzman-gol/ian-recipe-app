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

  const systemInstruction = `Role: Expert Culinary Data Architect & Translator.
Task: Convert raw YouTube description text into a structured, professional English recipe.

Input Handling:
1. Clean the text: Remove social media links, sponsor shoutouts, and non-culinary information.
2. Translation: If the input is in Hebrew, translate it to precise, professional English. Use specific culinary verbs (e.g., "Whisk," "Fold," "Sauté," "Simmer").
3. Terminology: Ensure units are standardized (g, ml, cups, tsp, tbsp).
4. Prep Info: Extract any crucial preparation information that must be known before starting (e.g., "Requires overnight proofing", "Ingredients must be room temperature").
5. Reference Videos: Extract any YouTube URLs found in the text and provide a short note about what the video demonstrates.

Constraint: Do not include any conversational text or explanations. Return ONLY the JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: rawText,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Recipe Name in English",
          },
          servings: {
            type: Type.INTEGER,
            description: "Number of servings (integer only)",
          },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: {
                  type: Type.STRING,
                  description: "Ingredient Name",
                },
                amount: {
                  type: Type.NUMBER,
                  description: "Numerical amount (convert fractions to decimals)",
                },
                unit: {
                  type: Type.STRING,
                  description: "Standardized unit",
                },
              },
              required: ["item", "amount", "unit"],
            },
            description: "The list of ingredients.",
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "Array of step descriptions",
          },
          culinary_notes: {
            type: Type.STRING,
            description: "Any extra tips or scientific explanations from the text",
          },
          prep_info: {
            type: Type.STRING,
            description: "Crucial preparation information that must be seen before starting",
          },
          reference_videos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                url: {
                  type: Type.STRING,
                  description: "YouTube URL",
                },
                note: {
                  type: Type.STRING,
                  description: "Short note about the video (e.g., 'Main recipe source')",
                },
              },
              required: ["url", "note"],
            },
            description: "List of reference videos extracted from the text",
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
