import { Transaction, SavingsGoal, InvestmentAsset } from '../types';

// Base API URL - configurable for different environments
const API_BASE_URL = 'https://x.rxxuzi.com/api';

// API endpoints for different resources
const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/users`,
  SAVINGS: `${API_BASE_URL}/savings`,
  TRANSACTIONS: `${API_BASE_URL}/transactions`,
};

// Use mocks only as fallback when API fails
const FALLBACK_TO_MOCKS = true;

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
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const url = `${API_ENDPOINTS.TRANSACTIONS}${params.toString() ? `?${params.toString()}` : ''}`;
    logApiRequest('GET', url);

    try {
      const response = await fetch(url);
      const data = await handleResponse(response);
      return data.transactions || [];
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error);

      // Fall back to mock data if configured
      if (FALLBACK_TO_MOCKS) {
        console.log('🔸 Falling back to mock transaction data');
        return mockTransactions;
      }

      throw error;
    }
  },

  add: async (transaction: Transaction): Promise<Transaction> => {
    const url = API_ENDPOINTS.TRANSACTIONS;
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

      // Fall back to mock handling if configured
      if (FALLBACK_TO_MOCKS) {
        console.log('🔸 Falling back to mock transaction add');
        return {
          ...transaction,
          id: Math.floor(Math.random() * 10000),
        };
      }

      throw error;
    }
  },

  update: async (transaction: Transaction): Promise<Transaction> => {
    const url = `${API_ENDPOINTS.TRANSACTIONS}/${transaction.id}`;
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

      // Fall back to mock handling if configured
      if (FALLBACK_TO_MOCKS) {
        console.log('🔸 Falling back to mock transaction update');
        return transaction;
      }

      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    const url = `${API_ENDPOINTS.TRANSACTIONS}/${id}`;
    logApiRequest('DELETE', url);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      await handleResponse(response);
    } catch (error) {
      console.error('❌ Failed to delete transaction:', error);

      // Fall back to mock handling if configured
      if (FALLBACK_TO_MOCKS) {
        console.log('🔸 Falling back to mock transaction delete');
        return;
      }

      throw error;
    }
  },
};

// Savings Goals API
export const savingsGoalsApi = {
  getAll: async (): Promise<SavingsGoal[]> => {
    const url = API_ENDPOINTS.SAVINGS;
    logApiRequest('GET', url);

    try {
      const response = await fetch(url);
      const data = await handleResponse(response);
      return data.savings || [];
    } catch (error) {
      console.error('❌ Failed to fetch savings goals:', error);

      // Fall back to mock data if configured
      if (FALLBACK_TO_MOCKS) {
        console.log('🔸 Falling back to mock savings data');
        return mockSavingsGoals;
      }

      throw error;
    }
  },

  add: async (goal: SavingsGoal): Promise<SavingsGoal> => {
    const url = API_ENDPOINTS.SAVINGS;
    logApiRequest('POST', url, goal);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      const data = await handleResponse(response);
      return data.savingsGoal;
    } catch (error) {
      console.error('❌ Failed to add savings goal:', error);

      // Fall back to mock handling if configured
      if (FALLBACK_TO_MOCKS) {
        console.log('🔸 Falling back to mock savings goal add');
        return {
          ...goal,
          id: Math.floor(Math.random() * 10000),
        };
      }

      throw error;
    }
  },

  update: async (goal: SavingsGoal): Promise<SavingsGoal> => {
    const url = `${API_ENDPOINTS.SAVINGS}/${goal.id}`;
    logApiRequest('PUT', url, goal);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      const data = await handleResponse(response);
      return data.savingsGoal;
    } catch (error) {
      console.error('❌ Failed to update savings goal:', error);

      // Fall back to mock handling if configured
      if (FALLBACK_TO_MOCKS) {
        console.log('🔸 Falling back to mock savings goal update');
        return goal;
      }

      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    const url = `${API_ENDPOINTS.SAVINGS}/${id}`;
    logApiRequest('DELETE', url);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      await handleResponse(response);
    } catch (error) {
      console.error('❌ Failed to delete savings goal:', error);

      // Fall back to mock handling if configured
      if (FALLBACK_TO_MOCKS) {
        console.log('🔸 Falling back to mock savings goal delete');
        return;
      }

      throw error;
    }
  },
};

// Users API
export const usersApi = {
  getProfile: async (): Promise<any> => {
    const url = API_ENDPOINTS.USERS;
    logApiRequest('GET', url);

    try {
      const response = await fetch(url);
      const data = await handleResponse(response);
      return data.user || {};
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);

      // Fall back to mock data if configured
      if (FALLBACK_TO_MOCKS) {
        console.log('🔸 Falling back to mock user data');
        return mockUserProfile;
      }

      throw error;
    }
  },

  updateProfile: async (userData: any): Promise<any> => {
    const url = API_ENDPOINTS.USERS;
    logApiRequest('PUT', url, userData);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await handleResponse(response);
      return data.user;
    } catch (error) {
      console.error('❌ Failed to update user profile:', error);

      // Fall back to mock handling if configured
      if (FALLBACK_TO_MOCKS) {
        console.log('🔸 Falling back to mock user profile update');
        return userData;
      }

      throw error;
    }
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

export const mockSavingsGoals = [
  {
    id: 1,
    name: '緊急用資金',
    target_amount: 1000000,
    current_amount: 450000,
    target_date: '2025-12-31'
  },
  {
    id: 2,
    name: '旅行資金',
    target_amount: 300000,
    current_amount: 120000,
    target_date: '2025-08-01'
  },
  {
    id: 3,
    name: '新しいパソコン',
    target_amount: 250000,
    current_amount: 100000,
    target_date: '2025-10-01'
  }
];

export const mockUserProfile = {
  id: 1,
  username: 'user123',
  email: 'user@example.com',
  name: '山田 太郎',
  settings: {
    currency: 'JPY',
    language: 'ja',
    theme: 'dark',
    savingsGoal: 3000000
  }
};