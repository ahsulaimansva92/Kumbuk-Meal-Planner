
import React from 'react';
import { DayOfWeek, DayPlan } from '../types';
import { LUNCH_OPTIONS } from '../constants';

interface PlannerViewProps {
  plan: Record<string, DayPlan>;
  onUpdate: (day: DayOfWeek, field: string, value: string) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({ plan, onUpdate }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-calendar-week text-indigo-500"></i>
          Weekly Meal Strategy
        </h2>
        <div className="hidden md:flex gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Fixed</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Manual</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.values(DayOfWeek).map((day) => {
          const dayPlan = plan[day];
          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-700">{day}</span>
                <i className="fa-solid fa-circle-check text-green-500 text-xs"></i>
              </div>
              
              <div className="p-5 space-y-6">
                {/* Breakfast */}
                <section>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Breakfast (Fixed)</label>
                  <div className="bg-blue-50 text-blue-700 rounded-lg p-3 text-sm">
                    {dayPlan.breakfast.join(' + ')}
                  </div>
                </section>

                {/* Lunch */}
                <section className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Lunch (Customizable)</label>
                  
                  <div className="space-y-2">
                    <select 
                      value={dayPlan.lunch.main}
                      onChange={(e) => onUpdate(day, 'lunch_main', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      {LUNCH_OPTIONS.mains.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    
                    <select 
                      value={dayPlan.lunch.veg1}
                      onChange={(e) => onUpdate(day, 'lunch_veg1', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      {LUNCH_OPTIONS.veg1.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>

                    <select 
                      value={dayPlan.lunch.veg2}
                      onChange={(e) => onUpdate(day, 'lunch_veg2', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      {LUNCH_OPTIONS.veg2.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>

                    <select 
                      value={dayPlan.lunch.meat}
                      onChange={(e) => onUpdate(day, 'lunch_meat', e.target.value)}
                      className="w-full bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                    >
                      {LUNCH_OPTIONS.meat.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </section>

                {/* Dinner */}
                <section>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Dinner (Carb + Carryover)</label>
                  <div className="bg-slate-100 text-slate-700 rounded-lg p-3 text-sm flex flex-col gap-1">
                    <span className="font-semibold">{dayPlan.dinner}</span>
                    <span className="text-xs text-slate-500">with {dayPlan.lunch.meat}</span>
                  </div>
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
