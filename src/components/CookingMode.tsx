import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Recipe } from '../types';
import { X, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, List } from 'lucide-react';

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
}

export function CookingMode({ recipe, onExit }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is ingredients view
  const [showIngredientsOverlay, setShowIngredientsOverlay] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // חישוב קבוצות המצרכים לתצוגה במגירה
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, typeof recipe.ingredients> = {};
    recipe.ingredients.forEach(ing => {
      const g = ing.group?.trim() || 'כללי';
      if (!groups[g]) groups[g] = [];
      groups[g].push(ing);
    });
    return groups;
  }, [recipe.ingredients]);

  // איפוס גלילה במעבר בין שלבים
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [currentStep]);

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
      }
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock !== null) {
      await wakeLock.release();
      setWakeLock(null);
    }
  }, [wakeLock]);

  useEffect(() => {
    requestWakeLock();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestWakeLock, releaseWakeLock]);

  const parseInstructions = (text: string) => {
    if (!text) return '';
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const content = part.slice(2, -2).trim();
        let targetItem: string;
        let targetGroup: string | null = null;

        if (content.includes(':')) {
          const splitContent = content.split(':');
          targetGroup = splitContent[0].trim().toLowerCase();
          targetItem = splitContent[1].trim().toLowerCase();
        } else {
          targetItem = content.toLowerCase();
        }

        const ing = recipe.ingredients.find(si => {
          const nameMatch = si.item.toLowerCase().trim() === targetItem;
          const groupMatch = targetGroup ? (si.group?.toLowerCase().trim() === targetGroup) : true;
          return nameMatch && groupMatch;
        });

        if (ing) {
          const formattedAmount = ing.amount.toFixed(ing.amount % 1 === 0 ? 0 : 2);
          return <span key={i}>{formattedAmount} {ing.unit} {ing.item}</span>;
        }
        return part;
      }
      return part;
    });
  };

  const totalSteps = recipe.steps.length;

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white z-50 flex flex-col h-[100dvh] rtl text-right font-sans" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950 z-20">
        <h1 className="text-xl md:text-2xl font-bold truncate pl-4">{recipe.name}</h1>
        <div className="flex items-center gap-3">
          {/* כפתור מגירת מצרכים - זמין תמיד */}
          <button
            onClick={() => setShowIngredientsOverlay(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-all text-zinc-300 font-bold text-sm"
          >
            <List className="w-5 h-5" />
            <span className="hidden sm:inline">מצרכים</span>
          </button>
          <button
            onClick={onExit}
            className="p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
            aria-label="יציאה"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Quick-View Ingredients Overlay */}
      {showIngredientsOverlay && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowIngredientsOverlay(false)} />
          <div className="relative w-full max-w-md bg-zinc-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-100">רשימת מצרכים</h2>
              <button onClick={() => setShowIngredientsOverlay(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-10">
              {Object.entries(groupedIngredients).map(([group, ings]) => (
                <div key={group} className="space-y-4">
                  <div className="w-fit">
                    <h3 className="text-lg font-bold text-zinc-100 border-b-2 border-zinc-500 pb-0.5 mb-2">{group}</h3>
                  </div>
                  <ul className="space-y-4">
                    {ings.map((ing, idx) => (
                      <li key={idx} className="flex items-baseline gap-4 text-lg border-b border-zinc-800/50 pb-2">
                        <span className="font-mono text-zinc-100 font-bold">{ing.amount % 1 === 0 ? ing.amount : ing.amount.toFixed(2)}</span>
                        <span className="text-zinc-500 text-sm">{ing.unit}</span>
                        <span className="text-zinc-300 flex-1">{ing.item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-zinc-800">
              <button 
                onClick={() => setShowIngredientsOverlay(false)}
                className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-2xl font-bold text-lg hover:bg-white transition-colors"
              >
                חזרה לבישול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 flex flex-col scroll-smooth">
        <div className="flex-1 flex flex-col justify-center">
          {currentStep === -1 ? (
            <div key="ingredients-view" className="max-w-2xl mx-auto w-full animate-in fade-in duration-500">
              {recipe.prep_info && (
                <div className="mb-10 bg-red-950/30 border border-red-900/50 rounded-3xl p-6">
                  <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> מידע הכנה קריטי
                  </h3>
                  <p className="text-xl text-red-100 whitespace-pre-wrap leading-relaxed">{recipe.prep_info}</p>
                </div>
              )}
              <h2 className="text-4xl font-bold mb-8 text-zinc-400">הכנת מרכיבים</h2>
              <ul className="space-y-6">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-baseline gap-6 text-2xl border-b border-zinc-800 pb-4">
                    <span className="font-mono text-zinc-300 w-24 text-right">{ing.amount % 1 === 0 ? ing.amount : ing.amount.toFixed(2)}</span>
                    <span className="text-zinc-500 w-24">{ing.unit}</span>
                    <span className="font-medium flex-1">{ing.item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div key={`step-${currentStep}`} className="max-w-4xl mx-auto w-full text-center animate-in fade-in slide-in-from-left-8 duration-500 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-800 text-zinc-400 font-bold text-3xl mb-12">
                {currentStep + 1}
              </div>
              <div className="text-4xl md:text-6xl font-medium leading-tight tracking-tight text-white">
                {parseInstructions(recipe.steps[currentStep])}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 border-t border-zinc-800 grid grid-cols-2 gap-4 pb-safe bg-zinc-950">
        <button
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === -1}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 transition-colors text-lg font-medium"
        >
          <ChevronRight className="w-6 h-6" /> הקודם
        </button>
        <button
          onClick={() => {
            if (currentStep < totalSteps - 1) setCurrentStep(prev => prev + 1);
          }}
          disabled={currentStep === totalSteps - 1}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-30 transition-colors text-lg font-medium"
        >
          {currentStep === totalSteps - 1 ? (
            <>סיום <CheckCircle2 className="w-6 h-6" /></>
          ) : (
            <>הבא <ChevronLeft className="w-6 h-6" /></>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-zinc-900 w-full">
        <div 
          className="h-full bg-zinc-100 transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
