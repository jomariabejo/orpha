// Represents an ingredient used in a meal
export class Ingredient {
  name: string;
  quantity: string;

  constructor(name: string, quantity: string) {
    this.name = name;
    this.quantity = quantity;
  }
}

// Represents a single meal like Breakfast, Lunch, etc.
export class Meal {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl?: string; // Optional, can be used for UI
  servingSize: string;

  constructor(
    title: string,
    description: string,
    ingredients: Ingredient[],
    instructions: string[],
    servingSize: string,
    imageUrl?: string
  ) {
    this.title = title;
    this.description = description;
    this.ingredients = ingredients;
    this.instructions = instructions;
    this.servingSize = servingSize;
    this.imageUrl = imageUrl;
  }
}

// Represents one full day meal plan
export class MealPlan {
  id: string;
  date: string; // ISO date string format (e.g. "2025-07-17")
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  morningSnack?: Meal; // Optional
  afternoonSnack?: Meal; // Optional

  constructor(
    id: string,
    date: string,
    breakfast: Meal,
    lunch: Meal,
    dinner: Meal,
    morningSnack?: Meal,
    afternoonSnack?: Meal
  ) {
    this.id = id;
    this.date = date;
    this.breakfast = breakfast;
    this.lunch = lunch;
    this.dinner = dinner;
    this.morningSnack = morningSnack;
    this.afternoonSnack = afternoonSnack;
  }
}

// Database model for storing meal plans
export interface MealPlanRecord {
  id: string;
  date: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  morningSnack?: Meal;
  afternoonSnack?: Meal;
  createdBy: string; // user ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isActive: boolean;
  tags?: string[];
}

// Form data for creating/editing meal plans
export interface MealPlanFormData {
  date: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  morningSnack?: Meal;
  afternoonSnack?: Meal;
} 