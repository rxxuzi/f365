import { useState, useEffect } from 'react';
import { AlertTriangle, Download, LogOut, Save, Upload } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { useTransactions } from '../contexts/TransactionContext';
import { useNavigate } from 'react-router-dom';
import { usersApi, savingsGoalsApi } from '../utils/api';

export default function Settings() {
  const [savingsGoal, setSavingsGoal] = useState(3000000);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { transactions } = useTransactions();
  const navigate = useNavigate();

  // Fetch user profile and settings on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profile = await usersApi.getProfile();
        setUserProfile(profile);
        // Set savings goal from user profile if available
        if (profile?.settings?.savingsGoal) {
          setSavingsGoal(profile.settings.savingsGoal);
        }
      } catch (err) {
        setError('ユーザープロファイルの取得に失敗しました');
        console.error('Failed to fetch user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Update savings goal
  const handleSavingsGoalUpdate = async () => {
    try {
      if (!userProfile) return;

      const updatedProfile = {
        ...userProfile,
        settings: {
          ...userProfile.settings,
          savingsGoal: savingsGoal
        }
      };

      await usersApi.updateProfile(updatedProfile);
      setUserProfile(updatedProfile);
      alert('貯蓄目標が更新されました');
    } catch (error) {
      console.error('Failed to update savings goal:', error);
      alert('貯蓄目標の更新に失敗しました');
    }
  };

  // Export data to CSV
  const exportData = () => {
    if (transactions.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    // CSVヘッダー
    let csv = '日付,カテゴリ,金額,メモ,タイプ\n';

    // データ行の追加
    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      const memo = transaction.memo ? `"${transaction.memo.replace(/"/g, '""')}"` : '';

      csv += `${transaction.date},${transaction.category},${amount},${memo},${transaction.type}\n`;
    });

    // CSVファイルのダウンロード
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `future_${new Date().toISOString().slice(0, 10)}.csv`;

    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Import data from CSV
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Confirm before import
    if (!window.confirm('既存のデータは上書きされます。よろしいですか？')) {
      event.target.value = ''; // Reset file input
      return;
    }

    try {
      const text = await file.text();
      const rows = text.split('\n');

      // Skip header row and parse data
      const importedData = rows.slice(1)
          .filter(row => row.trim())
          .map(row => {
            const [date, category, amount, memo, type] = row.split(',');
            return {
              date,
              category,
              amount: parseFloat(amount),
              memo: memo?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
              type: type.trim() === '支出' ? 'expense' : 'income'
            };
          });

      // Here we would call an API to import the data
      // For now, just show a success message
      console.log('Imported data:', importedData);
      alert('データのインポートが完了しました');

      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Import error:', error);
      alert('データのインポートに失敗しました');
      event.target.value = ''; // Reset file input
    }
  };

  const handleLogout = () => {
    // Here you would typically call your logout API
    // For now, just navigate to the home page
    navigate('/');
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-lg">読み込み中...</div>
        </div>
    );
  }

  return (
      <div className="space-y-8 animate-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">設定</h1>
        </div>

        {error && (
            <div className="bg-danger/20 p-4 rounded-md border border-danger/30 text-danger">
              {error}
            </div>
        )}

        {/* User Profile */}
        {userProfile && (
            <div className="card">
              <h2 className="text-lg font-medium mb-4">プロフィール</h2>
              <div className="space-y-2 mb-4">
                <p><span className="text-muted">ユーザー名:</span> {userProfile.username}</p>
                <p><span className="text-muted">メール:</span> {userProfile.email}</p>
                <p><span className="text-muted">名前:</span> {userProfile.name}</p>
              </div>
            </div>
        )}

        {/* Savings Goal */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">貯蓄目標</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="mr-4">目標金額:</label>
              <input
                  type="number"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(Number(e.target.value))}
                  className="flex-1"
              />
            </div>

            <div>
              <p className="text-sm text-muted mb-1">現在の目標: ¥{formatCurrency(savingsGoal)}</p>
            </div>

            <button
                onClick={handleSavingsGoalUpdate}
                className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md"
            >
              <Save className="w-4 h-4 mr-2" />
              目標を更新
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">データ管理</h2>
          <div className="space-y-4">
            {/* Import Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">データのインポート</h3>
              <div className="bg-input/50 p-4 rounded-md mb-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">注意</p>
                    <p className="text-muted">
                      インポートを実行すると、既存のデータは上書きされます。
                      必要に応じて、先にデータのエクスポートを行ってください。
                    </p>
                  </div>
                </div>
              </div>
              <label className="flex items-center px-4 py-2 bg-input hover:bg-border rounded-md cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                CSVファイルをインポート
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileImport}
                    className="hidden"
                />
              </label>
            </div>

            {/* Export Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">データのエクスポート</h3>
              <button
                  onClick={exportData}
                  className="flex items-center px-4 py-2 bg-input hover:bg-border rounded-md w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                CSVファイルをエクスポート
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">アカウント</h2>
          <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-danger hover:bg-danger-hover text-white rounded-md w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ログアウト
          </button>
        </div>
      </div>
  );
}