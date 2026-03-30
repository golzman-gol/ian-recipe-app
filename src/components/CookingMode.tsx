import { useState, useEffect, useCallback } from 'react';
import { Recipe } from '../types';
import { X, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
}

export function CookingMode({ recipe, onExit }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is ingredients view
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

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
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestWakeLock, releaseWakeLock]);

  const totalSteps = recipe.steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > -1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white z-50 flex flex-col h-[100dvh] rtl text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold truncate pl-4">{recipe.name}</h1>
        <button
          onClick={onExit}
          className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
          aria-label="יציאה ממצב בישול"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          {currentStep === -1 ? (
            <div className="max-w-2xl mx-auto w-full animate-in fade-in duration-300">
              {recipe.prep_info && (
                <div className="mb-10 bg-red-950/30 border border-red-900/50 rounded-3xl p-6">
                  <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    מידע הכנה קריטי
                  </h3>
                  <p className="text-xl text-red-100 whitespace-pre-wrap leading-relaxed">
                    {recipe.prep_info}
                  </p>
                </div>
              )}
              <h2 className="text-4xl font-bold mb-8 text-zinc-400">הכנת מרכיבים</h2>
              <ul className="space-y-6">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-baseline gap-6 text-2xl border-b border-zinc-800 pb-4">
                    <span className="font-mono text-zinc-300 w-24 text-right">
                      {Number.isInteger(ing.amount) ? ing.amount : ing.amount.toFixed(2)}
                    </span>
                    <span className="text-zinc-500 w-24">{ing.unit}</span>
                    <span className="font-medium flex-1">{ing.item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full text-center animate-in slide-in-from-left-8 duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-800 text-zinc-400 font-bold text-3xl mb-12">
                {currentStep + 1}
              </div>
              <p className="text-5xl md:text-6xl font-medium leading-tight tracking-tight">
                {recipe.steps[currentStep]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 border-t border-zinc-800 grid grid-cols-2 gap-4 pb-safe">
        {/* בממשק עברי, 'הקודם' נמצא בצד ימין (ראשון ב-DOM) ומצביע ימינה */}
        <button
          onClick={handlePrev}
          disabled={currentStep === -1}
          className="flex items-center justify-center gap-3 py-8 rounded-3xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-2xl font-medium"
        >
          <ChevronRight className="w-10 h-10" />
          הקודם
        </button>
        
        {/* 'הבא' נמצא בצד שמאל ומצביע שמאלה */}
        <button
          onClick={handleNext}
          disabled={currentStep === totalSteps - 1}
          className="flex items-center justify-center gap-3 py-8 rounded-3xl bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-2xl font-medium"
        >
          {currentStep === totalSteps - 1 ? (
            <>
              סיום
              <CheckCircle2 className="w-10 h-10" />
            </>
          ) : (
            <>
              הבא
              <ChevronLeft className="w-10 h-10" />
            </>
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
