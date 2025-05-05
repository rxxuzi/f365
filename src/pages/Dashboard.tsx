import { useTransactions } from '../contexts/TransactionContext';
import { formatCurrency, calculatePercentage } from '../utils/format';
import {
  ArrowUp,
  ArrowDown,
  PiggyBank,
  DollarSign,
  Calendar,
  Wallet,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
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
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { cn } from '../utils/cn';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

export default function Dashboard() {
  const { summary, transactions, currentMonth, currentYear } = useTransactions();
  const [activeTab, setActiveTab] = useState('summary');
  const [totalSavings, setTotalSavings] = useState(500000); // Initial value from the API
  const [savingsGoal, setSavingsGoal] = useState(3000000); // Initial value from the API
  const [savingsRate, setSavingsRate] = useState(0);

  // Fetch totals from API on component mount
  useEffect(() => {
    const fetchSavingsData = async () => {
      try {
        // In a real app, these would come from API calls
        // For now, we'll use the data from the JSON files you provided
        const savedAmount = 500000; // From users.json
        const goalAmount = 3000000; // From users.json

        setTotalSavings(savedAmount);
        setSavingsGoal(goalAmount);

        // Calculate savings rate based on income and expenses
        if (summary.income > 0) {
          setSavingsRate(Math.round(((summary.income - summary.expense) / summary.income) * 100));
        }
      } catch (error) {
        console.error('Failed to fetch savings data:', error);
      }
    };

    fetchSavingsData();
  }, [summary]);

  // Get transaction history for trends chart
  const transactionHistory = useMemo(() => {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group by date and calculate running balance
    let runningBalance = totalSavings - summary.balance; // Start with existing savings minus current month's balance
    const balanceByDate = {};

    sortedTransactions.forEach(transaction => {
      const date = transaction.date.substring(0, 10); // YYYY-MM-DD format

      if (!balanceByDate[date]) {
        balanceByDate[date] = runningBalance;
      }

      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }

      balanceByDate[date] = runningBalance;
    });

    // Convert to arrays for charting
    const dates = Object.keys(balanceByDate).sort();
    const balances = dates.map(date => balanceByDate[date]);

    return {
      dates,
      balances
    };
  }, [transactions, totalSavings, summary.balance]);

  // Create chart data
  const balanceData = {
    labels: transactionHistory.dates,
    datasets: [
      {
        label: '資産推移',
        data: transactionHistory.balances,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
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
        beginAtZero: false,
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

  // Create the savings rate meter
  const getSavingsRateColor = (rate: number) => {
    if (rate < 0) return '#EF4444'; // Red for negative
    if (rate < 10) return '#F59E0B'; // Orange for low
    if (rate < 20) return '#10B981'; // Green for good
    return '#3B82F6'; // Blue for excellent
  };

  const getSavingsRateLabel = (rate: number) => {
    if (rate < 0) return '赤字';
    if (rate < 10) return '低貯蓄';
    if (rate < 20) return '貯蓄中';
    if (rate < 30) return '高貯蓄';
    return '優秀';
  };

  // Savings meter data
  const meterData = {
    labels: ['赤字', '低貯蓄', '貯蓄中', '高貯蓄', '優秀'],
    datasets: [
      {
        data: [20, 20, 20, 20, 20], // Equal segments
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
        borderWidth: 0,
      },
    ],
  };

  const meterOptions = {
    cutout: '75%',
    circumference: 180,
    rotation: 270,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Calculate needle rotation based on savings rate
  // Convert savings rate to a position on the meter (0-100% -> 0-180 degrees)
  const getNeedleRotation = (rate: number) => {
    // Limit the rate between -10 and 40 for display purposes
    const limitedRate = Math.max(-10, Math.min(40, rate));
    // Map from -10 to 40 range to 0 to 180 degrees
    return ((limitedRate + 10) / 50) * 180;
  };

  return (
      <div className="space-y-8 animate-in">
        {/* Header section */}
        <div className="text-center mb-6">
          <p className="text-muted mb-2">現在の残高</p>
          <h2 className="text-4xl font-bold text-primary mb-4">
            ¥ {formatCurrency(summary.balance)}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/20 transition-all hover:bg-green-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowUp className="w-5 h-5 text-secondary mr-2" />
                  <span className="text-muted">収入</span>
                </div>
                <span className="text-xl font-semibold text-secondary">
                ¥ {formatCurrency(summary.income)}
              </span>
              </div>
            </div>

            <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/20 transition-all hover:bg-red-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowDown className="w-5 h-5 text-danger mr-2" />
                  <span className="text-muted">支出</span>
                </div>
                <span className="text-xl font-semibold text-danger">
                ¥ {formatCurrency(summary.expense)}
              </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                  onClick={() => setActiveTab('summary')}
                  className={cn(
                      "px-4 py-2 rounded-md text-sm whitespace-nowrap",
                      activeTab === 'summary'
                          ? "bg-primary text-white"
                          : "bg-input hover:bg-border"
                  )}
              >
                概要
              </button>
              <button
                  onClick={() => setActiveTab('savings')}
                  className={cn(
                      "px-4 py-2 rounded-md text-sm whitespace-nowrap",
                      activeTab === 'savings'
                          ? "bg-primary text-white"
                          : "bg-input hover:bg-border"
                  )}
              >
                <span className="text-primary font-medium">総貯蓄</span>
              </button>
              <button
                  onClick={() => setActiveTab('trends')}
                  className={cn(
                      "px-4 py-2 rounded-md text-sm whitespace-nowrap",
                      activeTab === 'trends'
                          ? "bg-primary text-white"
                          : "bg-input hover:bg-border"
                  )}
              >
                残高推移
              </button>
            </div>
          </div>

          {/* Summary Tab - Financial Health Overview */}
          {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Savings Rate Meter */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">今月の貯蓄率</h3>

                  <div className="relative h-44">
                    {/* Gauge chart */}
                    <div className="h-44">
                      <Doughnut data={meterData} options={meterOptions as any} />
                    </div>

                    {/* Needle */}
                    <div
                        className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
                        style={{
                          transform: `rotate(${getNeedleRotation(savingsRate)}deg)`,
                          transformOrigin: 'center bottom'
                        }}
                    >
                      <div className="w-1 h-32 bg-foreground rounded-t-full relative bottom-6"></div>
                    </div>

                    {/* Center circle and value */}
                    <div className="absolute top-1/2 left-0 right-0 flex flex-col items-center">
                      <div className="text-3xl font-bold" style={{ color: getSavingsRateColor(savingsRate) }}>
                        {savingsRate}%
                      </div>
                      <div className="text-sm font-medium" style={{ color: getSavingsRateColor(savingsRate) }}>
                        {getSavingsRateLabel(savingsRate)}
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-36 left-0 right-0 flex justify-between px-4">
                      <span className="text-xs text-muted">&lt;0%</span>
                      <span className="text-xs text-muted">30%&gt;</span>
                    </div>
                  </div>

                  <div className="mt-4 text-center text-sm text-muted">
                    {savingsRate >= 20 ? (
                        '素晴らしい！この調子で貯蓄を続けましょう。'
                    ) : savingsRate > 0 ? (
                        '良い調子です。支出を抑えて貯蓄率を高めましょう。'
                    ) : (
                        '収支がマイナスです。支出を見直しましょう。'
                    )}
                  </div>
                </div>

                {/* Monthly Stats */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">今月の状況</h3>
                    <div
                        className="text-sm px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getSavingsRateColor(savingsRate)}20`,
                          color: getSavingsRateColor(savingsRate)
                        }}
                    >
                      {getSavingsRateLabel(savingsRate)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-input rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Wallet className="w-5 h-5 text-muted mr-2" />
                        <span className="text-muted">収支比率</span>
                      </div>
                      <div className="text-xl font-semibold">
                        {summary.income > 0
                            ? (summary.expense / summary.income * 100).toFixed(0)
                            : 0}%
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {summary.income > summary.expense
                            ? '収入が支出を上回っています'
                            : '支出が収入を上回っています'}
                      </p>
                    </div>

                    <div className="bg-input rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-muted mr-2" />
                        <span className="text-muted">今月</span>
                      </div>
                      <div className="text-xl font-semibold">
                        {currentYear}年{currentMonth}月
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {transactions.length}件の取引
                      </p>
                    </div>

                    <div className="bg-input rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <PiggyBank className="w-5 h-5 text-muted mr-2" />
                        <span className="text-muted">今月の貯蓄</span>
                      </div>
                      <div className="text-xl font-semibold">
                        ¥{formatCurrency(Math.max(0, summary.income - summary.expense))}
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {summary.income > summary.expense
                            ? `目標の${((summary.income - summary.expense) / (savingsGoal - totalSavings) * 100).toFixed(1)}%達成`
                            : '今月は貯蓄がありません'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">最近の取引</h3>
                    <a href="/history" className="text-sm text-primary hover:text-primary-hover">
                      すべて表示
                    </a>
                  </div>

                  <div className="space-y-3">
                    {transactions.length > 0 ? (
                        transactions.slice(0, 5).map(transaction => (
                            <div
                                key={transaction.id}
                                className="flex justify-between items-center p-3 rounded-md hover:bg-input transition-colors cursor-pointer"
                            >
                              <div className="flex items-start">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                                    transaction.type === 'income' ? 'bg-secondary/20' : 'bg-danger/20'
                                )}>
                                  {transaction.type === 'income'
                                      ? <ArrowUp className="w-4 h-4 text-secondary" />
                                      : <ArrowDown className="w-4 h-4 text-danger" />
                                  }
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{transaction.category}</p>
                                  <p className="text-xs text-muted">{transaction.date}</p>
                                </div>
                              </div>
                              <p className={cn(
                                  "font-medium",
                                  transaction.type === 'income' ? 'text-secondary' : 'text-danger'
                              )}>
                                {transaction.type === 'income' ? '+' : '-'}
                                ¥{formatCurrency(transaction.amount)}
                              </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-muted">
                          取引履歴がありません
                        </div>
                    )}
                  </div>
                </div>
              </div>
          )}

          {/* Total Savings Tab */}
          {activeTab === 'savings' && (
              <div className="card p-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2">
                    <span className="text-primary">総貯蓄額：</span>¥ {formatCurrency(totalSavings)}
                  </h2>
                  <p className="text-muted">目標: ¥{formatCurrency(savingsGoal)}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="h-4 w-full bg-border rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out"
                        style={{ width: `${Math.min(calculatePercentage(totalSavings, savingsGoal), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                <span className="text-sm text-muted">
                  達成率: {calculatePercentage(totalSavings, savingsGoal)}%
                </span>
                    <span className="text-sm text-muted">
                  残り: ¥{formatCurrency(savingsGoal - totalSavings)}
                </span>
                  </div>
                </div>

                {/* Savings Breakdown */}
                <div className="bg-input rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-medium mb-3">貯蓄内訳</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                        <span>現在の貯蓄</span>
                      </div>
                      <span className="font-medium">¥{formatCurrency(totalSavings)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
                        <span>今月の追加貯蓄</span>
                      </div>
                      <span className="font-medium">
                    {summary.income > summary.expense
                        ? `+¥${formatCurrency(summary.income - summary.expense)}`
                        : `¥0`}
                  </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-primary-hover mr-2"></div>
                        <span>予想貯蓄総額</span>
                      </div>
                      <span className="font-medium">
                    ¥{formatCurrency(totalSavings + Math.max(0, summary.income - summary.expense))}
                  </span>
                    </div>
                  </div>
                </div>

                {/* Goal Estimation */}
                <div className="bg-input rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">目標達成予測</h3>
                  {summary.income > summary.expense ? (
                      <div className="space-y-2">
                        <p className="text-sm">
                          現在の貯蓄ペースでは、目標達成まであと
                          <span className="font-bold text-primary"> {Math.ceil((savingsGoal - totalSavings) / (summary.income - summary.expense))} </span>
                          ヶ月かかります。
                        </p>
                        <p className="text-sm text-muted">
                          毎月 ¥{formatCurrency(summary.income - summary.expense)} のペースで貯蓄中
                        </p>
                        <p className="text-sm">
                          目標達成予定: {currentYear + Math.floor((currentMonth - 1 + Math.ceil((savingsGoal - totalSavings) / (summary.income - summary.expense))) / 12)}年
                          {((currentMonth - 1 + Math.ceil((savingsGoal - totalSavings) / (summary.income - summary.expense))) % 12) + 1}月
                        </p>
                      </div>
                  ) : (
                      <p className="text-sm text-danger">
                        現在、支出が収入を上回っています。貯蓄目標を達成するには収入を増やすか、支出を減らす必要があります。
                      </p>
                  )}
                </div>
              </div>
          )}

          {/* Balance Trend Tab */}
          {activeTab === 'trends' && (
              <div className="card p-6">
                <h2 className="text-lg font-medium mb-4">資産推移</h2>

                {transactionHistory.dates.length > 0 ? (
                    <>
                      <div className="h-64 mb-6">
                        <Line data={balanceData} options={chartOptions as any} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-input rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <TrendingUp className="w-5 h-5 text-primary mr-2" />
                            <span className="text-muted">開始残高</span>
                          </div>
                          <div className="text-xl font-semibold">
                            ¥{formatCurrency(transactionHistory.balances[0] || 0)}
                          </div>
                        </div>

                        <div className="bg-input rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <DollarSign className="w-5 h-5 text-secondary mr-2" />
                            <span className="text-muted">現在残高</span>
                          </div>
                          <div className="text-xl font-semibold">
                            ¥{formatCurrency(transactionHistory.balances[transactionHistory.balances.length - 1] || 0)}
                          </div>
                        </div>

                        <div className="bg-input rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <PiggyBank className="w-5 h-5 text-primary mr-2" />
                            <span className="text-muted">累計増加額</span>
                          </div>
                          <div className="text-xl font-semibold">
                            {transactionHistory.balances.length > 0 ? (
                                <>
                                  ¥{formatCurrency((transactionHistory.balances[transactionHistory.balances.length - 1] || 0) - (transactionHistory.balances[0] || 0))}
                                  <span className="text-xs text-muted ml-2">
                            ({(((transactionHistory.balances[transactionHistory.balances.length - 1] || 0) / (transactionHistory.balances[0] || 1) - 1) * 100).toFixed(1)}%)
                          </span>
                                </>
                            ) : (
                                "¥0"
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-muted">
                      <p>取引データがまだありません</p>
                      <p className="text-sm mt-2">取引を追加して、資産推移を確認しましょう</p>
                    </div>
                )}
              </div>
          )}
        </div>
      </div>
  );
}