import { useState, useMemo, useEffect } from 'react';
import { Recipe, RecipeNote, Technique, LinkedTechnique } from '../types';
import { ArrowLeft, Play, Plus, Clock, ChefHat, Trash2, Edit3, Image as ImageIcon, AlertTriangle, Video, BookOpen, ThermometerSnowflake, Link, Download, Check, X, FileText, Users, Layout, ArrowUp } from 'lucide-react';
import { CookingMode } from './CookingMode';

interface RecipeViewProps {
  recipe: Recipe;
  recipes: Recipe[];
  techniques: Technique[];
  onBack: () => void;
  onUpdateRecipe: (updated: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onEdit: () => void;
  onSelectTechnique: (id: string, sectionId?: string) => void; // תמיכה בקישור לסעיף
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

  // ניהול מצב כפתור "חזרה למעלה"
  const [showScrollTop, setShowScrollTop] = useState(false);

  // פונקציה חדשה: מוודא שהדף תמיד נפתח הכי למעלה כשנכנסים למתכון
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [recipe.id]);

  useEffect(() => {
    const handleScroll = () => {
      // מופיע לאחר גלילה משמעותית
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
    .info-box { background: #fef2f2; border: 1px solid #fecaca; padding: 1.5rem; border-radius: 1rem; margin-bottom: 1.5rem; }
    .blue-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 1.5rem; border-radius: 1rem; margin-bottom: 1.5rem; }
    .amber-box { background: #fffbeb; border: 1px solid #fef3c7; padding: 1.5rem; border-radius: 1rem; margin-bottom: 2rem; }
    h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; border-bottom: 1px solid #f4f4f5; padding-bottom: 8px; }
    ul, ol { padding-right: 1.5rem; padding-left: 0; }
    li { margin-bottom: 0.75rem; }
    .note-item { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem; }
    .process-img { width: 100%; border-radius: 1rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${recipe.name}</h1>
    <p><strong>${yieldLabel}:</strong> ${displayYield}</p>
    ${recipe.prep_info ? `<div class="info-box"><h3>מידע הכנה קריטי</h3><p>${recipe.prep_info}</p></div>` : ''}
    ${recipe.culinary_notes ? `<div class="amber-box"><h3>דגשים קולינריים</h3><p>${recipe.culinary_notes}</p></div>` : ''}
    ${recipe.storage_info ? `<div class="blue-box"><h3>אחסון ותוקף</h3><p>${recipe.storage_info}</p></div>` : ''}
    <h2>מרכיבים</h2>
    <ul>${scaledIngredients.map(i => `<li><strong>${i.amount.toFixed(2)} ${i.unit}</strong> ${i.item}</li>`).join('')}</ul>
    <h2>הוראות הכנה</h2>
    <ol>${recipe.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    ${recipe.process_images && recipe.process_images.length > 0 ? `<h2>תמונות תהליך</h2>${recipe.process_images.map(img => `<div style="margin-bottom: 20px;"><img src="${typeof img === 'string' ? img : img.url}" class="process-img">${typeof img !== 'string' && img.caption ? `<p><em>${img.caption}</em></p>` : ''}</div>`).join('')}` : ''}
    ${recipe.notes && recipe.notes.length > 0 ? `<h2>NOTES</h2>${recipe.notes.map(n => `<div class="note-item"><small>${new Date(n.timestamp).toLocaleDateString('he-IL')}</small><p>${n.text}</p></div>`).join('')}` : ''}
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

  const displayImage = recipe.image_base64;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32 rtl text-right" dir="rtl">
      
      {/* כפתורי ניווט צפים - Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-50 print:hidden">
        {/* כפתור חזרה צף */}
        <button 
          onClick={onBack}
          className="p-4 bg-white/80 backdrop-blur-md border border-zinc-200 text-zinc-900 rounded-full shadow-lg hover:bg-white transition-all active:scale-90 group"
          title="חזרה לתפריט"
        >
          <ArrowLeft className="w-6 h-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* כפתור קפוץ למעלה - מופיע רק בגלילה */}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2">למחוק מתכון?</h3>
            <p className="text-zinc-600 mb-6 text-sm">האם אתה בטוח שברצונך למחוק את "{recipe.name}"? פעולה זו אינה ניתנת לביטול.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 text-zinc-700 font-medium">ביטול</button>
              <button onClick={() => { setShowDeleteConfirm(false); onDeleteRecipe(recipe.id); }} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium">מחיקה</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
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

      {/* Title & Tags */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{recipe.name}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map((tag) => (
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
                <button 
                  key={idx} 
                  onClick={() => onSelectTechnique(techId, sectionId)} 
                  className="bg-zinc-100 border border-zinc-200 text-sm font-medium text-zinc-700 rounded-xl px-3 py-1.5 hover:bg-zinc-200 flex flex-col items-start"
                >
                  <span>{tech.title}</span>
                  {section && <span className="text-[10px] text-zinc-400 font-bold">({section.title})</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Boxes - REORDERED (Prep -> Culinary -> Storage) */}
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

      {/* Ingredients */}
      <div className="bg-white rounded-3xl p-6 mb-10 border border-zinc-200 shadow-sm break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
          <h2 className="text-2xl font-bold text-zinc-900">מרכיבים</h2>
          <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
            <div className="flex items-center gap-1 bg-zinc-100 rounded-full p-1 border flex-shrink-0">
              {multipliers.map((m) => (
                <button key={m} onClick={() => { setMultiplier(m); setCustomMultiplier(''); }} className={`px-2.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold ${activeMultiplier === m && !customMultiplier ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600'}`}>{m}x</button>
              ))}
            </div>
            <input type="number" step="0.1" placeholder="מותאם" value={customMultiplier} onChange={(e) => setCustomMultiplier(e.target.value)} className="w-20 sm:w-28 px-2 sm:px-4 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-sm sm:text-base font-medium focus:ring-2 focus:ring-zinc-900 outline-none flex-shrink-0" />
          </div>
        </div>

        {/* הצגת כמות/תבנית דינמית */}
        {recipe.servings_base && (
          <div className="flex items-center gap-2 text-zinc-500 mb-6 font-bold text-right justify-start">
             {recipe.yield_type === 'pan' ? <Layout className="w-5 h-5" /> : <Users className="w-5 h-5" />}
             <span>{yieldLabel}: {displayYield}</span>
          </div>
        )}

        <ul className="space-y-4">
          {scaledIngredients.map((ing, idx) => (
            <li key={idx} className="flex items-baseline gap-4 py-3 border-b border-zinc-100 last:border-0">
              <span className="font-mono font-bold text-zinc-900 w-20 text-right text-lg">{ing.amount.toFixed(ing.amount % 1 === 0 ? 0 : 2)}</span>
              <span className="text-zinc-500 w-20 text-base font-medium">{ing.unit}</span>
              <span className="text-zinc-800 font-medium text-lg flex-1">{ing.item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="mb-12 bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm break-inside-avoid">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-8">הוראות הכנה</h2>
        <div className="space-y-8">
          {recipe.steps.map((step, idx) => (
            <div key={idx} className="flex flex-row gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold text-lg border">
                {idx + 1}
              </div>
              <p className="text-zinc-800 leading-relaxed pt-1 text-lg flex-1 text-right">{step}</p>
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
                  <div className="p-3 bg-zinc-50 flex-1 flex flex-col">
                    {yt ? (
                      <a href={yt.direct} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-1.5 rounded block text-center mb-2 uppercase hover:bg-zinc-50 transition-colors">Open in YouTube</a>
                    ) : (
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-1.5 rounded block text-center mb-2 uppercase hover:bg-zinc-50 transition-colors">Open Source Link</a>
                    )}
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
          <button onClick={handleAddNote} disabled={!newNote.trim()} className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-medium shadow-sm disabled:opacity-50">הוסף הערה</button>
        </div>
        <div className="space-y-4">
          {recipe.notes.map((note) => (
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
                  <div className="absolute top-5 left-5 flex gap-1 print:hidden">
                    <button onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }} className="p-2.5 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-full transition-all"><Edit3 className="w-5 h-5" /></button>
                    <button onClick={() => onUpdateRecipe({ ...recipe, notes: recipe.notes.filter(n => n.id !== note.id) })} className="p-2.5 text-zinc-400 hover:text-red-600 bg-red-50 rounded-full transition-all"><Trash2 className="w-5 h-5" /></button>
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
          h1, h2, p, li { text-align: right !important; }
        }
      `}</style>
    </div>
  );
}
