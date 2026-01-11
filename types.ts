
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
}

export interface MealItem {
  name: string;
  ingredients: MealIngredient[];
}

export interface LunchPlan {
  main: string;
  veg1: string;
  veg2: string;
  meat: string;
}

export interface DayPlan {
  day: DayOfWeek;
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
  date: string;
  period: string;
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

export interface WeeklyPlan {
  [key: string]: DayPlan;
}
