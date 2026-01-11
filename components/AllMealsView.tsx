
import React, { useState } from 'react';
import { MealOptions, MealItem, MealIngredient } from '../types';
import { suggestIngredientsForMeal, suggestBatchIngredients } from '../services/geminiService';

interface AllMealsViewProps {
  options: MealOptions;
  onOptionsUpdate: (newOptions: MealOptions | ((prev: MealOptions) => MealOptions)) => void;
}

const AllMealsView: React.FC<AllMealsViewProps> = ({ options, onOptionsUpdate }) => {
  const [editingCategory, setEditingCategory] = useState<keyof MealOptions | null>(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [expandedItem, setExpandedItem] = useState<{ category: keyof MealOptions, index: number } | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState<Record<string, boolean>>({});
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const handleAddItem = (category: keyof MealOptions) => {
    if (!newItemValue.trim()) return;
    const mealName = newItemValue.trim();
    setNewItemValue('');

    const newItem: MealItem = {
      name: mealName,
      ingredients: []
    };
    
    const newOptions = {
      ...options,
      [category]: [...options[category], newItem]
    };
    
    onOptionsUpdate(newOptions);
  };

  const handleFetchAllIngredients = async () => {
    if (isGlobalLoading) return;
    
    const categories: (keyof MealOptions)[] = [
      'breakfastCombos', 'lunchMains', 'lunchVeg1', 'lunchVeg2', 'lunchMeat', 'dinnerCombos'
    ];
    
    const allMealNames = new Set<string>();
    categories.forEach(cat => {
      options[cat].forEach(item => allMealNames.add(item.name));
    });

    const namesArray = Array.from(allMealNames);
    if (namesArray.length === 0) return;

    setIsGlobalLoading(true);
    try {
      const batchResults = await suggestBatchIngredients(namesArray);
      
      onOptionsUpdate((prevOptions: MealOptions) => {
        const updated = JSON.parse(JSON.stringify(prevOptions));
        categories.forEach(cat => {
          updated[cat] = updated[cat].map((item: MealItem) => {
            const suggested = batchResults[item.name];
            if (suggested && suggested.length > 0) {
              return { ...item, ingredients: suggested };
            }
            return item;
          });
        });
        return updated;
      });
      
      alert("Success! All meal ingredients have been fetched and permanently saved to your local library.");
    } catch (err) {
      console.error("Global fetch failed:", err);
      alert("Failed to sync library. Please try again later.");
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleFetchIngredients = async (category: keyof MealOptions, index: number) => {
    const meal = options[category][index];
    const loadingKey = `${category}-${index}`;
    if (loadingSuggestions[loadingKey]) return;

    setLoadingSuggestions(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const suggestions = await suggestIngredientsForMeal(meal.name);
      if (suggestions && suggestions.length > 0) {
        onOptionsUpdate((prevOptions: MealOptions) => {
          const updated = JSON.parse(JSON.stringify(prevOptions));
          if (updated[category][index] && updated[category][index].name === meal.name) {
            updated[category][index].ingredients = suggestions;
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("Fetch ingredients failed:", err);
      alert("Individual fetch failed. Check your connection.");
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleToggleExpand = (category: keyof MealOptions, index: number) => {
    if (expandedItem?.category === category && expandedItem?.index === index) {
      setExpandedItem(null);
    } else {
      setExpandedItem({ category, index });
    }
  };

  const handleDeleteItem = (category: keyof MealOptions, index: number) => {
    const newOptions = {
      ...options,
      [category]: options[category].filter((_, i) => i !== index)
    };
    onOptionsUpdate(newOptions);
    if (expandedItem?.category === category && expandedItem?.index === index) {
      setExpandedItem(null);
    }
  };

  const handleEditItemName = (category: keyof MealOptions, index: number, newName: string) => {
    const newOptions = {
      ...options,
      [category]: options[category].map((item, i) => i === index ? { ...item, name: newName } : item)
    };
    onOptionsUpdate(newOptions);
  };

  const handleAddIngredient = (category: keyof MealOptions, itemIndex: number) => {
    const newIngredient: MealIngredient = { name: '', amount: 0, unit: 'g' };
    const newOptions = {
      ...options,
      [category]: options[category].map((item, i) => 
        i === itemIndex ? { ...item, ingredients: [...item.ingredients, newIngredient] } : item
      )
    };
    onOptionsUpdate(newOptions);
  };

  const handleUpdateIngredient = (category: keyof MealOptions, itemIndex: number, ingIndex: number, field: keyof MealIngredient, value: any) => {
    const newOptions = {
      ...options,
      [category]: options[category].map((item, i) => {
        if (i !== itemIndex) return item;
        const newIngs = item.ingredients.map((ing, j) => 
          j === ingIndex ? { ...ing, [field]: value } : ing
        );
        return { ...item, ingredients: newIngs };
      })
    };
    onOptionsUpdate(newOptions);
  };

  const handleDeleteIngredient = (category: keyof MealOptions, itemIndex: number, ingIndex: number) => {
    const newOptions = {
      ...options,
      [category]: options[category].map((item, i) => {
        if (i !== itemIndex) return item;
        return { ...item, ingredients: item.ingredients.filter((_, j) => j !== ingIndex) };
      })
    };
    onOptionsUpdate(newOptions);
  };

  const categoryList: { key: keyof MealOptions; label: string; icon: string }[] = [
    { key: 'breakfastCombos', label: 'Breakfast Combinations', icon: 'fa-mug-hot' },
    { key: 'lunchMains', label: 'Lunch Mains', icon: 'fa-bowl-rice' },
    { key: 'lunchVeg1', label: 'Vegetable 1 (Salads/Sambols)', icon: 'fa-leaf' },
    { key: 'lunchVeg2', label: 'Vegetable 2 (Curries/Roots)', icon: 'fa-carrot' },
    { key: 'lunchMeat', label: 'Meat / Proteins', icon: 'fa-drumstick-bite' },
    { key: 'dinnerCombos', label: 'Dinner Options', icon: 'fa-moon' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Master Kitchen Library</h2>
          <p className="text-slate-500 text-sm">Ingredients here are permanently saved for future grocery calculations.</p>
        </div>
        <button 
          onClick={handleFetchAllIngredients}
          disabled={isGlobalLoading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl px-6 py-3 font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          {isGlobalLoading ? (
            <><i className="fa-solid fa-circle-notch animate-spin"></i> SYNCING LIBRARY...</>
          ) : (
            <><i className="fa-solid fa-wand-magic-sparkles"></i> FETCH AI INGREDIENTS (ALL)</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categoryList.map((cat) => (
          <div key={cat.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <i className={`fa-solid ${cat.icon} text-indigo-500`}></i>
                <h3 className="font-bold text-slate-700">{cat.label}</h3>
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                {options[cat.key].length} Items
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder={`Add to ${cat.label}...`}
                  value={editingCategory === cat.key ? newItemValue : ''}
                  onFocus={() => setEditingCategory(cat.key)}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem(cat.key)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button 
                  onClick={() => handleAddItem(cat.key)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {options[cat.key].map((item, idx) => {
                  const isLoading = loadingSuggestions[`${cat.key}-${idx}`];
                  const isExpanded = expandedItem?.category === cat.key && expandedItem?.index === idx;
                  const hasIngredients = item.ingredients.length > 0;

                  return (
                    <div key={idx} className="flex flex-col gap-2 bg-slate-50 border border-transparent p-3 rounded-xl hover:bg-white hover:border-indigo-100 transition-all">
                      <div className="group flex items-center gap-2">
                        <div className="flex-1">
                          <input 
                            type="text"
                            value={item.name}
                            onChange={(e) => handleEditItemName(cat.key, idx, e.target.value)}
                            className="w-full bg-transparent border-none text-sm text-slate-700 focus:text-indigo-700 focus:ring-0 p-0 font-bold"
                          />
                          {hasIngredients && (
                            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                              <i className="fa-solid fa-cloud-arrow-down"></i> SAVED TO LIBRARY
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleToggleExpand(cat.key, idx)}
                          className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                          <i className="fa-solid fa-list-check text-xs"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(cat.key, idx)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                        >
                          <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                      </div>

                      {/* Ingredients Sub-Editor */}
                      {isExpanded && (
                        <div className="mt-2 pl-4 border-l-2 border-indigo-200 space-y-3 pb-2 animate-fadeIn">
                          <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                              Household portions (3A, 2K)
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleFetchIngredients(cat.key, idx)}
                                disabled={isLoading || isGlobalLoading}
                                className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold hover:bg-emerald-100 shadow-sm border border-emerald-100"
                              >
                                {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>} RE-SYNC AI
                              </button>
                              <button 
                                onClick={() => handleAddIngredient(cat.key, idx)}
                                className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100 shadow-sm border border-indigo-100"
                              >
                                + MANUAL
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {item.ingredients.map((ing, ingIdx) => (
                              <div key={ingIdx} className="flex gap-2 items-center animate-fadeIn">
                                <input 
                                  type="text"
                                  value={ing.name}
                                  onChange={(e) => handleUpdateIngredient(cat.key, idx, ingIdx, 'name', e.target.value)}
                                  className="flex-[2] bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <input 
                                  type="number"
                                  value={ing.amount}
                                  onChange={(e) => handleUpdateIngredient(cat.key, idx, ingIdx, 'amount', parseFloat(e.target.value) || 0)}
                                  className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <input 
                                  type="text"
                                  value={ing.unit}
                                  onChange={(e) => handleUpdateIngredient(cat.key, idx, ingIdx, 'unit', e.target.value)}
                                  className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button 
                                  onClick={() => handleDeleteIngredient(cat.key, idx, ingIdx)}
                                  className="text-slate-300 hover:text-red-400 p-1"
                                >
                                  <i className="fa-solid fa-xmark text-[10px]"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                          {!hasIngredients && !isLoading && (
                            <div className="text-[10px] text-slate-400 italic">No historical data saved. Sync to populate.</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllMealsView;
