
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
      ingredients: [],
      fetchingBasis: 'AI'
    };
    
    const newOptions = {
      ...options,
      [category]: [...options[category], newItem]
    };
    
    onOptionsUpdate(newOptions);
  };

  const mergeIngredients = (existing: MealIngredient[], suggested: MealIngredient[]): MealIngredient[] => {
    // 1. Keep all manual ingredients
    const manuals = existing.filter(ing => ing.fetchingBasis === 'Manual');
    
    // 2. Filter suggested list to exclude items already handled manually (based on name match)
    const newAIs = suggested
      .filter(s => !manuals.some(m => m.name.toLowerCase() === s.name.toLowerCase()))
      .map(s => ({ ...s, fetchingBasis: 'AI' as const }));

    return [...manuals, ...newAIs];
  };

  const handleFetchAllIngredients = async () => {
    if (isGlobalLoading) return;
    
    const categories: (keyof MealOptions)[] = [
      'breakfastCombos', 'lunchMains', 'lunchVeg1', 'lunchVeg2', 'lunchMeat', 'dinnerCombos'
    ];
    
    const namesArray: string[] = [];
    categories.forEach(cat => {
      options[cat].forEach(item => {
        namesArray.push(item.name);
      });
    });

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
              return { 
                ...item, 
                ingredients: mergeIngredients(item.ingredients, suggested) 
              };
            }
            return item;
          });
        });
        return updated;
      });
      
      alert("Library successfully synced. Custom manual ingredients were preserved.");
    } catch (err) {
      console.error("Global fetch failed:", err);
      alert("Failed to sync library. Please check your connection.");
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
          const existing = updated[category][index].ingredients;
          updated[category][index].ingredients = mergeIngredients(existing, suggestions);
          return updated;
        });
      }
    } catch (err) {
      console.error("Fetch ingredients failed:", err);
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
    const newIngredient: MealIngredient = { name: '', amount: 0, unit: 'g', fetchingBasis: 'Manual' };
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

  const setIngredientBasis = (category: keyof MealOptions, itemIndex: number, ingIndex: number, basis: 'AI' | 'Manual') => {
    const newOptions = {
      ...options,
      [category]: options[category].map((item, i) => {
        if (i !== itemIndex) return item;
        const newIngs = item.ingredients.map((ing, j) => {
          if (j !== ingIndex) return ing;
          return { ...ing, fetchingBasis: basis };
        });
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
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Menu's & Recipes</h2>
          <p className="text-slate-500 text-sm">Define ingredients per meal. Quantities are for 5 people (3A, 2K).</p>
        </div>
        <button 
          onClick={handleFetchAllIngredients}
          disabled={isGlobalLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl px-6 py-3 font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          {isGlobalLoading ? (
            <><i className="fa-solid fa-sync animate-spin"></i> SYNCING ALL...</>
          ) : (
            <><i className="fa-solid fa-wand-magic-sparkles"></i> RE-SYNC ALL (SMART)</>
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
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full tracking-wider">
                {options[cat.key].length} Items
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1">
              {/* Add New Item Input */}
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder={`Add to ${cat.label}...`}
                  value={editingCategory === cat.key ? newItemValue : ''}
                  onFocus={() => setEditingCategory(cat.key)}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem(cat.key)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
                <button 
                  onClick={() => handleAddItem(cat.key)}
                  className="bg-slate-900 hover:bg-black text-white rounded-xl px-5 py-2 text-sm font-bold transition-all"
                >
                  Add
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {options[cat.key].map((item, idx) => {
                  const isLoading = loadingSuggestions[`${cat.key}-${idx}`];
                  const isExpanded = expandedItem?.category === cat.key && expandedItem?.index === idx;
                  const hasIngredients = item.ingredients.length > 0;

                  return (
                    <div key={idx} className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${isExpanded ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}>
                      <div className="group flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2">
                          <input 
                            type="text"
                            value={item.name}
                            onChange={(e) => handleEditItemName(cat.key, idx, e.target.value)}
                            className="bg-transparent border-none text-sm text-slate-700 focus:text-indigo-700 focus:ring-0 p-0 font-bold flex-1"
                          />
                          {hasIngredients && (
                            <i className="fa-solid fa-cloud-check text-emerald-500 text-[12px]" title="Saved with Data"></i>
                          )}
                        </div>
                        <button 
                          onClick={() => handleToggleExpand(cat.key, idx)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}
                        >
                          <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-list-ul'} text-xs`}></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(cat.key, idx)}
                          className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                        >
                          <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                      </div>

                      {/* Ingredients Sub-Editor */}
                      {isExpanded && (
                        <div className="mt-2 pl-4 border-l-2 border-indigo-200 space-y-4 pb-2 animate-fadeIn">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em]">Portion Matrix</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleFetchIngredients(cat.key, idx)}
                                disabled={isLoading}
                                className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1.5 rounded-lg font-bold hover:bg-emerald-100 border border-emerald-100 transition-colors flex items-center gap-1.5"
                              >
                                {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>} RE-SYNC AI
                              </button>
                              <button 
                                onClick={() => handleAddIngredient(cat.key, idx)}
                                className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg font-bold hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5"
                              >
                                <i className="fa-solid fa-plus"></i> ADD MANUAL
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {item.ingredients.map((ing, ingIdx) => (
                              <div key={ingIdx} className="flex flex-col gap-2 p-2 bg-white rounded-lg border border-slate-100 shadow-sm relative group/ing">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text"
                                    value={ing.name}
                                    placeholder="Ingredient name..."
                                    onChange={(e) => handleUpdateIngredient(cat.key, idx, ingIdx, 'name', e.target.value)}
                                    className="flex-1 bg-transparent border-none text-xs text-slate-700 focus:ring-0 p-0 font-bold"
                                  />
                                  <button 
                                    onClick={() => handleDeleteIngredient(cat.key, idx, ingIdx)}
                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                  >
                                    <i className="fa-solid fa-xmark text-sm"></i>
                                  </button>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 flex gap-1">
                                    <input 
                                      type="number"
                                      value={ing.amount}
                                      onChange={(e) => handleUpdateIngredient(cat.key, idx, ingIdx, 'amount', parseFloat(e.target.value) || 0)}
                                      className="w-16 bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[11px] font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                    <input 
                                      type="text"
                                      value={ing.unit}
                                      placeholder="unit"
                                      onChange={(e) => handleUpdateIngredient(cat.key, idx, ingIdx, 'unit', e.target.value)}
                                      className="w-12 bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[11px] text-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none uppercase"
                                    />
                                  </div>
                                  
                                  {/* Basis Selection Buttons */}
                                  <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                    <button 
                                      onClick={() => setIngredientBasis(cat.key, idx, ingIdx, 'AI')}
                                      className={`px-2 py-1 text-[9px] font-black rounded-md transition-all flex items-center gap-1 ${ing.fetchingBasis !== 'Manual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                      <i className="fa-solid fa-robot"></i> AI
                                    </button>
                                    <button 
                                      onClick={() => setIngredientBasis(cat.key, idx, ingIdx, 'Manual')}
                                      className={`px-2 py-1 text-[9px] font-black rounded-md transition-all flex items-center gap-1 ${ing.fetchingBasis === 'Manual' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                      <i className="fa-solid fa-user-pen"></i> MANUAL
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {item.ingredients.length === 0 && !isLoading && (
                              <div className="text-[10px] text-slate-400 italic py-2">No ingredients defined for this meal. Sync to fetch defaults.</div>
                            )}
                          </div>
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
