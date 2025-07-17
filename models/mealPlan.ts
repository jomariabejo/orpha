// Represents a drink with quantity
export interface Drink {
  name: string;
  quantity: string; // e.g.,1glass",250ml", "8 oz"
  type: 'water' | 'milk' | 'juice' | 'smoothie' | 'tea' | 'other';
}

// Represents an ingredient used in a meal
export interface Ingredient {
  name: string;
  quantity: string;
}

// Represents a single meal like Breakfast, Lunch, etc.
export interface Meal {
  id: string;
  name: string;
  description: string;
  ingredients: string[]; // Simplified to just strings
  ageRange: 'all' | '1-5' | '6-17';
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    vitaminA: number;
    vitaminC: number;
    vitaminD: number;
    calcium: number;
    iron: number;
  };
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  prepTime: number; // in minutes
  servingSize: string;
  notes: string;
  drinks: Drink[]; // Drinks for this meal
}

// Represents one full day meal plan
export interface DayPlan {
  date: string; // ISO date string format (e.g. "202577s:")
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  morningSnack?: Meal;
  afternoonSnack?: Meal;
}

// Database model for storing meal plans
export interface MealPlanRecord {
  id: string;
  name: string; // Plan name
  description?: string;
  weekStartDate: string; // ISO date string
  days: DayPlan[];
  createdBy: string; // user ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isActive: boolean;
  tags?: string[];
}

// Form data for creating/editing meal plans
export interface MealPlanFormData {
  name: string;
  description?: string;
  weekStartDate: string;
  days: DayPlan[];
}

// For daily meal plan creation (single day)
export interface DailyMealPlanFormData {
  date: string;
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  morningSnack?: Meal;
  afternoonSnack?: Meal;
}

// Database model for storing daily meal plans
export interface DailyMealPlanRecord {
  id: string;
  date: string;
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  morningSnack?: Meal;
  afternoonSnack?: Meal;
  createdBy: string; // user ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isActive: boolean;
  tags?: string[];
} 