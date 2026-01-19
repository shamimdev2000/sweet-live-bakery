
import React from 'react';
import { User, ShieldCheck, Calendar, HardDrive, LogOut, Key, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  username: string;
  onLogout: () => void;
  stats: {
    products: number;
    sales: number;
    expenses: number;
    staff: number;
  };
}

const ManagerView: React.FC<Props> = ({ username, onLogout, stats }) => {
  const handleMonthlyReset = () => {
    const confirm1 = window.confirm("আপনি কি নিশ্চিত যে আপনি এই মাসের সব ডাটা রিসেট করতে চান? এটি করলে সব বিক্রয় ও খরচের রেকর্ড মুছে যাবে।");
    if (confirm1) {
      const confirm2 = window.confirm("ডিলিট করার আগে কি আপনি সব রিপোর্ট ডাউনলোড করেছেন? ডিলিট করলে ডাটা আর ফিরে পাওয়া যাবে না।");
      if (confirm2) {
        const prefix = `bakery_v3_${username.toLowerCase()}_`;
        localStorage.removeItem(`${prefix}sales`);
        localStorage.removeItem(`${prefix}expenses`);
        localStorage.removeItem(`${prefix}wastage`);
        localStorage.removeItem(`${prefix}closings`);
        localStorage.removeItem(`${prefix}deductions`);
        localStorage.removeItem(`${prefix}attendance`);
        alert("ডাটা সফলভাবে রিসেট হয়েছে। অ্যাপটি রিলোড হবে।");
        window.location.reload();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header Card */}
      <div className="bg-[#161d31] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <User size={200} className="text-orange-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-orange-500/20 rounded-[2rem] border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-xl">
            <User size={64} />
          </div>
          
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-4xl font-black text-white capitalize">{username}</h2>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                Active
              </span>
            </div>
            <p className="text-slate-400 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck size={16} className="text-orange-500" />
              Bakery Manager • Pro Account
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider bg-[#0a1120] px-4 py-2 rounded-xl border border-slate-800">
                <Calendar size={14} className="text-orange-500" />
                Session: {new Date().toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider bg-[#0a1120] px-4 py-2 rounded-xl border border-slate-800">
                <HardDrive size={14} className="text-orange-500" />
                Data: Locally Encrypted
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Details */}
        <div className="bg-[#161d31] p-8 rounded-[2rem] border border-slate-800 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Key size={20} className="text-orange-500" />
            Account Actions
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0a1120] rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-sm font-semibold">Username</span>
              <span className="text-white font-bold">{username}</span>
            </div>
            <button 
              onClick={handleMonthlyReset}
              className="w-full mt-4 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white font-bold py-4 rounded-2xl border border-orange-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              <Trash2 size={20} />
              Monthly Data Reset (এক মাসের হিসাব ক্লিয়ার)
            </button>
            <button 
              onClick={onLogout}
              className="w-full mt-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold py-4 rounded-2xl border border-red-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              Logout from Session
            </button>
          </div>
        </div>

        {/* Managed Data Summary */}
        <div className="bg-[#161d31] p-8 rounded-[2rem] border border-slate-800 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <HardDrive size={20} className="text-orange-500" />
            Data Usage Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-[#0a1120] rounded-3xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-white mb-1">{stats.products}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Products</div>
            </div>
            <div className="p-6 bg-[#0a1120] rounded-3xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-white mb-1">{stats.sales}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sales</div>
            </div>
            <div className="p-6 bg-[#0a1120] rounded-3xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-white mb-1">{stats.expenses}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expenses</div>
            </div>
            <div className="p-6 bg-[#0a1120] rounded-3xl border border-slate-800 text-center">
              <div className="text-3xl font-black text-white mb-1">{stats.staff}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Staff Members</div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-3">
            <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-1" />
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              আপনার সব ডাটা এই ব্রাউজারে সেভ আছে। মাসে একবার ডাটা রিসেট করা ভালো, তবে অবশ্যই আগে রিপোর্ট ডাউনলোড করে নেবেন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerView;
