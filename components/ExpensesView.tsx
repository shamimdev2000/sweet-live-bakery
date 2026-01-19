
import React, { useState, useMemo } from 'react';
import { Expense, DailyClosing } from '../types';
import { Receipt } from 'lucide-react';

interface Props {
  expenses: Expense[];
  onAdd: (expense: Expense) => void;
  closings?: DailyClosing[];
}

const ExpensesView: React.FC<Props> = ({ expenses, onAdd, closings = [] }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '' as number | '',
    category: 'Raw Material' as Expense['category'],
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure the expense date includes current time if it's today's entry
    // to correctly work with the daily closing timestamp.
    const now = new Date();
    const selectedDate = new Date(formData.date || '');
    
    let finalDateString = selectedDate.toISOString();
    if (selectedDate.toDateString() === now.toDateString()) {
      finalDateString = now.toISOString();
    }

    onAdd({
      ...formData,
      amount: Number(formData.amount) || 0,
      id: Date.now().toString(),
      date: finalDateString
    } as Expense);

    setFormData({
      description: '',
      amount: '',
      category: 'Raw Material',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const lastClosingTimestamp = useMemo(() => {
    if (closings.length === 0) return 0;
    return Math.max(...closings.map(c => new Date(c.timestamp).getTime()));
  }, [closings]);

  const activeExpenses = useMemo(() => {
    return [...expenses]
      .filter(e => new Date(e.date).getTime() > lastClosingTimestamp)
      .reverse()
      .slice(0, 10);
  }, [expenses, lastClosingTimestamp]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-4">
        <div className="bg-white dark:bg-[#1a2236] p-8 rounded-[1.5rem] shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold mb-8 text-slate-900 dark:text-white">Record Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-300 block px-1">Description</label>
              <input required type="text" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#2e374d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Expense description..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-300 block px-1">Amount (৳)</label>
              <input required type="number" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#2e374d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-300 block px-1">Category</label>
              <select className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#2e374d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                <option value="Raw Material">Raw Material</option>
                <option value="Utilities">Utilities</option>
                <option value="Rent">Rent</option>
                <option value="Staff">Staff</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-300 block px-1">Date</label>
              <input required type="date" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#2e374d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 text-lg mt-4">
              Record Expense
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-white dark:bg-[#1a2236] rounded-[1.5rem] shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Expense History (Active Session)</h3>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Since last closing</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-widest bg-slate-50/50 dark:bg-transparent">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Description</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-8 py-5 text-sm text-slate-500 dark:text-slate-400">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-slate-200">{e.description}</td>
                    <td className="px-8 py-5 text-right font-bold text-slate-900 dark:text-white text-lg">৳{e.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {activeExpenses.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-medium">
                       No expenses recorded in the active session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesView;
