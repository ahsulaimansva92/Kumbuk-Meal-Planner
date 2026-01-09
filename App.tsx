
import React, { useState, useEffect } from 'react';
import { DayOfWeek, DayPlan, ShoppingItem } from './types';
import { INITIAL_WEEKLY_PLAN } from './constants';
import PlannerView from './components/PlannerView';
import ShoppingListView from './components/ShoppingListView';
import CostTrackerView from './components/CostTrackerView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'planner' | 'shopping' | 'cost'>('planner');
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, DayPlan>>(INITIAL_WEEKLY_PLAN);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Persistence
  useEffect(() => {
    const savedPlan = localStorage.getItem('mealPlan');
    if (savedPlan) setWeeklyPlan(JSON.parse(savedPlan));
    
    const savedItems = localStorage.getItem('shoppingItems');
    if (savedItems) setShoppingItems(JSON.parse(savedItems));
  }, []);

  const handlePlanChange = (day: DayOfWeek, field: string, value: string) => {
    setWeeklyPlan(prev => {
      const newPlan = {
        ...prev,
        [day]: {
          ...prev[day],
          lunch: field.startsWith('lunch_') 
            ? { ...prev[day].lunch, [field.replace('lunch_', '')]: value }
            : prev[day].lunch
        }
      };
      localStorage.setItem('mealPlan', JSON.stringify(newPlan));
      return newPlan;
    });
  };

  const updateShoppingItems = (items: ShoppingItem[]) => {
    setShoppingItems(items);
    localStorage.setItem('shoppingItems', JSON.stringify(items));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <i className="fa-solid fa-utensils text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Kumbuk Meal Planner</h1>
              <p className="text-indigo-100 text-sm">3 Adults, 2 Kids • Weekly Household Nutrition</p>
            </div>
          </div>
          <nav className="flex bg-white/10 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('planner')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'planner' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/10'}`}
            >
              Planner
            </button>
            <button 
              onClick={() => setActiveTab('shopping')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'shopping' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/10'}`}
            >
              Grocery List
            </button>
            <button 
              onClick={() => setActiveTab('cost')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'cost' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/10'}`}
            >
              Costs & ROI
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {activeTab === 'planner' && (
          <PlannerView plan={weeklyPlan} onUpdate={handlePlanChange} />
        )}
        {activeTab === 'shopping' && (
          <ShoppingListView 
            plan={weeklyPlan} 
            items={shoppingItems} 
            onItemsUpdate={updateShoppingItems} 
            loading={isLoading}
            setLoading={setIsLoading}
          />
        )}
        {activeTab === 'cost' && (
          <CostTrackerView 
            items={shoppingItems} 
            onItemsUpdate={updateShoppingItems} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-sm">
        <p>© 2024 Kumbuk Kitchen Management System. All nutritional values are estimates.</p>
      </footer>
    </div>
  );
};

export default App;
