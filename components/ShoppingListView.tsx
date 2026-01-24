
import React, { useState } from 'react';
import { DayPlan, ShoppingItem, MealOptions, SavedShoppingList } from '../types';

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
  plan, items, onItemsUpdate, loading, 
  savedLists, onSaveList, onDeleteSavedList
}) => {
  const [listName, setListName] = useState('');
  const [showSavedLists, setShowSavedLists] = useState(false);

  const handleSaveCurrentList = () => {
    if (items.length === 0) return;
    
    // Attempt to determine the period from the active plans if possible,
    // though usually this tab displays whatever was last generated.
    const name = listName.trim() || `Grocery List - ${new Date().toLocaleDateString()}`;
    const newList: SavedShoppingList = {
      id: `list-${Date.now()}`,
      name,
      date: new Date().toISOString(),
      period: "Custom Period", // In a more complex app, we'd pass the specific range used for generation
      items: [...items]
    };
    onSaveList(newList);
    setListName('');
    alert("List successfully saved to Planned Lists section.");
  };

  const handleLoadList = (list: SavedShoppingList) => {
    if (confirm(`Load planned list "${list.name}"? This will overwrite the current active list.`)) {
      onItemsUpdate(list.items);
      setShowSavedLists(false);
    }
  };

  const handleClear = () => {
    if (confirm("Clear the active shopping list?")) {
      onItemsUpdate([]);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-basket-shopping text-indigo-500"></i>
            Grocery Logistics Hub
          </h2>
          <p className="text-slate-400 text-sm">AI-calculated ingredients for your selected period.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSavedLists(!showSavedLists)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${showSavedLists ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            <i className="fa-solid fa-history mr-2"></i> {showSavedLists ? 'Back to Active List' : `Planned Lists (${savedLists.length})`}
          </button>
        </div>
      </div>

      {!showSavedLists ? (
        <>
          {items.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fadeIn">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <i className="fa-solid fa-list-check"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-700 uppercase tracking-tight text-sm">Active Requirements</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{items.length} Unique Components Found</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <input 
                    type="text" 
                    placeholder="Identify this plan..."
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="px-4 py-2 text-xs font-bold text-slate-700 outline-none min-w-[180px]"
                  />
                  <button 
                    onClick={handleSaveCurrentList}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Save Plan
                  </button>
                  <button 
                    onClick={handleClear}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="px-8 py-4">Consolidated Ingredient</th>
                      <th className="px-8 py-4 text-center">Net Quantity</th>
                      <th className="px-8 py-4">Standard Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.name}</div>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-600 font-mono text-center font-bold">
                          {item.quantity}
                        </td>
                        <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-200">
                <i className="fa-solid fa-receipt text-5xl"></i>
              </div>
              <h3 className="text-slate-600 font-black uppercase tracking-widest text-lg">No Active Plan</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 font-medium">
                Go to "Weekly menu", pick a period, and click "Update Grocery List" to use AI generation.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedLists.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 italic bg-white rounded-3xl border border-slate-200">
                Your planned lists archive is currently empty.
              </div>
            ) : (
              savedLists.map(list => (
                <div key={list.id} className="group bg-white border border-slate-200 p-6 rounded-3xl hover:border-indigo-400 hover:shadow-xl transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <button 
                      onClick={() => onDeleteSavedList(list.id)}
                      className="text-slate-200 hover:text-red-500 transition-colors"
                    >
                      <i className="fa-solid fa-circle-xmark text-lg"></i>
                    </button>
                  </div>
                  
                  <div className="flex flex-col h-full">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">{list.period}</span>
                    <h4 className="font-black text-slate-800 text-md mb-2 group-hover:text-indigo-600 transition-colors">{list.name}</h4>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-2 py-1 bg-slate-100 rounded-md text-[9px] font-bold text-slate-500 uppercase">{list.items.length} Items</span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(list.date).toLocaleDateString()}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleLoadList(list)}
                      className="mt-auto w-full bg-indigo-50 text-indigo-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      Load Into Calculator
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListView;
