
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Sale, DailyClosing } from '../types';
import { ShoppingCart, User, Phone, Wallet, Trash2 } from 'lucide-react';

interface Props {
  products: Product[];
  sales: Sale[];
  onAddSale: (sale: Sale) => void;
  onCancelSale: (saleId: string) => void;
  closings?: DailyClosing[];
}

const SalesView: React.FC<Props> = ({ products, sales, onAddSale, onCancelSale, closings = [] }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Mobile Payment'>('Cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const totalPrice = selectedProduct && quantity !== '' ? selectedProduct.price * Number(quantity) : 0;

  // Auto-fill amount paid when product/quantity changes
  useEffect(() => {
    if (totalPrice > 0) {
      setAmountPaid(totalPrice);
    } else {
      setAmountPaid('');
    }
  }, [totalPrice]);

  const dueAmount = totalPrice - (Number(amountPaid) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity === '') return;

    if (selectedProduct.stock < Number(quantity)) {
      alert("Not enough stock!");
      return;
    }

    if (dueAmount > 0.01 && !customerName) {
      alert("Please enter Customer Name for due sales.");
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: Number(quantity),
      unit: selectedProduct.unit || 'pcs',
      totalPrice,
      amountPaid: Number(amountPaid) || 0,
      dueAmount: Math.max(0, dueAmount),
      customerName: dueAmount > 0.01 ? customerName : undefined,
      customerPhone: dueAmount > 0.01 ? customerPhone : undefined,
      paymentMethod,
      date: new Date().toISOString()
    };

    onAddSale(newSale);
    setSelectedProductId('');
    setQuantity('');
    setAmountPaid('');
    setPaymentMethod('Cash');
    setCustomerName('');
    setCustomerPhone('');
  };

  const lastClosingTimestamp = useMemo(() => {
    if (closings.length === 0) return 0;
    return Math.max(...closings.map(c => new Date(c.timestamp).getTime()));
  }, [closings]);

  const activeSales = useMemo(() => {
    return [...sales]
      .filter(s => new Date(s.date).getTime() > lastClosingTimestamp)
      .reverse()
      .slice(0, 10);
  }, [sales, lastClosingTimestamp]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5">
        <div className="bg-white dark:bg-[#1a2236] p-8 rounded-[1.5rem] shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold mb-8 text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={20} className="text-orange-500" /> Record New Sale
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-300 block px-1">Product</label>
              <select required className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#2e374d] border border-slate-200 dark:border-orange-500 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                <option value="">Choose a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} (৳{p.price}/{p.unit}) - Stock: {p.stock} {p.unit}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-300 block px-1">
                  Quantity {selectedProduct && <span className="text-orange-500 font-bold">({selectedProduct.unit})</span>}
                </label>
                <input 
                  required 
                  type="number" 
                  min="0.001" 
                  step="any" 
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#2e374d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none" 
                  value={quantity} 
                  onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} 
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-300 block px-1">Payment Method</label>
                <select className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#2e374d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                  <option value="Cash">Cash</option>
                  <option value="Mobile Payment">Mobile Payment</option>
                </select>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-[#0a1120] rounded-2xl border border-slate-200 dark:border-slate-800">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase">Total Bill</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">৳{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Amount Paid (কত দিয়েছেন)</label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full p-3.5 rounded-xl bg-white dark:bg-[#1a2236] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                      value={amountPaid} 
                      onChange={e => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))} 
                      placeholder="0.00"
                    />
                  </div>
                  
                  {dueAmount > 0.01 && (
                    <div className="flex justify-between items-center px-1">
                      <span className="text-red-500 font-bold text-sm uppercase flex items-center gap-1"><Wallet size={14}/> Due Amount (বাকি)</span>
                      <span className="text-xl font-black text-red-500">৳{dueAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
               </div>
            </div>

            {dueAmount > 0.01 && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Customer Name (কাস্টমারের নাম)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-[#2e374d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="e.g. Rohim Mia" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Phone Number (মোবাইল নম্বর)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-[#2e374d] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="017XXXXXXXX" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 text-lg mt-4 flex items-center justify-center gap-2">
              <ShoppingCart size={20} /> Complete Sale
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="bg-white dark:bg-[#1a2236] rounded-[1.5rem] shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Sales (Active Session)</h3>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Transaction History</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-widest bg-slate-50/50 dark:bg-transparent">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Item & Customer</th>
                  <th className="px-8 py-5 text-center">Paid</th>
                  <th className="px-8 py-5 text-right">Total</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeSales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                       <div className="font-bold text-slate-900 dark:text-slate-200">{s.productName} <span className="text-slate-400 font-normal">x{s.quantity} {s.unit}</span></div>
                       {s.dueAmount > 0.01 && <div className="text-[10px] text-orange-500 font-bold uppercase mt-1 flex items-center gap-1"><Wallet size={10}/> Due: {s.customerName}</div>}
                    </td>
                    <td className="px-8 py-5 text-center">
                       <div className="font-bold text-emerald-500">৳{s.amountPaid.toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white">৳{s.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                    <td className="px-8 py-5 text-right">
                       <button 
                         onClick={() => onCancelSale(s.id)}
                         className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                         title="Cancel Transaction (বিক্রয় বাতিল)"
                       >
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
                {activeSales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium">
                       No sales recorded in the active session.
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

export default SalesView;
