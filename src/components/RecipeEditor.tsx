import { useState } from 'react';
import { Recipe, Technique } from '../types';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

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
        <button onClick={handleSave} className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full font-medium shadow-sm"><Save className="w-5 h-5" /> Save Recipe</button>
      </div>

      <div className="space-y-6">
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-500 mb-2">Recipe Title</label>
          <input type="text" value={recipe.name} onChange={e => setRecipe({...recipe, name: e.target.value})} className="w-full text-2xl font-bold border-b-2 border-zinc-100 focus:border-zinc-900 outline-none py-2" />
        </div>
      </div>
    </div>
  );
}
