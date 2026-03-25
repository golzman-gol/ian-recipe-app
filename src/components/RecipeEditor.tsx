import React, { useState, useRef } from 'react';
import { Recipe, Ingredient, Technique } from '../types';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, ChevronDown, ChevronRight } from 'lucide-react';

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
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [tags, setTags] = useState<string[]>(recipe.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!recipe.name.trim()) return;
    onSave({ ...recipe, tags });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const removeIngredient = (index: number) => {
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.filter((_, i) => i !== index)
    });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { item: '', amount: 0, unit: '' }]
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      {/* Header - רק ביטול ושמירה, בלי Import */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors">
            <ArrowLeft className="w-7 h-7 text-zinc-900" />
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">{isEditMode ? 'Edit Recipe' : 'New Recipe'}</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={!recipe.name.trim()}
          className="flex items-center gap-2 py-3 px-6 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <Save className="w-5 h-5" />
          Save
        </button>
      </div>

      <div className="space-y-8">
        {/* Title Section */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-500 mb-2 uppercase tracking-wider">Recipe Title</label>
          <input
            type="text"
            value={recipe.name}
            onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
            className="w-full border-b-2 border-zinc-100 py-2 text-2xl font-bold focus:border-zinc-900 outline-none transition-colors bg-transparent"
            placeholder="Name your creation..."
          />
        </div>

        {/* Ingredients Editor */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-zinc-900">Ingredients</h2>
            <button 
              onClick={addIngredient}
              className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="number"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(idx, 'amount', parseFloat(e.target.value) || 0)}
                  className="w-20 border border-zinc-100 rounded-xl px-3 py-2 bg-zinc-50 text-center font-mono"
                  placeholder="Qty"
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                  className="w-20 border border-zinc-100 rounded-xl px-3 py-2 bg-zinc-50"
                  placeholder="Unit"
                />
                <input
                  type="text"
                  value={ing.item}
                  onChange={(e) => updateIngredient(idx, 'item', e.target.value)}
                  className="flex-1 border border-zinc-100 rounded-xl px-3 py-2 bg-zinc-50"
                  placeholder="Ingredient"
                />
                <button onClick={() => removeIngredient(idx)} className="p-2 text-zinc-300 hover:text-red-600 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps Editor */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Instructions</h2>
          <div className="space-y-4">
            {recipe.steps.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="font-bold text-zinc-300 mt-2">{idx + 1}</span>
                <textarea
                  value={step}
                  onChange={(e) => {
                    const newSteps = [...recipe.steps];
                    newSteps[idx] = e.target.value;
                    setRecipe({ ...recipe, steps: newSteps });
                  }}
                  className="flex-1 border border-zinc-100 rounded-xl p-4 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 outline-none transition-all min-h-[100px]"
                />
              </div>
            ))}
            <button 
              onClick={() => setRecipe({...recipe, steps: [...recipe.steps, '']})}
              className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-500 font-medium hover:bg-zinc-50 transition-colors"
            >
              + Add Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
