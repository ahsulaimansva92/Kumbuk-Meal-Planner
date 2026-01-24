
export enum DayOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday'
}

export interface MealIngredient {
  name: string;
  amount: number;
  unit: string;
  fetchingBasis?: 'AI' | 'Manual';
}

export interface MealItem {
  name: string;
  ingredients: MealIngredient[];
  fetchingBasis?: 'AI' | 'Manual';
}

export interface LunchPlan {
  main: string;
  veg1: string;
  veg2: string;
  meat: string;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  breakfast: string;
  lunch: LunchPlan;
  dinner: string;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  estimatedCostPerUnit?: number;
}

export interface ShoppingItem extends Ingredient {
  id: string;
  actualCost?: number;
}

export interface SavedShoppingList {
  id: string;
  name: string;
  date: string; // When the list was created
  period: string; // The planned range (e.g. 2026-01-26 to 2026-01-28)
  items: ShoppingItem[];
}

export interface MealOptions {
  lunchMains: MealItem[];
  lunchVeg1: MealItem[];
  lunchVeg2: MealItem[];
  lunchMeat: MealItem[];
  breakfastCombos: MealItem[];
  dinnerCombos: MealItem[];
}

export interface DatePlanMap {
  [date: string]: DayPlan;
}
