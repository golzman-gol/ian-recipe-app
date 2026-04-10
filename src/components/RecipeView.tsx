import { useState, useMemo, useEffect } from 'react';
import { Recipe, RecipeNote, Technique, LinkedTechnique, Ingredient } from '../types';
import { ArrowLeft, Play, Plus, Clock, ChefHat, Trash2, Edit3, Image as ImageIcon, AlertTriangle, Video, BookOpen, ThermometerSnowflake, Link, Download, Check, X, FileText, Users, Layout, ArrowUp, Calculator, List } from 'lucide-react';
import { CookingMode } from './CookingMode';

interface RecipeViewProps {
  recipe: Recipe;
  recipes: Recipe[];
  techniques: Technique[];
  onBack: () => void;
  onUpdateRecipe: (updated: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onEdit: () => void;
  onSelectTechnique: (id: string, sectionId?: string) => void; 
  onSelectRecipe: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export function RecipeView({ recipe, recipes, techniques, onBack, onUpdateRecipe, onDeleteRecipe, onEdit, onSelectTechnique, onSelectRecipe, onTagClick }: RecipeViewProps) {
  const [multiplier, setMultiplier] = useState<number>(1);
  const [customMultiplier, setCustomMultiplier] = useState<string>('');
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSummary, setShowSummary] = useState(false); // מצב סכימה
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [recipe.id]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 1500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const multipliers = [0.5, 1, 2, 3];
  const activeMultiplier = customMultiplier ? parseFloat(customMultiplier) || 1 : multiplier;

  const scaledIngredients = useMemo(() => {
    return (recipe.ingredients || []).map((ing) => ({
      ...ing,
      amount: ing.amount * activeMultiplier,
    }));
  }, [recipe.ingredients, activeMultiplier]);

  // לוגיקת חלוקה לקבוצות
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, typeof scaledIngredients> = {};
    scaledIngredients.forEach(ing => {
      const g = ing.group?.trim() || 'כללי';
      if (!groups[g]) groups[g] = [];
      groups[g].push(ing);
    });
    return groups;
  }, [scaledIngredients]);

  // לוגיקת סכימה (Aggregation) - משופרת למניעת כפילויות
  const aggregatedIngredients = useMemo(() => {
    const summary: Record<string, { amount: number, unit: string, item: string }> = {};
    scaledIngredients.forEach(ing => {
      const normalizedItem = ing.item.trim().toLowerCase();
      const normalizedUnit = ing.unit.trim().toLowerCase();
      const key = `${normalizedItem}|${normalizedUnit}`;
      if (!summary[key]) {
        summary[key] = { amount: 0, unit: ing.unit, item: ing.item };
      }
      summary[key].amount += ing.amount;
    });
    return Object.values(summary).sort((a, b) => a.item.localeCompare(b.item));
  }, [scaledIngredients]);

  // פונקציית הזרקת כמויות - ללא הדגשה, באותו פונט של הטקסט
  const parseInstructions = (text: string) => {
    if (!text) return '';
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const content = part.slice(2, -2).trim();
        let targetItem: string;
        let targetGroup: string | null = null;

        if (content.includes(':')) {
          const splitContent = content.split(':');
          targetGroup = splitContent[0].trim().toLowerCase();
          targetItem = splitContent[1].trim().toLowerCase();
        } else {
          targetItem = content.toLowerCase();
        }

        const ing = scaledIngredients.find(si => {
          const nameMatch = si.item.toLowerCase().trim() === targetItem;
          const groupMatch = targetGroup 
            ? (si.group?.toLowerCase().trim() === targetGroup)
            : true;
          return nameMatch && groupMatch;
        });

        if (ing) {
          const formattedAmount = ing.amount.toFixed(ing.amount % 1 === 0 ? 0 : 2);
          return (
            <span key={i} className="text-zinc-800 text-lg mx-0.5">
              {formattedAmount} {ing.unit} {ing.item}
            </span>
          );
        }
        return part;
      }
      return part;
    });
  };

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

  const handlePrintPdf = () => window.print();

  const yieldLabel = recipe.yield_type === 'pan' ? 'גודל תבנית' : 'כמות';
  
  const displayYield = useMemo(() => {
    if (!recipe.servings_base) return '';
    const val = String(recipe.servings_base);
    const num = parseFloat(val);
    if (!isNaN(num) && /^\d*\.?\d+$/.test(val) && activeMultiplier !== 1) {
      return (num * activeMultiplier).toString();
    }
    return val;
  }, [recipe.servings_base, activeMultiplier]);

  const handleExportHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${recipe.name}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #18181b; max-width: 800px; margin: 0 auto; padding: 2rem; background: #fafafa; text-align: right; }
    .container { background: white; padding: 2.5rem; border-radius: 1.5rem; border: 1px solid #e4e4e7; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; border-bottom: 2px solid #f4f4f5; padding-bottom: 10px; }
    .group-title { font-weight: bold; margin-top: 15px; border-bottom: 2px solid #a1a1aa; display: inline-block; padding-bottom: 2px; }
    ul { list-style: none; padding: 0; }
    li { border-bottom: 1px solid #f1f1f1; padding: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${recipe.name}</h1>
    <h2>מרכיבים</h2>
    ${Object.entries(groupedIngredients).map(([group, ings]) => `
      <div class="group-title">${group}</div>
      <ul>${ings.map(i => `<li><strong>${i.amount.toFixed(2)} ${i.unit}</strong> ${i.item}</li>`).join('')}</ul>
    `).join('')}
    <h2>הוראות הכנה</h2>
    <ol>${recipe.steps.map(s => `<li>${s}</li>`).join('')}</ol>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name.replace(/\s+/g, '_')}_מתכון.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isCookingMode) return <CookingMode recipe={{ ...recipe, ingredients: scaledIngredients }} onExit={() => setIsCookingMode(false)} />;

  const displayImage = recipe.image_base_base64 || recipe.image_base64;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32 rtl text-right" dir="rtl">
      
      {/* כפתורי ניווט צפים */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-50 print:hidden">
        <button 
          onClick={onBack}
          className="p-4 bg-white/80 backdrop-blur-md border border-zinc-200 text-zinc-900 rounded-full shadow-lg hover:bg-white transition-all active:scale-90 group"
          title="חזרה לתפריט"
        >
          <ArrowLeft className="w-6 h-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
        </button>

        {showScrollTop && (
          <button 
            onClick={scrollToTop}
            className="p-4 bg-zinc-900/90 backdrop-blur-md text-white rounded-full shadow-lg hover:bg-zinc-900 transition-all animate-in fade-in zoom-in duration-300 active:scale-90"
            title="חזרה למעלה"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2">למחוק מתכון?</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 text-zinc-700 font-medium">ביטול</button>
              <button onClick={() => { setShowDeleteConfirm(false); onDeleteRecipe(recipe.id); }} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium">מחיקה</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={onBack} className="p-2 sm:p-3 -ml-2 sm:-ml-3 rounded-full hover:bg-zinc-100 transition-colors" title="חזרה">
            <ArrowLeft className="w-6 h-6 sm:w-7 h-7 text-zinc-900 rotate-180" />
          </button>
          
          <div className="flex items-center gap-0.5 sm:gap-1 border-r border-zinc-200 pr-1 sm:pr-2">
            <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors" title="מחיקה"><Trash2 className="w-5 h-5 sm:w-6 h-6" /></button>
            <button onClick={onEdit} className="p-2 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors" title="עריכה"><Edit3 className="w-5 h-5 sm:w-6 h-6" /></button>
            <button onClick={handlePrintPdf} className="p-2 rounded-full text-zinc-600 hover:bg-zinc-100" title="PDF / הדפסה"><FileText className="w-5 h-5 sm:w-6 h-6" /></button>
            <button onClick={handleExportHtml} className="p-2 rounded-full text-zinc-600 hover:bg-zinc-100" title="ייצוא HTML"><Download className="w-5 h-5 sm:w-6 h-6" /></button>
            
            <button 
              onClick={() => setIsCookingMode(true)} 
              className="flex items-center gap-1 sm:gap-2 bg-zinc-900 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-full hover:bg-zinc-800 transition-colors font-bold text-[10px] sm:text-sm shadow-sm active:scale-[0.98] mr-2 whitespace-nowrap"
            >
              <ChefHat className="w-4 h-4 sm:w-5 h-5" /> מצב בישול
            </button>
          </div>
        </div>
      </div>

      {displayImage && (
        <div className="mb-8 rounded-3xl overflow-hidden shadow-sm border border-zinc-200 aspect-video sticky top-4 z-10 max-h-[40vh]">
          <img src={displayImage} alt={recipe.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{recipe.name}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {(recipe.tags || []).map((tag) => (
            <button key={tag} onClick={() => onTagClick(tag)} className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-800 hover:bg-zinc-200">{tag}</button>
          ))}
        </div>
        
        {recipe.linkedTechniques && recipe.linkedTechniques.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <BookOpen className="w-5 h-5 text-zinc-400" />
            {recipe.linkedTechniques.map((link, idx) => {
              const techId = typeof link === 'string' ? link : link.techniqueId;
              const sectionId = typeof link === 'string' ? undefined : link.sectionId;
              const tech = techniques.find(t => t.id === techId);
              if (!tech) return null;
              const section = sectionId ? tech.sections?.find(s => s.id === sectionId) : null;
              return (
                <button key={idx} onClick={() => onSelectTechnique(techId, sectionId)} className="bg-zinc-100 border border-zinc-200 text-sm font-medium text-zinc-700 rounded-xl px-3 py-1.5 hover:bg-zinc-200 flex flex-col items-start">
                  <span>{tech.title}</span>
                  {section && <span className="text-[10px] text-zinc-400 font-bold">({section.title})</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Boxes */}
      {recipe.prep_info && (
        <div className="mb-10 bg-red-50 border-2 border-red-200 rounded-3xl p-6 shadow-sm section-to-print">
          <h2 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> מידע הכנה קריטי</h2>
          <p className="text-red-900 text-lg leading-relaxed whitespace-pre-wrap font-medium">{recipe.prep_info}</p>
        </div>
      )}

      {recipe.culinary_notes && (
        <div className="mb-10 bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm section-to-print">
          <h2 className="text-xl font-semibold text-amber-900 mb-3">דגשים קולינריים</h2>
          <p className="text-amber-800 leading-relaxed whitespace-pre-wrap text-lg">{recipe.culinary_notes}</p>
        </div>
      )}

      {recipe.storage_info && (
        <div className="mb-10 bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow-sm section-to-print">
          <h2 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2"><ThermometerSnowflake className="w-6 h-6" /> אחסון ותוקף</h2>
          <p className="text-blue-900 text-lg leading-relaxed whitespace-pre-wrap font-medium">{recipe.storage_info}</p>
        </div>
      )}

      {/* Ingredients Section */}
      <div className="bg-white rounded-3xl p-6 mb-10 border border-zinc-200 shadow-sm break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-zinc-900">מרכיבים</h2>
            {/* כפתור "רשימה לסופר" */}
            <button 
              onClick={() => setShowSummary(!showSummary)}
              className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all shadow-sm ${showSummary ? 'bg-zinc-100 text-zinc-900 border-zinc-300' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
            >
              {showSummary ? <List className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
              <span>{showSummary ? 'רשימה מפורטת' : 'רשימה לסופר'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
            <div className="flex items-center gap-1 bg-zinc-100 rounded-full p-1 border flex-shrink-0">
              {multipliers.map((m) => (
                <button key={m} onClick={() => { setMultiplier(m); setCustomMultiplier(''); }} className={`px-2.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold ${activeMultiplier === m && !customMultiplier ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600'}`}>{m}x</button>
              ))}
            </div>
            <input type="number" step="0.1" placeholder="מותאם" value={customMultiplier} onChange={(e) => setCustomMultiplier(e.target.value)} className="w-20 sm:w-28 px-2 sm:px-4 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-sm sm:text-base font-medium focus:ring-2 focus:ring-zinc-900 outline-none flex-shrink-0" />
          </div>
        </div>

        {recipe.servings_base && (
          <div className="flex items-center gap-2 text-zinc-500 mb-6 font-bold text-right justify-start">
             {recipe.yield_type === 'pan' ? <Layout className="w-5 h-5" /> : <Users className="w-5 h-5" />}
             <span>{yieldLabel}: {displayYield}</span>
          </div>
        )}

        {showSummary ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-3 bg-zinc-50 rounded-xl text-zinc-600 text-sm mb-4 font-medium border border-zinc-100">מציג כמויות מאוחדות עבור כל המתכון:</div>
            <ul className="space-y-4">
              {aggregatedIngredients.map((ing, idx) => (
                <li key={idx} className="flex items-baseline gap-4 py-3 border-b border-zinc-100 last:border-0">
                  <span className="font-mono font-bold text-zinc-900 w-20 text-right text-lg">{ing.amount.toFixed(ing.amount % 1 === 0 ? 0 : 2)}</span>
                  <span className="text-zinc-500 w-20 text-base font-medium">{ing.unit}</span>
                  <span className="text-zinc-800 font-medium text-lg flex-1">{ing.item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedIngredients).map(([group, ings]) => (
              <div key={group} className="space-y-3">
                {/* קו אופקי אפור עדין מעל הכותרת */}
                {group !== 'כללי' && (
                  <hr className="border-zinc-200 mb-4" />
                )}
                {group !== 'כללי' && (
                  /* כותרת קבוצה בעיצוב מבוקש - קו תחתון אפור כהה ופונט מרכיבים */
                  <div className="w-fit">
                    <h3 className="text-lg font-bold text-zinc-900 border-b-2 border-zinc-400 pb-0.5 mb-2">{group}</h3>
                  </div>
                )}
                <ul className="space-y-4">
                  {ings.map((ing, idx) => (
                    <li key={idx} className="flex items-baseline gap-4 py-2 border-b border-zinc-50 last:border-0">
                      <span className="font-mono font-bold text-zinc-900 w-20 text-right text-lg">{ing.amount.toFixed(ing.amount % 1 === 0 ? 0 : 2)}</span>
                      <span className="text-zinc-500 w-20 text-base font-medium">{ing.unit}</span>
                      <span className="text-zinc-800 font-medium text-lg flex-1">{ing.item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions Section */}
      <div className="mb-12 bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm break-inside-avoid">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-8">הוראות הכנה</h2>
        <div className="space-y-10">
          {(recipe.steps || []).map((step, idx) => (
            <div key={idx} className="flex flex-row gap-5 items-start">
              {/* החזרה לצבע המקורי: רקע אפור בהיר וטקסט שחור */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold text-lg border">
                {idx + 1}
              </div>
              <div className="text-zinc-800 leading-relaxed pt-1 text-lg flex-1 text-right">
                {parseInstructions(step)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Process Images */}
      {recipe.process_images && recipe.process_images.length > 0 && (
        <div className="mb-12 bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-6">תמונות תהליך</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recipe.process_images.map((img, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <div className="aspect-video rounded-2xl overflow-hidden border border-zinc-200"><img src={typeof img === 'string' ? img : img.url} className="w-full h-full object-cover" /></div>
                {typeof img !== 'string' && img.caption && <p className="text-zinc-600 font-medium text-sm px-1">{img.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REFERENCES */}
      {recipe.reference_videos && recipe.reference_videos.length > 0 && (
        <div className="border-t border-zinc-200 pt-10 mb-10 space-y-6 print:hidden">
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2"><Video className="w-6 h-6" /> REFERENCES</h2>
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
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="aspect-video w-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                      <Link className="text-zinc-400 w-8 h-8" />
                    </a>
                  )}
                  <div className="p-3 bg-zinc-50 flex-1">
                    <p className="text-xs text-zinc-600 line-clamp-2">{video.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NOTES */}
      <div className="border-t border-zinc-200 pt-10 print:block">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-6">NOTES</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-8 print:hidden">
          <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNote()} placeholder="הוסף תצפית חדשה..." className="flex-1 border border-zinc-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-zinc-900 bg-zinc-50 text-lg outline-none" />
          <button onClick={handleAddNote} disabled={!newNote.trim()} className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-medium shadow-sm disabled:opacity-50 transition-all active:scale-[0.98]">הוסף הערה</button>
        </div>
        <div className="space-y-4">
          {(recipe.notes || []).map((note) => (
            <div key={note.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative group">
              <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3 font-bold uppercase tracking-wider"><Clock className="w-4 h-4" /> {new Date(note.timestamp).toLocaleDateString('he-IL')}</div>
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea value={editingNoteText} onChange={(e) => setEditingNoteText(e.target.value)} className="w-full border border-zinc-200 rounded-xl p-3 bg-zinc-50 focus:ring-2 focus:ring-zinc-900 outline-none text-lg" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEditedNote} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1 font-bold"><Check className="w-4 h-4" /> שמור</button>
                    <button onClick={() => setEditingNoteId(null)} className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg text-sm font-medium">ביטול</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-800 leading-relaxed text-lg text-right">{note.text}</p>
                  <div className="absolute top-5 left-5 flex gap-1 print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }} className="p-2 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full transition-all"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => onUpdateRecipe({ ...recipe, notes: recipe.notes.filter(n => n.id !== note.id) })} className="p-2 text-zinc-400 hover:text-red-600 bg-red-50 rounded-full transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden, button, input { display: none !important; }
          body { padding: 0; background: white; font-size: 11pt; -webkit-print-color-adjust: exact; direction: rtl; }
          .container { border: none !important; padding: 0 !important; }
          .max-w-3xl { max-width: 100% !important; }
          h1, h2, h3, p, li { text-align: right !important; }
        }
      `}</style>
    </div>
  );
}
