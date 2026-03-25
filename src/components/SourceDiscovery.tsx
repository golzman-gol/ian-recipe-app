import { useState } from 'react';
import { Technique } from '../types';
import { ArrowLeft, BookOpen, Globe, Search } from 'lucide-react';

interface SourceDiscoveryProps {
  techniques: Technique[];
  onBack: () => void;
  onSelectTechnique: (id: string) => void;
}

export function SourceDiscovery({ techniques, onBack, onSelectTechnique }: SourceDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTechniques = techniques.filter(tech => 
    tech.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack} 
          className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-7 h-7 text-zinc-900" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
          <Globe className="w-8 h-8 text-zinc-400" />
          Source Discovery
        </h1>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-zinc-200 rounded-2xl bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm"
          placeholder="Search techniques or sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredTechniques.map(tech => (
          <div
            key={tech.id}
            onClick={() => onSelectTechnique(tech.id)}
            className="border border-zinc-200 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] bg-white flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <BookOpen className="w-4 h-4" /> Technique
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">{tech.title}</h3>
            <p className="text-sm text-zinc-600 line-clamp-2 flex-1">{tech.overview}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {tech.tags?.map(tag => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
        {filteredTechniques.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500 italic">
            No techniques found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
