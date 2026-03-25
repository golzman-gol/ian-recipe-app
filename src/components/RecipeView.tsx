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
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [tags, setTags] = useState<string[]>(recipe.tags || []);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({ ...recipe, tags });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 -ml-3 rounded-full hover:bg-zinc-100">
            <ArrowLeft className="w-7 h-7 text-zinc-900" />
          </button>
          <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Recipe' : 'Review Recipe'}</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 py-3 px-6 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-all"
        >
          <Save className="w-5 h-5" />
          Save Recipe
        </button>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-500 mb-2">Recipe Title</label>
          <input
            type="text"
            value={recipe.name}
            onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
            className="w-full border-b-2 border-zinc-100 py-2 text-xl font-bold focus:border-zinc-900 outline-none transition-colors"
          />
        </div>

        {/* Ingredients List */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Ingredients</h2>
            <button 
              onClick={() => setRecipe({...recipe, ingredients: [...recipe.ingredients, {item: '', amount: 0, unit: ''}]})}
              className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="number"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(idx, 'amount', parseFloat(e.target.value) || 0)}
                  className="w-20 border rounded-xl px-3 py-2 bg-zinc-50"
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                  className="w-20 border rounded-xl px-3 py-2 bg-zinc-50"
                />
                <input
                  type="text"
                  value={ing.item}
                  onChange={(e) => updateIngredient(idx, 'item', e.target.value)}
                  className="flex-1 border rounded-xl px-3 py-2 bg-zinc-50"
                />
                <button 
                  onClick={() => setRecipe({...recipe, ingredients: recipe.ingredients.filter((_, i) => i !== idx)})}
                  className="p-2 text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Steps</h2>
          <div className="space-y-4">
            {recipe.steps.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="font-bold text-zinc-300">{idx + 1}</span>
                <textarea
                  value={step}
                  onChange={(e) => {
                    const newSteps = [...recipe.steps];
                    newSteps[idx] = e.target.value;
                    setRecipe({ ...recipe, steps: newSteps });
                  }}
                  className="flex-1 border rounded-xl p-3 bg-zinc-50 min-h-[80px]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
