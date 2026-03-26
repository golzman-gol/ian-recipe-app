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

    // 1. מקורות מתוך מתכונים
    recipes.forEach(recipe => {
      if (recipe.reference_videos) {
        recipe.reference_videos.forEach((ref, index) => {
          sources.push({
            id: `recipe-${recipe.id}-${index}`,
            url: ref.url || '',
            note: ref.note || '',
            channelName: ref.channelName,
            sourceType: 'recipe',
            sourceId: recipe.id,
            sourceName: recipe.name
          });
        });
      }
    });

    // 2. מקורות מתוך טכניקות (גם כלליים וגם בתוך צ'אנקים)
    techniques.forEach(technique => {
      // רפרנסים כלליים
      if (technique.reference_videos) {
        technique.reference_videos.forEach((ref, index) => {
          sources.push({
            id: `tech-gen-${technique.id}-${index}`,
            url: ref.url || '',
            note: ref.note || '',
            channelName: ref.channelName,
            sourceType: 'technique',
            sourceId: technique.id,
            sourceName: technique.title
          });
        });
      }

      // רפרנסים בתוך צ'אנקים (Sections)
      if (technique.sections) {
        technique.sections.forEach(section => {
          if (section.references) {
            section.references.forEach((ref, refIndex) => {
              sources.push({
                id: `tech-sec-${technique.id}-${section.id}-${refIndex}`,
                url: ref.url || '',
                note: ref.note || (section.title ? `Part of: ${section.title}` : ''),
                channelName: ref.channelName,
                sourceType: 'technique',
                sourceId: technique.id,
                sourceName: `${technique.title} > ${section.title || 'Section'}`
              });
            });
          }
        });
      }
    });

    return sources;
  }, [recipes, techniques]);

  const filteredSources = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    if (!lowerQuery) return allSources;
    
    return allSources.filter(s => {
      const channelMatch = s.channelName?.toLowerCase().includes(lowerQuery);
      const noteMatch = s.note?.toLowerCase().includes(lowerQuery);
      const sourceNameMatch = s.sourceName?.toLowerCase().includes(lowerQuery);
      const urlMatch = s.url?.toLowerCase().includes(lowerQuery);
      return channelMatch || noteMatch || sourceNameMatch || urlMatch;
    });
  }, [allSources, searchQuery]);

  const getDisplaySource = (url: string) => {
    if (!url) return 'Link';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch { return 'External Link'; }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-8"><ArrowLeft className="w-5 h-5" /><span>Back</span></button>
      <div className="mb-8"><h1 className="text-3xl font-bold text-zinc-900">Source Discovery</h1></div>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
        <input type="text" className="block w-full pl-10 pr-3 py-3 border border-zinc-200 rounded-2xl bg-white focus:ring-2 focus:ring-zinc-900 outline-none shadow-sm" placeholder="Search by channel, note, or recipe..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSources.map(source => (
          <div key={source.id} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                {source.url.includes('youtube') ? <Youtube className="w-4 h-4 text-red-500" /> : <LinkIcon className="w-4 h-4 text-blue-500" />}
                <span className="truncate max-w-[150px]">{source.channelName || getDisplaySource(source.url)}</span>
              </div>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 transition-colors"><ExternalLink className="w-4 h-4" /></a>
            </div>
            {source.channelName && <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2"><User className="w-3 h-3" /><span>Channel: {source.channelName}</span></div>}
            <p className="text-zinc-700 text-sm mb-4 flex-1 line-clamp-3">{source.note || "No description."}</p>
            <div className="pt-4 border-t border-zinc-100 mt-auto">
              <div className="text-xs text-zinc-500 mb-2">In:</div>
              <button onClick={() => source.sourceType === 'recipe' ? onSelectRecipe(source.sourceId) : onSelectTechnique(source.sourceId)} className="text-left w-full text-sm font-medium text-zinc-900 hover:text-blue-600 transition-colors truncate">{source.sourceName}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
