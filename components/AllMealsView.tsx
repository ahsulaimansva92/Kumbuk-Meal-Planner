
import React, { useState, useEffect } from 'react';
import { MealOptions, MealItem, MealIngredient } from '../types';
import { suggestIngredientsForMeal } from '../services/geminiService';

interface AllMealsViewProps {
  options: MealOptions;
  onOptionsUpdate: (newOptions: MealOptions | ((prev: MealOptions) => MealOptions)) => void;
}

const AllMealsView: React.FC<AllMealsViewProps> = ({ options, onOptionsUpdate }) => {
  const [editingCategory, setEditingCategory] = useState<keyof MealOptions | null>(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [expandedItem, setExpandedItem] = useState<{ category: keyof MealOptions, index: number } | null>(null);
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  // Helper to trigger AI fetch for a specific item
  const autoFetchIngredients = async (category: keyof MealOptions, index: number, mealName: string) => {
    const loadingKey = `${category}-${index}`;
    if (loadingItems[loadingKey]) return;

    setLoadingItems(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const suggestions = await suggestIngredientsForMeal(mealName);
      if (suggestions && suggestions.length > 0) {
        onOptionsUpdate((prevOptions: MealOptions) => {
          const updated = JSON.parse(JSON.stringify(prevOptions));
          // Verify item still exists and name matches to avoid race conditions
          if (updated[category][index] && updated[category][index].name === mealName) {
            updated[category][index].ingredients = suggestions;
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("Auto-fetch failed:", err);
    } finally {
      setLoadingItems(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleAddItem = (category: keyof MealOptions) => {
    if (!newItemValue.trim()) return;
    const mealName = newItemValue.trim();
    setNewItemValue('');

    const newItem: MealItem = {
      name: mealName,
      ingredients: []
    };
    
    // Add to state
    onOptionsUpdate(prev => ({
      ...prev,
      [category]: [...prev[category], newItem]
    }));

    // Trigger auto-fetch for the newly added item (it will be at the last index)
    const newIndex = options[category].length;
    autoFetchIngredients(category, newIndex, mealName);
  };

  const handleEditItemName = (category: keyof MealOptions, index: number, newName: string) => {
    const oldName = options[category][index].name;
    if (oldName === newName) return;

    const newOptions = {
      ...options,
      [category]: options[category].map((item, i) => i === index ? { ...item, name: newName } : item)
    };
    onOptionsUpdate(newOptions);

    // If name changed significantly, re-fetch ingredients automatically
    if (newName.length > 3 && newName !== oldName) {
      // Small debounce simulation: only fetch if name seems "complete" (just a simple check here)
      const timeoutId = setTimeout(() => {
        autoFetchIngredients(category, index, newName);
      }, 1000);
      return () => clearTimeout(timeoutId);
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Master Kitchen Library</h2>
          <p className="text-slate-500 text-sm">Ingredients are automatically synced from AI and saved permanently.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-wider">
          <i className="fa-solid fa-bolt"></i> Auto-Sync Enabled
        </div>
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
                  const isLoading = loadingItems[`${cat.key}-${idx}`];
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
                          <div className="flex items-center gap-2 mt-0.5">
                            {isLoading ? (
                              <span className="text-[9px] text-indigo-400 font-bold flex items-center gap-1">
                                <i className="fa-solid fa-circle-notch animate-spin"></i> SYNCING INGREDIENTS...
                              </span>
                            ) : hasIngredients ? (
                              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                                <i className="fa-solid fa-cloud-arrow-down"></i> SAVED TO LIBRARY
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                <i className="fa-solid fa-hourglass-start"></i> WAITING FOR SYNC
                              </span>
                            )}
                          </div>
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
                              Standard household portions (3A, 2K)
                            </span>
                            <button 
                              onClick={() => handleAddIngredient(cat.key, idx)}
                              className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100 shadow-sm border border-indigo-100"
                            >
                              + MANUAL OVERRIDE
                            </button>
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
                            <div className="text-[10px] text-slate-400 italic">Ingredient data will appear here automatically.</div>
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
