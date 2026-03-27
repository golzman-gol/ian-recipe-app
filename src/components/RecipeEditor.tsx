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
  const [fetchingVideoIdx, setFetchingVideoIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // פונקציות הזזה למצרכים (חדש!)
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

  const handleSave = () => {
    onSave({ ...recipe, tags });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors"><ArrowLeft className="w-7 h-7 text-zinc-900" /></button>
          <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Recipe' : 'New Recipe'}</h1>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full font-bold shadow-lg active:scale-95"><Save className="w-5 h-5" /> Save</button>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Title</label>
            <input type="text" value={recipe.name} onChange={(e) => setRecipe({ ...recipe, name: e.target.value })} className="w-full text-2xl font-bold border-b-2 border-zinc-100 focus:border-zinc-900 py-2 outline-none" />
          </div>

          {/* עריכת Servings Base (חדש!) */}
          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Base Servings (Portions)</label>
            <input type="number" value={recipe.servings_base} onChange={(e) => setRecipe({ ...recipe, servings_base: parseInt(e.target.value) || 1 })} className="w-32 border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 font-bold text-lg focus:ring-2 focus:ring-zinc-900 outline-none" />
          </div>
        </div>

        {/* Ingredients with Reordering (חדש!) */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Ingredients</h2><button onClick={() => setRecipe({...recipe, ingredients: [...recipe.ingredients, {item:'', amount:1, unit:''}]})} className="bg-zinc-100 px-4 py-2 rounded-full text-sm font-bold"><Plus className="w-4 h-4" /> Add</button></div>
          <div className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
                <div className="flex flex-col">
                  <button onClick={() => moveIngredientUp(idx)} disabled={idx === 0} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => moveIngredientDown(idx)} disabled={idx === recipe.ingredients.length - 1} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                </div>
                <input type="number" step="0.1" value={ing.amount} onChange={(e) => updateIngredient(idx, 'amount', parseFloat(e.target.value) || 0)} className="w-20 border rounded-xl px-2 py-3 bg-white font-mono text-center" />
                <input type="text" value={ing.unit} onChange={(e) => updateIngredient(idx, 'unit', e.target.value)} className="w-24 border rounded-xl px-2 py-3 bg-white" placeholder="Unit" />
                <input type="text" value={ing.item} onChange={(e) => updateIngredient(idx, 'item', e.target.value)} className="flex-1 border rounded-xl px-3 py-3 bg-white font-medium" placeholder="Ingredient" />
                <button onClick={() => setRecipe({...recipe, ingredients: recipe.ingredients.filter((_,i)=>i!==idx)})} className="p-2 text-zinc-300 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        </div>
        
        {/* יתר שדות העריכה (Steps, Images, References) ימשיכו להופיע כאן... */}
      </div>
    </div>
  );
}
