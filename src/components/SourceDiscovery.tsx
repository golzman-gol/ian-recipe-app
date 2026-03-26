import { useState, useMemo } from 'react';
import { Recipe, Technique, ReferenceLink } from '../types';
import { ArrowLeft, Search, ExternalLink, Youtube, Link as LinkIcon, User } from 'lucide-react';

interface SourceDiscoveryProps {
  recipes: Recipe[];
  techniques: Technique[];
  onBack: () => void;
  onSelectRecipe: (id: string) => void;
  onSelectTechnique: (id: string) => void;
}

interface AggregatedSource {
  id: string;
  url: string;
  note: string;
  channelName?: string;
  sourceType: 'recipe' | 'technique';
  sourceId: string;
  sourceName: string;
}

export function SourceDiscovery({ recipes, techniques, onBack, onSelectRecipe, onSelectTechnique }: SourceDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const allSources = useMemo(() => {
    const sources: AggregatedSource[] = [];

    // איסוף מקורות ממתכונים - שואב את ה-channelName שהזנת ידנית בעורך
    recipes.forEach(recipe => {
      if (recipe.reference_videos) {
        recipe.reference_videos.forEach((ref, index) => {
          sources.push({
            id: `recipe-${recipe.id}-${index}`,
            url: ref.url || '',
            note: ref.note || '',
            channelName: ref.channelName, // המידע הקריטי מהעורך
            sourceType: 'recipe',
            sourceId: recipe.id,
            sourceName: recipe.name
          });
        });
      }
    });

    // איסוף מקורות מטכניקות
    techniques.forEach(technique => {
      if (technique.reference_videos) {
        technique.reference_videos.forEach((ref, index) => {
          sources.push({
            id: `technique-${technique.id}-${index}`,
            url: ref.url || '',
            note: ref.note || '',
            channelName: ref.channelName,
            sourceType: 'technique',
            sourceId: technique.id,
            sourceName: technique.title
          });
        });
      }
    });

    return sources;
  }, [recipes, techniques]);

  const filteredSources = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    if (!lowerQuery) return allSources;
    
    return allSources.filter(s => {
      // חיפוש משופר הכולל את שם הערוץ הידני
      const channelMatch = s.channelName?.toLowerCase().includes(lowerQuery);
      const noteMatch = s.note?.toLowerCase().includes(lowerQuery);
      const sourceNameMatch = s.sourceName?.toLowerCase().includes(lowerQuery);
      const urlMatch = s.url?.toLowerCase().includes(lowerQuery);
      
      return channelMatch || noteMatch || sourceNameMatch || urlMatch;
    });
  }, [allSources, searchQuery]);

  const isYoutube = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('shorts/');
  };

  const getDisplaySource = (url: string) => {
    if (!url) return 'Link';
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return 'External Link';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Source Discovery</h1>
        <p className="text-zinc-500">Explore all references, videos, and links across your culinary lab.</p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-zinc-200 rounded-2xl leading-5 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 sm:text-sm transition-all shadow-sm"
          placeholder="Search by channel name, note, or source..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredSources.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg">No sources found.</p>
          <p className="text-sm mt-2">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSources.map(source => (
            <div key={source.id} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                  {isYoutube(source.url) ? (
                    <Youtube className="w-4 h-4 text-red-500" />
                  ) : (
                    <LinkIcon className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="truncate max-w-[150px]" title={source.channelName || getDisplaySource(source.url)}>
                    {source.channelName || getDisplaySource(source.url)}
                  </span>
                </div>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-900 transition-colors"
                  title="Open Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* הצגת שם הערוץ באופן ברור במידה וקיים (פותר את הקישוריות) */}
              {source.channelName && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  <User className="w-3 h-3" />
                  <span>Channel: {source.channelName}</span>
                </div>
              )}
              
              <p className="text-zinc-700 text-sm mb-4 flex-1 line-clamp-3" title={source.note}>
                {source.note || "No description provided."}
              </p>
              
              <div className="pt-4 border-t border-zinc-100 mt-auto">
                <div className="text-xs text-zinc-500 mb-2">Referenced in:</div>
                <button
                  onClick={() => source.sourceType === 'recipe' ? onSelectRecipe(source.sourceId) : onSelectTechnique(source.sourceId)}
                  className="text-left w-full text-sm font-medium text-zinc-900 hover:text-blue-600 transition-colors truncate"
                  title={source.sourceName}
                >
                  {source.sourceName}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
