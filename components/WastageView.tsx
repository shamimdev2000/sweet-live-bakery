
import React, { useState, useMemo } from 'react';
import { Product, Wastage, DailyClosing } from '../types';
import { Trash, History, Trash2, Calendar, Banknote, AlertCircle, Plus, FileDown, RotateCcw } from 'lucide-react';

interface Props {
  wastage: Wastage[];
  products: Product[];
  onAdd: (w: Wastage) => void;
  onDelete: (id: string) => void;
  closings?: DailyClosing[];
}

const WastageView: React.FC<Props> = ({ wastage, products, onAdd, onDelete, closings = [] }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState<number | ''>('');
  const [reason, setReason] = useState('Expired');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || qty === '') return;

    if (selectedProduct.stock < Number(qty)) {
      alert("মজুদের চেয়ে বেশি পরিমাণ নষ্ট হতে পারে না!");
      return;
    }

    const newWastage: Wastage = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: Number(qty),
      unit: selectedProduct.unit,
      lossValue: selectedProduct.price * Number(qty),
      reason,
      date: new Date().toISOString()
    };

    onAdd(newWastage);
    setSelectedProductId('');
    setQty('');
    setReason('Expired');
    setIsAdding(false);
  };

  const lastClosingTimestamp = useMemo(() => {
    if (closings.length === 0) return 0;
    return Math.max(...closings.map(c => new Date(c.timestamp).getTime()));
  }, [closings]);

  const activeWastage = useMemo(() => {
    return [...wastage]
      .filter(w => new Date(w.date).getTime() > lastClosingTimestamp)
      .reverse();
  }, [wastage, lastClosingTimestamp]);

  const totalLoss = activeWastage.reduce((sum, w) => sum + w.lossValue, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-600 p-8 rounded-[2.5rem] shadow-lg shadow-orange-500/20 text-white md:col-span-1 border-4 border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <Trash size={180} />
          </div>
          <div className="relative z-10">
            <h4 className="text-orange-100 font-bold text-xs mb-2 uppercase tracking-widest">Active Wastage Loss</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">৳</span>
              <span className="text-5xl font-black tracking-tight">{totalLoss.toLocaleString()}</span>
            </div>
            <p className="mt-4 text-orange-100/70 text-[10px] font-bold uppercase tracking-widest">মালের অপচয় (চলতি সেশন)</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-[#161d31] p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
           <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Wastage Tracking</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">Keep track of expired, damaged or burnt items. These entries automatically reduce your available stock.</p>
           </div>
           <button 
             onClick={() => setIsAdding(true)}
             className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
           >
             <Plus size={20} /> Record Wastage
           </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#1a2236] p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">Record New Wastage</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Product</label>
                    <select required className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                       <option value="">Select Product...</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock} {p.unit})</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Quantity</label>
                    <input required type="number" step="any" className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none" value={qty} onChange={e => setQty(e.target.value === '' ? '' : Number(e.target.value))} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Reason</label>
                    <select className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none" value={reason} onChange={e => setReason(e.target.value)}>
                      <option value="Expired">Expired</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Burnt">Burnt</option>
                      <option value="Other">Other</option>
                    </select>
                 </div>
                 <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95">Save Entry</button>
              </form>
           </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#161d31] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <History size={24} className="text-orange-500" />
            Wastage History (Active Session)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-widest bg-slate-50 dark:bg-transparent border-b border-slate-100 dark:border-slate-800">
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Product</th>
                <th className="px-10 py-6">Qty</th>
                <th className="px-10 py-6">Loss Value</th>
                <th className="px-10 py-6">Reason</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeWastage.map(w => (
                <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-10 py-6 text-slate-500 text-sm whitespace-nowrap">{new Date(w.date).toLocaleDateString()}</td>
                  <td className="px-10 py-6 font-bold text-slate-900 dark:text-slate-200">{w.productName}</td>
                  <td className="px-10 py-6 font-medium text-slate-500">{w.quantity} {w.unit}</td>
                  <td className="px-10 py-6 font-black text-orange-600">৳{w.lossValue.toLocaleString()}</td>
                  <td className="px-10 py-6">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {w.reason}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button onClick={() => onDelete(w.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {activeWastage.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center text-slate-500 font-medium">
                     No wastage records found for this session.
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

const X = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default WastageView;
