import { useState, useRef } from 'react';
import { Technique, ReferenceLink } from '../types';
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Plus, Loader2 } from 'lucide-react';

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
  const [content, setContent] = useState(initialTechnique?.content || '');
  const [tags, setTags] = useState<string[]>(initialTechnique?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | undefined>(initialTechnique?.image_base64);
  const [referenceVideos, setReferenceVideos] = useState<ReferenceLink[]>(initialTechnique?.reference_videos || []);
  const [fetchingVideoIdx, setFetchingVideoIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addReferenceVideo = () => {
    setReferenceVideos([...referenceVideos, { url: '', note: '' }]);
  };

  const updateReferenceVideo = async (index: number, field: keyof ReferenceLink, value: string) => {
    const newVideos = [...referenceVideos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setReferenceVideos(newVideos);

    if (field === 'url' && (value.includes('youtube.com') || value.includes('youtu.be') || value.includes('shorts/'))) {
      setFetchingVideoIdx(index);
      try {
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (data && !data.error) {
          const updatedVideos = [...newVideos];
          updatedVideos[index] = {
            ...updatedVideos[index],
            thumbnailUrl: data.thumbnail_url,
            channelName: data.author_name,
            note: updatedVideos[index].note || data.title || ''
          };
          setReferenceVideos(updatedVideos);
        }
      } catch (e) {
        console.error("Failed to fetch YouTube metadata", e);
      } finally {
        setFetchingVideoIdx(null);
      }
    }
  };

  const removeReferenceVideo = (index: number) => {
    const newVideos = [...referenceVideos];
    newVideos.splice(index, 1);
    setReferenceVideos(newVideos);
  };

  const filteredTags = allTags.filter(t => 
    t.includes(tagInput.toLowerCase()) && !tags.includes(t)
  );

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const addTag = (tag: string) => {
    const newTag = tag.trim().toLowerCase();
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: initialTechnique?.id || Date.now().toString(),
      title: title.trim(),
      overview: overview.trim(),
      content: content.trim(),
      tags,
      image_base64: imageBase64,
      reference_videos: referenceVideos
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
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
            <button
              onClick={() => onDelete(initialTechnique.id)}
              className="p-3 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Image Upload */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-500 mb-3">Technique Image</label>
          {imageBase64 ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video mb-4">
              <img src={imageBase64} alt="Technique" className="w-full h-full object-cover" />
              <button
                onClick={() => setImageBase64(undefined)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 rounded-2xl p-8 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:border-zinc-400 cursor-pointer transition-colors aspect-video"
            >
              <ImageIcon className="w-10 h-10 mb-3 text-zinc-400" />
              <span className="font-medium">Tap to upload image</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold border-b-2 border-zinc-200 focus:border-zinc-900 py-2 focus:outline-none bg-transparent placeholder:text-zinc-300"
            placeholder="e.g., Cold Fermentation"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-zinc-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-zinc-100 text-zinc-800">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setShowTagDropdown(true);
            }}
            onFocus={() => setShowTagDropdown(true)}
            onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
            onKeyDown={handleAddTag}
            className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
            placeholder="Type a tag and press Enter..."
          />
          {showTagDropdown && tagInput && filteredTags.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
              {filteredTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
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

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Overview</label>
          <textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white min-h-[100px]"
            placeholder="Brief summary of the technique..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Guide Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white min-h-[400px] font-mono text-sm leading-relaxed"
            placeholder="# Technique Details&#10;&#10;Explain the science and process here..."
          />
        </div>

        {/* References */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-semibold text-zinc-900">References</label>
            <button
              onClick={addReferenceVideo}
              className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-full"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          
          <div className="space-y-4">
            {referenceVideos.map((video, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                {video.thumbnailUrl && (
                  <div className="w-32 flex-shrink-0 rounded-xl overflow-hidden aspect-video bg-zinc-200">
                    <img src={video.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={video.url}
                      onChange={(e) => updateReferenceVideo(idx, 'url', e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white pr-10"
                      placeholder="URL (YouTube, blog, paper...)"
                    />
                    {fetchingVideoIdx === idx && (
                      <div className="absolute right-3 top-2.5">
                        <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={video.note}
                    onChange={(e) => updateReferenceVideo(idx, 'note', e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                    placeholder="Description (e.g., Main Source, Kneading Technique)"
                  />
                  {video.channelName && (
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Channel: {video.channelName}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeReferenceVideo(idx)}
                  className="p-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {referenceVideos.length === 0 && (
              <p className="text-zinc-500 text-sm italic">No references added.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
