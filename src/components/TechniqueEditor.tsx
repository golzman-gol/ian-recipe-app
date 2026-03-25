import { useState } from 'react';
import { Technique } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

interface TechniqueEditorProps {
  initialTechnique?: Technique;
  onSave: (technique: Technique) => void;
  onCancel: () => void;
}

export function TechniqueEditor({ initialTechnique, onSave, onCancel }: TechniqueEditorProps) {
  const [title, setTitle] = useState(initialTechnique?.title || '');
  const [content, setContent] = useState(initialTechnique?.content || '');
  const [overview, setOverview] = useState(initialTechnique?.overview || '');

  const handleSave = () => {
    if (!title.trim()) return;
    
    const updatedTechnique: Technique = {
      ...initialTechnique,
      id: initialTechnique?.id || Date.now().toString(),
      title: title.trim(),
      overview: overview.trim(),
      content: content.trim(),
      tags: initialTechnique?.tags || [],
      reference_videos: initialTechnique?.reference_videos || [],
      process_images: initialTechnique?.process_images || []
    };
    
    onSave(updatedTechnique);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors">
            <ArrowLeft className="w-7 h-7 text-zinc-900" />
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">
            {initialTechnique ? 'Edit Technique' : 'New Technique'}
          </h1>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full font-medium shadow-sm active:scale-95 transition-all"
        >
          <Save className="w-5 h-5" /> Save
        </button>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-500 mb-2 uppercase tracking-wider text-[10px]">Title</label>
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full text-2xl font-bold border-b-2 border-zinc-100 focus:border-zinc-900 outline-none py-2 bg-transparent transition-colors" 
            placeholder="Technique Name..." 
          />
        </div>

        {/* Overview */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-500 mb-2 uppercase tracking-wider text-[10px]">Quick Summary</label>
          <input 
            value={overview} 
            onChange={e => setOverview(e.target.value)} 
            className="w-full border-b border-zinc-100 py-2 focus:border-zinc-900 outline-none bg-transparent transition-colors" 
            placeholder="A short sentence about this technique..." 
          />
        </div>

        {/* Content */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-500 mb-2 uppercase tracking-wider text-[10px]">Detailed Guide (Markdown)</label>
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            className="w-full border border-zinc-100 rounded-2xl p-4 min-h-[400px] focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50 font-mono text-sm leading-relaxed" 
            placeholder="Explain the process step by step..." 
          />
        </div>
      </div>
    </div>
  );
}
