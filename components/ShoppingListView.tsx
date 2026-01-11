
import React, { useState } from 'react';
import { DayOfWeek, DayPlan, ShoppingItem, MealOptions, SavedShoppingList } from '../types';
import { generateShoppingList } from '../services/geminiService';

interface ShoppingListViewProps {
  plan: Record<string, DayPlan>;
  options: MealOptions;
  items: ShoppingItem[];
  onItemsUpdate: (items: ShoppingItem[]) => void;
  loading: boolean;
  setLoading: (val: boolean) => void;
  savedLists: SavedShoppingList[];
  onSaveList: (list: SavedShoppingList) => void;
  onDeleteSavedList: (id: string) => void;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ 
  plan, options, items, onItemsUpdate, loading, setLoading,
  savedLists, onSaveList, onDeleteSavedList
}) => {
  const [startDay, setStartDay] = useState<DayOfWeek>(DayOfWeek.Monday);
  const [endDay, setEndDay] = useState<DayOfWeek>(DayOfWeek.Sunday);
  const [listName, setListName] = useState('');
  const [showSavedLists, setShowSavedLists] = useState(false);

  const getRelevantPlans = () => {
    const days = Object.values(DayOfWeek);
    const startIndex = days.indexOf(startDay);
    const endIndex = days.indexOf(endDay);
    
    if (startIndex <= endIndex) {
      return days.slice(startIndex, endIndex + 1).map(d => plan[d]);
    } else {
      return [...days.slice(startIndex), ...days.slice(0, endIndex + 1)].map(d => plan[d]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const relevantPlans = getRelevantPlans();
      const ingredients = await generateShoppingList(relevantPlans, options);
      const itemsWithIds = ingredients.map((ing: any, idx: number) => ({
        ...ing,
        id: `ing-${Date.now()}-${idx}`
      }));
      onItemsUpdate(itemsWithIds);
      setListName(`${startDay} to ${endDay} - ${new Date().toLocaleDateString()}`);
    } catch (err) {
      alert("Error generating list. Please check your API key and connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentList = () => {
    if (items.length === 0) return;
    const name = listName.trim() || `List for ${startDay}-${endDay}`;
    const newList: SavedShoppingList = {
      id: `list-${Date.now()}`,
      name,
      date: new Date().toISOString(),
      period: `${startDay} - ${endDay}`,
      items: [...items]
    };
    onSaveList(newList);
    alert("List saved to history!");
  };

  const handleLoadList = (list: SavedShoppingList) => {
    if (confirm(`Load "${list.name}"? This will replace your current active list.`)) {
      onItemsUpdate(list.items);
      setShowSavedLists(false);
    }
  };

  const handleClear = () => {
    if (confirm("Clear current shopping list?")) {
      onItemsUpdate([]);
      setListName('');
    }
  };

  const relevantPlansCount = getRelevantPlans().length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-basket-shopping text-indigo-500"></i>
              Grocery Period Calculator
            </h2>
            <p className="text-slate-400 text-sm">Quantities are derived from your Master Meal Library for {relevantPlansCount} days.</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setShowSavedLists(!showSavedLists)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg transition-colors"
            >
              <i className="fa-solid fa-clock-rotate-left"></i> 
              {showSavedLists ? 'Back to Calculator' : `History (${savedLists.length})`}
            </button>
            {items.length > 0 && !showSavedLists && (
              <button 
                onClick={handleClear}
                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <i className="fa-solid fa-trash-can"></i> Clear
              </button>
            )}
          </div>
        </div>
        
        {!showSavedLists ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-fadeIn">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Starting From</label>
              <select 
                value={startDay}
                onChange={(e) => setStartDay(e.target.value as DayOfWeek)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ending At</label>
              <select 
                value={endDay}
                onChange={(e) => setEndDay(e.target.value as DayOfWeek)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg px-6 py-2.5 font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><i className="fa-solid fa-circle-notch animate-spin"></i> CALCULATING...</>
              ) : (
                <><i className="fa-solid fa-calculator"></i> GENERATE LIST</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Saved Grocery Lists</h3>
            {savedLists.length === 0 ? (
              <div className="text-center py-8 text-slate-400 italic text-sm">No saved lists yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedLists.map(list => (
                  <div key={list.id} className="group relative bg-slate-50 border border-slate-100 p-4 rounded-xl hover:bg-white hover:border-indigo-200 transition-all">
                    <div className="flex flex-col mb-4">
                      <span className="text-xs font-bold text-indigo-500 mb-1">{list.period}</span>
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{list.name}</h4>
                      <span className="text-[10px] text-slate-400">{new Date(list.date).toLocaleDateString()} • {list.items.length} items</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleLoadList(list)}
                        className="flex-1 bg-white border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        Load List
                      </button>
                      <button 
                        onClick={() => onDeleteSavedList(list.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!showSavedLists && items.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fadeIn">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <i className="fa-solid fa-clipboard-list"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-700 uppercase tracking-tight text-sm">Active Shopping List</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{items.length} Ingredients</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <input 
                type="text" 
                placeholder="Name this list..."
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="px-4 py-2 text-sm text-slate-700 outline-none min-w-[200px]"
              />
              <button 
                onClick={handleSaveCurrentList}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-floppy-disk"></i> SAVE LIST
              </button>
            </div>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-3 font-bold">Ingredient</th>
                  <th className="px-6 py-3 font-bold text-center">Qty</th>
                  <th className="px-6 py-3 font-bold">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono text-center bg-slate-50/30">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {item.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {items.length === 0 && !loading && !showSavedLists && (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <i className="fa-solid fa-cart-shopping text-4xl"></i>
          </div>
          <h3 className="text-slate-600 font-bold text-lg">Your Grocery List is Empty</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">
            Select a period to calculate or view your list history.
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className="flex bg-slate-50 rounded-lg p-1">
                <button onClick={() => {setStartDay(DayOfWeek.Monday); setEndDay(DayOfWeek.Thursday);}} className="px-3 py-1.5 text-xs font-bold hover:bg-white rounded-md transition-all text-slate-600">Mon-Thu</button>
                <button onClick={() => {setStartDay(DayOfWeek.Friday); setEndDay(DayOfWeek.Sunday);}} className="px-3 py-1.5 text-xs font-bold hover:bg-white rounded-md transition-all text-slate-600">Fri-Sun</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListView;
