import { useState } from 'react';
import { Technique, Recipe } from '../types';
import { ArrowLeft, Edit2, BookOpen, Trash2, Video, Link, Share, Download } from 'lucide-react';
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
  const associatedRecipes = recipes.filter(r => r.linkedTechniques?.includes(technique.id));

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

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${technique.title}</title><style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:2rem}h1{color:#18181b}.hero-image{width:100%;border-radius:1rem}</style></head><body>${technique.image_base64?`<img src="${technique.image_base64}" class="hero-image">`:''}<h1>${technique.title}</h1><p>${technique.overview}</p><div>${technique.content}</div></body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${technique.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-zinc-100"><ArrowLeft className="w-7 h-7" /></button>
        <div className="flex gap-2">
          <button onClick={handleDownloadHtml} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Download className="w-6 h-6" /></button>
          <button onClick={onEdit} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Edit2 className="w-6 h-6" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 rounded-full text-red-600 hover:bg-red-50"><Trash2 className="w-6 h-6" /></button>
        </div>
      </div>

      {technique.image_base64 && <div className="mb-8 rounded-3xl overflow-hidden aspect-video border"><img src={technique.image_base64} className="w-full h-full object-cover" /></div>}
      <h1 className="text-4xl font-bold mb-4">{technique.title}</h1>

      {/* References - FIXED FOR IOS */}
      {technique.reference_videos && technique.reference_videos.length > 0 && (
        <div className="mb-10 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Link /> References</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {technique.reference_videos.map((video, idx) => {
              const ytData = getYoutubeData(video.url);
              return (
                <div key={idx} className="bg-white border rounded-2xl overflow-hidden flex flex-col shadow-sm">
                  {ytData ? (
                    <div className="aspect-video"><iframe width="100%" height="100%" src={ytData.embed} frameBorder="0" allowFullScreen></iframe></div>
                  ) : (
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="aspect-video bg-zinc-100 flex items-center justify-center"><Link className="text-zinc-400" /></a>
                  )}
                  <div className="p-3 bg-zinc-50 flex-1">
                    <a href={ytData?.direct || video.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-zinc-900 block mb-1 hover:underline">OPEN VIDEO</a>
                    <p className="text-xs text-zinc-600 line-clamp-2">{video.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="prose prose-zinc max-w-none mb-12"><ReactMarkdown>{technique.content}</ReactMarkdown></div>
    </div>
  );
}
