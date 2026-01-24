
import React, { useState, useEffect } from 'react';
import { DayPlan, ShoppingItem, MealOptions, SavedShoppingList, DatePlanMap } from './types';
import { INITIAL_MEAL_OPTIONS } from './constants';
import PlannerView from './components/PlannerView';
import ShoppingListView from './components/ShoppingListView';
import CostTrackerView from './components/CostTrackerView';
import AllMealsView from './components/AllMealsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'planner' | 'shopping' | 'cost' | 'meals'>('meals');
  const [datePlans, setDatePlans] = useState<DatePlanMap>({});
  const [mealOptions, setMealOptions] = useState<MealOptions>(INITIAL_MEAL_OPTIONS);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [savedLists, setSavedLists] = useState<SavedShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedPlans = localStorage.getItem('datePlans');
    if (savedPlans) setDatePlans(JSON.parse(savedPlans));
    
    const savedOptions = localStorage.getItem('mealOptions');
    if (savedOptions) setMealOptions(JSON.parse(savedOptions));

    const savedItems = localStorage.getItem('shoppingItems');
    if (savedItems) setShoppingItems(JSON.parse(savedItems));

    const archivedLists = localStorage.getItem('savedShoppingLists');
    if (archivedLists) setSavedLists(JSON.parse(archivedLists));
    
    setIsInitialized(true);
  }, []);

  useEffect(() => { if (isInitialized) localStorage.setItem('datePlans', JSON.stringify(datePlans)); }, [datePlans, isInitialized]);
  useEffect(() => { if (isInitialized) localStorage.setItem('mealOptions', JSON.stringify(mealOptions)); }, [mealOptions, isInitialized]);
  useEffect(() => { if (isInitialized) localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems)); }, [shoppingItems, isInitialized]);
  useEffect(() => { if (isInitialized) localStorage.setItem('savedShoppingLists', JSON.stringify(savedLists)); }, [savedLists, isInitialized]);

  const handlePlanChange = (date: string, field: string, value: string) => {
    setDatePlans(prev => {
      const existing = prev[date] || {
        date,
        breakfast: mealOptions.breakfastCombos[0]?.name || '',
        lunch: {
          main: mealOptions.lunchMains[0]?.name || '',
          veg1: mealOptions.lunchVeg1[0]?.name || '',
          veg2: mealOptions.lunchVeg2[0]?.name || '',
          meat: mealOptions.lunchMeat[0]?.name || '',
        },
        dinner: mealOptions.dinnerCombos[0]?.name || ''
      };

      return {
        ...prev,
        [date]: {
          ...existing,
          breakfast: field === 'breakfast' ? value : existing.breakfast,
          dinner: field === 'dinner' ? value : existing.dinner,
          lunch: field.startsWith('lunch_') 
            ? { ...existing.lunch, [field.replace('lunch_', '')]: value }
            : existing.lunch
        }
      };
    });
  };

  const handleOptionsUpdate = (newOptions: MealOptions | ((prev: MealOptions) => MealOptions)) => {
    setMealOptions(prev => {
      const next = typeof newOptions === 'function' ? (newOptions as any)(prev) : newOptions;
      return next;
    });
  };

  const updateShoppingItems = (items: ShoppingItem[]) => {
    setShoppingItems(items);
    setActiveTab('shopping');
  };

  const handleSaveList = (newList: SavedShoppingList) => {
    setSavedLists(prev => [newList, ...prev]);
  };

  const handleDeleteSavedList = (id: string) => {
    setSavedLists(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-indigo-700 text-white shadow-lg py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <i className="fa-solid fa-utensils text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Kumbuk Kitchen</h1>
              <p className="text-indigo-100 text-sm">3 Adults, 2 Kids • Household Management</p>
            </div>
          </div>
          <nav className="flex bg-white/10 p-1 rounded-xl overflow-x-auto">
            <button 
              onClick={() => setActiveTab('meals')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'meals' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/10'}`}
            >
              Menu's & Recipes
            </button>
            <button 
              onClick={() => setActiveTab('planner')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'planner' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/10'}`}
            >
              Weekly menu
            </button>
            <button 
              onClick={() => setActiveTab('shopping')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'shopping' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/10'}`}
            >
              Grocery List
            </button>
            <button 
              onClick={() => setActiveTab('cost')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'cost' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:bg-white/10'}`}
            >
              Finances
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {!isInitialized ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <i className="fa-solid fa-spinner animate-spin text-4xl mb-4 text-indigo-500"></i>
            <p className="font-medium uppercase tracking-widest text-xs">Initializing Kitchen Data...</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {activeTab === 'meals' && <AllMealsView options={mealOptions} onOptionsUpdate={handleOptionsUpdate} />}
            {activeTab === 'planner' && (
              <PlannerView 
                datePlans={datePlans} 
                options={mealOptions} 
                onUpdate={handlePlanChange}
                onSyncGrocery={(items) => updateShoppingItems(items)}
                setLoading={setIsLoading}
                loading={isLoading}
              />
            )}
            {activeTab === 'shopping' && (
              <ShoppingListView 
                plan={datePlans} options={mealOptions} items={shoppingItems} onItemsUpdate={(items) => setShoppingItems(items)} 
                loading={isLoading} setLoading={setIsLoading} savedLists={savedLists} onSaveList={handleSaveList} onDeleteSavedList={handleDeleteSavedList}
              />
            )}
            {activeTab === 'cost' && <CostTrackerView items={shoppingItems} onItemsUpdate={(items) => setShoppingItems(items)} />}
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-sm mt-auto">
        <p>© 2024 Kumbuk Kitchen Management System. Built for Sri Lankan Families.</p>
      </footer>
    </div>
  );
};

export default App;
