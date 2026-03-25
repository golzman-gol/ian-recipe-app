import { useState, useMemo } from 'react';
import { Recipe, RecipeNote, Technique } from '../types';
import { ArrowLeft, Clock, ChefHat, Trash2, Pencil, Link, Share, Download, Check, X, ExternalLink, BookOpen } from 'lucide-react';
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
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  // States for Note Editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const scaledIngredients = useMemo(() => recipe.ingredients.map((ing) => ({
    ...ing,
    amount: ing.amount * multiplier,
  })), [recipe.ingredients, multiplier]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: RecipeNote = { id: Date.now().toString(), timestamp: Date.now(), text: newNote.trim() };
    onUpdateRecipe({ ...recipe, notes: [note, ...recipe.notes] });
    setNewNote('');
  };

  const handleSaveEditedNote = () => {
    if (!editingNoteId) return;
    const updatedNotes = recipe.notes.map(n => 
      n.id === editingNoteId ? { ...n, text: editingNoteText.trim() } : n
    );
    onUpdateRecipe({ ...recipe, notes: updatedNotes });
    setEditingNoteId(null);
  };

  const getYoutubeData = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? { 
      embed: `https://www.youtube.com/embed/${id}`, 
      direct: `https://www.youtube.com/watch?v=${id}` 
    } : null;
  };

  if (isCookingMode) return <CookingMode recipe={{ ...recipe, ingredients: scaledIngredients }} onExit={() => setIsCookingMode(false)} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="w-7 h-7 text-zinc-900" />
        </button>
        <div className="flex gap-2">
          <button onClick={() => setIsCookingMode(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-full font-medium shadow-sm active:scale-95">
            <ChefHat className="w-5 h-5" /> Cook
          </button>
          <button onClick={onEdit} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors">
            <Pencil className="w-6 h-6" />
          </button>
          <button onClick={() => onDeleteRecipe(recipe.id)} className="p-3 rounded-full text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{recipe.name}</h1>
      
      {/* Linked Techniques */}
      {recipe.linkedTechniques && recipe.linkedTechniques.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <BookOpen className="w-5 h-5 text-zinc-400" />
          {recipe.linkedTechniques.map(id => {
            const tech = techniques.find(t => t.id === id);
            return tech ? (
              <button 
                key={id} 
                onClick={() => onSelectTechnique(id)}
                className="bg-zinc-100 border border-zinc-200 text-sm font-medium text-zinc-700 rounded-xl px-3 py-1.5 hover:bg-zinc-200 transition-colors"
              >
                {tech.title}
              </button>
            ) : null;
          })}
        </div>
      )}

      {/* Ingredients Box */}
      <div className="bg-white rounded-3xl p-6 mb-8 border border-zinc-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900">Ingredients</h2>
          <div className="flex gap-1 bg-zinc-100 p-1 rounded-full">
            {[0.5, 1, 2].map(m => (
              <button 
                key={m} 
                onClick={() => setMultiplier(m)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${multiplier === m ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>
        <ul className="space-y-4">
          {scaledIngredients.map((ing, idx) => (
            <li key={idx} className="flex items-baseline gap-4 py-3 border-b border-zinc-50 last:border-0">
              <span className="font-mono font-bold w-16 text-right text-zinc-900">
                {ing.amount.toFixed(ing.amount % 1 === 0 ? 0 : 2)}
              </span>
              <span className="text-zinc-500 w-16 text-sm uppercase">{ing.unit}</span>
              <span className="font-medium flex-1 text-zinc-800">{ing.item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reference Videos - YouTube Fix */}
      {recipe.reference_videos && recipe.reference_videos.length > 0 && (
        <div className="border-t border-zinc-100 pt-10 mb-10">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <ExternalLink className="w-6 h-6" /> References
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recipe.reference_videos.map((video, idx) => {
              const yt = getYoutubeData(video.url);
              return (
                <div key={idx} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  {yt ? (
                    <div className="aspect-video w-full">
                      <iframe width="100%" height="100%" src={yt.embed} frameBorder="0" allowFullScreen></iframe>
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-zinc-100 flex items-center justify-center">
                      <Link className="text-zinc-400" />
                    </div>
                  )}
                  <div className="p-3 bg-zinc-50 flex-1 flex flex-col">
                    <a 
                      href={yt?.direct || video.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-1.5 rounded block text-center mb-2 hover:bg-zinc-100 transition-colors uppercase"
                    >
                      Open Video
                    </a>
                    <p className="text-xs text-zinc-600 line-clamp-2">{video.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes Section with Edit Mode */}
      <div className="border-t border-zinc-100 pt-10">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6">Notes</h2>
        <div className="flex gap-3 mb-8">
          <input 
            type="text" 
            value={newNote} 
            onChange={(e) => setNewNote(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleAddNote()}
            placeholder="Add a new note..." 
            className="flex-1 border border-zinc-200 rounded-2xl px-5 py-4 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all" 
          />
          <button 
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="bg-zinc-900 text-white px-8 rounded-2xl font-medium disabled:opacity-50"
          >
            Add
          </button>
        </div>

        <div className="space-y-4">
          {recipe.notes.map((note) => (
            <div key={note.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative group">
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 mb-3 font-bold uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" /> {new Date(note.timestamp).toLocaleDateString()}
              </div>
              
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea 
                    value={editingNoteText} 
                    onChange={(e) => setEditingNoteText(e.target.value)} 
                    className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 outline-none" 
                    rows={3} 
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEditedNote} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1 font-bold">
                      <Check className="w-4 h-4" /> Save
                    </button>
                    <button onClick={() => setEditingNoteId(null)} className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg text-sm flex items-center gap-1 font-medium">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-800 text-lg leading-relaxed pr-16">{note.text}</p>
                  <div className="absolute top-5 right-4 flex gap-1">
                    <button 
                      onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }}
                      className="p-2.5 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full transition-colors"
                      title="Edit note"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onUpdateRecipe({ ...recipe, notes: recipe.notes.filter(n => n.id !== note.id) })}
                      className="p-2.5 text-zinc-400 hover:text-red-600 bg-red-50 rounded-full transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
