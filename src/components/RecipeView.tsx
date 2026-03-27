import { useState, useMemo } from 'react';
import { Recipe, RecipeNote, Technique } from '../types';
import { ArrowLeft, Play, Plus, Clock, ChefHat, Trash2, Edit3, Image as ImageIcon, AlertTriangle, Video, BookOpen, ThermometerSnowflake, Link, Share, Download, FileText, Check } from 'lucide-react';
import { CookingMode } from './CookingMode';

export function RecipeView({ recipe, recipes, techniques, onBack, onUpdateRecipe, onDeleteRecipe, onEdit, onSelectTechnique, onSelectRecipe, onTagClick }: RecipeViewProps) {
  const [multiplier, setMultiplier] = useState<number>(1);
  const [customMultiplier, setCustomMultiplier] = useState<string>('');
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const multipliers = [0.5, 1, 2, 3];
  const activeMultiplier = customMultiplier ? parseFloat(customMultiplier) || 1 : multiplier;

  const scaledIngredients = useMemo(() => {
    return recipe.ingredients.map((ing) => ({
      ...ing,
      amount: ing.amount * activeMultiplier,
    }));
  }, [recipe.ingredients, activeMultiplier]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: RecipeNote = { id: Date.now().toString(), timestamp: Date.now(), text: newNote.trim() };
    onUpdateRecipe({ ...recipe, notes: [note, ...recipe.notes] });
    setNewNote('');
  };

  const handlePrintPdf = () => window.print();

  if (isCookingMode) return <CookingMode recipe={{ ...recipe, ingredients: scaledIngredients }} onExit={() => setIsCookingMode(false)} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      {/* Delete Confirmation... */}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors"><ArrowLeft className="w-7 h-7 text-zinc-900" /></button>
        <div className="flex gap-2">
          <button onClick={handlePrintPdf} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors"><FileText className="w-6 h-6" /></button>
          <button onClick={() => setIsCookingMode(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-full font-medium shadow-sm active:scale-[0.98] transition-all"><ChefHat className="w-5 h-5" /> Cook Mode</button>
          <button onClick={onEdit} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors"><Edit3 className="w-6 h-6" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 rounded-full text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{recipe.name}</h1>
      </div>

      {/* Ingredients Box */}
      <div className="bg-white rounded-3xl p-6 mb-10 border border-zinc-200 shadow-sm break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-zinc-900">Ingredients</h2>
          <div className="flex items-center gap-1 bg-zinc-100 rounded-full p-1 border">
            {multipliers.map((m) => (
              <button key={m} onClick={() => { setMultiplier(m); setCustomMultiplier(''); }} className={`px-4 py-2 rounded-full text-base font-medium transition-all ${activeMultiplier === m && !customMultiplier ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600'}`}>{m}x</button>
            ))}
          </div>
        </div>
        
        {/* הצגת כמות המנות המעודכנת (חדש!) */}
        <p className="text-base text-zinc-500 mb-6 font-medium">
          Makes {recipe.servings_base * activeMultiplier} servings (Base: {recipe.servings_base})
        </p>

        <ul className="space-y-4">
          {scaledIngredients.map((ing, idx) => (
            <li key={idx} className="flex items-baseline gap-4 py-3 border-b border-zinc-100 last:border-0">
              <span className="font-mono font-bold text-zinc-900 w-20 text-right text-lg">
                {Number.isInteger(ing.amount) ? ing.amount : ing.amount.toFixed(2)}
              </span>
              <span className="text-zinc-500 w-20 text-base font-medium">{ing.unit}</span>
              <span className="text-zinc-800 font-medium text-lg text-left">{ing.item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* שאר חלקי התצוגה... */}
    </div>
  );
}

interface RecipeViewProps {
  recipe: Recipe;
  recipes: Recipe[];
  techniques: Technique[];
  onBack: () => void;
  onUpdateRecipe: (updated: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onEdit: () => void;
  onSelectTechnique: (id: string) => void;
  onSelectRecipe: (id: string) => void;
  onTagClick: (tag: string) => void;
}
