import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Transaction, BalanceSummary } from '../types';
import { transactionsApi } from '../utils/api';
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
      // Call the API to fetch transactions
      const data = await transactionsApi.getAll(year, month);
      console.log('Transactions fetched successfully:', data);
      setTransactions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Error in refreshTransactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new transaction
  const addTransaction = async (transaction: Transaction) => {
    try {
      const newTransaction = await transactionsApi.add(transaction);
      setTransactions(prev => [...prev, newTransaction]);
      return Promise.resolve();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
      setError(errorMessage);
      return Promise.reject(err);
    }
  };

  // Update transaction
  const updateTransaction = async (transaction: Transaction) => {
    try {
      const updatedTransaction = await transactionsApi.update(transaction);
      setTransactions(prev =>
          prev.map(t => (t.id === transaction.id ? updatedTransaction : t))
      );
      return Promise.resolve();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(errorMessage);
      return Promise.reject(err);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: number) => {
    try {
      await transactionsApi.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      return Promise.resolve();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(errorMessage);
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