import React, { useState, useRef, useEffect } from 'react';
import { Recipe, Ingredient, ReferenceLink, Technique, ProcessImage, LinkedTechnique } from '../types';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, ChevronDown, ChevronRight, Loader2, ArrowUp, ArrowDown, Layout, Users } from 'lucide-react';

interface RecipeEditorProps {
  initialRecipe: Recipe;
  techniques: Technique[];
  recipes: Recipe[];
  allTags?: string[];
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
  isEditMode: boolean;
}

export function RecipeEditor({ initialRecipe, techniques, recipes, allTags = [], onSave, onCancel, isEditMode }: RecipeEditorProps) {
  const [recipe, setRecipe] = useState<Recipe>(() => {
    if (isEditMode && !initialRecipe.original_ingredients && !initialRecipe.original_steps) {
      return {
        ...initialRecipe,
        original_ingredients: [...initialRecipe.ingredients],
        original_steps: [...initialRecipe.steps],
      };
    }
    return initialRecipe;
  });

  const [yieldType, setYieldType] = useState<'servings' | 'pan'>((recipe as any).yield_type || 'servings');
  const [tags, setTags] = useState<string[]>(recipe.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  // ניהול ניווט מקלדת לטאגים
  const [activeTagIndex, setActiveTagIndex] = useState(-1);
  
  const filteredTags = allTags.filter(t => 
    t.includes(tagInput.toLowerCase()) && !tags.includes(t)
  );

  // איפוס אינדקס כשהקלט משתנה
  useEffect(() => {
    setActiveTagIndex(-1);
  }, [tagInput]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (!showTagDropdown || filteredTags.length === 0) {
      if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        addTag(tagInput);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveTagIndex(prev => (prev < filteredTags.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveTagIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeTagIndex >= 0) {
        addTag(filteredTags[activeTagIndex]);
      } else if (tagInput.trim()) {
        addTag(tagInput);
      }
    } else if (e.key === 'Escape') {
      setShowTagDropdown(false);
    }
  };

  const addTag = (tag: string) => {
    const newTag = tag.trim().toLowerCase();
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
    setShowTagDropdown(false);
    setActiveTagIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const [showTechniquesDropdown, setShowTechniquesDropdown] = useState(false);
  const [techniqueSearch, setTechniqueSearch] = useState('');
  
  // ניהול ניווט מקלדת לטכניקות
  const [activeTechIndex, setActiveTechIndex] = useState(-1);
  
  const filteredTechniques = techniques.filter(t => 
    t.title.toLowerCase().includes(techniqueSearch.toLowerCase()) && 
    !(recipe.linkedTechniques || []).some(link => 
      typeof link === 'string' ? link === t.id : link.techniqueId === t.id
    )
  );

  // איפוס אינדקס כשהחיפוש משתנה
  useEffect(() => {
    setActiveTechIndex(-1);
  }, [techniqueSearch]);

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (!showTechniquesDropdown || filteredTechniques.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveTechIndex(prev => (prev < filteredTechniques.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveTechIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeTechIndex >= 0) {
        const tech = filteredTechniques[activeTechIndex];
        toggleLinkedTechnique(tech.id);
        setTechniqueSearch('');
        setShowTechniquesDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowTechniquesDropdown(false);
    }
  };
  
  const [scaleMultiplier, setScaleMultiplier] = useState<string>('1');
  const [fetchingVideoIdx, setFetchingVideoIdx] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processImagesInputRef = useRef<HTMLInputElement>(null);

  const applyScale = () => {
    const multiplier = parseFloat(scaleMultiplier);
    if (isNaN(multiplier) || multiplier <= 0) return;

    const newIngredients = recipe.ingredients.map(ing => ({
      ...ing,
      amount: Number((ing.amount * multiplier).toFixed(2))
    }));

    const currentYield = String(recipe.servings_base);
    const numericYield = parseFloat(currentYield);
    let newYield: any = recipe.servings_base;
    
    if (!isNaN(numericYield) && /^\d*\.?\d+$/.test(currentYield)) {
      newYield = Math.round(numericYield * multiplier);
    }

    setRecipe({
      ...recipe,
      servings_base: newYield,
      ingredients: newIngredients
    });
    setScaleMultiplier('1');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecipe({ ...recipe, image_base64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const readers = files.map(file => {
        return new Promise<ProcessImage>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ url: reader.result as string, caption: '' });
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(newImages => {
        const currentImages = (recipe.process_images || []).map(img => 
          typeof img === 'string' ? { url: img, caption: '' } : img
        );
        setRecipe({ 
          ...recipe, 
          process_images: [...currentImages, ...newImages] 
        });
      });
    }
  };

  const removeProcessImage = (index: number) => {
    const newImages = [...(recipe.process_images || [])];
    newImages.splice(index, 1);
    setRecipe({ ...recipe, process_images: newImages });
  };

  const updateProcessImageCaption = (index: number, caption: string) => {
    const newImages = [...(recipe.process_images || [])].map(img => 
      typeof img === 'string' ? { url: img, caption: '' } : img
    );
    newImages[index] = { ...newImages[index], caption };
    setRecipe({ ...recipe, process_images: newImages });
  };

  const handleSave = () => {
    const finalRecipe = { 
      ...recipe, 
      tags,
      yield_type: yieldType
    };
    onSave(finalRecipe as Recipe);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const moveIngredientUp = (index: number) => {
    if (index === 0) return;
    const newIngredients = [...recipe.ingredients];
    const temp = newIngredients[index - 1];
    newIngredients[index - 1] = newIngredients[index];
    newIngredients[index] = temp;
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const moveIngredientDown = (index: number) => {
    if (index === recipe.ingredients.length - 1) return;
    const newIngredients = [...recipe.ingredients];
    const temp = newIngredients[index + 1];
    newIngredients[index + 1] = newIngredients[index];
    newIngredients[index] = temp;
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { item: '', amount: 1, unit: '' }],
    });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...recipe.steps];
    newSteps[index] = value;
    setRecipe({ ...recipe, steps: newSteps });
  };

  const addStep = () => {
    setRecipe({ ...recipe, steps: [...recipe.steps, ''] });
  };

  const insertStep = (index: number) => {
    const newSteps = [...recipe.steps];
    newSteps.splice(index, 0, '');
    setRecipe({ ...recipe, steps: newSteps });
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...recipe.steps];
    const temp = newSteps[index - 1];
    newSteps[index - 1] = newSteps[index];
    newSteps[index] = temp;
    setRecipe({ ...recipe, steps: newSteps });
  };

  const moveStepDown = (index: number) => {
    if (index === recipe.steps.length - 1) return;
    const newSteps = [...recipe.steps];
    const temp = newSteps[index + 1];
    newSteps[index + 1] = newSteps[index];
    newSteps[index] = temp;
    setRecipe({ ...recipe, steps: newSteps });
  };

  const removeStep = (index: number) => {
    const newSteps = [...recipe.steps];
    newSteps.splice(index, 1);
    setRecipe({ ...recipe, steps: newSteps });
  };

  const addReferenceVideo = () => {
    setRecipe({
      ...recipe,
      reference_videos: [...(recipe.reference_videos || []), { url: '', note: '', channelName: '' }]
    });
  };

  const updateReferenceVideo = async (index: number, field: keyof ReferenceLink, value: string) => {
    const newVideos = [...(recipe.reference_videos || [])];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setRecipe({ ...recipe, reference_videos: newVideos });

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
            channelName: updatedVideos[index].channelName || data.author_name,
            note: updatedVideos[index].note || data.title || ''
          };
          setRecipe({ ...recipe, reference_videos: updatedVideos });
        }
      } catch (e) {
        console.error("Failed to fetch YouTube metadata", e);
      } finally {
        setFetchingVideoIdx(null);
      }
    }
  };

  const removeReferenceVideo = (index: number) => {
    const newVideos = [...(recipe.reference_videos || [])];
    newVideos.splice(index, 1);
    setRecipe({ ...recipe, reference_videos: newVideos });
  };

  const toggleLinkedTechnique = (techniqueId: string) => {
    const current = recipe.linkedTechniques || [];
    const exists = current.some(link => 
      typeof link === 'string' ? link === techniqueId : link.techniqueId === techniqueId
    );

    if (exists) {
      setRecipe({ 
        ...recipe, 
        linkedTechniques: current.filter(link => 
          typeof link === 'string' ? link !== techniqueId : link.techniqueId !== techniqueId
        ) 
      });
    } else {
      setRecipe({ ...recipe, linkedTechniques: [...current, { techniqueId }] });
    }
  };

  const updateLinkedTechniqueSection = (techniqueId: string, sectionId: string | undefined) => {
    const current = [...(recipe.linkedTechniques || [])];
    const index = current.findIndex(link => 
      typeof link === 'string' ? link === techniqueId : link.techniqueId === techniqueId
    );

    if (index !== -1) {
      current[index] = { techniqueId, sectionId };
      setRecipe({ ...recipe, linkedTechniques: current });
    }
  };

  const hasOriginal = recipe.original_ingredients || recipe.original_steps;
  const currentImage = recipe.image_base64;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32 rtl text-right" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onCancel}
          className="p-3 -ml-3 rounded-full hover:bg-zinc-100 transition-colors"
          aria-label="חזרה"
        >
          <ArrowLeft className="w-7 h-7 text-zinc-900 rotate-180" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {isEditMode ? 'עריכת מתכון' : 'בדיקת מתכון'}
        </h1>
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Image Upload */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-500 mb-3">תמונת המתכון</label>
          {currentImage ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video mb-4">
              <img src={currentImage} alt="Recipe" className="w-full h-full object-cover" />
              <button
                onClick={() => setRecipe({ ...recipe, image_base64: undefined })}
                className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
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
              <span className="font-medium">לחץ להעלאת תמונה</span>
            </div>
          )}
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Original Source (Archive) */}
        {isEditMode && hasOriginal && (
          <div className="bg-zinc-100 border border-zinc-200 rounded-3xl overflow-hidden">
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="w-full flex items-center justify-between p-5 text-right font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              <span>מקור (ארכיון)</span>
              {showOriginal ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 rotate-180" />}
            </button>
            {showOriginal && (
              <div className="p-5 pt-0 border-t border-zinc-200/50">
                <div className="mb-6 mt-4">
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">מרכיבים מקוריים</h4>
                  <ul className="space-y-2">
                    {recipe.original_ingredients?.map((ing, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-zinc-600">
                        <span className="font-mono w-12 text-left">{ing.amount}</span>
                        <span className="w-16">{ing.unit}</span>
                        <span>{ing.item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">שלבים מקוריים</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {recipe.original_steps?.map((step, idx) => (
                      <li key={idx} className="text-sm text-zinc-600 pr-2">
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-500 mb-2">שם המתכון</label>
            <input
              type="text"
              value={recipe.name}
              onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 font-medium text-lg bg-zinc-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-2">טכניקות מקושרות</label>
              <div className="relative">
                <div className="flex flex-wrap gap-3 mb-3">
                  {(recipe.linkedTechniques || []).map(link => {
                    const id = typeof link === 'string' ? link : link.techniqueId;
                    const sectionId = typeof link === 'string' ? undefined : link.sectionId;
                    const tech = techniques.find(t => t.id === id);
                    
                    return tech ? (
                      <div key={id} className="flex flex-col p-3 rounded-2xl bg-zinc-900 text-white min-w-[150px]">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-bold">{tech.title}</span>
                          <button onClick={() => toggleLinkedTechnique(id)} className="text-zinc-500 hover:text-white transition-colors">&times;</button>
                        </div>
                        
                        {tech.sections && tech.sections.length > 0 && (
                          <select
                            value={sectionId || ''}
                            onChange={(e) => updateLinkedTechniqueSection(id, e.target.value || undefined)}
                            className="mt-2 block w-full text-[10px] bg-zinc-800 border-none rounded-lg text-zinc-300 focus:ring-0 cursor-pointer p-1.5"
                          >
                            <option value="">-- כללי (ללא סעיף) --</option>
                            {tech.sections.map(s => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
                <input
                  type="text"
                  value={techniqueSearch}
                  onChange={(e) => { setTechniqueSearch(e.target.value); setShowTechniquesDropdown(true); }}
                  onFocus={() => setShowTechniquesDropdown(true)}
                  onBlur={() => setTimeout(() => { setShowTechniquesDropdown(false); setActiveTechIndex(-1); }, 200)}
                  onKeyDown={handleTechKeyDown}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-zinc-50"
                  placeholder="חפש והוסף טכניקות..."
                />
                {showTechniquesDropdown && filteredTechniques.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredTechniques.map((tech, index) => (
                      <button
                        key={tech.id}
                        onMouseEnter={() => setActiveTechIndex(index)}
                        onClick={() => { toggleLinkedTechnique(tech.id); setTechniqueSearch(''); setShowTechniquesDropdown(false); }}
                        className={`w-full text-right px-4 py-3 focus:outline-none first:rounded-t-2xl last:rounded-b-2xl transition-colors ${activeTechIndex === index ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                      >
                        <span className="text-sm font-medium text-zinc-900">{tech.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-500 mb-2">כמות / גודל תבנית</label>
            <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setYieldType('servings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${yieldType === 'servings' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
              >
                <Users className="w-4 h-4" /> מנות
              </button>
              <button
                type="button"
                onClick={() => setYieldType('pan')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${yieldType === 'pan' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
              >
                <Layout className="w-4 h-4" /> גודל תבנית
              </button>
            </div>
            <input
              type="text"
              value={recipe.servings_base}
              onChange={(e) => setRecipe({ ...recipe, servings_base: e.target.value as any })}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-zinc-50 font-medium"
              placeholder={yieldType === 'servings' ? "למשל: 4 מנות, סיר בינוני..." : "למשל: 24x32, תבנית קפיצית 26..."}
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-zinc-500 mb-2">תגיות</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-900 text-white">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-zinc-400 hover:text-white mr-1">&times;</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => { setTagInput(e.target.value); setShowTagDropdown(true); }}
              onFocus={() => setShowTagDropdown(true)}
              onBlur={() => setTimeout(() => { setShowTagDropdown(false); setActiveTagIndex(-1); }, 200)}
              onKeyDown={handleTagKeyDown}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-zinc-50"
              placeholder="הקלד תגית ולחץ Enter..."
            />
            {showTagDropdown && tagInput && filteredTags.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                {filteredTags.map((tag, index) => (
                  <button
                    key={tag}
                    onMouseEnter={() => setActiveTagIndex(index)}
                    onClick={() => addTag(tag)}
                    className={`w-full text-right px-4 py-3 focus:outline-none transition-colors ${activeTagIndex === index ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                  >
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">{tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* מידע הכנה קריטי - (אדום) */}
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm">
          <label className="block text-lg font-bold text-red-800 mb-2">מידע הכנה קריטי</label>
          <p className="text-sm text-red-700 mb-4">מידע שחייב להופיע לפני תחילת העבודה (למשל: "להתחיל 72 שעות מראש")</p>
          <textarea
            value={recipe.prep_info || ''}
            onChange={(e) => setRecipe({ ...recipe, prep_info: e.target.value })}
            className="w-full border border-red-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 bg-white min-h-[100px] text-red-900 font-medium"
            placeholder="למשל: התפחה קרה למשך הלילה..."
          />
        </div>

        {/* דגשים קולינריים - (כתום) */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm">
          <label className="block text-lg font-bold text-amber-900 mb-2">דגשים קולינריים</label>
          <p className="text-sm text-amber-700 mb-4">טיפים נוספים או הסברים מדעיים...</p>
          <textarea
            value={recipe.culinary_notes || ''}
            onChange={(e) => setRecipe({ ...recipe, culinary_notes: e.target.value })}
            className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-amber-900 bg-white min-h-[100px] text-amber-900 font-medium"
            placeholder="למשל: רמת הידרציה 75%..."
          />
        </div>

        {/* אחסון ותוקף - (כחול) */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow-sm">
          <label className="block text-lg font-bold text-blue-800 mb-2">אחסון ותוקף</label>
          <p className="text-sm text-blue-700 mb-4">חיי מדף והוראות אחסון</p>
          <textarea
            value={recipe.storage_info || ''}
            onChange={(e) => setRecipe({ ...recipe, storage_info: e.target.value })}
            className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white min-h-[100px] text-blue-900 font-medium"
            placeholder="למשל: נשמר 3 ימים במקרר"
          />
        </div>

        {/* Ingredients */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <label className="block text-lg font-semibold text-zinc-900">מרכיבים</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl p-1">
                <input
                  type="number" step="0.1" value={scaleMultiplier}
                  onChange={(e) => setScaleMultiplier(e.target.value)}
                  className="w-20 px-3 py-2 rounded-lg bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm font-medium"
                  placeholder="הכפל ב-"
                />
                <button type="button" onClick={applyScale} className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">שנה הכל</button>
              </div>
              <button type="button" onClick={addIngredient} className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 px-4 py-2.5 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> הוסף
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-zinc-50/50 p-2 rounded-2xl border border-zinc-100 group">
                <div className="flex flex-col gap-1 px-1">
                  <button type="button" onClick={() => moveIngredientUp(idx)} disabled={idx === 0} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20 transition-colors">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => moveIngredientDown(idx)} disabled={idx === recipe.ingredients.length - 1} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20 transition-colors">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="number" step="0.1" value={ing.amount}
                  onChange={(e) => updateIngredient(idx, 'amount', parseFloat(e.target.value) || 0)}
                  className="w-20 border border-zinc-200 rounded-xl px-2 py-3 focus:ring-2 focus:ring-zinc-900 outline-none bg-white font-mono text-center"
                  placeholder="כמות"
                />
                <input
                  type="text" value={ing.unit}
                  onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                  className="w-24 border border-zinc-200 rounded-xl px-2 py-3 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
                  placeholder="יחידה"
                />
                <input
                  type="text" value={ing.item}
                  onChange={(e) => updateIngredient(idx, 'item', e.target.value)}
                  className="flex-1 border border-zinc-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-zinc-900 outline-none bg-white font-medium"
                  placeholder="שם המרכיב"
                />
                <button type="button" onClick={() => removeIngredient(idx)} className="p-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-semibold text-zinc-900">שלבי הכנה</label>
            <button type="button" onClick={addStep} className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-full">
              <Plus className="w-4 h-4" /> הוסף
            </button>
          </div>
          <div className="space-y-4">
            {recipe.steps.map((step, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                {idx > 0 && (
                  <div className="flex justify-center -my-2 relative z-10">
                    <button type="button" onClick={() => insertStep(idx)} className="p-1 bg-white border border-zinc-200 rounded-full text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 shadow-sm transition-colors" title="הוסף שלב כאן">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex gap-3 items-start">
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <button type="button" onClick={() => moveStepUp(idx)} disabled={idx === 0} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 transition-colors">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => moveStepDown(idx)} disabled={idx === recipe.steps.length - 1} className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 transition-colors">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(idx, e.target.value)}
                    className="flex-1 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50 min-h-[80px]"
                    placeholder={`שלב ${idx + 1}...`}
                  />
                  <button type="button" onClick={() => removeStep(idx)} className="p-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Images */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-semibold text-zinc-900">תמונות תהליך</label>
            <button type="button" onClick={() => processImagesInputRef.current?.click()} className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-full">
              <Plus className="w-4 h-4" /> הוסף תמונות
            </button>
            <input type="file" accept="image/*" multiple ref={processImagesInputRef} onChange={handleProcessImagesUpload} className="hidden" />
          </div>
          {(recipe.process_images || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipe.process_images!.map((img, idx) => {
                const url = typeof img === 'string' ? img : img.url;
                const caption = typeof img === 'string' ? '' : img.caption || '';
                return (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200">
                      <img src={url} alt={`תהליך ${idx + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeProcessImage(idx)} className="absolute top-2 left-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input type="text" value={caption} onChange={(e) => updateProcessImageCaption(idx, e.target.value)} placeholder="הוסף תיאור..." className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm italic">טרם נוספו תמונות תהליך.</p>
          )}
        </div>
        
        {/* REFERENCES */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-semibold text-zinc-900">REFERENCES</label>
            <button type="button" onClick={addReferenceVideo} className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-full">
              <Plus className="w-4 h-4" /> הוסף
            </button>
          </div>
          <div className="space-y-4">
            {(recipe.reference_videos || []).map((video, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                {video.thumbnailUrl && (
                  <div className="w-32 flex-shrink-0 rounded-xl overflow-hidden aspect-video bg-zinc-200">
                    <img src={video.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="relative">
                    <input type="text" value={video.url} onChange={(e) => updateReferenceVideo(idx, 'url', e.target.value)} className="w-full border border-zinc-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white pr-10" placeholder="כתובת URL (יוטיוב, בלוג, מאמר...)" />
                    {fetchingVideoIdx === idx && (
                      <div className="absolute left-3 top-2.5">
                        <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <input type="text" value={video.channelName || ''} onChange={(e) => updateReferenceVideo(idx, 'channelName', e.target.value)} className="w-full border border-zinc-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white" placeholder="שם הערוץ (אופציונלי)" />
                  <input type="text" value={video.note} onChange={(e) => updateReferenceVideo(idx, 'note', e.target.value)} className="w-full border border-zinc-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white" placeholder="תיאור (למשל: מקור עיקרי, טכניקת לישה)" />
                </div>
                <button type="button" onClick={() => removeReferenceVideo(idx)} className="p-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onCancel} className="flex-1 py-4 px-4 border border-zinc-200 rounded-2xl shadow-sm text-base font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-all active:scale-[0.98]">ביטול</button>
          <button type="button" onClick={handleSave} className="flex-1 flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-all active:scale-[0.98]">
            <Save className="w-6 h-6" /> שמור מתכון
          </button>
        </div>
      </div>
    </div>
  );
}
