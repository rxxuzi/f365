import { useTransactions } from '../contexts/TransactionContext';
import { formatCurrency } from '../utils/format';
import { useState, useEffect, useMemo } from 'react';
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
  ChartOptions,
  TooltipItem,
  ChartData
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calendar
} from 'lucide-react';

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

// Increase default font sizes for all charts
ChartJS.defaults.font.size = 16;
ChartJS.defaults.borderColor = 'rgba(51, 51, 51, 0.1)';
ChartJS.defaults.color = '#888888';

// Time periods for analysis
type AnalysisPeriod = 'month' | 'quarter' | 'year';

export default function Analysis() {
  const { transactions, summary, currentYear, currentMonth } = useTransactions();
  const [analysisPeriod, setAnalysisPeriod] = useState<AnalysisPeriod>('month');

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};

    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          if (categories[t.category]) {
            categories[t.category] += t.amount;
          } else {
            categories[t.category] = t.amount;
          }
        });

    // Sort categories by amount (highest first)
    return Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, number>);
  }, [transactions]);

  // Create expense category data for pie chart
  const categoryData: ChartData<'doughnut'> = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#3B82F6', // blue
          '#F59E0B', // amber
          '#10B981', // green
          '#6366F1', // indigo
          '#8B5CF6', // violet
          '#EC4899', // pink
          '#EF4444', // red
          '#14B8A6', // teal
          '#F97316', // orange
          '#A855F7', // purple
          '#64748B', // slate
        ],
        borderWidth: 1,
        borderColor: '#111111',
      },
    ],
  };

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    // Initialize with all months
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    // Initialize income/expense data for each month
    const monthlyIncomes = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);
    const monthlyBalances = Array(12).fill(0);

    // Group transactions by month
    transactions.forEach(t => {
      const date = new Date(t.date);
      const month = date.getMonth();

      if (t.type === 'income') {
        monthlyIncomes[month] += t.amount;
      } else {
        monthlyExpenses[month] += t.amount;
      }
    });

    // Calculate balances
    for (let i = 0; i < 12; i++) {
      monthlyBalances[i] = monthlyIncomes[i] - monthlyExpenses[i];
    }

    return {
      labels: monthNames,
      incomes: monthlyIncomes,
      expenses: monthlyExpenses,
      balances: monthlyBalances,
    };
  }, [transactions]);

  // Monthly income vs. expense data
  const monthlyData: ChartData<'bar'> = {
    labels: monthlyTrends.labels,
    datasets: [
      {
        label: '収入',
        data: monthlyTrends.incomes,
        backgroundColor: '#10B981',
        borderRadius: 4,
      },
      {
        label: '支出',
        data: monthlyTrends.expenses,
        backgroundColor: '#EF4444',
        borderRadius: 4,
      },
    ],
  };

  // Savings trend data
  const savingsData: {
    datasets: {
      borderColor: string;
      backgroundColor: string;
      tension: number;
      data: any[];
      borderWidth: number;
      label: string;
      fill: boolean
    }[];
    labels: string[]
  } = {
    labels: monthlyTrends.labels,
    datasets: [
      {
        label: '貯蓄額',
        data: monthlyTrends.balances,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };

  // Calculate day of week trends
  const dayOfWeekTrends = useMemo(() => {
    const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    const dayCounts = Array(7).fill(0);
    const dayTotals = Array(7).fill(0);

    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const date = new Date(t.date);
          const day = date.getDay(); // 0 is Sunday, 6 is Saturday
          dayCounts[day]++;
          dayTotals[day] += t.amount;
        });

    // Calculate averages
    const dayAverages = dayTotals.map((total, index) =>
        dayCounts[index] ? Math.round(total / dayCounts[index]) : 0
    );

    return {
      labels: dayNames,
      totals: dayTotals,
      averages: dayAverages,
    };
  }, [transactions]);

  // Day of week spending data
  const dayOfWeekData: ChartData<'bar'> = {
    labels: dayOfWeekTrends.labels,
    datasets: [
      {
        label: '平均支出',
        data: dayOfWeekTrends.averages,
        backgroundColor: '#8B5CF6', // violet
        borderRadius: 6,
        maxBarThickness: 60,
      },
    ],
  };

  // Bar chart options
  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 16,
          },
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            return `${context.dataset.label || ''}: ¥${formatCurrency(context.parsed.y)}`;
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
          font: {
            size: 14,
          },
          callback: function(value) {
            return `¥${formatCurrency(Number(value))}`;
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  // Properly typed doughnut chart options
  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14,
          },
          padding: 20,
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
        callbacks: {
          label: function(context: TooltipItem<'doughnut'>) {
            const value = context.raw as number;
            const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `¥${formatCurrency(value)} (${percentage}%)`;
          }
        }
      },
    },
  };

  // Line chart options
  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            return `貯蓄額: ¥${formatCurrency(context.raw as number)}`;
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
          font: {
            size: 14,
          },
          callback: function(value) {
            return `¥${formatCurrency(Number(value))}`;
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    if (transactions.length === 0) {
      return {
        savingsRate: 0,
        avgMonthlyExpense: 0,
        largestExpense: 0,
        transactionCount: 0,
        avgTransactionAmount: 0,
        incomeToExpenseRatio: 0,
      };
    }

    const savingsRate = summary.income > 0
        ? Math.round((summary.income - summary.expense) / summary.income * 100)
        : 0;

    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const largestExpense = expenseTransactions.length > 0
        ? Math.max(...expenseTransactions.map(t => t.amount))
        : 0;

    const avgMonthlyExpense = summary.expense / (analysisPeriod === 'month' ? 1 : analysisPeriod === 'quarter' ? 3 : 12);

    const avgTransactionAmount = transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
        : 0;

    const incomeToExpenseRatio = summary.expense > 0
        ? summary.income / summary.expense
        : 0;

    return {
      savingsRate,
      avgMonthlyExpense,
      largestExpense,
      transactionCount: transactions.length,
      avgTransactionAmount,
      incomeToExpenseRatio,
    };
  }, [transactions, summary, analysisPeriod]);

  return (
      <div className="space-y-8 animate-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">分析</h1>

          {/* Period selector */}
          <div className="flex bg-input rounded-md overflow-hidden">
            <button
                onClick={() => setAnalysisPeriod('month')}
                className={`px-4 py-2 text-sm ${
                    analysisPeriod === 'month' ? 'bg-primary text-white' : 'hover:bg-border'
                }`}
            >
              月次
            </button>
            <button
                onClick={() => setAnalysisPeriod('quarter')}
                className={`px-4 py-2 text-sm ${
                    analysisPeriod === 'quarter' ? 'bg-primary text-white' : 'hover:bg-border'
                }`}
            >
              四半期
            </button>
            <button
                onClick={() => setAnalysisPeriod('year')}
                className={`px-4 py-2 text-sm ${
                    analysisPeriod === 'year' ? 'bg-primary text-white' : 'hover:bg-border'
                }`}
            >
              年次
            </button>
          </div>
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Income Card */}
          <div className="bg-green-900/20 p-6 rounded-lg border border-green-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUp className="w-6 h-6 text-secondary mr-3" />
                <span className="text-lg text-muted">総収入</span>
              </div>
              <span className="text-2xl font-semibold text-secondary">
              ¥{formatCurrency(summary.income)}
            </span>
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-red-900/20 p-6 rounded-lg border border-red-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowDown className="w-6 h-6 text-danger mr-3" />
                <span className="text-lg text-muted">総支出</span>
              </div>
              <span className="text-2xl font-semibold text-danger">
              ¥{formatCurrency(summary.expense)}
            </span>
            </div>
          </div>

          {/* Savings Rate Card */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Percent className="w-6 h-6 text-info mr-3" />
                <span className="text-lg text-muted">貯蓄率</span>
              </div>
              <span className="text-2xl font-semibold">
              {financialMetrics.savingsRate}%
            </span>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-primary mr-3" />
                <span className="text-lg text-muted">収支バランス</span>
              </div>
              <span className={`text-2xl font-semibold ${summary.balance >= 0 ? 'text-secondary' : 'text-danger'}`}>
              ¥{formatCurrency(summary.balance)}
            </span>
            </div>
          </div>
        </div>

        {/* First row of charts - balanced 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Income vs. Expense */}
          <div className="card p-6">
            <h2 className="text-xl font-medium mb-4">月次収支推移</h2>
            <div className="h-80">
              <Bar data={monthlyData} options={barOptions} />
            </div>
          </div>

          {/* Expense by Category */}
          <div className="card p-6">
            <h2 className="text-xl font-medium mb-4">カテゴリ別支出</h2>
            <div className="h-80">
              <Doughnut data={categoryData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Second row of charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Savings Trend */}
          <div className="card p-6">
            <h2 className="text-xl font-medium mb-4">貯蓄推移</h2>
            <div className="h-80">
              <Line
                  data={savingsData}
                  options={lineOptions}
              />
            </div>
          </div>

          {/* Day of Week Spending */}
          <div className="card p-6">
            <h2 className="text-xl font-medium mb-4">曜日別支出傾向</h2>
            <div className="h-80">
              <Bar
                  data={dayOfWeekData}
                  options={barOptions}
              />
            </div>
          </div>
        </div>

        {/* Third row - statistics and top expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Expenses */}
          <div className="card p-6">
            <h2 className="text-xl font-medium mb-4">主要支出</h2>
            <div className="space-y-3">
              {transactions
                  .filter(t => t.type === 'expense')
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((transaction) => (
                      <div
                          key={transaction.id}
                          className="flex justify-between items-center p-4 bg-input rounded-md"
                      >
                        <div>
                          <p className="text-lg font-medium">{transaction.category}</p>
                          <p className="text-base text-muted">{transaction.date}</p>
                          {transaction.memo && (
                              <p className="text-sm text-muted mt-1">{transaction.memo}</p>
                          )}
                        </div>
                        <p className="text-lg text-danger">
                          ¥{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                  ))}

              {transactions.filter(t => t.type === 'expense').length === 0 && (
                  <div className="text-center p-4 text-muted">
                    支出データがありません
                  </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="card p-6">
            <h2 className="text-xl font-medium mb-4">統計情報</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-5 bg-input rounded-lg">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-muted mr-2" />
                  <h3 className="text-lg text-muted">取引回数</h3>
                </div>
                <p className="text-2xl font-semibold">{financialMetrics.transactionCount}回</p>
              </div>

              <div className="p-5 bg-input rounded-lg">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 text-muted mr-2" />
                  <h3 className="text-lg text-muted">平均取引額</h3>
                </div>
                <p className="text-2xl font-semibold">
                  ¥{formatCurrency(financialMetrics.avgTransactionAmount)}
                </p>
              </div>

              <div className="p-5 bg-input rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingDown className="w-5 h-5 text-muted mr-2" />
                  <h3 className="text-lg text-muted">最大支出</h3>
                </div>
                <p className="text-2xl font-semibold">
                  ¥{formatCurrency(financialMetrics.largestExpense)}
                </p>
              </div>

              <div className="p-5 bg-input rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-muted mr-2" />
                  <h3 className="text-lg text-muted">収支比率</h3>
                </div>
                <p className="text-2xl font-semibold">
                  {financialMetrics.incomeToExpenseRatio.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}