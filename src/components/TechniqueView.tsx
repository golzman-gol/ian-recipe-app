import { useState } from 'react';
import { Technique, Recipe } from '../types';
import { ArrowLeft, Edit2, BookOpen, Trash2, Video, Link as LinkIcon, Download, ChevronDown, ChevronUp, Youtube, ExternalLink, FileText } from 'lucide-react';
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
    .section:last-child { border-bottom: none; }
    .section-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #18181b; }
    .content { white-space: pre-wrap; word-wrap: break-word; color: #3f3f46; }
    img { max-width: 100%; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
    .ref-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.75rem; margin-top: 1rem; font-size: 0.875rem; }
    ul { padding-right: 1.5rem; padding-left: 0; }
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
        ${s.references && s.references.length > 0 ? `
          <div class="ref-box">
            <strong>Sources:</strong>
            <ul>
              ${s.references.map(r => `<li><a href="${r.url}">${r.channelName || 'Source'}</a>: ${r.note || 'Reference'}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('')}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold mb-6">למחוק טכניקה?</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 text-zinc-700 font-medium">ביטול</button>
              <button onClick={() => onDelete(technique.id)} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium">מחיקה</button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Fixed Alignment */}
      <div className="flex items-center gap-4 mb-8 print:hidden">
        <button 
          onClick={onBack} 
          className="p-3 -mr-3 rounded-full hover:bg-zinc-100 transition-colors"
          title="חזרה"
        >
          <ArrowLeft className="w-7 h-7 text-zinc-900 rotate-180" />
        </button>
        
        {/* Actions grouped closer to the back button with a divider */}
        <div className="flex items-center gap-1 border-r border-zinc-200 pr-2">
          <button onClick={handlePrintPdf} className="p-3 text-zinc-600 hover:bg-zinc-100 rounded-full" title="הדפסה ל-PDF"><FileText className="w-6 h-6" /></button>
          <button onClick={handleDownloadHtml} className="p-3 text-zinc-600 hover:bg-zinc-100 rounded-full" title="ייצוא HTML"><Download className="w-6 h-6" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 text-red-600 hover:bg-red-50 rounded-full" title="מחיקה"><Trash2 className="w-6 h-6" /></button>
          <button onClick={onEdit} className="p-3 text-zinc-600 hover:bg-zinc-100 rounded-full" title="עריכה"><Edit2 className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Main Technique Image */}
      {technique.image_base_64 && (
        <div className="mb-8 rounded-3xl overflow-hidden border border-zinc-200 aspect-video sticky top-4 z-10 max-h-[40vh] shadow-sm">
          <img src={technique.image_base_64} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4 text-zinc-400 justify-start">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Mastering Technique</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-4">{technique.title}</h1>
        {technique.overview && (
          <div className="whitespace-pre-wrap break-words text-xl text-zinc-500 leading-relaxed italic">
            {technique.overview}
          </div>
        )}
      </div>

      {/* Modular Sections (The Chunks) */}
      <div className="space-y-6 mb-12">
        {(technique.sections || []).map((section, idx) => (
          <div key={section.id} className={`bg-white border rounded-3xl transition-all duration-300 overflow-hidden print-section ${expandedSections[section.id] ? 'border-zinc-900 ring-1 ring-zinc-900 shadow-md' : 'border-zinc-200 hover:border-zinc-400'}`}>
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
            <h2 className="hidden print:block text-2xl font-bold p-6 pb-2 border-b border-zinc-100">
              {idx + 1}. {section.title || `חלק ${idx + 1}`}
            </h2>

            <div className={`p-6 pt-0 space-y-6 animate-in fade-in slide-in-from-top-2 ${expandedSections[section.id] ? 'block' : 'hidden print:block'}`}>
              {section.image_base_64 && (
                <div className="rounded-2xl overflow-hidden border border-zinc-200 aspect-video mb-4 mt-6">
                  <img src={section.image_base_64} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="prose prose-zinc max-w-none text-zinc-800 leading-relaxed whitespace-pre-wrap break-words text-right">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>

              {section.references && section.references.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 print:hidden">
                  {section.references.map((ref, rIdx) => (
                    <div key={rIdx} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start justify-between group">
                      <div className="flex gap-4">
                        <div className="w-16 aspect-video bg-zinc-200 rounded-lg overflow-hidden flex-shrink-0">
                          {ref.thumbnailUrl ? <img src={ref.thumbnailUrl} className="w-full h-full object-cover" /> : <LinkIcon className="w-full h-full p-4 text-zinc-400" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase text-right">{ref.channelName || 'Source'}</p>
                          <p className="text-xs font-medium text-zinc-900 line-clamp-1 text-right">{ref.note || 'Reference'}</p>
                        </div>
                      </div>
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
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

      {/* Styles for Printing PDF */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { padding: 0; background: white; font-size: 12pt; direction: rtl; }
          .max-w-4xl { max-width: 100% !important; }
          .print-section { border: none !important; border-bottom: 2px solid #f4f4f5 !important; border-radius: 0 !important; box-shadow: none !important; break-inside: avoid; }
          .print-section h2 { display: block !important; padding-right: 0 !important; text-align: right; }
          .rounded-3xl, .rounded-2xl { border-radius: 12px !important; }
          h1, h2, h3, p, div { text-align: right !important; }
        }
      `}</style>
    </div>
  );
}
