
export enum DayOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday'
}

export interface LunchPlan {
  main: string;
  veg1: string;
  veg2: string;
  meat: string;
}

export interface DayPlan {
  day: DayOfWeek;
  breakfast: string[];
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

export interface WeeklyPlan {
  [key: string]: DayPlan;
}
