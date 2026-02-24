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
  { id: 'agents' as const, label: 'My Agents', icon: Home },
  { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
  { id: 'dna' as const, label: 'DNA', icon: Dna },
  { id: 'marketplace' as const, label: 'Store', icon: ShoppingBag },
  { id: 'profile' as const, label: 'Profile', icon: User },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  onTabChange,
  unreadMessages = 0
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-autopus-border"
    >
      <div className="flex items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[64px] ${
                isActive 
                  ? 'text-accent' 
                  : 'text-tertiary hover:text-secondary'
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {tab.id === 'chat' && unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent rounded-full text-[10px] text-white font-bold flex items-center justify-center"
                  >
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-safe-area-inset-bottom bg-surface" />
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
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface border-r border-autopus-border z-40"
    >
      {/* Logo */}
      <div className="p-6 border-b border-autopus-border">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ 
              background: 'linear-gradient(135deg, #2B2D42, #3D3F5C)',
            }}
          >
            🐙
          </div>
          <div>
            <h1 className="font-bold text-primary">Autopus</h1>
            <p className="text-xs text-secondary">Agent Companion</p>
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
                  ? 'bg-accent/10 text-accent' 
                  : 'text-secondary hover:bg-autopus hover:text-primary'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {tab.id === 'chat' && unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent rounded-full text-[10px] text-white font-bold flex items-center justify-center"
                  >
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className="font-medium">{tab.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-autopus-border">
        <p className="text-xs text-tertiary text-center">
          Autopus Station v2.0
        </p>
      </div>
    </aside>
  );
};
