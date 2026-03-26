export interface Ingredient {
  item: string;
  amount: number;
  unit: string;
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
  channelName?: string; // השדה שמאפשר שמירה וחיפוש של שם הערוץ
}

// ממשק חדש למקטעים (Chunks) בתוך טכניקה
export interface TechniqueSection {
  id: string;
  title: string;
  content: string;
  image_base_64?: string; // תמיכה בתמונה לכל צ'אנק
  references?: ReferenceLink[]; // שינוי למערך המאפשר הוספת מקורות מידע מרובים לכל צ'אנק
  isExpanded?: boolean; // לצורך ניהול מצב הפתיחה/סגירה בעורך ובתצוגה
}

export interface Technique {
  id: string;
  title: string;
  overview: string;
  content: string;
  tags: string[];
  image_base_64?: string;
  reference_videos?: ReferenceLink[];
  sections?: TechniqueSection[]; // הוספת מערך המקטעים החדש
}

export interface ProcessImage {
  url: string;
  caption?: string;
}

export interface Recipe {
  id: string;
  name: string;
  tags: string[];
  servings_base: number;
  ingredients: Ingredient[];
  steps: string[];
  notes: RecipeNote[];
  culinary_notes?: string;
  original_ingredients?: Ingredient[];
  original_steps?: string[];
  image_base_64?: string;
  linkedTechniques?: string[];
  linkedRecipes?: string[];
  prep_info?: string;
  storage_info?: string;
  process_images?: (string | ProcessImage)[];
  reference_videos?: ReferenceLink[];
}
