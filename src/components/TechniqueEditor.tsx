import { useState, useMemo, useRef } from 'react';
import { Recipe, RecipeNote, Technique, ReferenceLink } from '../types';
import { ArrowLeft, Plus, Clock, ChefHat, Trash2, Pencil, AlertTriangle, Link, Share, Download, Check, X, Save, ExternalLink } from 'lucide-react';
import { CookingMode } from './CookingMode';

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

export function RecipeView({ recipe, recipes, techniques, onBack, onUpdateRecipe, onDeleteRecipe, onEdit, onSelectTechnique, onSelectRecipe, onTagClick }: RecipeViewProps) {
  const [multiplier, setMultiplier] = useState<number>(1);
  const [customMultiplier, setCustomMultiplier] = useState<string>('');
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const multipliers = [0.5, 1, 2, 3];
  const activeMultiplier = customMultiplier ? parseFloat(customMultiplier) || 1 : multiplier;

  const scaledIngredients = useMemo(() => recipe.ingredients.map((ing) => ({
    ...ing,
    amount: ing.amount * activeMultiplier,
  })), [recipe.ingredients, activeMultiplier]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: RecipeNote = { id: Date.now().toString(), timestamp: Date.now(), text: newNote.trim() };
    onUpdateRecipe({ ...recipe, notes: [note, ...recipe.notes] });
    setNewNote('');
  };

  const handleSaveEditedNote = () => {
    if (!editingNoteId) return;
    const updatedNotes = recipe.notes.map(n => n.id === editingNoteId ? { ...n, text: editingNoteText.trim() } : n);
    onUpdateRecipe({ ...recipe, notes: updatedNotes });
    setEditingNoteId(null);
  };

  const getYoutubeData = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    if (!id) return null;
    return {
      embed: `https://www.youtube.com/embed/${id}`,
      direct: `https://www.youtube.com/watch?v=${id}`
    };
  };

  if (isCookingMode) return <CookingMode recipe={{ ...recipe, ingredients: scaledIngredients }} onExit={() => setIsCookingMode(false)} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-zinc-100"><ArrowLeft className="w-7 h-7" /></button>
        <div className="flex gap-2">
          <button onClick={() => setIsCookingMode(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-full font-medium"><ChefHat className="w-5 h-5" /> Cook</button>
          <button onClick={onEdit} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Pencil className="w-6 h-6" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 rounded-full text-red-600 hover:bg-red-50"><Trash2 className="w-6 h-6" /></button>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-8">{recipe.name}</h1>
      
      {/* Ingredients */}
      <div className="bg-white rounded-3xl p-6 mb-8 border border-zinc-200">
        <h2 className="text-2xl font-bold mb-6">Ingredients</h2>
        <ul className="space-y-4">
          {scaledIngredients.map((ing, idx) => (
            <li key={idx} className="flex items-baseline gap-4 py-3 border-b border-zinc-50 last:border-0">
              <span className="font-mono font-bold w-20 text-right">{ing.amount.toFixed(ing.amount % 1 === 0 ? 0 : 2)}</span>
              <span className="text-zinc-500 w-20">{ing.unit}</span>
              <span className="font-medium flex-1">{ing.item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="mb-10 bg-white rounded-3xl p-6 border border-zinc-200">
        <h2 className="text-2xl font-bold mb-6">Instructions</h2>
        <div className="space-y-6">
          {recipe.steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold">{idx + 1}</div>
              <p className="text-zinc-800 text-lg leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* YouTube References - iOS Fix */}
      {recipe.reference_videos && recipe.reference_videos.length > 0 && (
        <div className="border-t pt-10 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ExternalLink className="w-6 h-6" /> References</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recipe.reference_videos.map((video, idx) => {
              const yt = getYoutubeData(video.url);
              return (
                <div key={idx} className="bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  {yt ? <div className="aspect-video"><iframe width="100%" height="100%" src={yt.embed} frameBorder="0" allowFullScreen></iframe></div> : <div className="aspect-video bg-zinc-100 flex items-center justify-center"><Link /></div>}
                  <div className="p-3 bg-zinc-50">
                    <a href={yt?.direct || video.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-1 rounded block text-center mb-2">OPEN VIDEO</a>
                    <p className="text-xs text-zinc-600 line-clamp-1">{video.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes with Mobile Fix */}
      <div className="border-t pt-10">
        <h2 className="text-2xl font-bold mb-6">Notes</h2>
        <div className="flex gap-3 mb-8">
          <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote()} placeholder="Add a note..." className="flex-1 border rounded-2xl px-4 py-3 bg-zinc-50" />
          <button onClick={handleAddNote} className="bg-zinc-900 text-white px-6 rounded-2xl font-medium">Add</button>
        </div>
        <div className="space-y-4">
          {recipe.notes.map((note) => (
            <div key={note.id} className="bg-white border rounded-2xl p-5 shadow-sm relative">
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea value={editingNoteText} onChange={(e) => setEditingNoteText(e.target.value)} className="w-full border rounded-xl p-3" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEditedNote} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm">Save</button>
                    <button onClick={() => setEditingNoteId(null)} className="bg-zinc-100 px-4 py-2 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-800 pr-12">{note.text}</p>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => {setEditingNoteId(note.id); setEditingNoteText(note.text)}} className="p-2 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => onUpdateRecipe({ ...recipe, notes: recipe.notes.filter(n => n.id !== note.id) })} className="p-2 text-zinc-400 hover:text-red-600 bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TechniqueEditor({ initialTechnique, onSave, onCancel }: any) {
  const [title, setTitle] = useState(initialTechnique?.title || '');
  const [content, setContent] = useState(initialTechnique?.content || '');
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onCancel} className="p-3 -ml-3"><ArrowLeft /></button>
        <button onClick={() => onSave({ ...initialTechnique, id: initialTechnique?.id || Date.now().toString(), title, content })} className="bg-zinc-900 text-white px-6 py-2 rounded-full font-medium">Save</button>
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} className="w-full text-2xl font-bold border-b mb-8 outline-none" placeholder="Technique Title" />
      <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full border rounded-xl p-4 min-h-[300px]" placeholder="Content..." />
    </div>
  );
}
