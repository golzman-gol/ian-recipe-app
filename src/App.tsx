import { useState, useEffect } from 'react';
import { Recipe, Technique } from './types';
import { useLocalStorage } from './lib/useLocalStorage';
import { Home } from './components/Home';
import { RecipeView } from './components/RecipeView';
import { AddRecipe } from './components/AddRecipe';
import { RecipeEditor } from './components/RecipeEditor';
import { TechniqueView } from './components/TechniqueView';
import { TechniqueEditor } from './components/TechniqueEditor';
import { SourceDiscovery } from './components/SourceDiscovery';
import { AnimatePresence, motion } from 'motion/react';

type ViewState = 'home' | 'recipe' | 'add-recipe' | 'edit-recipe' | 'technique' | 'add-technique' | 'edit-technique' | 'source-discovery';

export default function App() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('culinary-lab-recipes', []);
  const [folders, setFolders] = useLocalStorage<any[]>('culinary-lab-folders', []);
  const [techniques, setTechniques] = useLocalStorage<Technique[]>('culinary-lab-techniques', []);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);
  const [globalSelectedTags, setGlobalSelectedTags] = useState<string[]>([]);

  const handleTagClick = (tag: string) => {
    setGlobalSelectedTags([tag]);
    setCurrentView('home');
  };

  // Migration logic
  useEffect(() => {
    if (folders.length > 0 && techniques.length === 0) {
      const migrated = folders.map(f => ({
        id: f.id,
        title: f.name,
        overview: f.overview || '',
        content: f.techniqueGuide || '',
        tags: []
      }));
      setTechniques(migrated);
      setFolders([]);
      
      const newRecipes = recipes.map(r => {
        const anyR = r as any;
        if (anyR.folderId) {
          return { ...r, linkedTechniques: [anyR.folderId], folderId: undefined };
        }
        return r;
      });
      setRecipes(newRecipes);
    }
  }, [folders, techniques, recipes, setTechniques, setFolders, setRecipes]);

  const handleAddRecipe = (recipe: Recipe) => {
    setRecipes([recipe, ...recipes]);
    setCurrentView('home');
  };

  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    setRecipes(recipes.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r)));
    setCurrentView('recipe');
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter((r) => r.id !== id));
    setCurrentView('home');
  };

  const handleAddTechnique = (technique: Technique) => {
    setTechniques([technique, ...techniques]);
    setCurrentView('home');
  };

  const handleUpdateTechnique = (updatedTechnique: Technique) => {
    setTechniques(techniques.map((t) => (t.id === updatedTechnique.id ? updatedTechnique : t)));
    setCurrentView('technique');
  };

  const handleDeleteTechnique = (id: string) => {
    setTechniques(techniques.filter((t) => t.id !== id));
    setRecipes(recipes.map(r => ({
      ...r,
      linkedTechniques: r.linkedTechniques?.filter(tid => tid !== id)
    })));
    setCurrentView('home');
  };

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);
  const selectedTechnique = techniques.find((t) => t.id === selectedTechniqueId);

  const allTags = Array.from(new Set([
    ...recipes.flatMap(r => r.tags || []),
    ...techniques.flatMap(t => t.tags || [])
  ])).sort();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 overflow-x-hidden rtl" dir="rtl">
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Home
              recipes={recipes}
              techniques={techniques}
              selectedTags={globalSelectedTags}
              onSelectedTagsChange={setGlobalSelectedTags}
              onSelectRecipe={(id) => {
                setSelectedRecipeId(id);
                setCurrentView('recipe');
              }}
              onSelectTechnique={(id) => {
                setSelectedTechniqueId(id);
                setCurrentView('technique');
              }}
              onAddRecipe={() => setCurrentView('add-recipe')}
              onAddTechnique={() => setCurrentView('add-technique')}
              onGoToSourceDiscovery={() => setCurrentView('source-discovery')}
              onImportData={(importedRecipes, importedTechniques) => {
                setRecipes(importedRecipes);
                setTechniques(importedTechniques);
              }}
            />
          </motion.div>
        )}

        {currentView === 'source-discovery' && (
          <motion.div
            key="source-discovery"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <SourceDiscovery
              recipes={recipes}
              techniques={techniques}
              onBack={() => setCurrentView('home')}
              onSelectRecipe={(id) => {
                setSelectedRecipeId(id);
                setCurrentView('recipe');
              }}
              onSelectTechnique={(id) => {
                setSelectedTechniqueId(id);
                setCurrentView('technique');
              }}
            />
          </motion.div>
        )}

        {currentView === 'add-recipe' && (
          <motion.div
            key="add-recipe"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <AddRecipe
              techniques={techniques}
              recipes={recipes}
              allTags={allTags}
              onAdd={handleAddRecipe}
              onCancel={() => setCurrentView('home')}
            />
          </motion.div>
        )}

        {currentView === 'edit-recipe' && selectedRecipe && (
          <motion.div
            key="edit-recipe"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <RecipeEditor
              initialRecipe={selectedRecipe}
              techniques={techniques}
              recipes={recipes}
              allTags={allTags}
              onSave={handleUpdateRecipe}
              onCancel={() => setCurrentView('recipe')}
              isEditMode={true}
            />
          </motion.div>
        )}

        {currentView === 'recipe' && selectedRecipe && (
          <motion.div
            key="recipe"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <RecipeView
              recipe={selectedRecipe}
              recipes={recipes}
              techniques={techniques}
              onBack={() => setCurrentView('home')}
              onUpdateRecipe={(updated) => setRecipes(recipes.map((r) => (r.id === updated.id ? updated : r)))}
              onDeleteRecipe={handleDeleteRecipe}
              onEdit={() => setCurrentView('edit-recipe')}
              onSelectTechnique={(id) => {
                setSelectedTechniqueId(id);
                setCurrentView('technique');
              }}
              onSelectRecipe={(id) => {
                setSelectedRecipeId(id);
                setCurrentView('recipe');
              }}
              onTagClick={handleTagClick}
            />
          </motion.div>
        )}

        {currentView === 'add-technique' && (
          <motion.div
            key="add-technique"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TechniqueEditor
              allTags={allTags}
              onSave={handleAddTechnique}
              onCancel={() => setCurrentView('home')}
            />
          </motion.div>
        )}

        {currentView === 'edit-technique' && selectedTechnique && (
          <motion.div
            key="edit-technique"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TechniqueEditor
              initialTechnique={selectedTechnique}
              allTags={allTags}
              onSave={handleUpdateTechnique}
              onCancel={() => setCurrentView('technique')}
              onDelete={handleDeleteTechnique}
            />
          </motion.div>
        )}

        {currentView === 'technique' && selectedTechnique && (
          <motion.div
            key="technique"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TechniqueView
              technique={selectedTechnique}
              recipes={recipes}
              onBack={() => setCurrentView('home')}
              onEdit={() => setCurrentView('edit-technique')}
              onDelete={handleDeleteTechnique}
              onSelectRecipe={(id) => {
                setSelectedRecipeId(id);
                setCurrentView('recipe');
              }}
              onTagClick={handleTagClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
