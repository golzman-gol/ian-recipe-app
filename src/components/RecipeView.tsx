import { useState, useMemo } from 'react';
import { Recipe, RecipeNote, Technique } from '../types';
import { ArrowLeft, Play, Plus, Clock, ChefHat, Trash2, Edit3, Image as ImageIcon, AlertTriangle, Video, BookOpen, ThermometerSnowflake, Link, Share, Check, X } from 'lucide-react';
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
  
  // States for Editing Notes
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

  const handleDeleteNote = (noteId: string) => {
    onUpdateRecipe({
      ...recipe,
      notes: recipe.notes.filter((n) => n.id !== noteId),
    });
  };

  const handleSaveEditedNote = () => {
    if (!editingNoteId) return;
    const updatedNotes = recipe.notes.map(n => 
      n.id === editingNoteId ? { ...n, text: editingNoteText.trim() } : n
    );
    onUpdateRecipe({ ...recipe, notes: updatedNotes });
    setEditingNoteId(null);
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
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

  if (isCookingMode) {
    return (
      <CookingMode
        recipe={{ ...recipe, ingredients: scaledIngredients }}
        onExit={() => setIsCookingMode(false)}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2">Delete Recipe?</h3>
            <p className="text-zinc-600 mb-6">Are you sure you want to delete "{recipe.name}"? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 text-zinc-700 font-medium hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteRecipe(recipe.id);
                }} 
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button
          onClick={onBack}
          className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-7 h-7 text-zinc-900" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors"
            aria-label="Share Recipe"
          >
            <Share className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsCookingMode(true)}
            className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-full hover:bg-zinc-800 transition-colors font-medium text-base shadow-sm active:scale-[0.98]"
          >
            <ChefHat className="w-5 h-5" />
            Cook Mode
          </button>
          <button
            onClick={onEdit}
            className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors"
            aria-label="Edit Recipe"
          >
            <Edit3 className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-3 rounded-full text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Delete Recipe"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Image */}
      {recipe.image_base64 && (
        <div className="mb-8 rounded-3xl overflow-hidden shadow-sm border border-zinc-200 aspect-video sticky top-4 z-10 max-h-[40vh]">
          <img src={recipe.image_base64} alt={recipe.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Title & Tags */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{recipe.name}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
        
        {/* Linked Techniques */}
        {recipe.linkedTechniques && recipe.linkedTechniques.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <BookOpen className="w-5 h-5 text-zinc-400" />
            {recipe.linkedTechniques.map(id => {
              const tech = techniques.find(t => t.id === id);
              if (!tech) return null;
              return (
                <button
                  key={id}
                  onClick={() => onSelectTechnique(id)}
                  className="bg-zinc-100 border border-zinc-200 text-sm font-medium text-zinc-700 rounded-xl px-3 py-1.5 hover:bg-zinc-200 transition-colors"
                >
                  {tech.title}
                </button>
              );
            })}
          </div>
        )}

        {/* Linked Recipes */}
        {recipe.linkedRecipes && recipe.linkedRecipes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Link className="w-5 h-5 text-zinc-400" />
            {recipe.linkedRecipes.map(id => {
              const linkedRecipe = recipes.find(r => r.id === id);
              if (!linkedRecipe) return null;
              return (
                <button
                  key={id}
                  onClick={() => onSelectRecipe(id)}
                  className="bg-zinc-100 border border-zinc-200 text-sm font-medium text-zinc-700 rounded-xl px-3 py-1.5 hover:bg-zinc-200 transition-colors"
                >
                  {linkedRecipe.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Crucial Prep Info */}
      {recipe.prep_info && (
        <div className="mb-10 bg-red-50 border-2 border-red-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Crucial Prep Info
          </h2>
          <p className="text-red-900 text-lg leading-relaxed whitespace-pre-wrap font-medium">
            {recipe.prep_info}
          </p>
        </div>
      )}

      {/* Storage & Expiry */}
      {recipe.storage_info && (
        <div className="mb-10 bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
            <ThermometerSnowflake className="w-6 h-6" />
            Storage & Expiry
          </h2>
          <p className="text-blue-900 text-lg leading-relaxed whitespace-pre-wrap font-medium">
            {recipe.storage_info}
          </p>
        </div>
      )}

      {/* Culinary Notes */}
      {recipe.culinary_notes && (
        <div className="mb-10 bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-amber-900 mb-3">Culinary Notes</h2>
          <p className="text-amber-800 leading-relaxed whitespace-pre-wrap text-lg">
            {recipe.culinary_notes}
          </p>
        </div>
      )}

      {/* Scaling Engine */}
      <div className="bg-white rounded-3xl p-6 mb-10 border border-zinc-200 shadow-sm break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-zinc-900">Ingredients</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-100 rounded-full p-1 border border-zinc-200 shadow-sm">
              {multipliers.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMultiplier(m);
                    setCustomMultiplier('');
                  }}
                  className={`px-4 py-2 rounded-full text-base font-medium transition-colors ${
                    multiplier === m && !customMultiplier
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.1"
              placeholder="Custom x"
              value={customMultiplier}
              onChange={(e) => setCustomMultiplier(e.target.value)}
              className="w-28 px-4 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 shadow-sm"
            />
          </div>
        </div>
        <p className="text-base text-zinc-500 mb-6 font-medium">
          Makes {recipe.servings_base * activeMultiplier} servings
        </p>

        <ul className="space-y-4">
          {scaledIngredients.map((ing, idx) => (
            <li key={idx} className="flex items-baseline gap-4 py-3 border-b border-zinc-100 last:border-0">
              <span className="font-mono font-bold text-zinc-900 w-20 text-right text-lg">
                {Number.isInteger(ing.amount) ? ing.amount : ing.amount.toFixed(2)}
              </span>
              <span className="text-zinc-500 w-20 text-base font-medium">{ing.unit}</span>
              <span className="text-zinc-800 font-medium text-lg">{ing.item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="mb-12 bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm break-inside-avoid">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-8">Instructions</h2>
        <div className="space-y-8">
          {recipe.steps.map((step, idx) => (
            <div key={idx} className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold text-lg shadow-sm border border-zinc-200">
                {idx + 1}
              </div>
              <p className="text-zinc-800 leading-relaxed pt-1 text-lg">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Process Images */}
      {recipe.process_images && recipe.process_images.length > 0 && (
        <div className="mb-12 bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-6">Process Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recipe.process_images.map((img, idx) => {
              const url = typeof img === 'string' ? img : img.url;
              const caption = typeof img === 'string' ? '' : img.caption || '';
              return (
                <div key={idx} className="flex flex-col gap-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
                    <img src={url} alt={`Process step ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                  {caption && (
                    <p className="text-zinc-600 font-medium text-sm px-1">{caption}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* References */}
      {recipe.reference_videos && recipe.reference_videos.length > 0 && (
        <div className="border-t border-zinc-200 pt-10 mb-10 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Link className="w-6 h-6" />
            References
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipe.reference_videos.map((video, idx) => {
              const embedUrl = getYoutubeEmbedUrl(video.url);
              return (
                <div key={idx} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  {embedUrl ? (
                    <div className="aspect-video w-full">
                      <iframe
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="aspect-video w-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                      <Link className="w-6 h-6 text-zinc-400" />
                    </a>
                  )}
                  {video.note && (
                    <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex-1">
                      <p className="text-zinc-700 font-medium text-xs line-clamp-2">{video.note}</p>
                      {video.channelName && (
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-1 truncate">
                          {video.channelName}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="border-t border-zinc-200 pt-10">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-6">Notes</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            placeholder="E.g., Used 20% more hydration today..."
            className="flex-1 border border-zinc-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-zinc-50 shadow-sm text-lg"
          />
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="bg-zinc-900 text-white px-8 py-4 rounded-2xl hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm active:scale-[0.98] text-lg"
          >
            Add Note
          </button>
        </div>

        <div className="space-y-4">
          {recipe.notes.length === 0 ? (
            <p className="text-zinc-500 text-center py-10 bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed text-lg">
              No notes yet. Start experimenting!
            </p>
          ) : (
            recipe.notes.map((note) => (
              <div key={note.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative group">
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3 font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  {new Date(note.timestamp).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                
                {editingNoteId === note.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingNoteText}
                      onChange={(e) => setEditingNoteText(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl p-3 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 outline-none text-lg"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSaveEditedNote}
                        className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1 font-bold"
                      >
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button 
                        onClick={() => setEditingNoteId(null)}
                        className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-zinc-800 leading-relaxed text-lg pr-20">{note.text}</p>
                    <div className="absolute top-5 right-5 flex gap-1">
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setEditingNoteText(note.text);
                        }}
                        className="p-2 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full transition-all"
                        aria-label="Edit note"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 bg-red-50 rounded-full transition-all"
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
