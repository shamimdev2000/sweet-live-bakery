
import React, { useState } from 'react';
import { Staff, Attendance, Expense, Deduction } from '../types';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  UserPlus,
  History,
  Users,
  Banknote,
  PiggyBank,
  Clock,
  MinusCircle,
  AlertCircle,
  X,
  ChevronRight
} from 'lucide-react';

interface Props {
  staff: Staff[];
  attendance: Attendance[];
  expenses: Expense[];
  deductions: Deduction[];
  onAddStaff: (s: Staff) => void;
  onUpdateAttendance: (a: Attendance) => void;
  onAddDeduction: (d: Deduction) => void;
  onPaySalary: (staffId: string, amount: number) => void;
}

const StaffView: React.FC<Props> = ({ 
  staff, 
  attendance, 
  expenses, 
  deductions,
  onAddStaff, 
  onUpdateAttendance, 
  onAddDeduction,
  onPaySalary 
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'salary'>('attendance');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeducting, setIsDeducting] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [staffFormData, setStaffFormData] = useState({
    name: '',
    designation: '',
    monthlySalary: '' as number | ''
  });

  const [deductionFormData, setDeductionFormData] = useState({
    amount: '' as number | '',
    reason: ''
  });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStaff({
      ...staffFormData,
      monthlySalary: Number(staffFormData.monthlySalary) || 0,
      id: Date.now().toString(),
      joinDate: new Date().toISOString()
    } as Staff);
    setStaffFormData({ name: '', designation: '', monthlySalary: '' });
    setIsAdding(false);
  };

  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDeducting) return;
    
    onAddDeduction({
      id: Date.now().toString(),
      staffId: isDeducting,
      amount: Number(deductionFormData.amount) || 0,
      reason: deductionFormData.reason,
      date: new Date().toISOString()
    });
    
    setDeductionFormData({ amount: '', reason: '' });
    setIsDeducting(null);
  };

  const getStatus = (staffId: string) => {
    const record = attendance.find(a => a.staffId === staffId && a.date === selectedDate);
    return record?.status || 'Not Marked';
  };

  const calculateTotalPaid = (staffName: string) => {
    return expenses
      .filter(e => e.category === 'Salary' && e.description.toLowerCase().includes(staffName.toLowerCase()))
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getCurrentMonthDeductions = (staffId: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return deductions
      .filter(d => {
        const dDate = new Date(d.date);
        return d.staffId === staffId && dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
      })
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const getDeductionList = (staffId: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return deductions
      .filter(d => {
        const dDate = new Date(d.date);
        return d.staffId === staffId && dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getPaymentHistory = (staffName: string) => {
    return expenses
      .filter(e => e.category === 'Salary' && e.description.toLowerCase().includes(staffName.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const recentAttendance = [...attendance]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Header Row as seen in screenshot */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-[#161d31] p-1 rounded-2xl border border-slate-800 shadow-sm">
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'attendance' ? 'bg-[#212a3e] text-white shadow-lg border border-slate-700' : 'text-slate-400 hover:text-white'}`}
          >
            Attendance (হাজিরা)
          </button>
          <button 
            onClick={() => setActiveTab('salary')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'salary' ? 'bg-[#212a3e] text-white shadow-lg border border-slate-700' : 'text-slate-400 hover:text-white'}`}
          >
            Salaries (বেতন)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group bg-[#161d31] rounded-xl border border-slate-800">
            <input 
              type="date" 
              className="bg-transparent border-none p-3 px-5 pr-10 rounded-xl text-white outline-none focus:ring-0 cursor-pointer text-sm font-bold"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 text-sm"
          >
            + Add Staff
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-[#161d31] p-8 rounded-[2rem] border border-slate-800 shadow-xl animate-in fade-in zoom-in duration-300">
          <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <UserPlus size={20} className="text-orange-500" /> Register Staff Member
          </h3>
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Full Name</label>
              <input required type="text" className="w-full p-4 rounded-xl bg-[#0a1120] border border-slate-800 text-white focus:ring-2 focus:ring-orange-500/50 outline-none" value={staffFormData.name} onChange={e => setStaffFormData({...staffFormData, name: e.target.value})} placeholder="e.g. Shuvo" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Designation</label>
              <input required type="text" className="w-full p-4 rounded-xl bg-[#0a1120] border border-slate-800 text-white focus:ring-2 focus:ring-orange-500/50 outline-none" value={staffFormData.designation} onChange={e => setStaffFormData({...staffFormData, designation: e.target.value})} placeholder="e.g. Master Baker" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Monthly Salary (৳)</label>
              <input required type="number" className="w-full p-4 rounded-xl bg-[#0a1120] border border-slate-800 text-white focus:ring-2 focus:ring-orange-500/50 outline-none" value={staffFormData.monthlySalary} onChange={e => setStaffFormData({...staffFormData, monthlySalary: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="0" />
            </div>
            <div className="md:col-span-3 flex justify-end gap-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-500 font-semibold">Cancel</button>
              <button type="submit" className="bg-orange-500 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg">Save Staff</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'attendance' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Attendance List */}
          <div className="lg:col-span-7">
            <div className="bg-[#161d31] rounded-[1.5rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">Attendance for {new Date(selectedDate).toLocaleDateString()}</h3>
              </div>
              <div className="p-6 space-y-4">
                {staff.map(s => {
                  const status = getStatus(s.id);
                  return (
                    <div key={s.id} className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 bg-[#212a3e]/30 rounded-2xl border border-slate-800/50 hover:bg-[#212a3e]/50 transition-all gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-lg border border-slate-600">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-white">{s.name}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.designation}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => onUpdateAttendance({ id: Date.now().toString(), staffId: s.id, date: selectedDate, status: 'Present' })}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs transition-all ${status === 'Present' ? 'bg-emerald-500 text-white' : 'bg-[#212a3e] text-slate-400 hover:text-white'}`}
                        >
                          Present
                        </button>
                        <button 
                          onClick={() => onUpdateAttendance({ id: Date.now().toString(), staffId: s.id, date: selectedDate, status: 'Late' })}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs transition-all ${status === 'Late' ? 'bg-amber-500 text-white' : 'bg-[#212a3e] text-slate-400 hover:text-white'}`}
                        >
                          Late
                        </button>
                        <button 
                          onClick={() => onUpdateAttendance({ id: Date.now().toString(), staffId: s.id, date: selectedDate, status: 'Absent' })}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs transition-all ${status === 'Absent' ? 'bg-red-500 text-white' : 'bg-[#212a3e] text-slate-400 hover:text-white'}`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
                {staff.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    <Users size={40} className="mx-auto mb-4 opacity-10" />
                    <p>No staff added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-[#161d31] rounded-[1.5rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="px-8 py-6 flex items-center justify-between border-b border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recent Attendance Records</h3>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1 cursor-pointer hover:text-orange-500 transition-colors">
                  History <ChevronRight size={12} />
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase text-slate-600 font-black border-b border-slate-800">
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Name</th>
                      <th className="px-8 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {recentAttendance.map(a => {
                      const staffMember = staff.find(s => s.id === a.staffId);
                      return (
                        <tr key={a.id} className="text-[11px] group hover:bg-[#212a3e]/10 transition-colors">
                          <td className="px-8 py-5 text-slate-500">{new Date(a.date).toLocaleDateString()}</td>
                          <td className="px-8 py-5 font-bold text-slate-300">{staffMember?.name || 'Unknown'}</td>
                          <td className="px-8 py-5 text-right">
                            <span className={`font-black uppercase tracking-widest text-[9px] ${
                              a.status === 'Present' ? 'text-emerald-500' : 
                              a.status === 'Late' ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {recentAttendance.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center text-slate-600 font-bold uppercase tracking-widest">
                           No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Salaries View (remains consistent but with matching dark theme) */
        <div className="bg-[#161d31] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {staff.map(s => {
              const totalPaid = calculateTotalPaid(s.name);
              const history = getPaymentHistory(s.name);
              const currentMonthDeductions = getCurrentMonthDeductions(s.id);
              const netPayable = s.monthlySalary - currentMonthDeductions;
              const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
              const isPaidThisMonth = history.some(h => h.description.includes(currentMonthName) && h.description.includes(new Date().getFullYear().toString()));

              return (
                <div key={s.id} className="bg-[#0a1120] p-8 rounded-3xl border border-slate-800 hover:border-orange-500/50 transition-all group flex flex-col h-full shadow-lg">
                  <div className="flex justify-center mb-4 relative">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                      <Banknote size={32} />
                    </div>
                    <button onClick={() => setIsDeducting(s.id)} className="absolute -top-1 -right-1 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><MinusCircle size={16} /></button>
                  </div>
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold mb-1 text-white">{s.name}</h4>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">{s.designation}</p>
                    <div className="mt-4 p-4 bg-[#161d31] rounded-2xl border border-slate-800 shadow-sm">
                       <span className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mb-1 block">Net Payable</span>
                       <div className="text-3xl font-black text-white">৳{netPayable.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="bg-[#161d31] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-emerald-400">
                          <PiggyBank size={16} />
                          <span className="text-[10px] font-bold uppercase">Lifetime Paid</span>
                       </div>
                       <div className="text-sm font-bold text-white">৳{totalPaid.toLocaleString()}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { if(window.confirm(`${s.name} কে নিট ৳${netPayable} প্রদান করতে চান?`)) onPaySalary(s.id, netPayable); }}
                    disabled={isPaidThisMonth}
                    className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 mt-auto flex items-center justify-center gap-2 ${isPaidThisMonth ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                  >
                    {isPaidThisMonth ? <CheckCircle2 size={18} /> : <Banknote size={18} />}
                    {isPaidThisMonth ? 'Already Paid' : 'Pay Net Salary'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deduction Modal (Styled for dark theme) */}
      {isDeducting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-[#161d31] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl w-full max-w-md animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2"><MinusCircle size={20} className="text-red-500" /> Add Deduction</h3>
                 <button onClick={() => setIsDeducting(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddDeduction} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Amount (৳)</label>
                    <input required type="number" className="w-full p-4 rounded-xl bg-[#0a1120] border border-slate-800 text-white outline-none" value={deductionFormData.amount} onChange={e => setDeductionFormData({...deductionFormData, amount: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="0.00" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Reason</label>
                    <textarea required className="w-full p-4 rounded-xl bg-[#0a1120] border border-slate-800 text-white outline-none h-24 resize-none" value={deductionFormData.reason} onChange={e => setDeductionFormData({...deductionFormData, reason: e.target.value})} placeholder="Reason for deduction..." />
                 </div>
                 <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg">Record Deduction</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffView;
