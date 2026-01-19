
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string; // e.g., 'pcs', 'kg', 'gm', 'pkt', 'ltr'
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  amountPaid: number;
  dueAmount: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'Cash' | 'Mobile Payment';
  date: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'Raw Material' | 'Utilities' | 'Rent' | 'Staff' | 'Salary' | 'Other';
  date: string;
}

export interface Wastage {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  lossValue: number;
  reason: string;
  date: string;
}

export interface Staff {
  id: string;
  name: string;
  designation: string;
  monthlySalary: number;
  joinDate: string;
}

export interface Attendance {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Late' | 'Absent';
}

export interface Deduction {
  id: string;
  staffId: string;
  amount: number;
  reason: string;
  date: string;
}

export interface DailyClosing {
  id: string;
  date: string; // YYYY-MM-DD
  totalSales: number;
  totalCashCollected: number;
  totalExpenses: number;
  totalWastage: number;
  systemBalance: number;
  actualCash: number;
  difference: number;
  closedBy: string;
  timestamp: string;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  EXPENSES = 'EXPENSES',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER',
  DAILY_CLOSING = 'DAILY_CLOSING',
  DUES = 'DUES',
  WASTAGE = 'WASTAGE'
}
