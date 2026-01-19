
import React, { useState, useMemo } from 'react';
import { Sale, Expense, DailyClosing, Wastage } from '../types';
import { 
  Lock, 
  History, 
  Trash2, 
  Clock,
  LockOpen,
  FileDown,
  RotateCcw,
  Banknote,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Trash
} from 'lucide-react';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  wastage: Wastage[];
  closings: DailyClosing[];
  onCloseDay: (closing: DailyClosing) => void;
  onDeleteClosing: (id: string) => void;
  currentUser: string;
}

const DailyClosingView: React.FC<Props> = ({ sales, expenses, wastage, closings, onCloseDay, onDeleteClosing, currentUser }) => {
  const [actualCashInput, setActualCashInput] = useState<number | ''>('');
  const today = new Date().toISOString().split('T')[0];
  
  const lastClosingTimestamp = useMemo(() => {
    if (closings.length === 0) return 0;
    return Math.max(...closings.map(c => new Date(c.timestamp).getTime()));
  }, [closings]);

  const activeStats = useMemo(() => {
    const activeSales = sales.filter(s => new Date(s.date).getTime() > lastClosingTimestamp);
    const activeExpenses = expenses.filter(e => new Date(e.date).getTime() > lastClosingTimestamp);
    const activeWastage = wastage.filter(w => new Date(w.date).getTime() > lastClosingTimestamp);
    
    const totalSalesVolume = activeSales.reduce((sum, s) => sum + s.totalPrice, 0);
    const totalCashCollected = activeSales.reduce((sum, s) => sum + s.amountPaid, 0);
    const totalExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalWastage = activeWastage.reduce((sum, w) => sum + w.lossValue, 0);
    const systemBalance = totalCashCollected - totalExpenses;

    return {
      sales: totalSalesVolume,
      cash: totalCashCollected,
      expenses: totalExpenses,
      wastage: totalWastage,
      balance: systemBalance,
      count: activeSales.length + activeExpenses.length + activeWastage.length
    };
  }, [sales, expenses, wastage, lastClosingTimestamp]);

  const difference = actualCashInput === '' ? 0 : Number(actualCashInput) - activeStats.balance;

  const handleCloseDay = () => {
    if (actualCashInput === '') {
      alert("দয়া করে আপনার ক্যাশের আসল টাকা (Actual Cash) কত তা লিখুন।");
      return;
    }

    const confirmMsg = activeStats.count === 0 
      ? 'নতুন কোনো হিসাব নেই। তবুও কি ক্লোজিং করতে চান?'
      : `আজকের ক্লোজিং সম্পন্ন করতে চান? \n\nসিস্টেমের ব্যালেন্স: ৳${activeStats.balance}\nআপনার ইনপুট: ৳${actualCashInput}\nপার্থক্য: ৳${difference}`;

    if (window.confirm(confirmMsg)) {
      const newClosing: DailyClosing = {
        id: Date.now().toString(),
        date: today,
        totalSales: activeStats.sales,
        totalCashCollected: activeStats.cash,
        totalExpenses: activeStats.expenses,
        totalWastage: activeStats.wastage,
        systemBalance: activeStats.balance,
        actualCash: Number(actualCashInput),
        difference: difference,
        closedBy: currentUser,
        timestamp: new Date().toISOString()
      };
      onCloseDay(newClosing);
      setActualCashInput('');
    }
  };

  const handleUndoLast = () => {
    if (closings.length === 0) return;
    const lastClosing = [...closings].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (window.confirm(`আপনি কি শেষ ক্লোজিংটি (${new Date(lastClosing.timestamp).toLocaleTimeString()}) বাতিল করতে চান? এটি করলে আগের সব হিসাব আবার ফিরে আসবে।`)) {
      onDeleteClosing(lastClosing.id);
    }
  };

  const handleDownloadHistory = () => {
    if (closings.length === 0) return;
    const headers = ['Date', 'Manager', 'Sales', 'Expenses', 'Wastage', 'Sys Balance', 'Actual Cash', 'Diff'];
    const csvContent = [
      headers.join(','),
      ...closings.map(c => [
        new Date(c.date).toLocaleDateString(),
        c.closedBy,
        c.totalSales,
        c.totalExpenses,
        c.totalWastage || 0,
        c.systemBalance,
        c.actualCash,
        c.difference
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bakery_Closing_Full_History.csv';
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-[#161d31] p-6 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
           <LockOpen size={220} className="text-orange-500" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                  Official Account Closing
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Daily Closing Update</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <Clock size={16} className="text-orange-500" />
                ক্যাশের হিসাব মিলিয়ে দিনের কাজ শেষ করুন
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {closings.length > 0 && (
                <button onClick={handleUndoLast} className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-red-500/20">
                  <RotateCcw size={18} /> আনলক (Undo)
                </button>
              )}
              <button onClick={handleCloseDay} className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(15,67,89,0.3)] active:scale-95 transition-all group">
                <Lock size={20} className="group-hover:scale-110 transition-transform" /> 
                Close & Start Fresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryItem title="Total Sales" value={activeStats.sales} bangla="মোট বিক্রি" color="text-slate-600 dark:text-slate-300" />
              <SummaryItem title="Total Expenses" value={activeStats.expenses} bangla="মোট খরচ" color="text-red-500" />
              <SummaryItem title="Total Wastage" value={activeStats.wastage} bangla="নষ্ট মাল (ক্ষতি)" color="text-orange-500" />
              <SummaryItem title="System Balance" value={activeStats.balance} bangla="সিস্টেম হিসাব" color="text-emerald-500" highlight />
            </div>

            <div className="lg:col-span-4 bg-orange-500/5 p-8 rounded-[2rem] border-2 border-orange-500/20 shadow-inner">
               <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Banknote size={14} /> Enter Actual Cash in Hand
               </h4>
               <div className="space-y-4">
                 <input 
                   type="number" 
                   className="w-full bg-white dark:bg-[#0a1120] border-2 border-orange-500/30 rounded-2xl p-4 text-2xl font-black text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-300" 
                   placeholder="৳0.00"
                   value={actualCashInput}
                   onChange={e => setActualCashInput(e.target.value === '' ? '' : Number(e.target.value))}
                 />
                 
                 {actualCashInput !== '' && (
                    <div className={`p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${difference === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                       <span className="text-[10px] font-black uppercase tracking-widest">Discrepancy:</span>
                       <div className="flex items-center gap-1 font-black text-lg">
                          {difference === 0 ? <CheckCircle2 size={16}/> : difference > 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                          ৳{Math.abs(difference).toLocaleString()}
                       </div>
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161d31] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <History size={24} className="text-orange-500" />
            Closing History (আগের ক্লোজিং রেকর্ড)
          </h3>
          <button onClick={handleDownloadHistory} className="bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2">
            <FileDown size={16} /> Export All Records
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-widest bg-slate-50 dark:bg-transparent border-b border-slate-100 dark:border-slate-800">
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">System Balance</th>
                <th className="px-10 py-6">Actual Cash</th>
                <th className="px-10 py-6">Diff (গরমিল)</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...closings].reverse().map(c => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{new Date(c.date).toLocaleDateString()}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-bold text-slate-500">৳{c.systemBalance.toLocaleString()}</td>
                  <td className="px-10 py-6 font-bold text-slate-900 dark:text-white text-lg">৳{c.actualCash.toLocaleString()}</td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${c.difference === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {c.difference === 0 ? 'Balanced' : `${c.difference > 0 ? '+' : ''}${c.difference}`}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button onClick={() => onDeleteClosing(c.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ title, value, bangla, color, highlight }: any) => (
  <div className={`p-6 rounded-3xl border flex flex-col justify-between h-full ${highlight ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-50 dark:bg-[#0a1120] border-slate-200 dark:border-slate-800'}`}>
    <div>
      <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-[10px] text-slate-500 mb-4">{bangla}</p>
    </div>
    <div className={`text-xl font-black ${color}`}>৳{value.toLocaleString()}</div>
  </div>
);

export default DailyClosingView;
