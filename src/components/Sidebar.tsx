import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Clock, 
  BarChart2,
  Settings, 
  PlusCircle,
  LineChart
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  openTransactionModal: () => void;
}

export default function Sidebar({ openTransactionModal }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card h-full flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <LineChart className="w-6 h-6 text-primary" />
          <span className="text-xl font-semibold">Future</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <div className="space-y-1">
          <NavLink 
            to="/" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
              isActive 
                ? "bg-primary text-white" 
                : "text-foreground hover:bg-input"
            )}
            end
          >
            <Home className="w-5 h-5 mr-3" />
            ホーム
          </NavLink>
          
          <NavLink 
            to="/history" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
              isActive 
                ? "bg-primary text-white" 
                : "text-foreground hover:bg-input"
            )}
          >
            <Clock className="w-5 h-5 mr-3" />
            履歴
          </NavLink>
          
          <NavLink 
            to="/analysis" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
              isActive 
                ? "bg-primary text-white" 
                : "text-foreground hover:bg-input"
            )}
          >
            <BarChart2 className="w-5 h-5 mr-3" />
            分析
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
              isActive 
                ? "bg-primary text-white" 
                : "text-foreground hover:bg-input"
            )}
          >
            <Settings className="w-5 h-5 mr-3" />
            設定
          </NavLink>
          
          <button
            onClick={openTransactionModal}
            className="w-full flex items-center px-3 py-2 rounded-md text-sm bg-input hover:bg-border transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-3" />
            新規追加
          </button>
        </div>
      </nav>
    </aside>
  );
}