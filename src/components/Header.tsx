import { formatYearMonth } from '../utils/format';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useTransactions } from '../contexts/TransactionContext';
import { useState } from 'react';
import { cn } from '../utils/cn';

export default function Header() {
  const { currentYear, currentMonth, setCurrentMonth, setCurrentYear } = useTransactions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4">
      {/* Mobile menu button */}
      <button 
        className="md:hidden rounded-md p-2 hover:bg-input"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="w-5 h-5" />
      </button>
      
      {/* Date navigation */}
      <div className="flex items-center">
        <button 
          onClick={goToPreviousMonth}
          className="p-1 rounded-md hover:bg-input"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <span className="mx-2 text-lg font-medium">
          {formatYearMonth(currentYear, currentMonth)}
        </span>
        
        <button 
          onClick={goToNextMonth}
          className="p-1 rounded-md hover:bg-input"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Mobile menu */}
      <div className={cn(
        "md:hidden fixed inset-0 bg-background z-50 transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-16 border-b border-border flex items-center px-4">
            <button
              className="p-2 rounded-md hover:bg-input"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="ml-2 text-lg font-medium">メニュー</span>
          </div>
          
          <nav className="flex-1 p-4">
            {/* Mobile navigation items */}
          </nav>
        </div>
      </div>
    </header>
  );
}