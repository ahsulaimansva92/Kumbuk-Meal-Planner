
import { DayOfWeek, MealOptions, MealItem } from './types';

const createItem = (name: string, ingredients: { name: string, amount: number, unit: string }[] = []): MealItem => ({
  name,
  ingredients
});

export const INITIAL_MEAL_OPTIONS: MealOptions = {
  breakfastCombos: [
    createItem("Bathala + Pol Sambol + Katta Sambol", [
      { name: "Sweet Potato", amount: 1000, unit: "g" },
      { name: "Coconut", amount: 1, unit: "units" },
      { name: "Red Onion", amount: 50, unit: "g" },
      { name: "Green Chili", amount: 4, unit: "units" }
    ]),
    createItem("Rice + Parippu + Pol Sambol + Egg"),
    createItem("Red Rice + Parippu + Halmasso"),
    createItem("Rice + Gotukola + Soya"),
    createItem("Manioc + Pol Sambol"),
    createItem("Cowpea + Pol Sambol + Katta Sambol")
  ],
  dinnerCombos: [
    createItem("Bread", [{ name: "Loaf of Bread", amount: 1.5, unit: "units" }]),
    createItem("Noodles"),
    createItem("Pasta"),
    createItem("Kottu"),
    createItem("Rotti")
  ],
  lunchMains: [
    createItem("Yellow Rice", [{ name: "Keeri Samba", amount: 600, unit: "g" }, { name: "Butter", amount: 50, unit: "g" }]),
    createItem("Red Rice", [{ name: "Red Raw Rice", amount: 600, unit: "g" }]),
    createItem("White Rice", [{ name: "White Raw Rice", amount: 600, unit: "g" }])
  ],
  lunchVeg1: [
    createItem("Beans", [{ name: "Green Beans", amount: 350, unit: "g" }]),
    createItem("Bandakka"),
    createItem("Karawila Salad"),
    createItem("Gowa Carrot salad"),
    createItem("Spring Onion Salad"),
    createItem("Gotukola Sambol"),
    createItem("Spinatch kirata")
  ],
  lunchVeg2: [
    createItem("Polos", [{ name: "Baby Jackfruit", amount: 1, unit: "units" }]),
    createItem("Kos"),
    createItem("Del"),
    createItem("Potatoe"),
    createItem("Beet root"),
    createItem("Watakolu"),
    createItem("Hathu")
  ],
  lunchMeat: [
    createItem("Chicken Curry", [{ name: "Chicken", amount: 800, unit: "g" }]),
    createItem("Fish Curry"),
    createItem("Ambul Thiyal"),
    createItem("Sprats/Small Fried Fish/Karawala/Kunisso"),
    createItem("Mackeral")
  ]
};

export const INITIAL_WEEKLY_PLAN: Record<DayOfWeek, any> = {
  [DayOfWeek.Monday]: { day: DayOfWeek.Monday, breakfast: "Bathala + Pol Sambol + Katta Sambol", lunch: { main: "Red Rice", veg1: "Beans", veg2: "Potatoe", meat: "Chicken Curry" }, dinner: "Bread" },
  [DayOfWeek.Tuesday]: { day: DayOfWeek.Tuesday, breakfast: "Rice + Parippu + Pol Sambol + Egg", lunch: { main: "White Rice", veg1: "Bandakka", veg2: "Beet root", meat: "Fish Curry" }, dinner: "Noodles" },
  [DayOfWeek.Wednesday]: { day: DayOfWeek.Wednesday, breakfast: "Red Rice + Parippu + Halmasso", lunch: { main: "Red Rice", veg1: "Gotukola Sambol", veg2: "Polos", meat: "Ambul Thiyal" }, dinner: "Pasta" },
  [DayOfWeek.Thursday]: { day: DayOfWeek.Thursday, breakfast: "Rice + Gotukola + Soya", lunch: { main: "White Rice", veg1: "Spring Onion Salad", veg2: "Kos", meat: "Mackeral" }, dinner: "Kottu" },
  [DayOfWeek.Friday]: { day: DayOfWeek.Friday, breakfast: "Bathala + Pol Sambol + Katta Sambol", lunch: { main: "Red Rice", veg1: "Karawila Salad", veg2: "Watakolu", meat: "Chicken Curry" }, dinner: "Bread" },
  [DayOfWeek.Saturday]: { day: DayOfWeek.Saturday, breakfast: "Manioc + Pol Sambol", lunch: { main: "Yellow Rice", veg1: "Gowa Carrot salad", veg2: "Del", meat: "Sprats/Small Fried Fish/Karawala/Kunisso" }, dinner: "Rotti" },
  [DayOfWeek.Sunday]: { day: DayOfWeek.Sunday, breakfast: "Cowpea + Pol Sambol + Katta Sambol", lunch: { main: "Yellow Rice", veg1: "Spinatch kirata", veg2: "Hathu", meat: "Chicken Curry" }, dinner: "Bread" },
};
