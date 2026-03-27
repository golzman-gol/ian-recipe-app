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
    const temp = newIngredients[index - 1];
    newIngredients[index - 1] = newIngredients[index];
    newIngredients[index] = temp;
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const moveIngredientDown = (index: number) => {
    if (index === recipe.ingredients.length - 1) return;
    const newIngredients = [...recipe.ingredients];
    const temp = newIngredients[index + 1];
    newIngredients[index + 1] = newIngredients[index];
    newIngredients[index] = temp;
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { item: '', amount: 1, unit: '' }],
    });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleSave = () => {
    onSave({ ...recipe, tags });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors">
            <ArrowLeft className="w-7 h-7 text-zinc-900" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {isEditMode ? 'Edit Recipe' : 'New Recipe'}
          </h1>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full font-bold shadow-lg active:scale-95 transition-transform">
          <Save className="w-5 h-5" /> Save
        </button>
      </div>

      <div className="space-y-8">
        {/* Basic Info & Servings */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Title</label>
            <input 
              type="text" 
              value={recipe.name} 
              onChange={(e) => setRecipe({ ...recipe, name: e.target.value })} 
              className="w-full text-2xl font-bold border-b-2 border-zinc-100 focus:border-zinc-900 py-2 outline-none transition-colors" 
            />
          </div>

          {/* עריכת כמות מנות בסיס (חדש!) */}
          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Base Servings (Original Yield)</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                value={recipe.servings_base} 
                onChange={(e) => setRecipe({ ...recipe, servings_base: parseInt(e.target.value) || 1 })} 
                className="w-32 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50 font-bold text-lg" 
              />
              <span className="text-zinc-500 font-medium text-sm">portions</span>
            </div>
          </div>
        </div>

        {/* Ingredients List with Reordering */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-900">Ingredients</h2>
            <button onClick={addIngredient} className="flex items-center gap-1 text-sm font-bold bg-zinc-100 text-zinc-900 px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-zinc-50/50 p-2 rounded-2xl border border-zinc-100">
                {/* כפתורי הזזה (חדש!) */}
                <div className="flex flex-col gap-1 px-1">
                  <button onClick={() => moveIngredientUp(idx)} disabled={idx === 0} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20 transition-colors">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveIngredientDown(idx)} disabled={idx === recipe.ingredients.length - 1} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20 transition-colors">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                
                <input 
                  type="number" 
                  step="0.1"
                  value={ing.amount} 
                  onChange={(e) => updateIngredient(idx, 'amount', parseFloat(e.target.value) || 0)} 
                  className="w-20 border border-zinc-200 rounded-xl px-2 py-3 focus:ring-2 focus:ring-zinc-900 outline-none bg-white font-mono text-center" 
                />
                <input 
                  type="text" 
                  value={ing.unit} 
                  onChange={(e) => updateIngredient(idx, 'unit', e.target.value)} 
                  className="w-24 border border-zinc-200 rounded-xl px-2 py-3 focus:ring-2 focus:ring-zinc-900 outline-none bg-white" 
                  placeholder="Unit" 
                />
                <input 
                  type="text" 
                  value={ing.item} 
                  onChange={(e) => updateIngredient(idx, 'item', e.target.value)} 
                  className="flex-1 border border-zinc-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-zinc-900 outline-none bg-white font-medium" 
                  placeholder="Ingredient name" 
                />
                <button onClick={() => removeIngredient(idx)} className="p-2 text-zinc-300 hover:text-red-600 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* שאר חלקי הקוד המקורי שלך (Steps, Images וכו') נשארים כאן... */}
      </div>
    </div>
  );
}
