import { Technique, Recipe } from '../types';
import { ArrowLeft, Edit2, Trash2, Link, ExternalLink, BookOpen } from 'lucide-react';
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
  
  // פונקציית עזר לזיהוי יוטיוב ותמיכה בקישור ישיר לאייפון
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

  const associatedRecipes = recipes.filter(r => r.linkedTechniques?.includes(technique.id));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      {/* Header - כאן הסרתי את כפתור ה-Import והשארתי רק עריכה ומחיקה */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="w-7 h-7 text-zinc-900" />
        </button>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-3 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors">
            <Edit2 className="w-6 h-6" />
          </button>
          <button onClick={() => onDelete(technique.id)} className="p-3 rounded-full text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 text-zinc-500">
          <BookOpen className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wider">Technique Guide</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-6">{technique.title}</h1>
        
        {/* References - תיקון יוטיוב לאייפון */}
        {technique.reference_videos && technique.reference_videos.length > 0 && (
          <div className="mb-10 space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <ExternalLink className="w-6 h-6" />
              References
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {technique.reference_videos.map((video, idx) => {
                const yt = getYoutubeData(video.url);
                return (
                  <div key={idx} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    {yt ? (
                      <div className="aspect-video w-full">
                        <iframe width="100%" height="100%" src={yt.embed} frameBorder="0" allowFullScreen></iframe>
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-zinc-100 flex items-center justify-center">
                        <Link className="text-zinc-400" />
                      </div>
                    )}
                    <div className="p-3 bg-zinc-50 flex-1">
                      {/* כפתור ייעודי שפותח את האפליקציה באייפון */}
                      <a 
                        href={yt?.direct || video.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-1.5 rounded block text-center mb-2 hover:bg-zinc-100 transition-colors uppercase"
                      >
                        Open Video
                      </a>
                      <p className="text-xs text-zinc-600 line-clamp-2">{video.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="prose prose-zinc max-w-none mb-12">
        <ReactMarkdown>{technique.content}</ReactMarkdown>
      </div>

      {associatedRecipes.length > 0 && (
        <div className="mt-12 pt-8 border-t border-zinc-200">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6">Related Recipes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {associatedRecipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="text-left bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{recipe.name}</h3>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
