import { useState, useMemo } from 'react';
import { Recipe, Technique } from '../types';
import { Search, Plus, ChefHat, BookOpen, Utensils, Globe, Download, Upload } from 'lucide-react';
import { useRef } from 'react';

interface HomeProps {
  recipes: Recipe[];
  techniques: Technique[];
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
  onSelectRecipe: (id: string) => void;
  onSelectTechnique: (id: string) => void;
  onAddRecipe: () => void;
  onAddTechnique: () => void;
  onGoToSourceDiscovery: () => void;
  onImportData: (recipes: Recipe[], techniques: Technique[]) => void;
}

export function Home({ 
  recipes, 
  techniques, 
  selectedTags,
  onSelectedTagsChange,
  onSelectRecipe, 
  onSelectTechnique,
  onAddRecipe,
  onAddTechnique,
  onGoToSourceDiscovery,
  onImportData
}: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'recipes' | 'techniques'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    const data = { recipes, techniques };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'culinary-lab-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.recipes && data.techniques) {
          onImportData(data.recipes, data.techniques);
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file format. Expected recipes and techniques.');
        }
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    recipes.forEach(r => r.tags?.forEach(t => tags.add(t.toLowerCase())));
    techniques.forEach(t => t.tags?.forEach(t => tags.add(t.toLowerCase())));
    return Array.from(tags).sort();
  }, [recipes, techniques]);

  const filteredTags = allTags.filter(t => 
    t.includes(searchQuery.toLowerCase()) && !selectedTags.includes(t)
  );

  const filteredItems = useMemo(() => {
    let items: Array<{ type: 'recipe' | 'technique', item: Recipe | Technique }> = [];
    
    if (contentTypeFilter === 'all' || contentTypeFilter === 'recipes') {
      items.push(...recipes.map(r => ({ type: 'recipe' as const, item: r })));
    }
    if (contentTypeFilter === 'all' || contentTypeFilter === 'techniques') {
      items.push(...techniques.map(t => ({ type: 'technique' as const, item: t })));
    }

    return items.filter(({ item }) => {
      const name = 'name' in item ? item.name : item.title;
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => item.tags?.map(t => t.toLowerCase()).includes(tag));
      
      return matchesSearch && matchesTags;
    }).sort((a, b) => {
      const nameA = 'name' in a.item ? a.item.name : a.item.title;
      const nameB = 'name' in b.item ? b.item.name : b.item.title;
      return nameA.localeCompare(nameB);
    });
  }, [recipes, techniques, searchQuery, selectedTags, contentTypeFilter]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onSelectedTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onSelectedTagsChange([...selectedTags, tag]);
    }
    setSearchQuery('');
    setShowTagDropdown(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 text-zinc-900">
          <ChefHat className="w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tight">Ian's Kitchen</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportData}
            className="bg-zinc-100 text-zinc-900 px-3 py-2 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 font-medium text-sm"
            title="Export All Data"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-zinc-100 text-zinc-900 px-3 py-2 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 font-medium text-sm"
            title="Import Data"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportData}
            className="hidden"
          />
          <button
            onClick={onGoToSourceDiscovery}
            className="bg-zinc-100 text-zinc-900 px-3 py-2 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 font-medium text-sm"
            title="Source Discovery"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Sources</span>
          </button>
          <button
            onClick={onAddTechnique}
            className="bg-zinc-100 text-zinc-900 px-3 py-2 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 font-medium text-sm"
            aria-label="Add Technique"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">New Technique</span>
          </button>
          <button
            onClick={onAddRecipe}
            className="bg-zinc-900 text-white px-3 py-2 rounded-full hover:bg-zinc-800 transition-colors flex items-center gap-2 font-medium text-sm"
            aria-label="Add Recipe"
          >
            <Utensils className="w-4 h-4" />
            <span className="hidden sm:inline">New Recipe</span>
          </button>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-zinc-200 rounded-2xl leading-5 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 sm:text-sm transition-all shadow-sm"
          placeholder="Search or filter by tags..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowTagDropdown(true);
          }}
          onFocus={() => setShowTagDropdown(true)}
          onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
        />
        
        {showTagDropdown && searchQuery && filteredTags.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
            {filteredTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="w-full text-left px-4 py-3 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none first:rounded-t-2xl last:rounded-b-2xl"
              >
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                  {tag}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        <button
          onClick={() => setContentTypeFilter('all')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            contentTypeFilter === 'all' 
              ? 'bg-zinc-900 text-white shadow-sm' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          All Content
        </button>
        <button
          onClick={() => setContentTypeFilter('recipes')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            contentTypeFilter === 'recipes' 
              ? 'bg-zinc-900 text-white shadow-sm' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Recipes
        </button>
        <button
          onClick={() => setContentTypeFilter('techniques')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            contentTypeFilter === 'techniques' 
              ? 'bg-zinc-900 text-white shadow-sm' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Techniques
        </button>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {selectedTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
            >
              {tag}
              <span className="text-zinc-400 hover:text-white">&times;</span>
            </button>
          ))}
          <button
            onClick={() => onSelectedTagsChange([])}
            className="text-sm text-zinc-500 hover:text-zinc-900 underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg">No items found.</p>
          <p className="text-sm mt-2">Try adjusting your search or add a new recipe/technique.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredItems.map(({ type, item }) => (
            <div
              key={`${type}-${item.id}`}
              onClick={() => type === 'recipe' ? onSelectRecipe(item.id) : onSelectTechnique(item.id)}
              className={`border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col ${
                type === 'recipe' ? 'bg-white border-zinc-200' : 'bg-zinc-50 border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                {type === 'recipe' ? (
                  <><Utensils className="w-4 h-4" /> Recipe</>
                ) : (
                  <><BookOpen className="w-4 h-4" /> Technique</>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                  {'name' in item ? item.name : item.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200/50 text-zinc-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {item.image_base64 && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-3 border border-zinc-200">
                    <img src={item.image_base64} alt={'name' in item ? item.name : item.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              {type === 'recipe' && (
                <div className="text-sm text-zinc-500 flex justify-between items-center mt-4 pt-4 border-t border-zinc-100">
                  <span>{(item as Recipe).ingredients.length} ingredients</span>
                  <span>{(item as Recipe).servings_base} servings</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
