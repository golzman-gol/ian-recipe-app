import React, { useState, useRef } from 'react';
import { Recipe, Ingredient, ReferenceLink, Technique, ProcessImage } from '../types';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, ChevronDown, ChevronRight, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

interface RecipeEditorProps {
  initialRecipe: Recipe;
  techniques: Technique[];
  recipes: Recipe[];
  allTags?: string[];
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
  isEditMode: boolean;
}

export function RecipeEditor({ initialRecipe, techniques, recipes, allTags = [], onSave, onCancel, isEditMode }: RecipeEditorProps) {
  const [recipe, setRecipe] = useState<Recipe>(() => {
    if (isEditMode && !initialRecipe.original_ingredients && !initialRecipe.original_steps) {
      return {
        ...initialRecipe,
        original_ingredients: [...initialRecipe.ingredients],
        original_steps: [...initialRecipe.steps],
      };
    }
    return initialRecipe;
  });

  const [tags, setTags] = useState<string[]>(recipe.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [fetchingVideoIdx, setFetchingVideoIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // פונקציות להזזת מצרכים (חדש!)
  const moveIngredientUp = (index: number) => {
    if (index === 0) return;
    const newIngredients = [...recipe.ingredients];
    [newIngredients[index - 1], newIngredients[index]] = [newIngredients[index], newIngredients[index - 1]];
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const moveIngredientDown = (index: number) => {
    if (index === recipe.ingredients.length - 1) return;
    const newIngredients = [...recipe.ingredients];
    [newIngredients[index + 1], newIngredients[index]] = [newIngredients[index], newIngredients[index + 1]];
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setRecipe({ ...recipe, ingredients: [...recipe.ingredients, { item: '', amount: 1, unit: '' }] });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const updateReferenceVideo = async (index: number, field: keyof ReferenceLink, value: string) => {
    const newVideos = [...(recipe.reference_videos || [])];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setRecipe({ ...recipe, reference_videos: newVideos });

    if (field === 'url' && (value.includes('youtube.com') || value.includes('youtu.be'))) {
      setFetchingVideoIdx(index);
      try {
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (data && !data.error) {
          const updatedVideos = [...newVideos];
          updatedVideos[index] = {
            ...updatedVideos[index],
            thumbnailUrl: data.thumbnail_url,
            channelName: updatedVideos[index].channelName || data.author_name,
            note: updatedVideos[index].note || data.title || ''
          };
          setRecipe({ ...recipe, reference_videos: updatedVideos });
        }
      } catch (e) { console.error(e); } finally { setFetchingVideoIdx(null); }
    }
  };

  const handleSave = () => {
    onSave({ ...recipe, tags });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 -ml-3 rounded-full hover:bg-zinc-100"><ArrowLeft className="w-7 h-7 text-zinc-900" /></button>
          <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Recipe' : 'New Recipe'}</h1>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full font-bold shadow-lg"><Save className="w-5 h-5" /> Save</button>
      </div>

      <div className="space-y-8">
        {/* Basic Info & Servings */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Title</label>
            <input type="text" value={recipe.name} onChange={(e) => setRecipe({ ...recipe, name: e.target.value })} className="w-full text-2xl font-bold border-b py-2 focus:border-zinc-900 outline-none" placeholder="Recipe Name" />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Base Servings (Yield)</label>
            <input type="number" value={recipe.servings_base} onChange={(e) => setRecipe({ ...recipe, servings_base: parseInt(e.target.value) || 1 })} className="w-32 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50 font-bold" />
            <p className="text-xs text-zinc-500 mt-2">This is the original portion count before scaling.</p>
          </div>
        </div>

        {/* Ingredients with Reordering */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Ingredients</h2>
            <button onClick={addIngredient} className="flex items-center gap-1 text-sm font-medium bg-zinc-100 px-4 py-2 rounded-full"><Plus className="w-4 h-4" /> Add</button>
          </div>
          <div className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-zinc-50/50 p-2 rounded-2xl border border-zinc-100">
                {/* חצי הזזה (חדש!) */}
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveIngredientUp(idx)} disabled={idx === 0} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => moveIngredientDown(idx)} disabled={idx === recipe.ingredients.length - 1} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                </div>
                <input type="number" step="0.1" value={ing.amount} onChange={(e) => updateIngredient(idx, 'amount', parseFloat(e.target.value) || 0)} className="w-20 border border-zinc-200 rounded-xl px-2 py-3 focus:ring-2 focus:ring-zinc-900 outline-none font-mono text-center" />
                <input type="text" value={ing.unit} onChange={(e) => updateIngredient(idx, 'unit', e.target.value)} className="w-24 border border-zinc-200 rounded-xl px-2 py-3 focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="Unit" />
                <input type="text" value={ing.item} onChange={(e) => updateIngredient(idx, 'item', e.target.value)} className="flex-1 border border-zinc-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-zinc-900 outline-none font-medium" placeholder="Ingredient" />
                <button onClick={() => removeIngredient(idx)} className="p-2 text-zinc-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* שאר חלקי העורך (Culinary Notes, References וכו') נשארים ללא שינוי כדי לשמור על הפונקציונליות */}
      </div>
    </div>
  );
}
