import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Globe,
  Heart,
  Users,
  WalletCards,
  FileCheck,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Settings,
  Plus,
  ChevronRight,
  Star,
  Server,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreateTrip: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenCreateTrip }) => {
  const { user } = useAuth();
  const { trips, activeTrip, setActiveTripById } = useTrip();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trips', label: 'My Trips', icon: Compass, badge: trips.length },
    { id: 'discover', label: 'Discover', icon: Globe },
    { id: 'ratings', label: 'Ratings & Reviews', icon: Star },
    { id: 'architecture', label: 'Spring Boot & Arch', icon: Server },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'groups', label: 'Travel Groups', icon: Users },
    { id: 'budget', label: 'Budget & Expenses', icon: WalletCards },
    { id: 'documents', label: 'Document Vault', icon: FileCheck },
    { id: 'ai-copilot', label: 'TripNest AI', icon: Sparkles, isAi: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ...(user?.role === 'ADMIN'
      ? [{ id: 'admin', label: 'Admin Console', icon: ShieldCheck, isAdmin: true }]
      : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shrink-0 transition-colors">
      <div className="space-y-6">
        {/* Create Trip Action Button */}
        <button
          onClick={onOpenCreateTrip}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Adventure</span>
        </button>

        {/* Navigation Section */}
        <div className="space-y-1">
          <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </span>
          <div className="mt-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? item.isAi
                        ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-600 font-semibold dark:text-indigo-400'
                        : 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        item.isAi
                          ? 'text-indigo-600 dark:text-indigo-400 animate-pulse'
                          : isActive
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="rounded-md bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-bold font-mono text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {item.badge}
                    </span>
                  )}
                  {item.isAdmin && (
                    <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-400 uppercase tracking-wider">
                      Staff
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Active Trip Mini Card */}
      {activeTrip && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Active Journey</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
              {activeTrip.status}
            </span>
          </div>

          <div
            onClick={() => onSelectTab('trips')}
            className="flex items-center gap-2.5 p-1 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors group"
          >
            <img
              src={activeTrip.coverImage}
              alt={activeTrip.tripName}
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {activeTrip.tripName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {activeTrip.destination} • {activeTrip.travelers} travelers
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {trips.length > 1 && (
            <select
              value={activeTrip.id}
              onChange={(e) => setActiveTripById(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-hidden"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  Switch to: {t.tripName} ({t.destination})
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </aside>
  );
};
