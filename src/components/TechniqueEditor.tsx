import { useState, useRef } from 'react';
import { Technique, ReferenceLink, TechniqueSection } from '../types';
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Plus, Loader2, ChevronDown, ChevronUp, Link as LinkIcon, Youtube, X } from 'lucide-react';

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
  const [imageBase64, setImageBase64] = useState<string | undefined>(initialTechnique?.image_base_64);
  
  const [sections, setSections] = useState<TechniqueSection[]>(initialTechnique?.sections || [
    { id: '1', title: '', content: '', isExpanded: true, references: [] }
  ]);
  
  const [fetchingVideoKey, setFetchingVideoKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSection = (id: string, updates: Partial<TechniqueSection>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // לוגיקת מקורות מידע מרובים לצ'אנק
  const addSectionReference = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const currentRefs = section.references || [];
    updateSection(sectionId, { references: [...currentRefs, { url: '', note: '', channelName: '' }] });
  };

  const removeSectionReference = (sectionId: string, refIndex: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const currentRefs = [...(section.references || [])];
    currentRefs.splice(refIndex, 1);
    updateSection(sectionId, { references: currentRefs });
  };

  const updateSectionReference = async (sectionId: string, refIndex: number, field: keyof ReferenceLink, value: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const currentRefs = [...(section.references || [])];
    currentRefs[refIndex] = { ...currentRefs[refIndex], [field]: value };
    updateSection(sectionId, { references: currentRefs });

    if (field === 'url' && (value.includes('youtube.com') || value.includes('youtu.be') || value.includes('shorts/'))) {
      const fetchKey = `${sectionId}-${refIndex}`;
      setFetchingVideoKey(fetchKey);
      try {
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (data && !data.error) {
          const updatedRefs = [...currentRefs];
          updatedRefs[refIndex] = {
            ...updatedRefs[refIndex],
            thumbnailUrl: data.thumbnail_url,
            channelName: updatedRefs[refIndex].channelName || data.author_name,
            note: updatedRefs[refIndex].note || data.title || ''
          };
          updateSection(sectionId, { references: updatedRefs });
        }
      } catch (e) { console.error(e); } finally { setFetchingVideoKey(null); }
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
          <button onClick={onCancel} className="p-3 -ml-3 rounded-full hover:bg-zinc-100"><ArrowLeft className="w-7 h-7" /></button>
          <h1 className="text-3xl font-bold">{initialTechnique ? 'Edit Technique' : 'New Technique'}</h1>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full font-bold shadow-lg active:scale-95">
          <Save className="w-5 h-5" /> Save
        </button>
      </div>

      <div className="space-y-8">
        {/* Main Technique Image */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
          <div className="aspect-video relative rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {imageBase64 ? (
              <>
                <img src={imageBase64} className="w-full h-full object-cover" />
                <button onClick={(e) => { e.stopPropagation(); setImageBase64(undefined); }} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 backdrop-blur-md transition-colors"><Trash2 className="w-5 h-5" /></button>
              </>
            ) : (
              <div className="text-center text-zinc-400"><ImageIcon className="w-10 h-10 mx-auto mb-2" /><span>Main Image</span></div>
            )}
            <input type="file" ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImageBase64(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} className="hidden" accept="image/*" />
          </div>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-3xl font-bold border-b py-2 outline-none" placeholder="Title" />
          <textarea value={overview} onChange={(e) => setOverview(e.target.value)} className="w-full border rounded-2xl p-4 bg-zinc-50 outline-none min-h-[100px]" placeholder="Context..." />
        </div>

        {/* Sections Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Guide Sections</h2><button onClick={() => setSections([...sections, { id: Date.now().toString(), title: '', content: '', isExpanded: true, references: [] }])} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full text-sm font-bold"><Plus className="w-4 h-4" /> Add Section</button></div>

          {sections.map((section, idx) => (
            <div key={section.id} className="bg-white border rounded-3xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 bg-zinc-50 border-b">
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => updateSection(section.id, { isExpanded: !section.isExpanded })}>
                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                  <input type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} onClick={(e) => e.stopPropagation()} className="bg-transparent font-bold outline-none flex-1" placeholder="Section Title" />
                  {section.isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </div>
                <button onClick={() => setSections(sections.filter(s => s.id !== section.id))} className="p-2 text-zinc-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
              </div>

              {section.isExpanded && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <textarea value={section.content} onChange={(e) => updateSection(section.id, { content: e.target.value })} className="w-full border rounded-2xl p-4 bg-zinc-50 min-h-[250px] font-mono text-sm" placeholder="Markdown Content" />
                    
                    <div className="space-y-6">
                      {/* Section Image with Delete Button */}
                      <div className="aspect-video relative rounded-xl overflow-hidden border bg-zinc-50 flex items-center justify-center cursor-pointer" onClick={() => document.getElementById(`file-${section.id}`)?.click()}>
                        {section.image_base_64 ? (
                          <>
                            <img src={section.image_base_64} className="w-full h-full object-cover" />
                            <button onClick={(e) => { e.stopPropagation(); updateSection(section.id, { image_base_64: undefined }); }} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-zinc-200" />
                        )}
                        <input type="file" id={`file-${section.id}`} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => updateSection(section.id, { image_base_64: reader.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} className="hidden" accept="image/*" />
                      </div>

                      {/* Multiple References Logic */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between"><label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Section Sources</label><button onClick={() => addSectionReference(section.id)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-600"><Plus className="w-4 h-4" /></button></div>
                        {(section.references || []).map((ref, rIdx) => (
                          <div key={rIdx} className="p-3 bg-zinc-50 rounded-xl border space-y-2 relative group">
                            <button onClick={() => removeSectionReference(section.id, rIdx)} className="absolute -top-2 -right-2 p-1 bg-white border rounded-full text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                            <div className="relative">
                              <input type="text" value={ref.url} onChange={(e) => updateSectionReference(section.id, rIdx, 'url', e.target.value)} className="w-full text-[10px] border rounded p-1.5" placeholder="URL" />
                              {fetchingVideoKey === `${section.id}-${rIdx}` && <Loader2 className="absolute right-2 top-1.5 w-3 h-3 animate-spin text-zinc-400" />}
                            </div>
                            <input type="text" value={ref.channelName || ''} onChange={(e) => updateSectionReference(section.id, rIdx, 'channelName', e.target.value)} className="w-full text-[10px] border rounded p-1.5" placeholder="Channel" />
                            <input type="text" value={ref.note || ''} onChange={(e) => updateSectionReference(section.id, rIdx, 'note', e.target.value)} className="w-full text-[10px] border rounded p-1.5" placeholder="Note" />
                          </div>
                        ))}
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
