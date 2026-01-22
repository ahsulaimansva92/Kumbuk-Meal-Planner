
import React from 'react';
import { DayOfWeek, DayPlan, MealOptions } from '../types';

interface PlannerViewProps {
  plan: Record<string, DayPlan>;
  options: MealOptions;
  onUpdate: (day: DayOfWeek, field: string, value: string) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({ plan, options, onUpdate }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-calendar-week text-indigo-500"></i>
          Weekly menu
        </h2>
        <div className="hidden md:flex gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Pre-assigned</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-400"></div> Editable</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.values(DayOfWeek).map((day) => {
          const dayPlan = plan[day];
          if (!dayPlan) return null;
          
          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-700">{day}</span>
                <i className="fa-solid fa-circle-check text-green-500 text-xs"></i>
              </div>
              
              <div className="p-5 space-y-6">
                {/* Breakfast */}
                <section>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Breakfast</label>
                  <select 
                    value={dayPlan.breakfast}
                    onChange={(e) => onUpdate(day, 'breakfast', e.target.value)}
                    className="w-full bg-blue-50 border border-blue-100 text-blue-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    {!options.breakfastCombos.some(c => c.name === dayPlan.breakfast) && (
                      <option value={dayPlan.breakfast}>{dayPlan.breakfast}</option>
                    )}
                    {options.breakfastCombos.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </section>

                {/* Lunch */}
                <section className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Lunch (Customizable)</label>
                  
                  <div className="space-y-2">
                    <select 
                      value={dayPlan.lunch.main}
                      onChange={(e) => onUpdate(day, 'lunch_main', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      {!options.lunchMains.some(m => m.name === dayPlan.lunch.main) && <option value={dayPlan.lunch.main}>{dayPlan.lunch.main}</option>}
                      {options.lunchMains.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                    </select>
                    
                    <select 
                      value={dayPlan.lunch.veg1}
                      onChange={(e) => onUpdate(day, 'lunch_veg1', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      {!options.lunchVeg1.some(v => v.name === dayPlan.lunch.veg1) && <option value={dayPlan.lunch.veg1}>{dayPlan.lunch.veg1}</option>}
                      {options.lunchVeg1.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                    </select>

                    <select 
                      value={dayPlan.lunch.veg2}
                      onChange={(e) => onUpdate(day, 'lunch_veg2', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      {!options.lunchVeg2.some(v => v.name === dayPlan.lunch.veg2) && <option value={dayPlan.lunch.veg2}>{dayPlan.lunch.veg2}</option>}
                      {options.lunchVeg2.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                    </select>

                    <select 
                      value={dayPlan.lunch.meat}
                      onChange={(e) => onUpdate(day, 'lunch_meat', e.target.value)}
                      className="w-full bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                    >
                      {!options.lunchMeat.some(m => m.name === dayPlan.lunch.meat) && <option value={dayPlan.lunch.meat}>{dayPlan.lunch.meat}</option>}
                      {options.lunchMeat.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                </section>

                {/* Dinner */}
                <section>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Dinner</label>
                  <select 
                    value={dayPlan.dinner}
                    onChange={(e) => onUpdate(day, 'dinner', e.target.value)}
                    className="w-full bg-slate-100 text-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  >
                    {!options.dinnerCombos.some(c => c.name === dayPlan.dinner) && (
                      <option value={dayPlan.dinner}>{dayPlan.dinner}</option>
                    )}
                    {options.dinnerCombos.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block px-1">Accompanied by {dayPlan.lunch.meat}</span>
                </section>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlannerView;
