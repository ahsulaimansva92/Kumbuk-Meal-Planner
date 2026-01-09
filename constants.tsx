
import { DayOfWeek } from './types';

export const BREAKFAST_COMBOS: Record<DayOfWeek, string[]> = {
  [DayOfWeek.Monday]: ["Bathala", "Pol Sambol", "Katta Sambol"],
  [DayOfWeek.Tuesday]: ["Rice", "Parippu", "Pol Sambol", "Egg"],
  [DayOfWeek.Wednesday]: ["Red Rice", "Parippu", "Halmasso"],
  [DayOfWeek.Thursday]: ["Rice", "Gotukola", "Soya"],
  [DayOfWeek.Friday]: ["Bathala", "Pol Sambol", "Katta Sambol"],
  [DayOfWeek.Saturday]: ["Manioc", "Pol Sambol"],
  [DayOfWeek.Sunday]: ["Cowpea", "Pol Sambol", "Katta Sambol"],
};

export const LUNCH_OPTIONS = {
  mains: ["Yellow Rice", "Red Rice", "White Rice"],
  veg1: ["Beans", "Bandakka", "Karawila Salad", "Gowa Carrot salad", "Spring Onion Salad", "Gotukola Sambol", "Spinatch kirata"],
  veg2: ["Polos", "Kos", "Del", "Potatoe", "Beet root", "Watakolu", "Hathu"],
  meat: ["Chicken Curry", "Fish Curry", "Ambul Thiyal", "Sprats/Small Fried Fish/Karawala/Kunisso", "Mackeral"]
};

export const DINNER_CARBS: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: "Bread",
  [DayOfWeek.Tuesday]: "Noodles",
  [DayOfWeek.Wednesday]: "Pasta",
  [DayOfWeek.Thursday]: "Kottu",
  [DayOfWeek.Friday]: "Bread",
  [DayOfWeek.Saturday]: "Rotti",
  [DayOfWeek.Sunday]: "Bread",
};

export const INITIAL_WEEKLY_PLAN: Record<DayOfWeek, any> = Object.values(DayOfWeek).reduce((acc, day) => {
  acc[day] = {
    day,
    breakfast: BREAKFAST_COMBOS[day as DayOfWeek],
    lunch: {
      main: LUNCH_OPTIONS.mains[0],
      veg1: LUNCH_OPTIONS.veg1[0],
      veg2: LUNCH_OPTIONS.veg2[0],
      meat: LUNCH_OPTIONS.meat[0]
    },
    dinner: DINNER_CARBS[day as DayOfWeek]
  };
  return acc;
}, {} as any);
