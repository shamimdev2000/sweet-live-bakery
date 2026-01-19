
import React, { useMemo } from 'react';
import { Product, Sale, Expense, DailyClosing, Wastage } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { FileDown, ShoppingCart, Package, ReceiptIndianRupee, Wallet, Clock, ArrowRightLeft, TrendingUp, UtensilsCrossed, Monitor, Trash2, CalendarDays } from 'lucide-react';

interface Props {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  wastage?: Wastage[];
  closings?: DailyClosing[];
  onInstall?: () => void;
  showInstallButton?: boolean;
}

const Dashboard: React.FC<Props> = ({ products, sales, expenses, wastage = [], closings = [], onInstall, showInstallButton }) => {
  // Get Current Month Details
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Find the timestamp of the very last closing done
  const lastClosingTimestamp = useMemo(() => {
    if (closings.length === 0) return 0;
    return Math.max(...closings.map(c => new Date(c.timestamp).getTime()));
  }, [closings]);

  // Monthly Stats (Data for the entire current month)
  const monthlyStats = useMemo(() => {
    const mSales = sales.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const mExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const mWastage = wastage.filter(w => {
      const d = new Date(w.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalSales = mSales.reduce((acc, s) => acc + s.totalPrice, 0);
    const totalCash = mSales.reduce((acc, s) => acc + s.amountPaid, 0);
    const totalExp = mExpenses.reduce((acc, e) => acc + e.amount, 0);
    const totalWaste = mWastage.reduce((acc, w) => acc + w.lossValue, 0);

    return {
      salesVolume: totalSales,
      cashCollected: totalCash,
      expenses: totalExp,
      wastageLoss: totalWaste,
      balance: totalCash - totalExp
    };
  }, [sales, expenses, wastage, currentMonth, currentYear]);

  // Active Session Totals (Data AFTER the last closing)
  const activeSessionStats = useMemo(() => {
    const activeSales = sales.filter(s => new Date(s.date).getTime() > lastClosingTimestamp);
    const activeExpenses = expenses.filter(e => new Date(e.date).getTime() > lastClosingTimestamp);
    const activeWastage = wastage.filter(w => new Date(w.date).getTime() > lastClosingTimestamp);
    
    const totalSalesVolume = activeSales.reduce((acc, s) => acc + s.totalPrice, 0);
    const totalCashCollected = activeSales.reduce((acc, s) => acc + s.amountPaid, 0);
    const totalExpenses = activeExpenses.reduce((acc, e) => acc + e.amount, 0);
    const totalWastageLoss = activeWastage.reduce((acc, w) => acc + w.lossValue, 0);
    
    return {
      salesVolume: totalSalesVolume,
      cashCollected: totalCashCollected,
      expenses: totalExpenses,
      mainBalance: totalCashCollected - totalExpenses,
      wastageLoss: totalWastageLoss
    };
  }, [sales, expenses, wastage, lastClosingTimestamp]);

  // CSV Export Logic
  const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSales = () => {
    const headers = ['Date', 'Product', 'Quantity', 'Unit', 'Total Price', 'Paid', 'Due', 'Customer', 'Payment Method'];
    const rows = sales.map(s => [new Date(s.date).toLocaleDateString(), s.productName, s.quantity, s.unit, s.totalPrice, s.amountPaid, s.dueAmount, s.customerName || 'N/A', s.paymentMethod]);
    downloadCSV('Monthly_Full_Sales_Report', headers, rows);
  };

  const handleExportStock = () => {
    const headers = ['Product Name', 'Category', 'Price', 'Current Stock', 'Unit'];
    const rows = products.map(p => [p.name, p.category, p.price, p.stock, p.unit]);
    downloadCSV('Current_Inventory_Report', headers, rows);
  };

  const handleExportExpenses = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = expenses.map(e => [new Date(e.date).toLocaleDateString(), e.description, e.category, e.amount]);
    downloadCSV('Monthly_Full_Expenses_Report', headers, rows);
  };

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const daySales = sales
      .filter(s => s.date.startsWith(dateStr))
      .reduce((acc, curr) => acc + curr.totalPrice, 0);
    return { 
      name: d.toLocaleDateString([], { month: 'numeric', day: 'numeric' }), 
      sales: daySales 
    };
  }).reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Installation Banner */}
      {showInstallButton && (
        <div className="bg-orange-500 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-b-4 border-orange-700">
           <div className="flex items-center gap-4">
              <Monitor className="text-white" size={32} />
              <p className="text-white font-bold">Install Sweet Live on your device for quick access.</p>
           </div>
           <button onClick={onInstall} className="bg-white text-orange-600 px-6 py-2 rounded-xl font-black uppercase text-sm shadow-md">Install App</button>
        </div>
      )}

      {/* Main Branding Header */}
      <div className="bg-white dark:bg-[#161d31] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
             <UtensilsCrossed size={300} className="text-orange-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
             <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <UtensilsCrossed size={32} className="text-white" />
             </div>
             <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Sweet Live Bakery</h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Monthly Business Performance</p>
             </div>
          </div>
          <div className="relative z-10 bg-orange-500/10 p-4 px-6 rounded-2xl border border-orange-500/20">
             <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Current Month</div>
             <div className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays size={18} className="text-orange-500" /> {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </div>
          </div>
      </div>

      {/* Primary Metrics Row - Monthly Performance */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
           <TrendingUp size={18} className="text-orange-500" />
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Monthly Overview (পুরো মাসের মোট হিসাব)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <StatCard title="Monthly Sales" value={monthlyStats.salesVolume} type="neutral" bangla="মাসের মোট বিক্রি" />
          <StatCard title="Total Collected" value={monthlyStats.cashCollected} type="revenue" bangla="মাসের নগদ আদায়" />
          <StatCard title="Monthly Expenses" value={monthlyStats.expenses} type="expense" bangla="মাসের মোট খরচ" />
          <StatCard title="Wastage Loss" value={monthlyStats.wastageLoss} type="wastage" bangla="মাসের নষ্ট মাল" />
          <StatCard title="Current Balance" value={monthlyStats.balance} type="balance" bangla="মাসের বর্তমান ব্যালেন্স" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Session Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Clock size={120} className="text-orange-500" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-orange-500" />
                  Today's Session
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Cash in Hand</span>
                      <span className="text-lg font-black text-emerald-400">৳{activeSessionStats.mainBalance.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Daily Sales</span>
                      <span className="text-lg font-black text-white">৳{activeSessionStats.salesVolume.toLocaleString()}</span>
                   </div>
                   <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-center">
                      <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest">ডেইলি ক্লোজিং করলে উপরের হিসাবগুলো জিরো হবে।</p>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-white dark:bg-[#161d31] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FileDown size={20} className="text-orange-500" /> Monthly Reports
            </h3>
            <div className="space-y-3">
              <ReportButton onClick={handleExportSales} icon={<ShoppingCart size={18}/>} label="Full Sales Data" color="orange" bangla="সারা মাসের বিক্রয়" />
              <ReportButton onClick={handleExportStock} icon={<Package size={18}/>} label="Inventory Stock" color="emerald" bangla="বর্তমান মজুদ" />
              <ReportButton onClick={handleExportExpenses} icon={<ReceiptIndianRupee size={18}/>} label="Full Expense Data" color="red" bangla="সারা মাসের খরচ" />
            </div>
          </div>
        </div>

        {/* Sales Trend Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-[#161d31] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
               <TrendingUp size={20} className="text-orange-500" />
               Weekly Sales Trend
             </h3>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Last 7 Days</span>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#0F4359" 
                  strokeWidth={4} 
                  dot={{ fill: '#0F4359', strokeWidth: 2, r: 5 }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportButton = ({ onClick, icon, label, color, bangla }: any) => {
  const colors: any = {
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500 hover:text-white',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
  };

  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 font-bold ${colors[color]}`}>
      <div className="p-2 bg-white/20 dark:bg-black/10 rounded-lg">
        {icon}
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-sm">{label}</span>
        {bangla && <span className="text-[9px] opacity-70 font-medium">{bangla}</span>}
      </div>
    </button>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  type: 'revenue' | 'expense' | 'profit' | 'balance' | 'neutral' | 'wastage';
  bangla: string;
}> = ({ title, value, type, bangla }) => {
  const isNegative = value < 0;
  const displayValue = Math.abs(value).toLocaleString();
  
  const getStyles = () => {
    switch(type) {
      case 'revenue': return 'text-emerald-500 border-emerald-500/20';
      case 'expense': return 'text-red-500 border-red-500/20';
      case 'wastage': return 'text-orange-600 border-orange-500/20 bg-orange-500/5';
      case 'profit': return isNegative ? 'text-red-500 border-red-500/20' : 'text-orange-500 border-orange-500/20';
      case 'balance': return 'text-orange-500 border-orange-500/30 bg-orange-500/5';
      default: return 'text-slate-900 dark:text-white border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className={`bg-white dark:bg-[#161d31] p-5 rounded-[2rem] border transition-all duration-300 shadow-sm ${type === 'balance' ? 'ring-2 ring-orange-500/20' : ''}`}>
      <div className="flex flex-col h-full">
        <h4 className="text-slate-400 dark:text-[#94a3b8] font-bold text-[8px] mb-1 tracking-wider uppercase">{title}</h4>
        <div className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mb-3">{bangla}</div>
        <div className="mt-auto flex items-baseline gap-1">
          <span className={`text-base font-bold ${getStyles()}`}>৳</span>
          <span className={`text-xl md:text-2xl font-black tracking-tighter truncate ${getStyles()}`}>
            {isNegative ? '-' : ''}{displayValue}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
