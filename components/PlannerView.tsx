
import React, { useState, useMemo } from 'react';
import { DayPlan, MealOptions, ShoppingItem } from '../types';
import { generateShoppingList } from '../services/geminiService';

interface PlannerViewProps {
  datePlans: Record<string, DayPlan>;
  options: MealOptions;
  onUpdate: (date: string, field: string, value: string) => void;
  onSyncGrocery: (items: ShoppingItem[]) => void;
  setLoading: (val: boolean) => void;
  loading: boolean;
}

const PlannerView: React.FC<PlannerViewProps> = ({ datePlans, options, onUpdate, onSyncGrocery, setLoading, loading }) => {
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  });

  const activeDates = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    let current = new Date(start);
    
    // Safety cap to prevent infinite loops or browser freeze (max 31 days)
    let count = 0;
    while (current <= end && count < 31) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
      count++;
    }
    return dates;
  }, [startDate, endDate]);

  const handleSync = async () => {
    setLoading(true);
    try {
      const relevantPlans = activeDates.map(date => {
        return datePlans[date] || {
          date,
          breakfast: options.breakfastCombos[0]?.name || '',
          lunch: {
            main: options.lunchMains[0]?.name || '',
            veg1: options.lunchVeg1[0]?.name || '',
            veg2: options.lunchVeg2[0]?.name || '',
            meat: options.lunchMeat[0]?.name || '',
          },
          dinner: options.dinnerCombos[0]?.name || ''
        };
      });

      const ingredients = await generateShoppingList(relevantPlans, options);
      const itemsWithIds = ingredients.map((ing: any, idx: number) => ({
        ...ing,
        id: `ing-${Date.now()}-${idx}`
      }));
      onSyncGrocery(itemsWithIds);
    } catch (err) {
      console.error(err);
      alert("Error syncing period. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Date Selection Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Planning Start Date</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Planning End Date</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
        
        <button 
          onClick={handleSync}
          disabled={loading || activeDates.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl px-8 py-3.5 font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          {loading ? (
            <><i className="fa-solid fa-circle-notch animate-spin"></i> CALCULATING...</>
          ) : (
            <><i className="fa-solid fa-wand-magic-sparkles"></i> Update Grocery List</>
          )}
        </button>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeDates.map((date) => {
          const plan = datePlans[date] || {
            date,
            breakfast: options.breakfastCombos[0]?.name || '',
            lunch: {
              main: options.lunchMains[0]?.name || '',
              veg1: options.lunchVeg1[0]?.name || '',
              veg2: options.lunchVeg2[0]?.name || '',
              meat: options.lunchMeat[0]?.name || '',
            },
            dinner: options.dinnerCombos[0]?.name || ''
          };
          
          return (
            <div key={date} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-black text-slate-800 text-xs uppercase tracking-tight">{getDayName(date)}</span>
                  <span className="text-[10px] font-bold text-slate-400">{date}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-green-500">
                  <i className="fa-solid fa-check text-[10px]"></i>
                </div>
              </div>
              
              <div className="p-5 space-y-6">
                <section>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Breakfast</label>
                  <select 
                    value={plan.breakfast}
                    onChange={(e) => onUpdate(date, 'breakfast', e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-100 text-blue-900 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    {options.breakfastCombos.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </section>

                <section className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Lunch Suite</label>
                  
                  <div className="space-y-2">
                    <select 
                      value={plan.lunch.main}
                      onChange={(e) => onUpdate(date, 'lunch_main', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {options.lunchMains.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                    </select>
                    
                    <select 
                      value={plan.lunch.veg1}
                      onChange={(e) => onUpdate(date, 'lunch_veg1', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {options.lunchVeg1.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                    </select>

                    <select 
                      value={plan.lunch.veg2}
                      onChange={(e) => onUpdate(date, 'lunch_veg2', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {options.lunchVeg2.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                    </select>

                    <select 
                      value={plan.lunch.meat}
                      onChange={(e) => onUpdate(date, 'lunch_meat', e.target.value)}
                      className="w-full bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 text-xs font-bold"
                    >
                      {options.lunchMeat.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                </section>

                <section>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Dinner Selection</label>
                  <select 
                    value={plan.dinner}
                    onChange={(e) => onUpdate(date, 'dinner', e.target.value)}
                    className="w-full bg-indigo-50/50 border border-indigo-100 text-indigo-900 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                  >
                    {options.dinnerCombos.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </section>
              </div>
            </div>
          );
        })}

        {activeDates.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <i className="fa-solid fa-calendar-xmark text-4xl text-slate-200 mb-4"></i>
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">No Range Selected</h3>
            <p className="text-slate-300 text-xs mt-2">Adjust your Planning Start and End dates to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlannerView;
