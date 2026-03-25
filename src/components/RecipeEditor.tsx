import { useState, useRef } from 'react';
import { Recipe, Technique, Ingredient } from '../types';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface RecipeEditorProps {
  initialRecipe: Recipe;
  techniques: Technique[];
  recipes: Recipe[];
  allTags?: string[];
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
  isEditMode: boolean;
}

export function RecipeEditor({ initialRecipe, onSave, onCancel, isEditMode }: RecipeEditorProps) {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!recipe.name.trim()) return;
    onSave(recipe);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 -ml-3 rounded-full hover:bg-zinc-100"><ArrowLeft className="w-7 h-7" /></button>
          <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Recipe' : 'Review Recipe'}</h1>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full font-medium shadow-sm active:scale-95"><Save className="w-5 h-5" /> Save Recipe</button>
      </div>

      <div className="space-y-6">
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-500 mb-2">Recipe Title</label>
          <input type="text" value={recipe.name} onChange={e => setRecipe({...recipe, name: e.target.value})} className="w-full text-2xl font-bold border-b-2 border-zinc-100 focus:border-zinc-900 outline-none py-2 transition-colors" />
        </div>

        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">Ingredients</h2><button onClick={() => setRecipe({...recipe, ingredients: [...recipe.ingredients, {item: '', amount: 0, unit: ''}]})} className="p-2 bg-zinc-100 rounded-full"><Plus className="w-5 h-5" /></button></div>
          <div className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="number" value={ing.amount} onChange={e => {
                  const newIngs = [...recipe.ingredients];
                  newIngs[idx].amount = parseFloat(e.target.value) || 0;
                  setRecipe({...recipe, ingredients: newIngs});
                }} className="w-20 border rounded-xl px-3 py-2 bg-zinc-50" />
                <input type="text" value={ing.item} onChange={e => {
                  const newIngs = [...recipe.ingredients];
                  newIngs[idx].item = e.target.value;
                  setRecipe({...recipe, ingredients: newIngs});
                }} className="flex-1 border rounded-xl px-3 py-2 bg-zinc-50" placeholder="Ingredient name" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
