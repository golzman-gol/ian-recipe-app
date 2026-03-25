import { useState, useMemo } from 'react';
import { Recipe, RecipeNote, Technique } from '../types';
import { ArrowLeft, Play, Plus, Clock, ChefHat, Trash2, Pencil, Image as ImageIcon, AlertTriangle, Video, BookOpen, ThermometerSnowflake, Link, Share, Download, Check, X, ExternalLink } from 'lucide-react';
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
  
  // States for Note Editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const activeMultiplier = customMultiplier ? parseFloat(customMultiplier) || 1 : multiplier;

  const scaledIngredients = useMemo(() => {
    return recipe.ingredients.map((ing) => ({
      ...ing,
      amount: ing.amount * activeMultiplier,
    }));
  }, [recipe.ingredients, activeMultiplier]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: RecipeNote = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      text: newNote.trim(),
    };
    onUpdateRecipe({
      ...recipe,
      notes: [note, ...recipe.notes],
    });
    setNewNote('');
  };

  const handleSaveNote = () => {
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

  if (isCookingMode) {
    return (
      <CookingMode
        recipe={{
          ...recipe,
          ingredients: scaledIngredients,
        }}
        onExit={() => setIsCookingMode(false)}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-all">
          <ArrowLeft className="w-7 h-7 text-zinc-900" />
        </button>
        <div className="flex gap-2">
          <button onClick={() => setIsCookingMode(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full font-medium shadow-sm hover:bg-zinc-800 transition-all active:scale-95">
            <ChefHat className="w-5 h-5" /> Cook Mode
          </button>
          <button onClick={onEdit} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100 transition-all">
            <Edit3 className="w-6 h-6" />
          </button>
          <button onClick={() => onDeleteRecipe(recipe.id)} className="p-3 rounded-full text-red-600 hover:bg-red-50 transition-all">
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{recipe.name}</h1>

      {/* Tags, Prep, Storage Sections remain unchanged as in original */}
      <div className="flex flex-wrap gap-2 mb-8">
        {recipe.tags.map((tag) => (
          <button key={tag} onClick={() => onTagClick(tag)} className="px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 transition-colors">
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {recipe.prep_info && (
          <div className="bg-orange-50 rounded-2xl p-4 flex items-start gap-3 border border-orange-100">
            <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Prep & Timing</span>
              <p className="text-orange-900 text-sm leading-relaxed">{recipe.prep_info}</p>
            </div>
          </div>
        )}
        {recipe.storage_info && (
          <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-3 border border-blue-100">
            <ThermometerSnowflake className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Storage</span>
              <p className="text-blue-900 text-sm leading-relaxed">{recipe.storage_info}</p>
            </div>
          </div>
        )}
      </div>

      {/* Scaling & Ingredients */}
      <div className="bg-white rounded-3xl p-6 mb-8 border border-zinc-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900">Ingredients</h2>
          <div className="flex gap-1 bg-zinc-100 p-1 rounded-full">
            {[0.5, 1, 2, 3].map((m) => (
              <button key={m} onClick={() => { setMultiplier(m); setCustomMultiplier(''); }} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeMultiplier === m ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>
                {m}x
              </button>
            ))}
          </div>
        </div>
        <ul className="space-y-4">
          {scaledIngredients.map((ing, idx) => (
            <li key={idx} className="flex items-baseline gap-4 py-3 border-b border-zinc-50 last:border-0">
              <span className="font-mono font-bold w-16 text-right text-zinc-900">{ing.amount.toFixed(ing.amount % 1 === 0 ? 0 : 2)}</span>
              <span className="text-zinc-500 w-16 text-sm uppercase">{ing.unit}</span>
              <span className="font-medium flex-1 text-zinc-800">{ing.item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Culinary Notes Section - PRESERVED */}
      {recipe.culinary_notes && (
        <div className="bg-zinc-900 text-zinc-100 rounded-3xl p-8 mb-8 shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-400">
            <AlertTriangle className="w-5 h-5" /> Culinary Science & Notes
          </h2>
          <p className="text-lg leading-relaxed text-zinc-300 italic">{recipe.culinary_notes}</p>
        </div>
      )}

      {/* YouTube References - FIXED FOR IOS */}
      {recipe.reference_videos && recipe.reference_videos.length > 0 && (
        <div className="border-t border-zinc-100 pt-10 mb-10">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Video className="w-6 h-6" /> References
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
                    <a href={yt?.direct || video.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-1.5 rounded block text-center mb-2 hover:bg-zinc-100 transition-colors uppercase">
                      צפייה ביוטיוב
                    </a>
                    <p className="text-xs text-zinc-600 line-clamp-2">{video.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes Section - WITH EDITING & MOBILE VISIBILITY */}
      <div className="border-t border-zinc-100 pt-10">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6">Lab Notes</h2>
        <div className="flex gap-3 mb-8">
          <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote()} placeholder="Add a new observation..." className="flex-1 border border-zinc-200 rounded-2xl px-5 py-4 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 transition-all" />
          <button onClick={handleAddNote} className="bg-zinc-900 text-white px-8 rounded-2xl font-medium">Add</button>
        </div>
        <div className="space-y-4">
          {recipe.notes.map((note) => (
            <div key={note.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative group">
              <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3 font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" /> {new Date(note.timestamp).toLocaleDateString()}
              </div>
              
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea value={editingNoteText} onChange={(e) => setEditingNoteText(e.target.value)} className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 outline-none" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={handleSaveNote} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1 font-bold">
                      <Check className="w-4 h-4" /> Save
                    </button>
                    <button onClick={() => setEditingNoteId(null)} className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg text-sm font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-800 leading-relaxed text-lg pr-20">{note.text}</p>
                  <div className="absolute top-5 right-5 flex gap-1">
                    <button onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }} className="p-2 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full transition-all">
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => onUpdateRecipe({ ...recipe, notes: recipe.notes.filter(n => n.id !== note.id) })} className="p-2 text-zinc-400 hover:text-red-600 bg-red-50 rounded-full transition-all">
                      <Trash2 className="w-5 h-5" />
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
