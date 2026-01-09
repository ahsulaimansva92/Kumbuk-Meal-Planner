
import React from 'react';
import { ShoppingItem } from '../types';

interface CostTrackerViewProps {
  items: ShoppingItem[];
  onItemsUpdate: (items: ShoppingItem[]) => void;
}

const CostTrackerView: React.FC<CostTrackerViewProps> = ({ items, onItemsUpdate }) => {
  const handleCostChange = (id: string, cost: number) => {
    onItemsUpdate(items.map(item => item.id === id ? { ...item, actualCost: cost } : item));
  };

  const totalCost = items.reduce((sum, item) => sum + (item.actualCost || 0), 0);

  const downloadExcel = () => {
    // Standard CSV export
    const headers = ['Ingredient', 'Quantity', 'Unit', 'Total Cost (LKR)'];
    const rows = items.map(item => [
      item.name,
      item.quantity,
      item.unit,
      item.actualCost || 0
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meal_cost_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Financial Overview</h2>
          <p className="text-slate-500 text-sm">Track household grocery expenditure</p>
        </div>
        <div className="bg-indigo-600 text-white rounded-2xl px-8 py-4 shadow-lg flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Total Expenditure</span>
            <span className="text-2xl font-black">LKR {totalCost.toLocaleString()}</span>
          </div>
          <button 
            onClick={downloadExcel}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all"
            title="Download CSV report"
          >
            <i className="fa-solid fa-file-excel text-xl"></i>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 font-semibold">Item</th>
                <th className="px-6 py-4 font-semibold">Qty</th>
                <th className="px-6 py-4 font-semibold text-right">Unit Cost / Item Cost (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-700">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.unit}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={item.actualCost || ''}
                      onChange={(e) => handleCostChange(item.id, parseFloat(e.target.value) || 0)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-right w-32 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    Generate a shopping list first to track costs
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CostTrackerView;
