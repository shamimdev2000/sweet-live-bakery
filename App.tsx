
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Sale, Expense, View, Staff, Attendance, DailyClosing, Deduction, Wastage } from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import SalesView from './components/SalesView';
import ExpensesView from './components/ExpensesView';
import StaffView from './components/StaffView';
import ManagerView from './components/ManagerView';
import DailyClosingView from './components/DailyClosingView';
import DuesView from './components/DuesView';
import WastageView from './components/WastageView';
import Login from './components/Login';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ReceiptIndianRupee, 
  Users,
  UserCheck,
  LogOut,
  Moon,
  Sun,
  UtensilsCrossed,
  Lock,
  Wallet,
  Menu,
  X,
  AlertTriangle,
  Monitor,
  Trash2
} from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('sweetBakery_theme') as 'dark' | 'light') || 'dark';
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [wastage, setWastage] = useState<Wastage[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [dailyClosings, setDailyClosings] = useState<DailyClosing[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stock < 10).length;
  }, [products]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sweetBakery_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Improved Auth Check: Use localStorage for persistent access
  useEffect(() => {
    const auth = localStorage.getItem('sweetBakery_auth');
    if (auth) {
      setIsAuthenticated(true);
      setCurrentUser(auth.toLowerCase());
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setIsDataLoaded(false);
      const prefix = `bakery_v3_${currentUser.toLowerCase()}_`;
      
      try {
        const savedProducts = localStorage.getItem(`${prefix}products`);
        const savedSales = localStorage.getItem(`${prefix}sales`);
        const savedExpenses = localStorage.getItem(`${prefix}expenses`);
        const savedWastage = localStorage.getItem(`${prefix}wastage`);
        const savedStaff = localStorage.getItem(`${prefix}staff`);
        const savedAttendance = localStorage.getItem(`${prefix}attendance`);
        const savedClosings = localStorage.getItem(`${prefix}closings`);
        const savedDeductions = localStorage.getItem(`${prefix}deductions`);

        setProducts(savedProducts ? JSON.parse(savedProducts) : []);
        setSales(savedSales ? JSON.parse(savedSales) : []);
        setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
        setWastage(savedWastage ? JSON.parse(savedWastage) : []);
        setStaff(savedStaff ? JSON.parse(savedStaff) : []);
        setAttendance(savedAttendance ? JSON.parse(savedAttendance) : []);
        setDailyClosings(savedClosings ? JSON.parse(savedClosings) : []);
        setDeductions(savedDeductions ? JSON.parse(savedDeductions) : []);
      } catch (err) {
        console.error("Error loading data from local storage", err);
      } finally {
        setIsDataLoaded(true);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (isDataLoaded && currentUser) {
      const prefix = `bakery_v3_${currentUser.toLowerCase()}_`;
      localStorage.setItem(`${prefix}products`, JSON.stringify(products));
      localStorage.setItem(`${prefix}sales`, JSON.stringify(sales));
      localStorage.setItem(`${prefix}expenses`, JSON.stringify(expenses));
      localStorage.setItem(`${prefix}wastage`, JSON.stringify(wastage));
      localStorage.setItem(`${prefix}staff`, JSON.stringify(staff));
      localStorage.setItem(`${prefix}attendance`, JSON.stringify(attendance));
      localStorage.setItem(`${prefix}closings`, JSON.stringify(dailyClosings));
      localStorage.setItem(`${prefix}deductions`, JSON.stringify(deductions));
    }
  }, [products, sales, expenses, wastage, staff, attendance, dailyClosings, deductions, currentUser, isDataLoaded]);

  const handleLogin = (username: string) => {
    const normalizedUsername = username.toLowerCase();
    setCurrentUser(normalizedUsername);
    setIsAuthenticated(true);
    localStorage.setItem('sweetBakery_auth', normalizedUsername);
  };

  const handleLogout = () => {
    if (window.confirm("আপনি কি লগআউট করতে চান?")) {
      setIsAuthenticated(false);
      setCurrentUser('');
      setIsDataLoaded(false);
      localStorage.removeItem('sweetBakery_auth');
    }
  };

  const addSale = (newSale: Sale) => {
    setSales(prev => [...prev, newSale]);
    setProducts(prev => prev.map(p => 
      p.id === newSale.productId 
        ? { ...p, stock: Math.max(0, p.stock - newSale.quantity) } 
        : p
    ));
  };

  const cancelSale = (saleId: string) => {
    const saleToCancel = sales.find(s => s.id === saleId);
    if (!saleToCancel) return;

    if (window.confirm(`আপনি কি এই বিক্রয়টি বাতিল করতে চান? (এটি বাতিল করলে "${saleToCancel.productName}" এর স্টক ফেরত যাবে)`)) {
      setSales(prev => prev.filter(s => s.id !== saleId));
      setProducts(prev => prev.map(p => 
        p.id === saleToCancel.productId 
          ? { ...p, stock: p.stock + saleToCancel.quantity } 
          : p
      ));
    }
  };

  const updateSale = (updatedSale: Sale) => {
    setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
  };

  const updateSales = (updatedSales: Sale[]) => {
    setSales(prev => {
      const newSales = [...prev];
      updatedSales.forEach(updated => {
        const index = newSales.findIndex(s => s.id === updated.id);
        if (index !== -1) {
          newSales[index] = updated;
        }
      });
      return newSales;
    });
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const addWastage = (newWastage: Wastage) => {
    setWastage(prev => [...prev, newWastage]);
    setProducts(prev => prev.map(p => 
      p.id === newWastage.productId 
        ? { ...p, stock: Math.max(0, p.stock - newWastage.quantity) } 
        : p
    ));
  };

  const deleteWastage = (id: string) => {
    const item = wastage.find(w => w.id === id);
    if (!item) return;

    if (window.confirm(`এটি ডিলিট করলে "${item.productName}" এর স্টক ফেরত যাবে। আপনি কি নিশ্চিত?`)) {
      setWastage(prev => prev.filter(w => w.id !== id));
      setProducts(prev => prev.map(p => 
        p.id === item.productId 
          ? { ...p, stock: p.stock + item.quantity } 
          : p
      ));
    }
  };

  const addStaffMember = (newStaff: Staff) => {
    setStaff(prev => [...prev, newStaff]);
  };

  const updateAttendance = (newAttendance: Attendance) => {
    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.staffId === newAttendance.staffId && a.date === newAttendance.date));
      return [...filtered, newAttendance];
    });
  };

  const addDeduction = (newDeduction: Deduction) => {
    setDeductions(prev => [...prev, newDeduction]);
  };

  const addDailyClosing = (closing: DailyClosing) => {
    setDailyClosings(prev => [...prev, closing]);
    setCurrentView(View.DASHBOARD);
    alert('ডেইলি ক্লোজিং সফল হয়েছে! ড্যাশবোর্ডের সমস্ত হিসাব রিসেট করা হয়েছে।');
  };

  const deleteDailyClosing = (id: string) => {
    if (window.confirm('Delete this closing record? This will "Unlock" the transactions for that period.')) {
      setDailyClosings(prev => prev.filter(c => c.id !== id));
    }
  };

  const paySalary = (staffId: string, amount: number) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: `Salary Payment: ${staffMember.name} (${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()})`,
      amount: amount,
      category: 'Salary',
      date: new Date().toISOString()
    };
    addExpense(newExpense);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    setDeductions(prev => prev.filter(d => {
      const dDate = new Date(d.date);
      return !(d.staffId === staffId && dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear);
    }));
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} theme={theme} />;
  }

  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} />, bangla: 'ড্যাশবোর্ড' },
    { id: View.SALES, label: 'Sales', icon: <ShoppingCart size={20} />, bangla: 'বিক্রয়' },
    { id: View.DUES, label: 'Dues', icon: <Wallet size={20} />, bangla: 'বাকি' },
    { id: View.INVENTORY, label: 'Inventory', icon: <Package size={20} />, bangla: 'মজুদ', notification: lowStockCount },
    { id: View.WASTAGE, label: 'Wastage', icon: <Trash2 size={20} />, bangla: 'নষ্ট মাল' },
    { id: View.EXPENSES, label: 'Expenses', icon: <ReceiptIndianRupee size={20} />, bangla: 'খরচ' },
    { id: View.STAFF, label: 'Staff & Salary', icon: <Users size={20} />, bangla: 'হাজিরা ও বেতন' },
    { id: View.DAILY_CLOSING, label: 'Daily Closing', icon: <Lock size={20} />, bangla: 'ক্লোজিং' },
    { id: View.MANAGER, label: 'Manager Profile', icon: <UserCheck size={20} />, bangla: 'ম্যানেজার' },
  ];

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white ${isMobileMenuOpen ? 'overflow-hidden lg:overflow-auto' : ''}`}>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[60] lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`w-72 bg-white dark:bg-dark-bg border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-[70] transition-all duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-orange-500/10' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(242,103,17,0.4)]">
               <UtensilsCrossed size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-orange-500 tracking-tight leading-tight">Sweet Live<br/><span className="text-lg">Bakery</span></h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="lg:hidden p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
             <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                currentView === item.id 
                  ? 'bg-orange-500 text-white shadow-[0_8px_20px_rgba(242,103,17,0.2)]' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white hover:bg-orange-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`transition-transform duration-200 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <div className="flex flex-col items-start leading-none flex-1">
                <span className="font-bold text-[14px]">{item.label}</span>
                {item.bangla && <span className="text-[10px] opacity-60 mt-0.5">{item.bangla}</span>}
              </div>
              {item.notification && item.notification > 0 && (
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full text-[10px] font-black shadow-sm ${
                  currentView === item.id ? 'bg-white text-orange-600' : 'bg-red-500 text-white'
                }`}>
                  {item.notification}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6">
           {deferredPrompt && (
             <button 
              onClick={handleInstallClick}
              className="w-full mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-3 hover:bg-orange-500 hover:text-white transition-all group"
             >
                <Monitor size={18} className="text-orange-500 group-hover:text-white shrink-0" />
                <p className="text-[10px] font-bold uppercase leading-tight text-left">
                  Install Desktop App (পিসিতে সেভ করুন)
                </p>
             </button>
           )}
           <div className="bg-slate-100 dark:bg-[#161d31] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 group">
              <p className="text-[10px] text-orange-500 uppercase tracking-widest font-bold mb-1">Bakery Status</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">v3.1.0 <span className="text-emerald-500 ml-1">• Stable</span></h4>
              <p className="text-[10px] text-slate-500 mt-2 truncate">User: <span className="text-slate-700 dark:text-slate-300 capitalize font-medium">{currentUser}</span></p>
           </div>
           <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-bold uppercase tracking-widest opacity-60">
             © 2026 MD SHAMIM
           </div>
        </div>
      </aside>

      <main className="lg:ml-72 flex-1 w-full min-h-screen flex flex-col relative">
        <header className="sticky top-0 z-40 px-4 md:px-8 py-4 bg-slate-50/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="lg:hidden p-2.5 text-orange-500 bg-white dark:bg-[#161d31] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm active:scale-90 transition-transform"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-[#161d31] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
               <UtensilsCrossed size={24} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white capitalize truncate max-w-[150px] xs:max-w-none">
                {currentView === View.DASHBOARD ? 'Sweet Live Bakery' : currentView.toLowerCase().replace('_', ' ')}
              </h2>
              <p className="hidden xs:block text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                Stable Desktop Management <span className="text-orange-500 ml-1">• Persistent Auth</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
             <button 
               onClick={toggleTheme}
               className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white dark:bg-[#161d31] border border-slate-200 dark:border-slate-800 rounded-xl text-orange-500 hover:bg-orange-50 dark:hover:bg-[#1e293b] transition-all shadow-sm active:scale-90"
               title="Toggle Theme"
             >
                {theme === 'dark' ? <SafeSun size={18} /> : <Moon size={18} />}
             </button>
             <button 
               onClick={handleLogout}
               className="h-10 md:h-12 px-4 md:px-6 bg-white dark:bg-[#161d31] border border-slate-200 dark:border-slate-800 rounded-xl text-red-500 font-bold flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm text-sm active:scale-95"
             >
               <LogOut size={16} className="hidden xs:block" /> 
               <span>Logout</span>
             </button>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1">
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out h-full">
            {!isDataLoaded ? (
              <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="font-bold tracking-widest text-[10px] uppercase animate-pulse">Establishing Secure Session...</p>
              </div>
            ) : (
              <>
                {currentView === View.DASHBOARD && (
                  <Dashboard products={products} sales={sales} expenses={expenses} wastage={wastage} closings={dailyClosings} onInstall={handleInstallClick} showInstallButton={!!deferredPrompt} />
                )}
                {currentView === View.INVENTORY && (
                  <Inventory products={products} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} onMarkWastage={(p, qty, reason) => addWastage({ id: Date.now().toString(), productId: p.id, productName: p.name, quantity: qty, unit: p.unit, lossValue: p.price * qty, reason, date: new Date().toISOString() })} />
                )}
                {currentView === View.SALES && (
                  <SalesView products={products} sales={sales} onAddSale={addSale} onCancelSale={cancelSale} closings={dailyClosings} />
                )}
                {currentView === View.DUES && (
                  <DuesView sales={sales} onUpdateSales={updateSales} />
                )}
                {currentView === View.WASTAGE && (
                  <WastageView wastage={wastage} products={products} onAdd={addWastage} onDelete={deleteWastage} closings={dailyClosings} />
                )}
                {currentView === View.EXPENSES && (
                  <ExpensesView expenses={expenses} onAdd={addExpense} closings={dailyClosings} />
                )}
                {currentView === View.DAILY_CLOSING && (
                  <DailyClosingView 
                    sales={sales} 
                    expenses={expenses} 
                    wastage={wastage}
                    closings={dailyClosings} 
                    onCloseDay={addDailyClosing} 
                    onDeleteClosing={deleteDailyClosing}
                    currentUser={currentUser} 
                  />
                )}
                {currentView === View.MANAGER && (
                  <ManagerView 
                    username={currentUser} 
                    onLogout={handleLogout} 
                    stats={{
                      products: products.length,
                      sales: sales.length,
                      expenses: expenses.length,
                      staff: staff.length
                    }}
                  />
                )}
                {currentView === View.STAFF && (
                  <StaffView 
                    staff={staff} 
                    attendance={attendance} 
                    expenses={expenses}
                    deductions={deductions}
                    onAddStaff={addStaffMember} 
                    onUpdateAttendance={updateAttendance} 
                    onAddDeduction={addDeduction}
                    onPaySalary={paySalary}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const SafeSun = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
);

export default App;
