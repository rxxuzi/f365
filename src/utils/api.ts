import { Transaction, SavingsGoal, InvestmentAsset } from '../types';

// Base API URL - should be updated to match your PHP backend
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Flag to force using mocks (set to false when your API is ready)
const USE_MOCKS = true;

// Add more logging for debugging
const logApiRequest = (method: string, url: string, body?: any) => {
  console.log(`🌐 API ${method} Request:`, url, body || '');
};

async function handleResponse(response: Response) {
  console.log(`📥 API Response Status:`, response.status);

  // First try to get the response as JSON
  try {
    const data = await response.json();

    // Check for non-ok status
    if (!response.ok) {
      console.error('❌ API Error Response:', data);
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    console.log('✅ API Response Data:', data);
    return data;
  } catch (err) {
    // Error parsing JSON or in the response
    console.error('❌ API Response Error:', err);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // If response was ok but JSON parsing failed
    throw new Error('Invalid response format');
  }
}

// Transactions API
export const transactionsApi = {
  getAll: async (year?: number, month?: number): Promise<Transaction[]> => {
    if (USE_MOCKS) {
      console.log('🔸 Using mock transaction data');
      return Promise.resolve(mockTransactions);
    }

    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const url = `${API_URL}/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    logApiRequest('GET', url);

    try {
      const response = await fetch(url);
      const data = await handleResponse(response);
      return data.transactions || [];
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error);
      throw error;
    }
  },

  add: async (transaction: Transaction): Promise<Transaction> => {
    if (USE_MOCKS) {
      console.log('🔸 Using mock transaction add');
      return Promise.resolve({
        ...transaction,
        id: Math.floor(Math.random() * 10000),
      });
    }

    const url = `${API_URL}/transactions`;
    logApiRequest('POST', url, transaction);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      const data = await handleResponse(response);
      return data.transaction;
    } catch (error) {
      console.error('❌ Failed to add transaction:', error);
      throw error;
    }
  },

  update: async (transaction: Transaction): Promise<Transaction> => {
    if (USE_MOCKS) {
      console.log('🔸 Using mock transaction update');
      return Promise.resolve(transaction);
    }

    const url = `${API_URL}/transactions`;
    logApiRequest('PUT', url, transaction);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      const data = await handleResponse(response);
      return data.transaction;
    } catch (error) {
      console.error('❌ Failed to update transaction:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCKS) {
      console.log('🔸 Using mock transaction delete');
      return Promise.resolve();
    }

    const url = `${API_URL}/transactions`;
    logApiRequest('DELETE', url, { id });

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await handleResponse(response);
    } catch (error) {
      console.error('❌ Failed to delete transaction:', error);
      throw error;
    }
  },
};

// Savings Goals API
export const savingsGoalsApi = {
  // ... similar pattern with mock handling
};

// Investments API
export const investmentsApi = {
  // ... similar pattern with mock handling
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