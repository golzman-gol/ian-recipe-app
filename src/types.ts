export interface Ingredient {
  item: string;
  amount: number;
  unit: string;
  group?: string; // שדה חדש: מאפשר שיוך מצרך לקבוצה (למשל: "בצק", "קרם", "פירורים")
}

export interface RecipeNote {
  id: string;
  timestamp: number;
  text: string;
}

export interface ReferenceLink {
  url: string;
  note: string;
  thumbnailUrl?: string;
  channelName?: string; 
}

export interface TechniqueSection {
  id: string;
  title: string;
  content: string;
  image_base64?: string;
  references?: ReferenceLink[];
  isExpanded?: boolean;
}

export interface Technique {
  id: string;
  title: string;
  overview: string;
  content: string;
  tags: string[];
  image_base64?: string;
  reference_videos?: ReferenceLink[];
  sections?: TechniqueSection[];
}

export interface ProcessImage {
  url: string;
  caption?: string;
}

export interface LinkedTechnique {
  techniqueId: string;
  sectionId?: string;
}

export interface Recipe {
  id: string;
  name: string;
  tags: string[];
  servings_base: string | number;
  yield_type?: 'servings' | 'pan';
  ingredients: Ingredient[];
  steps: string[];
  notes: RecipeNote[];
  culinary_notes?: string;
  original_ingredients?: Ingredient[];
  original_steps?: string[];
  image_base64?: string;
  linkedTechniques?: (string | LinkedTechnique)[];
  linkedRecipes?: string[];
  prep_info?: string;
  storage_info?: string;
  process_images?: (string | ProcessImage)[];
  reference_videos?: ReferenceLink[];
}
