import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Map, 
  BarChart2, 
  Plus, 
  Lock, 
  Unlock, 
  ShieldCheck,
  Server,
  Layers
} from 'lucide-react';
import { setAdminAuthState } from '../services/storage';

interface NavbarProps {
  activeTab: 'dashboard' | 'analytics' | 'admin' | 'feeds';
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'admin' | 'feeds') => void;
  onOpenCitizenModal: () => void;
  onOpenAdminLoginModal: () => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (authed: boolean) => void;
  totalEventsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCitizenModal,
  onOpenAdminLoginModal,
  isAdminAuthenticated,
  setIsAdminAuthenticated,
  totalEventsCount
}) => {
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        day: '2-digit',
        month: 'short'
      };
      setIstTime(new Intl.DateTimeFormat('en-IN', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminToggle = () => {
    if (isAdminAuthenticated) {
      setAdminAuthState(false);
      setIsAdminAuthenticated(false);
    } else {
      onOpenAdminLoginModal();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080e1d] border-b border-slate-800/80 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer py-1" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/90 border border-slate-700 text-sky-400">
              <Cloud className="w-5 h-5 stroke-[2.2]" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-white font-sans">
                  CLOUD NET
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  IMD v2.6
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">
                National Weather Monitoring & Verification
              </span>
            </div>
          </div>

          {/* Centered Navigation Tabs - Clean Matte Pill Box */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map & Live Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Analytics & Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Verification</span>
              {isAdminAuthenticated && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('feeds')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'feeds'
                  ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Data Feeds</span>
            </button>
          </nav>

          {/* Right Section: IST Time, Report CTA, Admin Toggle */}
          <div className="flex items-center space-x-4">
            
            {/* Matte IST Clock */}
            <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-medium">{istTime || 'IST Live'}</span>
            </div>

            {/* Citizen Report Action Button - Clean Solid Slate/Sky Style */}
            <button
              onClick={onOpenCitizenModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Report Weather</span>
            </button>

            {/* Admin Toggle Button */}
            <button
              onClick={handleAdminToggle}
              title={isAdminAuthenticated ? "Officer Authenticated (Click to Logout)" : "Admin Officer Login"}
              className={`p-2 rounded-lg border transition-colors ${
                isAdminAuthenticated
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800 hover:bg-emerald-900/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {isAdminAuthenticated ? (
                <Unlock className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`text-xs py-1 px-2.5 rounded font-medium ${
              activeTab === 'dashboard' ? 'text-sky-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Map & Feed
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`text-xs py-1 px-2.5 rounded font-medium ${
              activeTab === 'analytics' ? 'text-sky-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`text-xs py-1 px-2.5 rounded font-medium ${
              activeTab === 'admin' ? 'text-sky-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveTab('feeds')}
            className={`text-xs py-1 px-2.5 rounded font-medium ${
              activeTab === 'feeds' ? 'text-sky-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Feeds
          </button>
        </div>

      </div>
    </header>
  );
};
