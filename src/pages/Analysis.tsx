import { useTransactions } from '../contexts/TransactionContext';
import { formatCurrency } from '../utils/format';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { ArrowUp, ArrowDown } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analysis() {
  const { transactions, summary } = useTransactions();

  // Monthly income vs. expense
  const monthlyData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    datasets: [
      {
        label: '収入',
        data: Array(12).fill(summary.income),
        backgroundColor: '#10B981',
      },
      {
        label: '支出',
        data: Array(12).fill(summary.expense),
        backgroundColor: '#EF4444',
      },
    ],
  };
  
  // Expense by category
  const categoryData = {
    labels: ['食費', '家賃', '光熱費', '交通費', '娯楽', '医療費'],
    datasets: [
      {
        data: [45800, 126000, 32500, 24257, 15000, 8000],
        backgroundColor: [
          '#3B82F6',
          '#F59E0B',
          '#10B981',
          '#6366F1',
          '#8B5CF6',
          '#EC4899',
        ],
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ¥${formatCurrency(context.parsed.y)}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(51, 51, 51, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return `¥${formatCurrency(value)}`;
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `¥${formatCurrency(value)} (${percentage}%)`;
          }
        }
      },
    },
  };

  // 貯蓄推移データ
  const savingsData = {
    labels: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
    datasets: [
      {
        label: '貯蓄額',
        data: Array(12).fill(500000),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">分析</h1>
      </div>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ArrowUp className="w-5 h-5 text-secondary mr-2" />
              <span className="text-sm text-muted">総収入</span>
            </div>
            <span className="text-xl font-semibold text-secondary">
              ¥{formatCurrency(summary.income)}
            </span>
          </div>
        </div>

        <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ArrowDown className="w-5 h-5 text-danger mr-2" />
              <span className="text-sm text-muted">総支出</span>
            </div>
            <span className="text-xl font-semibold text-danger">
              ¥{formatCurrency(summary.expense)}
            </span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="text-sm text-muted mb-1">平均月次支出</h3>
          <p className="text-xl font-semibold">
            ¥{formatCurrency(summary.expense / 12)}
          </p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="text-sm text-muted mb-1">貯蓄率</h3>
          <p className="text-xl font-semibold">
            {Math.round((summary.income - summary.expense) / summary.income * 100)}%
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs. Expense */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">月次収支推移</h2>
          <div className="h-64">
            <Bar data={monthlyData} options={barOptions} />
          </div>
        </div>
        
        {/* Expense by Category */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">カテゴリ別支出</h2>
          <div className="h-64">
            <Pie data={categoryData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Savings Trend */}
      <div className="card">
        <h2 className="text-lg font-medium mb-4">貯蓄推移</h2>
        <div className="h-64">
          <Line
            data={savingsData}
            options={{
              ...barOptions,
              plugins: {
                ...barOptions.plugins,
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>
      </div>
      
      {/* Weekly Expenses */}
      <div className="card">
        <h2 className="text-lg font-medium mb-4">週別支出</h2>
        <div className="h-64">
          <Bar
            data={{
              labels: ['第1週', '第2週', '第3週', '第4週', '第5週'],
              datasets: [
                {
                  label: '支出',
                  data: [45000, 52000, 38000, 62000, 31557],
                  backgroundColor: '#EF4444',
                },
              ],
            }}
            options={barOptions}
          />
        </div>
      </div>

      {/* Top Expenses */}
      <div className="card">
        <h2 className="text-lg font-medium mb-4">主要支出</h2>
        <div className="space-y-2">
          {transactions
            .filter(t => t.type === 'expense')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((transaction, index) => (
              <div 
                key={transaction.id} 
                className="flex justify-between items-center p-3 bg-input rounded-md"
              >
                <div>
                  <p className="font-medium">{transaction.category}</p>
                  <p className="text-sm text-muted">{transaction.date}</p>
                </div>
                <p className="text-danger">
                  ¥{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="card">
        <h2 className="text-lg font-medium mb-4">統計</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-input rounded-lg">
            <h3 className="text-sm text-muted mb-1">取引回数</h3>
            <p className="text-xl font-semibold">{transactions.length}回</p>
          </div>
          <div className="p-4 bg-input rounded-lg">
            <h3 className="text-sm text-muted mb-1">平均取引額</h3>
            <p className="text-xl font-semibold">
              ¥{formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length)}
            </p>
          </div>
          <div className="p-4 bg-input rounded-lg">
            <h3 className="text-sm text-muted mb-1">最大支出</h3>
            <p className="text-xl font-semibold">
              ¥{formatCurrency(Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount)))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}