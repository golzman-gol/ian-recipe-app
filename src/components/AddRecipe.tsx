import { useState } from 'react';
import { Recipe, Technique } from '../types';
import { parseRecipeWithAI } from '../lib/ai';
import { ArrowLeft, Wand2, Loader2, Edit3 } from 'lucide-react';
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
  const [isManualMode, setIsManualMode] = useState(false);
  const [error, setError] = useState('');

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setError('');
    try {
      const result = await parseRecipeWithAI(rawText);
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        name: result.title || 'מתכון ללא שם',
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
      setError(err instanceof Error ? err.message : 'נכשלו עיבוד המתכון. ייתכן והשרת עמוס.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualEntry = () => {
    const blankRecipe: Recipe = {
      id: Date.now().toString(),
      name: '',
      tags: [],
      servings_base: 1,
      ingredients: [{ item: '', amount: 1, unit: '' }],
      steps: [''],
      notes: [],
      culinary_notes: '',
      prep_info: '',
      reference_videos: [],
    };
    setParsedRecipe(blankRecipe);
    setIsManualMode(true);
  };

  // אם יש מתכון מעובד (או מצב ידני), עוברים לעורך
  if (parsedRecipe) {
    return (
      <RecipeEditor
        initialRecipe={parsedRecipe}
        techniques={techniques}
        recipes={recipes}
        allTags={allTags}
        onSave={onAdd}
        onCancel={() => {
          setParsedRecipe(null);
          setIsManualMode(false);
        }}
        isEditMode={!isManualMode} // אם זה ידני, זה נחשב יצירה חדשה
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 rtl text-right" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onCancel}
          className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors"
          aria-label="חזרה"
        >
          <ArrowLeft className="w-7 h-7 text-zinc-900 rotate-180" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">הוספת מתכון חדש</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="rawText" className="block text-base font-medium text-zinc-700 mb-3">
            הדבק תיאור מיוטיוב או טקסט חופשי של מתכון
          </label>
          <textarea
            id="rawText"
            rows={12}
            className="block w-full border border-zinc-200 rounded-3xl p-5 shadow-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-base bg-zinc-50"
            placeholder="הדבק כאן מצרכים, שלבי הכנה ופרטים נוספים..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
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
            {isParsing ? 'מעבד נתונים בעזרת AI...' : 'עבד והמר בעזרת AI'}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-50 text-zinc-500 font-medium">או</span>
            </div>
          </div>

          <button
            onClick={handleManualEntry}
            className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-zinc-200 rounded-3xl shadow-sm text-lg font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-all active:scale-[0.98]"
          >
            <Edit3 className="w-5 h-5" />
            הזנה ידנית ללא AI
          </button>
        </div>
      </div>
    </div>
  );
}
