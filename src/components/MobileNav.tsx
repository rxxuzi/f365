import { NavLink } from 'react-router-dom';
import { Home, Clock, BarChart2, Settings } from 'lucide-react';
import { cn } from '../utils/cn';

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-4">
      <NavLink 
        to="/" 
        className={({ isActive }) => cn(
          "flex items-center justify-center",
          isActive ? "text-primary" : "text-muted"
        )}
        end
      >
        <Home className="w-6 h-6" />
      </NavLink>
      
      <NavLink 
        to="/history" 
        className={({ isActive }) => cn(
          "flex items-center justify-center",
          isActive ? "text-primary" : "text-muted"
        )}
      >
        <Clock className="w-6 h-6" />
      </NavLink>
      
      <NavLink 
        to="/analysis" 
        className={({ isActive }) => cn(
          "flex items-center justify-center",
          isActive ? "text-primary" : "text-muted"
        )}
      >
        <BarChart2 className="w-6 h-6" />
      </NavLink>
      
      <NavLink 
        to="/settings" 
        className={({ isActive }) => cn(
          "flex items-center justify-center",
          isActive ? "text-primary" : "text-muted"
        )}
      >
        <Settings className="w-6 h-6" />
      </NavLink>
    </nav>
  );
}