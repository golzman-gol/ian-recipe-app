import { useState } from 'react';
import { Technique } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

interface TechniqueEditorProps {
  initialTechnique?: Technique;
  allTags?: string[];
  onSave: (technique: Technique) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function TechniqueEditor({ initialTechnique, onSave, onCancel }: TechniqueEditorProps) {
  const [title, setTitle] = useState(initialTechnique?.title || '');
  const [content, setContent] = useState(initialTechnique?.content || '');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onCancel} className="p-3 -ml-3"><ArrowLeft className="w-7 h-7 text-zinc-900" /></button>
        <button onClick={() => onSave({ ...initialTechnique, id: initialTechnique?.id || Date.now().toString(), title, content, overview: '', tags: [] })} className="bg-zinc-900 text-white px-6 py-2 rounded-full font-medium"><Save className="w-5 h-5 mr-2 inline" /> Save Technique</button>
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} className="w-full text-2xl font-bold border-b mb-8 outline-none" placeholder="Technique Title" />
      <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full border rounded-xl p-4 min-h-[300px]" placeholder="Explain the process here..." />
    </div>
  );
}
