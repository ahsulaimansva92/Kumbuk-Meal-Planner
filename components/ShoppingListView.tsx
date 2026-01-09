
import React, { useState } from 'react';
import { DayOfWeek, DayPlan, ShoppingItem } from '../types';
import { generateShoppingList } from '../services/geminiService';

interface ShoppingListViewProps {
  plan: Record<string, DayPlan>;
  items: ShoppingItem[];
  onItemsUpdate: (items: ShoppingItem[]) => void;
  loading: boolean;
  setLoading: (val: boolean) => void;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ plan, items, onItemsUpdate, loading, setLoading }) => {
  const [startDay, setStartDay] = useState<DayOfWeek>(DayOfWeek.Monday);
  const [endDay, setEndDay] = useState<DayOfWeek>(DayOfWeek.Thursday);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const days = Object.values(DayOfWeek);
      const startIndex = days.indexOf(startDay);
      const endIndex = days.indexOf(endDay);
      
      const sliceOfDays = days.slice(startIndex, endIndex + 1);
      const relevantPlans = sliceOfDays.map(d => plan[d]);

      const ingredients = await generateShoppingList(relevantPlans);
      const itemsWithIds = ingredients.map((ing: any, idx: number) => ({
        ...ing,
        id: `ing-${Date.now()}-${idx}`
      }));
      onItemsUpdate(itemsWithIds);
    } catch (err) {
      alert("Error generating list. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-basket-shopping text-indigo-500"></i>
          Calculate Purchase Quantities
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">From Morning</label>
            <select 
              value={startDay}
              onChange={(e) => setStartDay(e.target.value as DayOfWeek)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none"
            >
              {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">To Night</label>
            <select 
              value={endDay}
              onChange={(e) => setEndDay(e.target.value as DayOfWeek)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none"
            >
              {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg px-6 py-2.5 font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><i className="fa-solid fa-circle-notch animate-spin"></i> Calculating...</>
            ) : (
              <><i className="fa-solid fa-wand-magic-sparkles"></i> Generate List</>
            )}
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Required Ingredients</h3>
            <span className="text-xs text-slate-500">{items.length} items total</span>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-3 font-semibold">Item Name</th>
                  <th className="px-6 py-3 font-semibold">Quantity</th>
                  <th className="px-6 py-3 font-semibold">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {items.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-cart-arrow-down text-slate-300 text-2xl"></i>
          </div>
          <h3 className="text-slate-500 font-medium">No shopping list generated yet</h3>
          <p className="text-slate-400 text-sm">Select a date range and click Generate List to begin.</p>
        </div>
      )}
    </div>
  );
};

export default ShoppingListView;
