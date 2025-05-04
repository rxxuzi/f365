export interface Transaction {
  id?: number;
  amount: number;
  category: string;
  date: string;
  memo: string;
  type: 'income' | 'expense';
}

export interface SavingsGoal {
  id?: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
}

export interface BalanceSummary {
  balance: number;
  income: number;
  expense: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface InvestmentAsset {
  id?: number;
  name: string;
  amount: number;
  category: string;
  initial_value: number;
  current_value: number;
  purchase_date: string;
  notes?: string;
}