import { useState } from 'react';
import { Technique, Recipe } from '../types';
import { ArrowLeft, Edit2, BookOpen, Trash2, Video, Link as LinkIcon, Download, ChevronDown, ChevronUp, Youtube, ExternalLink, FileText, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TechniqueViewProps {
  technique: Technique;
  recipes: Recipe[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onSelectRecipe: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export function TechniqueView({ technique, recipes, onBack, onEdit, onDelete, onSelectRecipe, onTagClick }: TechniqueViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (technique.sections && technique.sections.length > 0) {
      initial[technique.sections[0].id] = true;
    }
    return initial;
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const associatedRecipes = recipes.filter(r => r.linkedTechniques?.includes(technique.id));

  const handlePrintPdf = () => window.print();

  const handleDownloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${technique.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #18181b; max-width: 800px; margin: 0 auto; padding: 2rem; background: #fafafa; text-align: right; }
    .container { background: white; padding: 2.5rem; border-radius: 1.5rem; border: 1px solid #e4e4e7; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    h1 { font-size: 2.5rem; font-weight: 800; border-bottom: 2px solid #f4f4f5; padding-bottom: 1rem; margin-top: 0; }
    .overview { font-size: 1.1rem; color: #71717a; font-style: italic; margin-bottom: 2rem; }
    .section { border-bottom: 1px solid #f4f4f5; padding: 2rem 0; }
    .section-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #18181b; }
    .content { white-space: pre-wrap; word-wrap: break-word; color: #3f3f46; }
    img { max-width: 100%; border-radius: 1rem; margin: 1.5rem 0; }
    footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${technique.title}</h1>
    ${technique.overview ? `<div class="overview">${technique.overview}</div>` : ''}
    ${(technique.sections || []).map((s, idx) => `
      <div class="section">
        <h2 class="section-title">${idx + 1}. ${s.title}</h2>
        ${s.image_base_64 ? `<img src="${s.image_base_64}">` : ''}
        <div class="content">${s.content}</div>
      </div>
    `).join('')}
    <footer>נכתב ונערך על ידי יאן גולזמן</footer>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${technique.title.replace(/\s+/g, '_')}_Technique.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32 rtl text-right" dir="rtl">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold mb-6">למחוק טכניקה?</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 text-zinc-700 font-medium">ביטול</button>
              <button onClick={() => onDelete(technique.id)} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium">מחיקה</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center gap-4 mb-8 print:hidden">
        <button 
          onClick={onBack} 
          className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors"
          title="חזרה"
        >
          <ArrowLeft className="w-7 h-7 text-zinc-900 rotate-180" />
        </button>
        
        <div className="flex items-center gap-1 border-r border-zinc-200 pr-2">
          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 sm:p-3 rounded-full text-red-600 hover:bg-red-50 transition-colors" title="מחיקה"><Trash2 className="w-5 h-5 sm:w-6 h-6" /></button>
          <button onClick={onEdit} className="p-2 sm:p-3 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors" title="עריכה"><Edit2 className="w-5 h-5 sm:w-6 h-6" /></button>
          <button onClick={handlePrintPdf} className="p-2 sm:p-3 rounded-full text-zinc-600 hover:bg-zinc-100" title="PDF / הדפסה"><FileText className="w-5 h-5 sm:w-6 h-6" /></button>
          <button onClick={handleDownloadHtml} className="p-2 sm:p-3 rounded-full text-zinc-600 hover:bg-zinc-100" title="ייצוא HTML"><Download className="w-5 h-5 sm:w-6 h-6" /></button>
        </div>
      </div>

      {/* Main Image */}
      {technique.image_base_64 && (
        <div className="mb-8 rounded-3xl overflow-hidden border border-zinc-200 aspect-video sticky top-4 z-10 max-h-[40vh] shadow-sm print:relative print:top-0 print:max-h-none print:aspect-auto print:rounded-none print:shadow-none print:border-0 print:mb-12">
          <img src={technique.image_base_64} className="w-full h-full object-cover print:rounded-2xl" />
        </div>
      )}

      <div className="mb-12 print:mb-16">
        <div className="flex items-center gap-3 mb-4 text-zinc-400 justify-start print:hidden">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Mastering Technique</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 mb-4 print:text-6xl">{technique.title}</h1>
        {technique.overview && (
          <div className="whitespace-pre-wrap break-words text-xl text-zinc-500 leading-relaxed italic print:text-zinc-700 print:text-2xl">
            {technique.overview}
          </div>
        )}
      </div>

      {/* Modular Sections */}
      <div className="space-y-6 mb-12">
        {(technique.sections || []).map((section, idx) => (
          <div key={section.id} className={`bg-white border rounded-3xl transition-all duration-300 overflow-hidden print:border-0 print:border-b print:border-zinc-100 print:rounded-none print:shadow-none break-inside-avoid ${expandedSections[section.id] ? 'border-zinc-900 ring-1 ring-zinc-900 shadow-md' : 'border-zinc-200 hover:border-zinc-400'}`}>
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-6 text-right print:hidden"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                <h3 className="text-xl font-bold text-zinc-900">{section.title || `חלק ${idx + 1}`}</h3>
              </div>
              {expandedSections[section.id] ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
            </button>

            {/* Print Title */}
            <h2 className="hidden print:block text-3xl font-bold p-6 pb-4 border-b border-zinc-50">
              {idx + 1}. {section.title || `חלק ${idx + 1}`}
            </h2>

            <div className={`p-6 pt-0 space-y-6 animate-in fade-in slide-in-from-top-2 ${expandedSections[section.id] ? 'block' : 'hidden print:block'}`}>
              {section.image_base_64 && (
                <div className="rounded-2xl overflow-hidden border border-zinc-200 aspect-video mb-4 mt-6 print:rounded-xl">
                  <img src={section.image_base_64} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="prose prose-zinc prose-rtl max-w-none text-zinc-800 leading-relaxed whitespace-pre-wrap break-words text-right text-lg">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>

              {section.references && section.references.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 print:hidden">
                  {section.references.map((ref, rIdx) => (
                    <a 
                      key={rIdx} 
                      href={ref.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start justify-between group hover:bg-zinc-100 transition-colors"
                    >
                      <div className="flex gap-4">
                        <div className="w-16 aspect-video bg-zinc-200 rounded-lg overflow-hidden flex-shrink-0">
                          {ref.thumbnailUrl ? <img src={ref.thumbnailUrl} className="w-full h-full object-cover" /> : <LinkIcon className="w-full h-full p-4 text-zinc-400" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase text-right">{ref.channelName || 'Source'}</p>
                          <p className="text-xs font-medium text-zinc-900 line-clamp-1 text-right">{ref.note || 'Reference'}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Associated Recipes */}
      {associatedRecipes.length > 0 && (
        <div className="mt-16 pt-8 border-t border-zinc-200 print:hidden">
          <h2 className="text-2xl font-bold text-zinc-900 mb-8 text-right">מתכונים מקושרים</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {associatedRecipes.map(recipe => (
              <button key={recipe.id} onClick={() => onSelectRecipe(recipe.id)} className="text-right bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-900 hover:shadow-lg transition-all active:scale-[0.98] group">
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{recipe.name}</h3>
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{recipe.ingredients.length} מרכיבים &bull; {recipe.servings_base} מנות</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PDF Footer Credit */}
      <footer className="hidden print:block text-center mt-20 pt-8 border-t border-zinc-100 text-zinc-400 text-sm font-medium">
        נכתב ונערך על ידי יאן גולזמן
      </footer>

      <style>{`
        @media print {
          @page { margin: 20mm; }
          .print\\:hidden, button, .sticky { display: none !important; position: relative !important; top: 0 !important; }
          body { padding: 0; background: white; font-size: 11pt; -webkit-print-color-adjust: exact; direction: rtl; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
          h1, h2, h3, p, div { text-align: right !important; color: #000 !important; }
          .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
          img { max-width: 100% !important; height: auto !important; }
          .hidden.print\\:block { display: block !important; }
        }

        /* הפתרון הסופי והיציב ליישור נקודות (Hanging Indent) */
        .prose ul {
          list-style: none !important;
          padding-right: 0 !important;
          margin: 1rem 0 !important;
        }

        .prose li {
          position: relative !important;
          padding-right: 1.5rem !important; /* מרחב לנקודה */
          margin-bottom: 0.75rem !important;
          display: block !important; /* חזרה לבלוק כדי לאפשר ירידת שורה תקינה */
          text-align: right !important;
        }

        .prose li::before {
          content: "•";
          position: absolute !important;
          right: 0 !important;
          top: 0 !important;
          width: 1rem !important;
          text-align: right !important;
          font-weight: bold;
          color: #3f3f46;
        }

        /* מניעת רווחים מיותרים בתוך ה-Markdown */
        .prose li p {
          margin: 0 !important;
          display: inline !important;
        }
      `}</style>
    </div>
  );
}
