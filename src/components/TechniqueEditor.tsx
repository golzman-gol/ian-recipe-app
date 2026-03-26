import { useState, useRef } from 'react';
import { Technique, ReferenceLink, TechniqueSection } from '../types';
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Plus, Loader2, ChevronDown, ChevronUp, Link as LinkIcon, Youtube } from 'lucide-react';

interface TechniqueEditorProps {
  initialTechnique?: Technique;
  allTags?: string[];
  onSave: (technique: Technique) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function TechniqueEditor({ initialTechnique, allTags = [], onSave, onCancel, onDelete }: TechniqueEditorProps) {
  const [title, setTitle] = useState(initialTechnique?.title || '');
  const [overview, setOverview] = useState(initialTechnique?.overview || '');
  const [tags, setTags] = useState<string[]>(initialTechnique?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | undefined>(initialTechnique?.image_base_64);
  
  const [sections, setSections] = useState<TechniqueSection[]>(initialTechnique?.sections || [
    { id: '1', title: '', content: '', isExpanded: true }
  ]);
  
  const [fetchingVideoId, setFetchingVideoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSection = () => {
    const newSection: TechniqueSection = {
      id: Date.now().toString(),
      title: '',
      content: '',
      isExpanded: true
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<TechniqueSection>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handleSectionImage = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateSection(id, { image_base_64: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const updateSectionVideo = async (sectionId: string, field: keyof ReferenceLink, value: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const currentRef = section.reference || { url: '', note: '' };
    const updatedRef = { ...currentRef, [field]: value };
    updateSection(sectionId, { reference: updatedRef });

    if (field === 'url' && (value.includes('youtube.com') || value.includes('youtu.be') || value.includes('shorts/'))) {
      setFetchingVideoId(sectionId);
      try {
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (data && !data.error) {
          updateSection(sectionId, {
            reference: {
              ...updatedRef,
              thumbnailUrl: data.thumbnail_url,
              channelName: updatedRef.channelName || data.author_name,
              note: updatedRef.note || data.title || ''
            }
          });
        }
      } catch (e) {
        console.error("Failed to fetch metadata", e);
      } finally {
        setFetchingVideoId(null);
      }
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: initialTechnique?.id || Date.now().toString(),
      title: title.trim(),
      overview: overview.trim(),
      content: '',
      tags,
      image_base_64: imageBase64,
      sections: sections
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors">
            <ArrowLeft className="w-7 h-7 text-zinc-900" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {initialTechnique ? 'Edit Technique' : 'New Technique'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {initialTechnique && onDelete && (
            <button onClick={() => onDelete(initialTechnique.id)} className="p-3 text-red-600 hover:bg-red-50 rounded-full">
              <Trash2 className="w-6 h-6" />
            </button>
          )}
          <button onClick={handleSave} disabled={!title.trim()} className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full font-bold hover:bg-zinc-800">
            <Save className="w-5 h-5" /> Save
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="aspect-video relative rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {imageBase64 ? (
              <img src={imageBase64} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center"><ImageIcon className="w-10 h-10 mx-auto text-zinc-300 mb-2" /><span className="text-sm font-medium text-zinc-400">Main Technique Image</span></div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-3xl font-bold border-b border-zinc-100 py-2 focus:border-zinc-900 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Overview</label>
            <textarea value={overview} onChange={(e) => setOverview(e.target.value)} className="w-full border border-zinc-100 rounded-2xl p-4 bg-zinc-50 min-h-[100px]" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Guide Sections</h2>
            <button onClick={addSection} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 rounded-full text-sm font-bold">
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>

          {sections.map((section, idx) => (
            <div key={section.id} className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 bg-zinc-50 border-b">
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => updateSection(section.id, { isExpanded: !section.isExpanded })}>
                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                  <input type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} onClick={(e) => e.stopPropagation()} className="bg-transparent font-bold text-zinc-900 outline-none flex-1" placeholder="Section Title" />
                  {section.isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
                <button onClick={() => removeSection(section.id)} className="p-2 text-zinc-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
              </div>

              {section.isExpanded && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <textarea value={section.content} onChange={(e) => updateSection(section.id, { content: e.target.value })} className="w-full border rounded-2xl p-4 bg-zinc-50 min-h-[250px] font-mono text-sm" placeholder="Content (Markdown)" />
                    <div className="space-y-6">
                      <div className="aspect-video relative rounded-xl overflow-hidden border bg-zinc-50 flex items-center justify-center cursor-pointer" onClick={() => document.getElementById(`file-${section.id}`)?.click()}>
                        {section.image_base_64 ? <img src={section.image_base_64} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-zinc-200" />}
                        <input type="file" id={`file-${section.id}`} onChange={(e) => handleSectionImage(section.id, e)} className="hidden" accept="image/*" />
                      </div>
                      <div className="p-4 bg-zinc-50 rounded-2xl border space-y-3">
                        <input type="text" value={section.reference?.url || ''} onChange={(e) => updateSectionVideo(section.id, 'url', e.target.value)} className="w-full text-xs border rounded-lg p-2.5" placeholder="Reference URL" />
                        <input type="text" value={section.reference?.channelName || ''} onChange={(e) => updateSectionVideo(section.id, 'channelName', e.target.value)} className="w-full text-xs border rounded-lg p-2.5" placeholder="Channel Name" />
                        <input type="text" value={section.reference?.note || ''} onChange={(e) => updateSectionVideo(section.id, 'note', e.target.value)} className="w-full text-xs border rounded-lg p-2.5" placeholder="Note" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
