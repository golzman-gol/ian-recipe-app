import { useState, useMemo } from 'react';
import { Recipe, RecipeNote, Technique } from '../types';
import { ArrowLeft, Play, Plus, Clock, ChefHat, Trash2, Edit3, Image as ImageIcon, AlertTriangle, Video, BookOpen, ThermometerSnowflake, Link, Share, Download, Check, X as CloseIcon } from 'lucide-react';
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
  
  // States for Note Editing
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

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

  const handleStartEditNote = (note: RecipeNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  };

  const handleSaveEditedNote = () => {
    if (!editingNoteId) return;
    const updatedNotes = recipe.notes.map(n => 
      n.id === editingNoteId ? { ...n, text: editingNoteText.trim() } : n
    );
    onUpdateRecipe({ ...recipe, notes: updatedNotes });
    setEditingNoteId(null);
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateRecipe({
      ...recipe,
      notes: recipe.notes.filter((n) => n.id !== noteId),
    });
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.name,
          text: `Check out this recipe for ${recipe.name}!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${recipe.name}</title><style>body{font-family:system-ui,sans-serif;line-height:1.6;color:#18181b;max-width:800px;margin:0 auto;padding:2rem;background:#fafafa}.container{background:white;padding:2.5rem;border-radius:1.5rem;shadow:0 4px 6px -1px rgb(0 0 0/0.1)}h1{font-size:2.5rem;margin-bottom:1rem}.hero-image{width:100%;max-height:400px;object-fit:cover;border-radius:1rem;margin-bottom:2rem}.tag{background:#f4f4f5;padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.875rem;margin-right:0.5rem}.info-box{background:#fef2f2;border:1px solid #fecaca;padding:1.5rem;border-radius:1rem;margin-bottom:2rem}</style></head><body><div class="container">${recipe.image_base64?`<img src="${recipe.image_base64}" class="hero-image">`:''}<h1>${recipe.name}</h1><div class="meta">${recipe.tags?.map(t=>`<span class="tag">${t}</span>`).join('')||''}</div>${recipe.prep_info?`<div class="info-box"><h3>Crucial Prep Info</h3><p>${recipe.prep_info}</p></div>`:''}<h2>Ingredients</h2><ul>${recipe.ingredients.map(i=>`<li><strong>${i.amount} ${i.unit}</strong> ${i.item}</li>`).join('')}</ul><h2>Instructions</h2><ol>${recipe.steps.map(s=>`<li>${s}</li>`).join('')}</ol></div></body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
    a.click();
  };

  if (isCookingMode) return <CookingMode recipe={{ ...recipe, ingredients: scaledIngredients }} onExit={() => setIsCookingMode(false)} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2">Delete Recipe?</h3>
            <p className="text-zinc-600 mb-6">Are you sure you want to delete "{recipe.name}"?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 font-medium">Cancel</button>
              <button onClick={() => onDeleteRecipe(recipe.id)} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="w-7 h-7 text-zinc-900" />
        </button>
        <div className="flex gap-2">
          <button onClick={handleShare} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Share className="w-6 h-6" /></button>
          <button onClick={handleDownloadHtml} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Download className="w-6 h-6" /></button>
          <button onClick={() => setIsCookingMode(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-full font-medium shadow-sm"><ChefHat className="w-5 h-5" /> Cook</button>
          <button onClick={onEdit} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Edit3 className="w-6 h-6" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 rounded-full text-red-600 hover:bg-red-50"><Trash2 className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Content */}
      {recipe.image_base64 && <div className="mb-8 rounded-3xl overflow-hidden aspect-video border border-zinc-200"><img src={recipe.image_base64} className="w-full h-full object-cover" /></div>}
      <h1 className="text-4xl font-bold mb-4">{recipe.name}</h1>
      
      {/* Scaling */}
      <div className="bg-white rounded-3xl p-6 mb-10 border border-zinc-200">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Ingredients</h2>
          <div className="flex gap-2">
            {multipliers.map(m => (
              <button key={m} onClick={() => {setMultiplier(m); setCustomMultiplier('')}} className={`px-4 py-2 rounded-full font-medium ${multiplier === m && !customMultiplier ? 'bg-zinc-900 text-white' : 'bg-zinc-100'}`}>{m}x</button>
            ))}
          </div>
        </div>
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
      <div className="mb-12 bg-white rounded-3xl p-6 border border-zinc-200">
        <h2 className="text-2xl font-bold mb-8">Instructions</h2>
        <div className="space-y-8">
          {recipe.steps.map((step, idx) => (
            <div key={idx} className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold">{idx + 1}</div>
              <p className="text-zinc-800 text-lg leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* References - FIXED FOR IOS */}
      {recipe.reference_videos && recipe.reference_videos.length > 0 && (
        <div className="border-t pt-10 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Link className="w-6 h-6" /> References</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recipe.reference_videos.map((video, idx) => {
              const ytData = getYoutubeData(video.url);
              return (
                <div key={idx} className="bg-white border rounded-2xl overflow-hidden flex flex-col shadow-sm">
                  {ytData ? (
                    <div className="aspect-video">
                      <iframe width="100%" height="100%" src={ytData.embed} frameBorder="0" allowFullScreen></iframe>
                    </div>
                  ) : (
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="aspect-video bg-zinc-100 flex items-center justify-center"><Link className="text-zinc-400" /></a>
                  )}
                  <div className="p-3 bg-zinc-50 flex-1">
                    {/* Universal link for iOS */}
                    <a href={ytData?.direct || video.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-zinc-900 block mb-1 hover:underline">OPEN IN YOUTUBE</a>
                    <p className="text-xs text-zinc-600 line-clamp-2">{video.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes - WITH EDITING AND MOBILE FIX */}
      <div className="border-t pt-10">
        <h2 className="text-2xl font-bold mb-6">Notes</h2>
        <div className="flex gap-3 mb-8">
          <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote()} placeholder="Add a note..." className="flex-1 border rounded-2xl px-5 py-4 bg-zinc-50" />
          <button onClick={handleAddNote} disabled={!newNote.trim()} className="bg-zinc-900 text-white px-8 rounded-2xl font-medium">Add</button>
        </div>

        <div className="space-y-4">
          {recipe.notes.map((note) => (
            <div key={note.id} className="bg-white border rounded-3xl p-6 shadow-sm relative group">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3 font-bold uppercase">
                <Clock className="w-4 h-4" /> {new Date(note.timestamp).toLocaleDateString()}
              </div>
              
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea value={editingNoteText} onChange={(e) => setEditingNoteText(e.target.value)} className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-zinc-900 outline-none" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEditedNote} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Save</button>
                    <button onClick={() => setEditingNoteId(null)} className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg text-sm flex items-center gap-1"><CloseIcon className="w-4 h-4" /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-800 text-lg pr-12">{note.text}</p>
                  <div className="absolute top-5 right-5 flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleStartEditNote(note)} className="p-2 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full" aria-label="Edit note"><Edit3 className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteNote(note.id)} className="p-2 text-zinc-400 hover:text-red-600 bg-red-50 rounded-full" aria-label="Delete note"><Trash2 className="w-5 h-5" /></button>
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
