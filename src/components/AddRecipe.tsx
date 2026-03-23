import { useState } from 'react';
import { Recipe, Technique } from '../types';
import { parseRecipeWithAI, AIParsedRecipe } from '../lib/ai';
import { ArrowLeft, Wand2, Loader2 } from 'lucide-react';
import { RecipeEditor } from './RecipeEditor';

interface AddRecipeProps {
  techniques: Technique[];
  recipes: Recipe[];
  allTags?: string[];
  onAdd: (recipe: Recipe) => void;
  onCancel: () => void;
}

export function AddRecipe({ techniques, recipes, allTags = [], onAdd, onCancel }: AddRecipeProps) {
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState('');

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setError('');
    try {
      const result = await parseRecipeWithAI(rawText);
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        name: result.title || 'Untitled Recipe',
        tags: [],
        servings_base: result.servings || 1,
        ingredients: result.ingredients || [],
        steps: result.steps || [],
        notes: [],
        culinary_notes: result.culinary_notes || '',
        prep_info: result.prep_info || '',
        reference_videos: result.reference_videos || [],
      };
      setParsedRecipe(newRecipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse recipe');
    } finally {
      setIsParsing(false);
    }
  };

  if (parsedRecipe) {
    return (
      <RecipeEditor
        initialRecipe={parsedRecipe}
        techniques={techniques}
        recipes={recipes}
        allTags={allTags}
        onSave={onAdd}
        onCancel={() => setParsedRecipe(null)}
        isEditMode={false}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onCancel}
          className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-7 h-7 text-zinc-900" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Add New Recipe</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="rawText" className="block text-base font-medium text-zinc-700 mb-3">
            Paste raw YouTube description or recipe text
          </label>
          <textarea
            id="rawText"
            rows={12}
            className="block w-full border border-zinc-200 rounded-3xl p-5 shadow-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-base bg-zinc-50"
            placeholder="Paste ingredients, steps, and any other details here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={isParsing || !rawText.trim()}
          className="w-full flex justify-center items-center gap-3 py-5 px-4 border border-transparent rounded-3xl shadow-sm text-lg font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isParsing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Wand2 className="w-6 h-6" />
          )}
          {isParsing ? 'Parsing with AI...' : 'Format with AI'}
        </button>
      </div>
    </div>
  );
}
