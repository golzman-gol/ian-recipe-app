import { useState, useMemo, useRef } from 'react';
import { Recipe, RecipeNote, Technique, ReferenceLink } from '../types';
import { ArrowLeft, Plus, Clock, ChefHat, Trash2, Edit3, Image as ImageIcon, AlertTriangle, Link, Share, Download, Check, X as CloseIcon, Save, Loader2 } from 'lucide-react';
import { CookingMode } from './CookingMode';

// --- רכיב הצפייה במתכון (RecipeView) עם התיקונים לאייפון ---
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

  const handleStartEditNote = (note: RecipeNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  };

  const handleSaveEditedNote = () => {
    if (!editingNoteId) return;
    const updatedNotes = recipe.notes.map(n => n.id === editingNoteId ? { ...n, text: editingNoteText.trim() } : n);
    onUpdateRecipe({ ...recipe, notes: updatedNotes });
    setEditingNoteId(null);
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateRecipe({ ...recipe, notes: recipe.notes.filter((n) => n.id !== noteId) });
  };

  const getYoutubeData = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    if (!id) return null;
    return { embed: `https://www.youtube.com/embed/${id}`, direct: `https://www.youtube.com/watch?v=${id}` };
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${recipe.name}</title><style>body{font-family:sans-serif;padding:2rem}h1{color:#18181b}.hero-image{width:100%;border-radius:1rem}</style></head><body>${recipe.image_base64?`<img src="${recipe.image_base64}" class="hero-image">`:''}<h1>${recipe.name}</h1><ul>${recipe.ingredients.map(i=>`<li>${i.amount} ${i.unit} ${i.item}</li>`).join('')}</ul></body></html>`;
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-zinc-100"><ArrowLeft className="w-7 h-7" /></button>
        <div className="flex gap-2">
          <button onClick={handleDownloadHtml} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Download className="w-6 h-6" /></button>
          <button onClick={() => setIsCookingMode(true)} className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-full font-medium shadow-sm"><ChefHat className="w-5 h-5" /> Cook</button>
          <button onClick={onEdit} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Edit3 className="w-6 h-6" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 rounded-full text-red-600 hover:bg-red-50"><Trash2 className="w-6 h-6" /></button>
        </div>
      </div>

      {recipe.image_base64 && <div className="mb-8 rounded-3xl overflow-hidden aspect-video border"><img src={recipe.image_base64} className="w-full h-full object-cover" /></div>}
      <h1 className="text-4xl font-bold mb-4">{recipe.name}</h1>
      
      {/* Ingredients */}
      <div className="bg-white rounded-3xl p-6 mb-10 border border-zinc-200 shadow-sm">
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

      {/* References FIXED FOR IOS */}
      {recipe.reference_videos && recipe.reference_videos.length > 0 && (
        <div className="border-t pt-10 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Link /> References</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recipe.reference_videos.map((video, idx) => {
              const ytData = getYoutubeData(video.url);
              return (
                <div key={idx} className="bg-white border rounded-2xl overflow-hidden flex flex-col shadow-sm">
                  {ytData ? (
                    <div className="aspect-video"><iframe width="100%" height="100%" src={ytData.embed} frameBorder="0" allowFullScreen></iframe></div>
                  ) : (
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="aspect-video bg-zinc-100 flex items-center justify-center"><Link className="text-zinc-400" /></a>
                  )}
                  <div className="p-3 bg-zinc-50 flex-1">
                    <a href={ytData?.direct || video.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-zinc-900 block mb-1 hover:underline">OPEN IN YOUTUBE</a>
                    <p className="text-xs text-zinc-600 line-clamp-2">{video.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes WITH EDITING */}
      <div className="border-t pt-10">
        <h2 className="text-2xl font-bold mb-6">Notes</h2>
        <div className="flex gap-3 mb-8">
          <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote()} placeholder="Add a note..." className="flex-1 border rounded-2xl px-5 py-4 bg-zinc-50" />
          <button onClick={handleAddNote} disabled={!newNote.trim()} className="bg-zinc-900 text-white px-8 rounded-2xl font-medium">Add</button>
        </div>
        <div className="space-y-4">
          {recipe.notes.map((note) => (
            <div key={note.id} className="bg-white border rounded-3xl p-6 shadow-sm relative group">
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea value={editingNoteText} onChange={(e) => setEditingNoteText(e.target.value)} className="w-full border rounded-xl p-3" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEditedNote} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Save</button>
                    <button onClick={() => setEditingNoteId(null)} className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg text-sm flex items-center gap-1"><CloseIcon className="w-4 h-4" /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-800 text-lg pr-12">{note.text}</p>
                  <div className="absolute top-5 right-5 flex gap-1">
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

// --- רכיב עריכת הטכניקה (TechniqueEditor) - חייב להישאר בקובץ! ---
interface TechniqueEditorProps {
  initialTechnique?: Technique;
  allTags?: string[];
  onSave: (technique: Technique) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function TechniqueEditor({ initialTechnique, allTags = [], onSave, onCancel, onDelete }: TechniqueEditorProps) {
  const [title, setTitle] = useState(initialTechnique?.title || '');
  const [overview, setOverview] = useState(initialTechnique?.overview || '');
  const [content, setContent] = useState(initialTechnique?.content || '');
  const [tags, setTags] = useState<string[]>(initialTechnique?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | undefined>(initialTechnique?.image_base64);
  const [referenceVideos, setReferenceVideos] = useState<ReferenceLink[]>(initialTechnique?.reference_videos || []);
  const [fetchingVideoIdx, setFetchingVideoIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addReferenceVideo = () => setReferenceVideos([...referenceVideos, { url: '', note: '' }]);

  const updateReferenceVideo = async (index: number, field: keyof ReferenceLink, value: string) => {
    const newVideos = [...referenceVideos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setReferenceVideos(newVideos);
    if (field === 'url' && (value.includes('youtube.com') || value.includes('youtu.be') || value.includes('shorts/'))) {
      setFetchingVideoIdx(index);
      try {
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (data && !data.error) {
          const updatedVideos = [...newVideos];
          updatedVideos[index] = { ...updatedVideos[index], thumbnailUrl: data.thumbnail_url, channelName: data.author_name, note: updatedVideos[index].note || data.title || '' };
          setReferenceVideos(updatedVideos);
        }
      } finally { setFetchingVideoIdx(null); }
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ id: initialTechnique?.id || Date.now().toString(), title: title.trim(), overview: overview.trim(), content: content.trim(), tags, image_base64: imageBase64, reference_videos: referenceVideos });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 -ml-3 rounded-full hover:bg-zinc-100"><ArrowLeft className="w-7 h-7 text-zinc-900" /></button>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Edit Technique</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={!title.trim()} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"><Save className="w-5 h-5" /> Save</button>
        </div>
      </div>
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-2xl font-bold border-b-2 border-zinc-200 focus:border-zinc-900 py-2 outline-none bg-transparent" placeholder="e.g., Cold Fermentation" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Guide Content (Markdown)</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full border rounded-xl px-4 py-3 min-h-[400px] font-mono text-sm leading-relaxed" placeholder="# Technique Details..." />
        </div>
      </div>
    </div>
  );
}
