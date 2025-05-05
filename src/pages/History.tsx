import { useTransactions } from '../contexts/TransactionContext';
import { formatCurrency, formatDate } from '../utils/format';
import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Trash2, Edit } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';

export default function History() {
  const { transactions, deleteTransaction, currentMonth, currentYear } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Filter transactions by current month/year
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
        transactionDate.getFullYear() === currentYear &&
        transactionDate.getMonth() + 1 === currentMonth
    );
  });

  // Filter and sort transactions
  const filteredTransactions = currentMonthTransactions
      .filter(transaction => {
        const matchesSearch =
            transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.memo.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType =
            filterType === 'all' ||
            transaction.type === filterType;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'asc'
              ? new Date(a.date).getTime() - new Date(b.date).getTime()
              : new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
          return sortOrder === 'asc'
              ? a.amount - b.amount
              : b.amount - a.amount;
        }
      });

  // Toggle sort order
  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle transaction edit
  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // Handle transaction delete
  const handleDelete = async (id: number) => {
    if (window.confirm('この取引を削除してもよろしいですか？')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error('Failed to delete transaction', error);
      }
    }
  };

  return (
      <div className="space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">取引履歴</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4" />
            <input
                type="text"
                placeholder="カテゴリまたはメモで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <button
                  className="px-4 py-2 bg-input rounded-md flex items-center"
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              >
                <Filter className="mr-2 h-4 w-4" />
                <span>
                {filterType === 'all' ? 'すべて' :
                    filterType === 'income' ? '収入' : '支出'}
              </span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {isFilterMenuOpen && (
                  <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-md shadow-md z-10">
                    <div className="py-1">
                      <button
                          className="px-4 py-2 hover:bg-input w-full text-left"
                          onClick={() => {
                            setFilterType('all');
                            setIsFilterMenuOpen(false);
                          }}
                      >
                        すべて
                      </button>
                      <button
                          className="px-4 py-2 hover:bg-input w-full text-left"
                          onClick={() => {
                            setFilterType('income');
                            setIsFilterMenuOpen(false);
                          }}
                      >
                        収入
                      </button>
                      <button
                          className="px-4 py-2 hover:bg-input w-full text-left"
                          onClick={() => {
                            setFilterType('expense');
                            setIsFilterMenuOpen(false);
                          }}
                      >
                        支出
                      </button>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
            <tr>
              <th className="text-left py-3 px-4">カテゴリ</th>
              <th className="text-left py-3 px-4">
                <button
                    className="flex items-center"
                    onClick={() => toggleSort('date')}
                >
                  日付
                  <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${
                          sortBy === 'date' && sortOrder === 'asc' ? 'rotate-180' : ''
                      }`}
                  />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                    className="flex items-center ml-auto"
                    onClick={() => toggleSort('amount')}
                >
                  金額
                  <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${
                          sortBy === 'amount' && sortOrder === 'asc' ? 'rotate-180' : ''
                      }`}
                  />
                </button>
              </th>
              <th className="text-right py-3 px-4">操作</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-border">
            {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-input/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{transaction.category}</p>
                          {transaction.memo && (
                              <p className="text-xs text-muted mt-1">{transaction.memo}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(transaction.date)}
                      </td>
                      <td className={`py-3 px-4 text-right ${
                          transaction.type === 'income' ? 'text-secondary' : 'text-danger'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                              onClick={() => handleEdit(transaction)}
                              className="p-1 rounded-full hover:bg-input"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                              onClick={() => transaction.id && handleDelete(transaction.id)}
                              className="p-1 rounded-full hover:bg-danger hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))
            ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">
                    取引が見つかりません
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
            <TransactionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setSelectedTransaction(null);
                }}
                initialData={selectedTransaction}
            />
        )}
      </div>
  );
}