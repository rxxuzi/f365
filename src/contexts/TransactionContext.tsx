import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Transaction, BalanceSummary } from '../types';
import { transactionsApi, mockTransactions } from '../utils/api';
import { getCurrentYearMonth } from '../utils/format';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  summary: BalanceSummary;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  refreshTransactions: (year?: number, month?: number) => Promise<void>;
  currentYear: number;
  currentMonth: number;
  setCurrentYear: (year: number) => void;
  setCurrentMonth: (month: number) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { year, month } = getCurrentYearMonth();
  const [currentYear, setCurrentYear] = useState(year);
  const [currentMonth, setCurrentMonth] = useState(month);
  const [summary, setSummary] = useState<BalanceSummary>({
    balance: 0,
    income: 0,
    expense: 0,
  });

  // Calculate summary from transactions
  useEffect(() => {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    setSummary({
      income,
      expense,
      balance: income - expense,
    });
  }, [transactions]);

  // Fetch transactions when year/month changes
  useEffect(() => {
    refreshTransactions(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Refresh transactions data
  const refreshTransactions = async (year?: number, month?: number) => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      let data: Transaction[] = [];

      try {
        // Try to get data from API
        data = await transactionsApi.getAll(year, month);
        console.log('API data fetched successfully:', data);
      } catch (apiError) {
        // If API fails, fallback to mock data
        console.warn('API fetch failed, using mock data:', apiError);
        data = mockTransactions;
      }

      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      console.error('Error in refreshTransactions:', err);
      // Fallback to mock data on any error
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  // Add new transaction
  const addTransaction = async (transaction: Transaction) => {
    try {
      let newTransaction: Transaction;

      try {
        // Try to add via API
        newTransaction = await transactionsApi.add(transaction);
      } catch (apiError) {
        console.warn('API add failed, using mock data:', apiError);
        // For development - mimic API behavior if API fails
        newTransaction = {
          ...transaction,
          id: Math.floor(Math.random() * 10000),
        };
      }

      setTransactions(prev => [...prev, newTransaction]);
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      return Promise.reject(err);
    }
  };

  // Update transaction
  const updateTransaction = async (transaction: Transaction) => {
    try {
      try {
        // Try to update via API
        await transactionsApi.update(transaction);
      } catch (apiError) {
        console.warn('API update failed:', apiError);
        // Continue with local update even if API fails
      }

      setTransactions(prev =>
          prev.map(t => (t.id === transaction.id ? transaction : t))
      );
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      return Promise.reject(err);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: number) => {
    try {
      try {
        // Try to delete via API
        await transactionsApi.delete(id);
      } catch (apiError) {
        console.warn('API delete failed:', apiError);
        // Continue with local delete even if API fails
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      return Promise.reject(err);
    }
  };

  return (
      <TransactionContext.Provider
          value={{
            transactions,
            loading,
            error,
            summary,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            refreshTransactions,
            currentYear,
            currentMonth,
            setCurrentYear,
            setCurrentMonth,
          }}
      >
        {children}
      </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}