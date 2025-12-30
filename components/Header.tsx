
import React from 'react';
import { AppSettings } from '../types';

interface HeaderProps {
  onSearchClick: () => void;
  searchActive: boolean;
  onSearchChange: (val: string) => void;
  searchValue: string;
  settings: AppSettings;
}

const Header: React.FC<HeaderProps> = ({ onSearchClick, searchActive, onSearchChange, searchValue, settings }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: '28px' }}>local_pizza</span>
            )}
            <h1 className="text-neutral-900 dark:text-white text-xl font-bold leading-tight tracking-tight truncate">
              {settings.shopName || 'Hott Rossi'}
            </h1>
          </div>
        </div>
        
        {searchActive ? (
          <div className="flex-[2] ml-4 relative">
             <input 
              autoFocus
              type="text" 
              placeholder="Buscar no cardápio..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 px-4 pr-10 rounded-full bg-gray-100 dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary text-neutral-900 dark:text-white text-sm"
             />
             <button 
              onClick={onSearchClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
             >
                <span className="material-symbols-outlined text-sm">close</span>
             </button>
          </div>
        ) : (
          <button 
            onClick={onSearchClick}
            className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-surface-dark w-10 h-10 text-neutral-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#3d241f] transition-colors shrink-0 ml-2"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <p className="text-neutral-600 dark:text-[#c99b92] text-xs font-medium">Aberto • Fecha às 23:00</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
