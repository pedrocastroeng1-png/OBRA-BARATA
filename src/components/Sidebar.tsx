import { LayoutDashboard, Settings, History, Send, ListPlus, Activity } from 'lucide-react';
import React from 'react';
import clsx from 'clsx';

interface SidebarProps {
  currentTab: 'dashboard' | 'history' | 'keywords' | 'settings' | 'diagnostic';
  onTabChange: (tab: 'dashboard' | 'history' | 'keywords' | 'settings' | 'diagnostic') => void;
}

export function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'keywords', label: 'Palavras-Chave', icon: ListPlus },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'diagnostic', label: 'Diagnóstico', icon: Activity },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ] as const;

  return (
    <div className="w-64 bg-black text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-yellow-400 text-black p-1.5 rounded-md">
            <Send size={20} className="transform -rotate-45 ml-1" />
          </span>
          Obra Barata
        </h1>
        <p className="text-gray-400 text-xs mt-2">v1.0 - SaaS Panel</p>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-yellow-400 text-black" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">Pronto para VPS</p>
          <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Sistema Online
          </div>
        </div>
      </div>
    </div>
  );
}
