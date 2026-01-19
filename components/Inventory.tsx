
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Plus, Search, Package, Trash2, ChevronDown, AlertCircle, Banknote, Edit3, X, AlertTriangle, Trash } from 'lucide-react';

interface Props {
  products: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
  onMarkWastage: (p: Product, qty: number, reason: string) => void;
}

const Inventory: React.FC<Props> = ({ products, onAdd, onUpdate, onDelete, onMarkWastage }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'>('name_asc');
  
  // Custom Modal States
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [wastageModalProduct, setWastageModalProduct] = useState<Product | null>(null);
  const [wastageQty, setWastageQty] = useState<number | ''>('');
  const [wastageReason, setWastageReason] = useState('Expired');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Bread',
    price: '' as number | '',
    stock: '' as number | '',
    unit: 'pcs'
  });

  // Calculate Total Stock Value
  const stockSummary = useMemo(() => {
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const totalItems = products.length;
    const totalQuantity = products.reduce((acc, p) => acc + p.stock, 0);
    return { totalValue, totalItems, totalQuantity };
  }, [products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0
    };

    if (editingId) {
      onUpdate({ ...finalData, id: editingId } as Product);
      setEditingId(null);
    } else {
      onAdd({ ...finalData, id: Date.now().toString() } as Product);
    }
    setFormData({ name: '', category: 'Bread', price: '', stock: '', unit: 'pcs' });
    setIsAdding(false);
  };

  const handleWastageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wastageModalProduct && wastageQty !== '') {
      onMarkWastage(wastageModalProduct, Number(wastageQty), wastageReason);
      setWastageModalProduct(null);
      setWastageQty('');
      setWastageReason('Expired');
    }
  };

  const handleEdit = (p: Product) => {
    setFormData({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      unit: p.unit
    });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const executeDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
      if (editingId === confirmDeleteId) {
        setIsAdding(false);
        setEditingId(null);
      }
    }
  };

  const filteredProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

  const units = ['pcs', 'kg', 'gm', 'pkt', 'ltr', 'box'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stock Value Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-emerald-600 p-8 rounded-[2.5rem] shadow-lg shadow-emerald-500/20 text-white border-4 border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <Banknote size={180} />
          </div>
          <div className="relative z-10">
            <h4 className="text-emerald-100 font-bold text-xs mb-2 uppercase tracking-widest flex items-center gap-2">
               <Banknote size={16} /> Total Stock Value
            </h4>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">৳</span>
              <span className="text-5xl font-black tracking-tighter">{stockSummary.totalValue.toLocaleString()}</span>
            </div>
            <p className="mt-4 text-emerald-100/70 text-[10px] font-bold uppercase tracking-widest">মজুদ মালের মোট মূল্য</p>
          </div>
        </div>

        <div className="md:col-span-8 bg-white dark:bg-[#161d31] p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Inventory Analysis</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">Currently tracking <span className="text-orange-500 font-bold">{stockSummary.totalItems} unique products</span> with a total quantity of {stockSummary.totalQuantity.toLocaleString()} units.</p>
           </div>
           <div className="flex gap-4 w-full sm:w-auto">
             <div className="flex-1 sm:flex-none p-4 px-6 bg-slate-50 dark:bg-[#0a1120] rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Items</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{stockSummary.totalItems}</div>
             </div>
             <div className="flex-1 sm:flex-none p-4 px-6 bg-slate-50 dark:bg-[#0a1120] rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Qty</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{stockSummary.totalQuantity}</div>
             </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Product List (মজুদ তালিকা)</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your bakery items and individual stock levels.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', category: 'Bread', price: '', stock: '', unit: 'pcs' });
            setEditingId(null);
            setIsAdding(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a2236] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-[#212a3e]/50 border border-slate-200 dark:border-orange-500/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sort By:</span>
          <select 
            className="bg-slate-50 dark:bg-[#212a3e]/50 border border-slate-200 dark:border-slate-700 p-3.5 px-6 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer w-full md:w-48 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="price_asc">Price (Low-High)</option>
            <option value="price_desc">Price (High-Low)</option>
          </select>
        </div>
      </div>

      {/* Wastage Modal */}
      {wastageModalProduct && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#1a2236] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                   <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                     <Trash size={20} />
                   </div>
                   Mark Wastage (নষ্ট মাল)
                </h3>
                <button onClick={() => setWastageModalProduct(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleWastageSubmit} className="space-y-6">
                 <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Product</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{wastageModalProduct.name}</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Quantity ({wastageModalProduct.unit})</label>
                    <input 
                      required 
                      type="number" 
                      step="any"
                      max={wastageModalProduct.stock}
                      className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black text-2xl outline-none" 
                      value={wastageQty} 
                      onChange={e => setWastageQty(e.target.value === '' ? '' : Number(e.target.value))} 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Reason (কারণ)</label>
                    <select className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none" value={wastageReason} onChange={e => setWastageReason(e.target.value)}>
                      <option value="Expired">Expired (মেয়াদ শেষ)</option>
                      <option value="Damaged">Damaged (ভেঙে গেছে)</option>
                      <option value="Burnt">Burnt (পুড়ে গেছে)</option>
                      <option value="Other">Other</option>
                    </select>
                 </div>
                 <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                    Confirm Wastage
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1a2236] p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md animate-in zoom-in duration-300 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">আপনি কি নিশ্চিত?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              এই প্রোডাক্টটি ("{products.find(p => p.id === confirmDeleteId)?.name}") ডিলিট করলে এটি চিরতরে মুছে যাবে। আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDelete}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                না, ফিরে যান
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#0a1120]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#1a2236] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                 <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                   <Package size={20} />
                 </div>
                 {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => {setIsAdding(false); setEditingId(null);}} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Product Name</label>
                <input required type="text" className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Milk Bread" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Category</label>
                <select className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Bread">Bread</option>
                  <option value="Cake">Cake</option>
                  <option value="Cookies">Cookies</option>
                  <option value="Pastry">Pastry</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Price (৳) per {formData.unit}</label>
                <input required type="number" step="any" className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Stock & Unit</label>
                <div className="flex gap-2">
                  <input required type="number" step="any" className="flex-1 p-4 rounded-xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="0" />
                  <div className="relative w-32">
                    <select 
                      className="w-full h-full p-4 pl-4 pr-10 rounded-xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none appearance-none cursor-pointer" 
                      value={formData.unit} 
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-between items-center mt-6">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => setConfirmDeleteId(editingId)}
                    className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"
                  >
                    <Trash2 size={18} /> Delete Item
                  </button>
                )}
                <div className="flex gap-4 ml-auto">
                  <button type="button" onClick={() => {setIsAdding(false); setEditingId(null);}} className="px-8 py-3 text-slate-400 font-semibold hover:text-orange-500 transition-colors">Cancel</button>
                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-95">
                    {editingId ? 'Update Product' : 'Save Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(p => (
          <div 
            key={p.id} 
            className={`bg-white dark:bg-[#1a2236] p-8 rounded-[1.5rem] border relative group transition-all shadow-sm hover:shadow-md ${
              p.stock < 10 
                ? 'border-red-500 dark:border-red-500/50 ring-2 ring-red-500/10' 
                : 'border-slate-200 dark:border-slate-800 hover:border-orange-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="bg-slate-100 dark:bg-[#212a3e] text-slate-500 dark:text-slate-400 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                {p.category}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setWastageModalProduct(p)} 
                  className="p-2.5 text-orange-500 hover:text-white bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-500 border border-orange-100 dark:border-orange-500/20 hover:border-orange-500 transition-all rounded-xl shadow-sm active:scale-90"
                  title="Mark Wastage (নষ্ট মাল)"
                >
                  <Trash size={16} />
                </button>
                <button 
                  onClick={() => handleEdit(p)} 
                  className="p-2.5 text-slate-400 hover:text-orange-500 transition-all bg-white dark:bg-[#0a1120] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-90"
                  title="Edit Product"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => setConfirmDeleteId(p.id)} 
                  className="p-2.5 text-red-500 hover:text-white bg-red-50 dark:bg-red-500/10 hover:bg-red-500 border border-red-100 dark:border-red-500/20 hover:border-red-500 transition-all rounded-xl shadow-sm active:scale-90"
                  title="Delete Product (মুছে ফেলুন)"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="absolute top-20 right-8 text-right">
               <div className="flex items-baseline justify-end gap-1 text-orange-500 dark:text-orange-400">
                 <span className="text-lg font-bold">৳</span>
                 <span className="text-3xl font-black">{p.price}</span>
               </div>
               <div className="text-[10px] text-slate-400 font-bold uppercase">per {p.unit || 'pcs'}</div>
            </div>
            
            <div className="mb-10 mt-2">
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                {p.name}
              </h4>
              {p.stock < 10 && (
                <div className="flex items-center gap-1 text-red-500 font-black text-[10px] uppercase animate-pulse mt-1">
                  <AlertCircle size={12} /> Low Stock (মজুদ কম)
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-semibold">Available Stock</span>
                <span className={`font-bold ${p.stock < 10 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                  {p.stock} {p.unit || 'pcs'}
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-[#0a1120] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800/50">
                <div 
                  className={`h-full transition-all duration-1000 ${p.stock < 10 ? 'bg-red-500' : 'bg-orange-500'}`} 
                  style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-[#1a2236] border border-slate-200 dark:border-slate-800 rounded-[2rem]">
             <Package size={48} className="mx-auto mb-4 opacity-10 text-slate-400" />
             <p className="text-slate-500 font-medium text-lg">No products found in inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
