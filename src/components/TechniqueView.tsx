import { useState } from 'react';
import { Technique, Recipe } from '../types';
import { ArrowLeft, Edit2, BookOpen, Trash2, Video, Link as LinkIcon, Share, Download, ChevronDown, ChevronUp, Youtube, ExternalLink } from 'lucide-react';
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
  // ניהול מצב פתיחה/סגירה של מקטעים
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // כברירת מחדל, המקטע הראשון פתוח והשאר סגורים
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
          title: technique.title,
          text: `Explore this culinary technique: ${technique.title}`,
          url: window.location.href,
        });
      } catch (err) { console.error('Error sharing:', err); }
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>${technique.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #18181b; max-width: 800px; margin: 0 auto; padding: 2rem; background: #fafafa; text-align: left; }
    .container { background: white; padding: 2.5rem; border-radius: 1.5rem; border: 1px solid #e4e4e7; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    h1 { font-size: 2.5rem; font-weight: 800; border-bottom: 2px solid #f4f4f5; padding-bottom: 1rem; }
    .section { border: 1px solid #e4e4e7; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem; }
    .section-title { font-size: 1.25rem; font-weight: 700; margin-top: 0; }
    img { max-width: 100%; border-radius: 0.75rem; margin: 1rem 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${technique.title}</h1>
    <p>${technique.overview || ''}</p>
    ${(technique.sections || []).map(s => `
      <div class="section">
        <h2 class="section-title">${s.title}</h2>
        <div>${s.content}</div>
        ${s.image_base_64 ? `<img src="${s.image_base_64}">` : ''}
        ${s.reference ? `<p><small>Reference: <a href="${s.reference.url}">${s.reference.channelName || 'Source'}</a></small></p>` : ''}
      </div>
    `).join('')}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${technique.title.replace(/\s+/g, '_')}.html`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold mb-6">Delete Technique?</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 text-zinc-700 font-medium">Cancel</button>
              <button onClick={() => onDelete(technique.id)} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors"><ArrowLeft className="w-7 h-7 text-zinc-900" /></button>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="p-3 text-zinc-600 hover:bg-zinc-100 rounded-full"><Share className="w-6 h-6" /></button>
          <button onClick={handleDownloadHtml} className="p-3 text-zinc-600 hover:bg-zinc-100 rounded-full"><Download className="w-6 h-6" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 text-red-600 hover:bg-red-50 rounded-full"><Trash2 className="w-6 h-6" /></button>
          <button onClick={onEdit} className="p-3 text-zinc-600 hover:bg-zinc-100 rounded-full"><Edit2 className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Main Technique Header */}
      {technique.image_base_64 && (
        <div className="mb-8 rounded-3xl overflow-hidden border border-zinc-200 aspect-video sticky top-4 z-10 max-h-[40vh] shadow-sm">
          <img src={technique.image_base_64} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4 text-zinc-400">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Mastering Technique</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-4">{technique.title}</h1>
        {technique.overview && <p className="text-xl text-zinc-500 leading-relaxed italic">{technique.overview}</p>}
      </div>

      {/* New Modular Sections (The Chunks) */}
      <div className="space-y-6 mb-12">
        {(technique.sections || []).map((section, idx) => (
          <div key={section.id} className={`bg-white border rounded-3xl transition-all duration-300 overflow-hidden ${expandedSections[section.id] ? 'border-zinc-900 ring-1 ring-zinc-900 shadow-md' : 'border-zinc-200 hover:border-zinc-400'}`}>
            {/* Section Header */}
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                <h3 className="text-xl font-bold text-zinc-900">{section.title || `Section ${idx + 1}`}</h3>
              </div>
              {expandedSections[section.id] ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
            </button>

            {/* Section Body */}
            {expandedSections[section.id] && (
              <div className="p-6 pt-0 border-t border-zinc-50 space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="prose prose-zinc max-w-none text-zinc-800 leading-relaxed">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
                
                {section.image_base_64 && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-200 aspect-video">
                    <img src={section.image_base_64} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Section Specific Reference */}
                {section.reference && section.reference.url && (
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-24 aspect-video bg-zinc-200 rounded-lg overflow-hidden flex-shrink-0">
                          {section.reference.thumbnailUrl ? <img src={section.reference.thumbnailUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><LinkIcon className="text-zinc-400" /></div>}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">{section.reference.channelName || 'External Source'}</p>
                          <p className="text-sm font-medium text-zinc-900 line-clamp-2">{section.reference.note || 'Reference Link'}</p>
                        </div>
                      </div>
                      <a href={section.reference.url} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Associated Recipes */}
      {associatedRecipes.length > 0 && (
        <div className="mt-16 pt-8 border-t border-zinc-200">
          <h2 className="text-2xl font-bold text-zinc-900 mb-8">Related Lab Experiments</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {associatedRecipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="text-left bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-900 hover:shadow-lg transition-all active:scale-[0.98] group"
              >
                <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-zinc-900">{recipe.name}</h3>
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
                  {recipe.ingredients.length} Ingredients &bull; {recipe.servings_base} servings
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
