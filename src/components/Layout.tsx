import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';
import TransactionModal from './TransactionModal';
import MobileNav from './MobileNav';
import { PlusCircle } from 'lucide-react';

export default function Layout() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block h-screen">
        <Sidebar openTransactionModal={() => setIsTransactionModalOpen(true)} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav />
          
          {/* Mobile New Transaction Button */}
          <button
            onClick={() => setIsTransactionModalOpen(true)}
            className="fixed right-4 bottom-20 w-12 h-12 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-lg"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
      />
    </div>
  );
}