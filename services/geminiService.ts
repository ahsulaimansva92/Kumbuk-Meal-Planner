
import { GoogleGenAI, Type } from "@google/genai";
import { DayPlan, MealOptions, MealIngredient } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestIngredientsForMeal = async (mealName: string): Promise<MealIngredient[]> => {
  const prompt = `
    Suggest a comprehensive list of ingredients and their exact quantities for the Sri Lankan dish: "${mealName}".
    The quantities MUST be suitable for a single meal for a household of 5 people (3 adults and 2 children).
    
    Provide the output as a JSON array of objects with 'name', 'amount' (number), and 'unit' (string like g, kg, ml, l, units).
    Ensure you include all spices, vegetables, and proteins mentioned in the name.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Ingredient name' },
            amount: { type: Type.NUMBER, description: 'Numerical quantity' },
            unit: { type: Type.STRING, description: 'Unit of measurement' }
          },
          required: ['name', 'amount', 'unit']
        }
      }
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse suggested ingredients:", error);
    return [];
  }
};

export const suggestBatchIngredients = async (mealNames: string[]): Promise<Record<string, MealIngredient[]>> => {
  const prompt = `
    ACT AS A SRI LANKAN CULINARY EXPERT.
    For each of the following dishes/combinations, suggest a complete ingredient list and portions for 5 people (3 adults, 2 kids).
    
    IMPORTANT: If a name contains multiple components (e.g. "Bathala + Pol Sambol + Katta Sambol"), you MUST provide ingredients for ALL mentioned parts.
    
    Dishes:
    ${mealNames.map(name => `- ${name}`).join('\n')}
    
    Return a JSON object where the keys are the EXACT dish names provided above.
    The values are arrays of objects with 'name', 'amount' (number), and 'unit' (string).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse batch ingredients:", error);
    return {};
  }
};

export const generateShoppingList = async (plans: DayPlan[], mealOptions: MealOptions) => {
  const allCategories: (keyof MealOptions)[] = [
    'breakfastCombos', 'lunchMains', 'lunchVeg1', 'lunchVeg2', 'lunchMeat', 'dinnerCombos'
  ];
  
  const masterDataStr = allCategories.map(cat => {
    return mealOptions[cat].map(item => {
      const ings = item.ingredients.map(i => `${i.amount}${i.unit} ${i.name}`).join(', ');
      return `- ${item.name}: [${ings || 'No ingredients defined'}]`;
    }).join('\n');
  }).join('\n');

  const prompt = `
    ACT AS A HOUSEHOLD LOGISTICS EXPERT. 
    Calculate a consolidated grocery list for a Sri Lankan household of 5 (3 Adults, 2 Kids) for the following planning period.

    MASTER MEAL LIBRARY (Truth Source for 1 meal / 5 people):
    ${masterDataStr}

    MEAL PLAN FOR THE SELECTED DATES:
    ${plans.map(p => `
      - Date: ${p.date}: 
        Breakfast: ${p.breakfast}
        Lunch: ${p.lunch.main}, ${p.lunch.veg1}, ${p.lunch.veg2}, ${p.lunch.meat}
        Dinner: ${p.dinner}
    `).join('\n')}

    RULES:
    1. STRICTLY MULTIPLY the Master Library quantities by the number of times that specific meal appears in the plan.
    2. CONSOLIDATE identical ingredients (e.g., if multiple meals use 'Onions', sum them up).
    3. If a planned meal has NO ingredients in the library, ESTIMATE standard Sri Lankan quantities for 5 people.
    4. Provide the final list as a JSON array of objects with 'name', 'quantity' (number), and 'unit' (string).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Consolidated ingredient name' },
            quantity: { type: Type.NUMBER, description: 'Total aggregated quantity' },
            unit: { type: Type.STRING, description: 'Unit of measure' }
          },
          required: ['name', 'quantity', 'unit']
        }
      }
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse grocery list:", error);
    return [];
  }
};
