import { useTransactions } from '../contexts/TransactionContext';
import { formatCurrency, calculatePercentage } from '../utils/format';
import { TrendingUp, TrendingDown, Edit2, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { summary, transactions } = useTransactions();
  const [activeTab, setActiveTab] = useState('総貯蓄額');
  
  // Create data for the balance line chart
  const balanceData = {
    labels: Array.from({ length: 31 }, (_, i) => `${i + 1}日`),
    datasets: [
      {
        label: '残高推移',
        data: Array(31).fill(summary.balance),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `¥${formatCurrency(context.parsed.y)}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return `¥${formatCurrency(value)}`;
          }
        },
        grid: {
          color: 'rgba(51, 51, 51, 0.1)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Current Balance */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-primary mb-8">
          ¥ {formatCurrency(summary.balance)}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUp className="w-5 h-5 text-secondary mr-2" />
                <span className="text-sm text-muted">収入</span>
              </div>
              <span className="text-xl font-semibold text-secondary">
                ¥ {formatCurrency(summary.income)}
              </span>
            </div>
          </div>
          
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowDown className="w-5 h-5 text-danger mr-2" />
                <span className="text-sm text-muted">支出</span>
              </div>
              <span className="text-xl font-semibold text-danger">
                ¥ {formatCurrency(summary.expense)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Savings Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('総貯蓄額')}
              className={`px-4 py-2 rounded-md text-sm ${
                activeTab === '総貯蓄額'
                  ? 'bg-primary text-white'
                  : 'bg-input hover:bg-border'
              }`}
            >
              総貯蓄額
            </button>
            <button
              onClick={() => setActiveTab('残高推移')}
              className={`px-4 py-2 rounded-md text-sm ${
                activeTab === '残高推移'
                  ? 'bg-primary text-white'
                  : 'bg-input hover:bg-border'
              }`}
            >
              残高推移
            </button>
          </div>
          
          <button className="p-2 rounded-md bg-input hover:bg-border">
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
        
        {activeTab === '総貯蓄額' ? (
          <div className="card p-6">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-secondary mb-1">
                ¥ {formatCurrency(summary.balance)}
              </h2>
              <p className="text-sm text-muted">目標: ¥3,000,000</p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min(calculatePercentage(summary.balance, 3000000), 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted">
                  進捗: {calculatePercentage(summary.balance, 3000000)}%
                </span>
                <span className="text-xs text-muted">
                  ¥{formatCurrency(3000000)}
                </span>
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted">最近の取引</h3>
                <a href="/history" className="text-sm text-primary hover:text-primary-hover">
                  すべて表示
                </a>
              </div>
              <div className="space-y-2">
                {transactions.slice(0, 3).map(transaction => (
                  <div 
                    key={transaction.id} 
                    className="flex justify-between items-center p-2 rounded-md hover:bg-input"
                  >
                    <div>
                      <p className="text-sm font-medium">{transaction.category}</p>
                      <p className="text-xs text-muted">{transaction.date}</p>
                    </div>
                    <p className={`${
                      transaction.type === 'income' ? 'text-secondary' : 'text-danger'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      ¥{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-6">
            <h2 className="text-lg font-medium mb-4">残高推移</h2>
            <div className="h-64">
              <Line data={balanceData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}