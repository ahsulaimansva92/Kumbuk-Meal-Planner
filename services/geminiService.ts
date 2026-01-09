
import { GoogleGenAI, Type } from "@google/genai";
import { DayPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateShoppingList = async (plans: DayPlan[]) => {
  const prompt = `
    Based on the following Sri Lankan meal plan for a household of 3 adults and 2 children, calculate the total required ingredients and their quantities (in grams, ml, or units) for the entire period.
    
    Portion considerations:
    - 3 Adults and 2 Kids (Kids eat roughly 0.5x adult portions).
    - Provide realistic bulk quantities for dry goods (rice, lentils) and precise amounts for perishables.
    
    Meal Plan:
    ${plans.map(p => `
      Day: ${p.day}
      Breakfast: ${p.breakfast.join(', ')}
      Lunch: ${p.lunch.main}, ${p.lunch.veg1}, ${p.lunch.veg2}, ${p.lunch.meat}
      Dinner: ${p.dinner} (Accompanied by ${p.lunch.meat} from lunch)
    `).join('\n')}

    Output a JSON array of objects.
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
            name: { type: Type.STRING, description: 'Ingredient name (e.g., Red Rice, Coconut, Chicken)' },
            quantity: { type: Type.NUMBER, description: 'Numerical amount required' },
            unit: { type: Type.STRING, description: 'Unit of measurement (g, ml, units, kg, l)' }
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
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
};
