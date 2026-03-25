import { useState } from 'react';
import { Technique, Recipe } from '../types';
import { ArrowLeft, Edit2, BookOpen, Trash2, Link, Download, ExternalLink } from 'lucide-react';
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

  const getYoutubeData = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    if (!id) return null;
    return { embed: `https://www.youtube.com/embed/${id}`, direct: `https://www.youtube.com/watch?v=${id}` };
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 -ml-3"><ArrowLeft className="w-7 h-7" /></button>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100"><Edit2 className="w-6 h-6" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-3 rounded-full text-red-600 hover:bg-red-50"><Trash2 className="w-6 h-6" /></button>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-6">{technique.title}</h1>

      {technique.reference_videos && technique.reference_videos.length > 0 && (
        <div className="mb-10 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><ExternalLink /> References</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {technique.reference_videos.map((video, idx) => {
              const yt = getYoutubeData(video.url);
              return (
                <div key={idx} className="bg-white border rounded-2xl overflow-hidden flex flex-col shadow-sm">
                  {yt ? <div className="aspect-video"><iframe width="100%" height="100%" src={yt.embed} frameBorder="0" allowFullScreen></iframe></div> : <div className="aspect-video bg-zinc-100 flex items-center justify-center"><Link /></div>}
                  <div className="p-3 bg-zinc-50">
                    <a href={yt?.direct || video.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-1 rounded block text-center mb-1">OPEN VIDEO</a>
                    <p className="text-xs text-zinc-600 line-clamp-1">{video.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="prose prose-zinc max-w-none"><ReactMarkdown>{technique.content}</ReactMarkdown></div>
    </div>
  );
}
