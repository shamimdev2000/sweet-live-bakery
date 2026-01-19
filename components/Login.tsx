
import React, { useState } from 'react';
import { UtensilsCrossed, Lock, User, UserPlus, LogIn, ChevronRight, AlertCircle } from 'lucide-react';

interface Props {
  onLogin: (username: string) => void;
  theme: 'dark' | 'light';
}

interface UserData {
  username: string;
  password: string;
  role: string;
}

const Login: React.FC<Props> = ({ onLogin, theme }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getUsers = (): UserData[] => {
    const users = localStorage.getItem('sweetBakery_users');
    return users ? JSON.parse(users) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Normalize username to lowercase to prevent case conflicts
    const normalizedUsername = username.trim().toLowerCase();
    const users = getUsers();

    if (isSignup) {
      if (normalizedUsername.length < 3 || password.length < 4) {
        setError('ইউজারনেম অন্তত ৩ অক্ষর এবং পাসওয়ার্ড ৪ অক্ষরের হতে হবে।');
        return;
      }
      
      const userExists = users.some(u => u.username === normalizedUsername);
      if (userExists) {
        setError('এই ইউজারনেমটি ইতিমধ্যে ব্যবহার করা হয়েছে। অন্য নাম চেষ্টা করুন।');
        return;
      }

      const newUser: UserData = { 
        username: normalizedUsername, 
        password, 
        role: 'Manager' 
      };
      
      localStorage.setItem('sweetBakery_users', JSON.stringify([...users, newUser]));
      setSuccess('রেজিস্ট্রেশন সফল হয়েছে! এখন লগইন করুন।');
      setIsSignup(false);
      setPassword('');
      // Reset form
      setUsername('');
    } else {
      const user = users.find(u => u.username === normalizedUsername && u.password === password);
      if (user) {
        // Success: Trigger login
        onLogin(normalizedUsername);
      } else {
        setError('ইউজারনেম বা পাসওয়ার্ড সঠিক নয়। দয়া করে আবার চেষ্টা করুন।');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a1120] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-white dark:bg-[#161d31] rounded-2xl flex items-center justify-center shadow-md dark:shadow-[0_0_30px_rgba(15,67,89,0.1)] mb-6 border border-slate-200 dark:border-[#2e374d]">
          <div className="p-4 bg-orange-500/10 rounded-xl">
             <UtensilsCrossed size={48} className="text-orange-500" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Sweet Live Bakery</h1>
        <p className="text-slate-500 dark:text-[#94a3b8] text-lg font-medium">Smart Business Manager</p>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-[#161d31] rounded-[2rem] shadow-xl dark:shadow-2xl p-8 md:p-10 border border-slate-200 dark:border-[#2e374d] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {isSignup ? 'নতুন একাউন্ট' : 'লগইন করুন'}
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                {isSignup ? 'Create Manager Profile' : 'Access your dashboard'}
              </p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500 border border-orange-500/20 shadow-inner">
              {isSignup ? <UserPlus size={28} /> : <LogIn size={28} />}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-[#94a3b8] uppercase tracking-widest px-1">Username / মোবাইল নং</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  required 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-[#2e374d] text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold" 
                  placeholder="আপনার নাম বা নম্বর" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-[#94a3b8] uppercase tracking-widest px-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  required 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#0a1120] border border-slate-200 dark:border-[#2e374d] text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-500 p-4 rounded-2xl text-xs border border-red-100 dark:border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={18} className="shrink-0" />
                <span className="font-bold">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 p-4 rounded-2xl text-xs border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={18} className="shrink-0" />
                <span className="font-bold">{success}</span>
              </div>
            )}

            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4.5 rounded-2xl shadow-[0_10px_25px_rgba(15,67,89,0.3)] active:scale-[0.98] text-lg transition-all flex items-center justify-center gap-3 group">
              {isSignup ? 'রেজিস্ট্রেশন করুন' : 'সাইন ইন'}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-[#2e374d] text-center">
            <button onClick={() => { setIsSignup(!isSignup); setError(''); setSuccess(''); }} className="group inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors font-bold">
              <span className="text-sm">{isSignup ? 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন' : "নতুন একাউন্ট খুলতে চান? এখানে চাপ দিন"}</span>
            </button>
          </div>
        </div>
      </div>
      <p className="mt-12 text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
        © 2026 SWEET LIVE BAKERY SYSTEM, Copyright MD SHAMIM 
      </p>
    </div>
  );
};

export default Login;
