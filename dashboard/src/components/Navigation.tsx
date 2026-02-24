import React from 'react';
import { 
  Home, 
  MessageCircle, 
  Dna, 
  ShoppingBag, 
  User 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'agents' | 'chat' | 'dna' | 'marketplace' | 'profile';
  onTabChange: (tab: 'agents' | 'chat' | 'dna' | 'marketplace' | 'profile') => void;
  unreadMessages?: number;
}

const tabs = [
  { id: 'agents' as const, label: '我的 Agents', icon: Home },
  { id: 'chat' as const, label: '對話', icon: MessageCircle },
  { id: 'dna' as const, label: 'DNA', icon: Dna },
  { id: 'marketplace' as const, label: '商店', icon: ShoppingBag },
  { id: 'profile' as const, label: '我的', icon: User },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  onTabChange,
  unreadMessages = 0
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div 
        className="mx-2 mb-2 rounded-2xl border border-white/10 backdrop-blur-xl"
        style={{ 
          background: 'linear-gradient(180deg, rgba(30,30,40,0.95) 0%, rgba(20,20,30,0.98) 100%)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        <div className="flex items-center justify-around py-2 px-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                  isActive 
                    ? 'bg-white/10 scale-105' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Icon 
                    size={20} 
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-indigo-400' : 'text-white/50'
                    }`} 
                  />
                  {/* Unread badge for chat */}
                  {tab.id === 'chat' && unreadMessages > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center animate-pulse">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </div>
                <span 
                  className={`text-[10px] mt-0.5 font-medium transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-safe-area-inset-bottom bg-black/50" />
    </nav>
  );
};

// Desktop Side Navigation (for larger screens)
interface DesktopSideNavProps {
  activeTab: 'agents' | 'chat' | 'dna' | 'marketplace' | 'profile';
  onTabChange: (tab: 'agents' | 'chat' | 'dna' | 'marketplace' | 'profile') => void;
  unreadMessages?: number;
}

export const DesktopSideNav: React.FC<DesktopSideNavProps> = ({
  activeTab,
  onTabChange,
  unreadMessages = 0
}) => {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/10 backdrop-blur-xl z-40"
      style={{ 
        background: 'linear-gradient(180deg, rgba(20,20,30,0.98) 0%, rgba(15,15,25,0.99) 100%)'
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ 
              background: 'linear-gradient(135deg, #6366F1, #8b5cf6)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
            }}
          >
            🐙
          </div>
          <div>
            <h1 className="font-bold text-white">Autopus</h1>
            <p className="text-xs text-white/40">Agent Companion</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {tab.id === 'chat' && unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className="font-medium">{tab.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/30 text-center">
          Autopus Station v2.0
        </p>
      </div>
    </aside>
  );
};
