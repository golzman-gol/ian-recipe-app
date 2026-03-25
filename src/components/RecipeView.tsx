import { useState, useMemo } from 'react';
import { Recipe, RecipeNote, Technique } from '../types';
import { ArrowLeft, Play, Plus, Clock, ChefHat, Trash2, Edit3, Image as ImageIcon, AlertTriangle, Video, BookOpen, ThermometerSnowflake, Link, Share, Download, Check, X } from 'lucide-react';
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
    const note: RecipeNote = { id: Date.now().toString(), timestamp: Date.now(), text: newNote.trim() };
    onUpdateRecipe({ ...recipe, notes: [note, ...recipe.notes] });
    setNewNote('');
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateRecipe({ ...recipe, notes: recipe.notes.filter((n) => n.id !== noteId) });
  };

  const handleSaveEditedNote = () => {
    if (!editingNoteId) return;
    const updatedNotes = recipe.notes.map(n => 
      n.id === editingNoteId ? { ...n, text: editingNoteText.trim() } : n
    );
    onUpdateRecipe({ ...recipe, notes: updatedNotes });
    setEditingNoteId(null);
  };

  // YouTube Fix for iPhone & Shorts
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

  // שיתוף כקובץ HTML (משתמש בלוגיקה המקורית שלך לעיצוב הקובץ)
  const handleShareAsHtml = async () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${recipe.name}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #18181b; max-width: 800px; margin: 0 auto; padding: 2rem; background: #fafafa; }
    .container { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    h1 { font-size: 2.5rem; border-bottom: 2px solid #f4f4f5; padding-bottom: 1rem; }
    .info-box { background: #fef2f2; border: 1px solid #fecaca; padding: 1.5rem; border-radius: 1rem; margin-bottom: 2rem; }
    .info-box.blue { background: #eff6ff; border-color: #bfdbfe; }
    li { margin-bottom: 0.75rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${recipe.name}</h1>
    ${recipe.prep_info ? `<div class="info-box"><h3>Prep Info</h3><p>${recipe.prep_info}</p></div>` : ''}
    ${recipe.storage_info ? `<div class="info-box blue"><h3>Storage</h3><p>${recipe.storage_info}</p></div>` : ''}
    <h2>Ingredients</h2>
    <ul>${recipe.ingredients.map(i => `<li><strong>${i.amount} ${i.unit}</strong> ${i.item}</li>`).join('')}</ul>
    <h2>Instructions</h2>
    <ol>${recipe.steps.map(s => `<li>${s}</li>`).join('')}</ol>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const file = new File([blob], `${recipe.name}.html`, { type: 'text/html' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: recipe.name });
      } catch (err) { console.error('Share failed', err); }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recipe.name}.html`;
      a.click();
    }
  };

  if (isCookingMode) return <CookingMode recipe={{ ...recipe, ingredients: scaledIngredients }} onExit={() => setIsCookingMode(false)} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      {/* Delete Modal נשמר מהמקור... */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Delete Recipe?</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 rounded-xl bg-zinc-100">Cancel</button>
              <button onClick={() => { setShowDeleteConfirm(false); onDeleteRecipe(recipe.id); }} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header - הוסר כפתור ה-Download, השיתוף עכשיו שולח HTML */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-zinc-100"><ArrowLeft className="w-7 h-7 text-zinc-900" /></button>
        <div className="flex gap-2">
          <button onClick={handleShareAsHtml} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Share className="w-6 h-6" /></button>
          <button onClick={() => setIsCookingMode(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-full font-medium shadow-sm"><ChefHat className="w-5 h-5" /> Cook Mode</button>
          <button onClick={onEdit} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Edit3 className="w-6 h-6" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 rounded-full text-red-600 hover:bg-red-50"><Trash2 className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Image, Title & Tags נשמרים בדיוק מהמקור שלך */}
      {recipe.image_base64 && (
        <div className="mb-8 rounded-3xl overflow-hidden border border-zinc-200 aspect-video"><img src={recipe.image_base64} className="w-full h-full object-cover" /></div>
      )}

      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{recipe.name}</h1>
      <div className="flex flex-wrap gap-2 mb-8">
        {recipe.tags.map(tag => <button key={tag} onClick={() => onTagClick(tag)} className="px-4 py-1.5 rounded-full bg-zinc-100 text-sm font-medium">{tag}</button>)}
      </div>

      {/* Prep & Storage - PRESERVED */}
      {recipe.prep_info && (
        <div className="mb-10 bg-red-50 border-2 border-red-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> Crucial Prep Info</h2>
          <p className="text-red-900 text-lg leading-relaxed whitespace-pre-wrap font-medium">{recipe.prep_info}</p>
        </div>
      )}

      {recipe.storage_info && (
        <div className="mb-10 bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2"><ThermometerSnowflake className="w-6 h-6" /> Storage & Expiry</h2>
          <p className="text-blue-900 text-lg leading-relaxed whitespace-pre-wrap font-medium">{recipe.storage_info}</p>
        </div>
      )}

      {/* Culinary Notes - PRESERVED */}
      {recipe.culinary_notes && (
        <div className="mb-10 bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-amber-900 mb-3">Culinary Notes</h2>
          <p className="text-amber-800 leading-relaxed whitespace-pre-wrap text-lg">{recipe.culinary_notes}</p>
        </div>
      )}

      {/* Scaling Engine & Ingredients */}
      <div className="bg-white rounded-3xl p-6 mb-10 border border-zinc-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ingredients</h2>
          <div className="flex gap-1 bg-zinc-100 p-1 rounded-full">
            {multipliers.map(m => <button key={m} onClick={() => setMultiplier(m)} className={`px-4 py-2 rounded-full text-base font-medium ${activeMultiplier === m ? 'bg-zinc-900 text-white' : 'text-zinc-600'}`}>{m}x</button>)}
          </div>
        </div>
        <ul className="space-y-4">
          {scaledIngredients.map((ing, idx) => (
            <li key={idx} className="flex items-baseline gap-4 py-3 border-b border-zinc-100 last:border-0">
              <span className="font-mono font-bold text-zinc-900 w-20 text-right">{ing.amount.toFixed(2)}</span>
              <span className="text-zinc-500 w-20">{ing.unit}</span>
              <span className="text-zinc-800 font-medium text-lg">{ing.item}</span>
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
              <p className="text-zinc-800 leading-relaxed text-lg">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Process Images - PRESERVED */}
      {recipe.process_images && recipe.process_images.length > 0 && (
        <div className="mb-12 bg-white rounded-3xl p-6 border border-zinc-200">
          <h2 className="text-2xl font-bold mb-6">Process Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recipe.process_images.map((img, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <div className="aspect-video rounded-2xl overflow-hidden border"><img src={typeof img === 'string' ? img : img.url} className="w-full h-full object-cover" /></div>
                {typeof img !== 'string' && img.caption && <p className="text-zinc-600 font-medium text-sm">{img.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* References - FIXED FOR IOS & SHORTS */}
      {recipe.reference_videos && recipe.reference_videos.length > 0 && (
        <div className="border-t border-zinc-200 pt-10 mb-10 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2"><Video className="w-6 h-6" /> References</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recipe.reference_videos.map((video, idx) => {
              const yt = getYoutubeData(video.url);
              return (
                <div key={idx} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  {yt ? <div className="aspect-video w-full"><iframe width="100%" height="100%" src={yt.embed} frameBorder="0" allowFullScreen></iframe></div> : <div className="aspect-video w-full bg-zinc-100 flex items-center justify-center"><Link className="text-zinc-400" /></div>}
                  <div className="p-3 bg-zinc-50 flex-1">
                    {yt && <a href={yt.direct} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-1.5 rounded block text-center mb-2 uppercase">Open in YouTube</a>}
                    <p className="text-xs text-zinc-600 line-clamp-2">{video.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes - EDITABLE & MOBILE FRIENDLY */}
      <div className="border-t border-zinc-200 pt-10">
        <h2 className="text-2xl font-bold mb-6">Notes</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} placeholder="Add a new observation..." className="flex-1 border border-zinc-200 rounded-2xl px-5 py-4 bg-zinc-50" />
          <button onClick={handleAddNote} className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-medium">Add Note</button>
        </div>
        <div className="space-y-4">
          {recipe.notes.map((note) => (
            <div key={note.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative">
              <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3 font-bold uppercase tracking-wider"><Clock className="w-4 h-4" /> {new Date(note.timestamp).toLocaleDateString()}</div>
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea value={editingNoteText} onChange={(e) => setEditingNoteText(e.target.value)} className="w-full border rounded-xl p-3 bg-zinc-50 outline-none" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEditedNote} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-bold"><Check className="w-4 h-4" /> Save</button>
                    <button onClick={() => setEditingNoteId(null)} className="bg-zinc-100 px-4 py-2 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-800 leading-relaxed text-lg pr-20">{note.text}</p>
                  <div className="absolute top-5 right-5 flex gap-1">
                    <button onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }} className="p-2.5 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full transition-all"><Edit3 className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteNote(note.id)} className="p-2.5 text-zinc-400 hover:text-red-600 bg-red-50 rounded-full transition-all"><Trash2 className="w-5 h-5" /></button>
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
