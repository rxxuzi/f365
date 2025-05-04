import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useTransactions } from '../contexts/TransactionContext';
import { formatDateForInput } from '../utils/format';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id?: number;
    amount: number;
    category: string;
    date: string;
    memo: string;
    type: 'income' | 'expense';
  };
}

export default function TransactionModal({ 
  isOpen, 
  onClose,
  initialData 
}: TransactionModalProps) {
  const { addTransaction } = useTransactions();
  const today = new Date().toISOString().split('T')[0];
  
  // Initial form state
  const [form, setForm] = useState({
    id: initialData?.id,
    amount: initialData?.amount || 0,
    category: initialData?.category || '食費',
    date: initialData?.date || today,
    memo: initialData?.memo || '',
    type: initialData?.type || 'expense',
  });
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!form.amount) newErrors.amount = '金額は必須です';
    if (!form.category) newErrors.category = 'カテゴリは必須です';
    if (!form.date) newErrors.date = '日付は必須です';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await addTransaction(form);
      onClose();
      
      // Reset form
      setForm({
        id: undefined,
        amount: 0,
        category: '食費',
        date: today,
        memo: '',
        type: 'expense',
      });
    } catch (error) {
      console.error('Failed to save transaction', error);
    }
  };
  
  // Update form values
  const updateForm = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    
    // Clear error for this field if exists
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-semibold">新規追加</h2>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-foreground rounded-full p-1 hover:bg-input"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Income/Expense Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`py-3 rounded-md flex items-center justify-center ${
                form.type === 'income' 
                  ? 'bg-secondary/20 text-secondary border border-secondary' 
                  : 'bg-input text-muted'
              }`}
              onClick={() => updateForm('type', 'income')}
            >
              <span className="text-lg">＋ 収入</span>
            </button>
            
            <button
              type="button"
              className={`py-3 rounded-md flex items-center justify-center ${
                form.type === 'expense' 
                  ? 'bg-danger/20 text-danger border border-danger' 
                  : 'bg-input text-muted'
              }`}
              onClick={() => updateForm('type', 'expense')}
            >
              <span className="text-lg">ー 支出</span>
            </button>
          </div>
          
          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              金額
            </label>
            <input 
              type="number" 
              value={form.amount || ''} 
              onChange={(e) => updateForm('amount', parseFloat(e.target.value) || 0)}
              className={`w-full ${errors.amount ? 'border-danger' : ''}`}
            />
            {errors.amount && (
              <p className="text-sm text-danger">{errors.amount}</p>
            )}
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              カテゴリ
            </label>
            <select 
              value={form.category} 
              onChange={(e) => updateForm('category', e.target.value)}
              className={`w-full ${errors.category ? 'border-danger' : ''}`}
            >
              {form.type === 'expense' ? (
                <>
                  <option value="食費">食費</option>
                  <option value="家賃">家賃</option>
                  <option value="光熱費">光熱費</option>
                  <option value="交通費">交通費</option>
                  <option value="娯楽">娯楽</option>
                  <option value="医療費">医療費</option>
                  <option value="衣服">衣服</option>
                  <option value="その他">その他</option>
                </>
              ) : (
                <>
                  <option value="給料">給料</option>
                  <option value="副業">副業</option>
                  <option value="投資">投資</option>
                  <option value="贈与">贈与</option>
                  <option value="その他">その他</option>
                </>
              )}
            </select>
            {errors.category && (
              <p className="text-sm text-danger">{errors.category}</p>
            )}
          </div>
          
          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              日付
            </label>
            <div className="relative">
              <input 
                type="date" 
                value={formatDateForInput(form.date)} 
                onChange={(e) => updateForm('date', e.target.value)}
                className={`w-full ${errors.date ? 'border-danger' : ''}`}
              />
              <Calendar className="w-5 h-5 absolute right-3 top-2.5 pointer-events-none text-muted" />
            </div>
            {errors.date && (
              <p className="text-sm text-danger">{errors.date}</p>
            )}
          </div>
          
          {/* Memo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              メモ
            </label>
            <textarea 
              value={form.memo} 
              onChange={(e) => updateForm('memo', e.target.value)}
              className="w-full min-h-[100px]"
            />
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
          >
            保存
          </button>
        </form>
      </div>
    </div>
  );
}