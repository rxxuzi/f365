import { Transaction, SavingsGoal, InvestmentAsset } from '../types';

// Base API URL - should be updated to match your PHP backend
const API_URL = import.meta.env.VITE_API_URL || '/api';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'An unknown error occurred',
    }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }
  return response.json();
}

// Transactions API
export const transactionsApi = {
  getAll: async (year?: number, month?: number): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const url = `${API_URL}/transactions.php${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    const data = await handleResponse(response);
    return data.transactions || [];
  },
  
  add: async (transaction: Transaction): Promise<Transaction> => {
    const response = await fetch(`${API_URL}/transactions.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    const data = await handleResponse(response);
    return data.transaction;
  },
  
  update: async (transaction: Transaction): Promise<Transaction> => {
    const response = await fetch(`${API_URL}/transactions.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    const data = await handleResponse(response);
    return data.transaction;
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/transactions.php`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await handleResponse(response);
  },
};

// Savings Goals API
export const savingsGoalsApi = {
  getAll: async (): Promise<SavingsGoal[]> => {
    const response = await fetch(`${API_URL}/savings-goals.php`);
    const data = await handleResponse(response);
    return data.goals || [];
  },
  
  getTarget: async (): Promise<SavingsGoal> => {
    const response = await fetch(`${API_URL}/savings-target.php`);
    const data = await handleResponse(response);
    return data.target;
  },
  
  updateTarget: async (goal: SavingsGoal): Promise<SavingsGoal> => {
    const response = await fetch(`${API_URL}/savings-target.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: goal }),
    });
    const data = await handleResponse(response);
    return data.target;
  },
};

// Investments API
export const investmentsApi = {
  getAll: async (): Promise<InvestmentAsset[]> => {
    const response = await fetch(`${API_URL}/investments.php`);
    const data = await handleResponse(response);
    return data.investments || [];
  },
  
  add: async (investment: InvestmentAsset): Promise<InvestmentAsset> => {
    const response = await fetch(`${API_URL}/investments.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investment),
    });
    const data = await handleResponse(response);
    return data.investment;
  },
  
  update: async (investment: InvestmentAsset): Promise<InvestmentAsset> => {
    const response = await fetch(`${API_URL}/investments.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investment),
    });
    const data = await handleResponse(response);
    return data.investment;
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/investments.php`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await handleResponse(response);
  },
};

// For mock data during development
export const mockTransactions: Transaction[] = [
  { 
    id: 1, 
    amount: 280000, 
    category: '給料', 
    date: '2025-04-05', 
    memo: '4月分給料', 
    type: 'income' 
  },
  { 
    id: 2, 
    amount: 158199, 
    category: '副業', 
    date: '2025-04-15', 
    memo: 'フリーランス案件', 
    type: 'income' 
  },
  { 
    id: 3, 
    amount: 126000, 
    category: '家賃', 
    date: '2025-04-02', 
    memo: '4月分家賃', 
    type: 'expense' 
  },
  { 
    id: 4, 
    amount: 45800, 
    category: '食費', 
    date: '2025-04-18', 
    memo: '月の食費', 
    type: 'expense' 
  },
  { 
    id: 5, 
    amount: 32500, 
    category: '光熱費', 
    date: '2025-04-10', 
    memo: '電気・ガス・水道', 
    type: 'expense' 
  },
  { 
    id: 6, 
    amount: 24257, 
    category: '交通費', 
    date: '2025-04-22', 
    memo: '電車・バス', 
    type: 'expense' 
  },
];