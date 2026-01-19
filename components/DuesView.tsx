
import React, { useState, useMemo } from 'react';
import { Sale } from '../types';
import { Wallet, Search, Phone, User, CheckCircle2, History, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  sales: Sale[];
  onUpdateSales: (sales: Sale[]) => void;
}

interface CustomerGroup {
  name: string;
  phone: string;
  totalDue: number;
  sales: Sale[];
}

const DuesView: React.FC<Props> = ({ sales, onUpdateSales }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collectingCustomerKey, setCollectingCustomerKey] = useState<string | null>(null);
  const [collectionAmount, setCollectionAmount] = useState<number | ''>('');
  const [expandedCustomerKey, setExpandedCustomerKey] = useState<string | null>(null);

  // Group sales by Customer Name + Phone
  const customerGroups = useMemo(() => {
    const groups: Record<string, CustomerGroup> = {};
    
    sales.forEach(s => {
      if (s.dueAmount <= 0) return;
      
      const key = `${(s.customerName || 'Unknown').toLowerCase()}|${s.customerPhone || 'None'}`;
      if (!groups[key]) {
        groups[key] = {
          name: s.customerName || 'Unknown',
          phone: s.customerPhone || 'None',
          totalDue: 0,
          sales: []
        };
      }
      groups[key].totalDue += s.dueAmount;
      groups[key].sales.push(s);
    });

    // Sort customer sales by date (oldest first) to apply payments correctly
    Object.values(groups).forEach(group => {
      group.sales.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return Object.values(groups).sort((a, b) => b.totalDue - a.totalDue);
  }, [sales]);

  const totalOutstanding = customerGroups.reduce((acc, g) => acc + g.totalDue, 0);

  const filteredGroups = customerGroups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.phone.includes(searchTerm)
  );

  const handleCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingCustomerKey || collectionAmount === '') return;

    const group = customerGroups.find(g => `${g.name.toLowerCase()}|${g.phone}` === collectingCustomerKey);
    if (!group) return;

    let remainingPayment = Number(collectionAmount);
    if (remainingPayment > group.totalDue) {
      alert("Collection amount cannot exceed customer's total due!");
      return;
    }

    const updatedSalesList: Sale[] = [];
    
    // Distribute payment starting from oldest sales
    for (const sale of group.sales) {
      if (remainingPayment <= 0) break;

      const amountToApply = Math.min(sale.dueAmount, remainingPayment);
      updatedSalesList.push({
        ...sale,
        amountPaid: sale.amountPaid + amountToApply,
        dueAmount: sale.dueAmount - amountToApply
      });
      remainingPayment -= amountToApply;
    }

    onUpdateSales(updatedSalesList);
    setCollectingCustomerKey(null);
    setCollectionAmount('');
  };

  const toggleExpand = (key: string) => {
    setExpandedCustomerKey(prev => prev === key ? null : key);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-500 p-8 rounded-[2.5rem] shadow-lg shadow-orange-500/20 text-white md:col-span-1 border-4 border-white/10">
          <h4 className="text-orange-100 font-bold text-sm mb-2 uppercase tracking-widest">Total Active Dues</h4>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">৳</span>
            <span className="text-5xl font-black tracking-tight">{totalOutstanding.toLocaleString()}</span>
          </div>
          <p className="mt-4 text-orange-100/70 text-[10px] font-bold uppercase tracking-widest">Across {customerGroups.length} Customers</p>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-[#161d31] p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
           <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Unified Due Management</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">Customers with the same name and phone are grouped together for easier collection.</p>
           </div>
           <div className="hidden sm:flex w-20 h-20 bg-orange-500/10 rounded-[2rem] items-center justify-center text-orange-500 border border-orange-500/20">
              <Wallet size={40} />
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2236] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by customer name or phone number..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#212a3e]/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredGroups.map(g => {
          const key = `${g.name.toLowerCase()}|${g.phone}`;
          const isExpanded = expandedCustomerKey === key;
          
          return (
            <div key={key} className={`bg-white dark:bg-[#1a2236] p-8 rounded-[2rem] border transition-all shadow-sm flex flex-col ${
              isExpanded ? 'border-orange-500/50 ring-4 ring-orange-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-orange-500/30'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-2xl border border-orange-500/20 shadow-sm">
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">{g.name}</h4>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold mt-1">
                       <Phone size={14} className="text-orange-500" /> {g.phone}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Total Remaining</div>
                   <div className="text-3xl font-black text-red-500 tracking-tighter">৳{g.totalDue.toLocaleString()}</div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="flex-1 space-y-3 mb-8">
                 <button 
                   onClick={() => toggleExpand(key)}
                   className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-orange-500 transition-colors mb-2"
                 >
                    {g.sales.length} Transactions {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                 </button>
                 
                 {isExpanded && (
                   <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar animate-in slide-in-from-top-2">
                     {g.sales.map(s => (
                       <div key={s.id} className="flex justify-between items-center p-3 px-4 bg-slate-50 dark:bg-[#0a1120] rounded-xl border border-slate-200 dark:border-slate-800/50">
                         <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-900 dark:text-slate-300">{s.productName} x{s.quantity}</span>
                            <span className="text-[9px] text-slate-500 font-bold">{new Date(s.date).toLocaleDateString()}</span>
                         </div>
                         <div className="text-right">
                            <span className="text-xs font-black text-red-500">৳{s.dueAmount.toLocaleString()}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setCollectingCustomerKey(key)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  <CheckCircle2 size={18} /> Collect Payment
                </button>
              </div>
            </div>
          );
        })}
        {filteredGroups.length === 0 && (
          <div className="lg:col-span-2 py-24 text-center bg-white dark:bg-[#1a2236] border border-dashed border-slate-300 dark:border-slate-800 rounded-[2.5rem]">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <History size={40} className="opacity-20 text-slate-500" />
             </div>
             <p className="text-slate-500 font-black text-xl">No outstanding dues found.</p>
             <p className="text-slate-400 text-sm mt-2 font-medium">Clear accounts are happy accounts!</p>
          </div>
        )}
      </div>

      {collectingCustomerKey && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 dark:bg-[#0a1120]/90 backdrop-blur-md">
           <div className="bg-white dark:bg-[#1a2236] p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-md animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                      <Wallet size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Collect Payment</h3>
                 </div>
                 <button onClick={() => setCollectingCustomerKey(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X size={28} />
                 </button>
              </div>
              <form onSubmit={handleCollect} className="space-y-8">
                 <div className="p-6 bg-orange-500/5 rounded-3xl border border-orange-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Total Debt</p>
                      <p className="text-xs text-slate-500 font-bold truncate max-w-[150px]">{customerGroups.find(g => `${g.name.toLowerCase()}|${g.phone}` === collectingCustomerKey)?.name}</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">৳{customerGroups.find(g => `${g.name.toLowerCase()}|${g.phone}` === collectingCustomerKey)?.totalDue.toLocaleString()}</p>
                 </div>
                 <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">Collection Amount (৳)</label>
                    <input 
                      required 
                      type="number" 
                      autoFocus
                      className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-[#0a1120] border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black text-3xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder-slate-300" 
                      value={collectionAmount} 
                      onChange={e => setCollectionAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                      placeholder="0.00"
                    />
                 </div>
                 <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98] text-lg uppercase tracking-widest">
                    Confirm Collection
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default DuesView;
