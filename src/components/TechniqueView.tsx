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

  // Extract YouTube ID for embed
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
          text: `Check out this technique for ${technique.title}!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${technique.title}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #18181b;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #fafafa;
    }
    .container {
      background: white;
      padding: 2.5rem;
      border-radius: 1.5rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-top: 0;
      margin-bottom: 1rem;
      letter-spacing: -0.025em;
    }
    .hero-image {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
      border-radius: 1rem;
      margin-bottom: 2rem;
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f4f4f5;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    .tag {
      background: #f4f4f5;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .content {
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="container">
    ${technique.image_base64 ? `<img src="${technique.image_base64}" alt="${technique.title}" class="hero-image">` : ''}
    <h1>${technique.title}</h1>
    
    <div class="meta">
      ${technique.tags?.map(t => `<span class="tag">${t}</span>`).join('') || ''}
    </div>

    ${technique.overview ? `
    <h2>Overview</h2>
    <p class="content">${technique.overview}</p>
    ` : ''}

    <h2>Technique Guide</h2>
    <div class="content">${technique.content}</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${technique.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2">Delete Technique?</h3>
            <p className="text-zinc-600 mb-6">Are you sure you want to delete "{technique.title}"? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 text-zinc-700 font-medium hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(technique.id)}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8 print:hidden">
        <button
          onClick={onBack}
          className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-7 h-7 text-zinc-900" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-3 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
            aria-label="Share technique"
          >
            <Share className="w-6 h-6" />
          </button>
          <button
            onClick={handleDownloadHtml}
            className="p-3 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
            aria-label="Download as HTML"
            title="Download as HTML"
          >
            <Download className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-3 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Delete technique"
          >
            <Trash2 className="w-6 h-6" />
          </button>
          <button
            onClick={onEdit}
            className="p-3 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
            aria-label="Edit technique"
          >
            <Edit2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Image */}
      {technique.image_base64 && (
        <div className="mb-8 rounded-3xl overflow-hidden shadow-sm border border-zinc-200 aspect-video sticky top-4 z-10 max-h-[40vh]">
          <img src={technique.image_base64} alt={technique.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 text-zinc-500">
          <BookOpen className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wider">Technique Guide</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{technique.title}</h1>
        
        {technique.tags && technique.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {technique.tags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* References */}
        {technique.reference_videos && technique.reference_videos.length > 0 && (
          <div className="mb-10 space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <Link className="w-6 h-6" />
              References
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {technique.reference_videos.map((video, idx) => {
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

        {technique.overview && (
          <p className="text-xl text-zinc-600 leading-relaxed mb-8">{technique.overview}</p>
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
                <div className="text-sm text-zinc-500">
                  {recipe.ingredients.length} ingredients &bull; {recipe.servings_base} servings
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
