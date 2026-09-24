import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Sparkles, ChevronDown, User, Shield, Users, LogOut, Check, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { NotificationPopover } from '../common/NotificationPopover';
import { LoginModal } from '../auth/LoginModal';
import { Role } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAiCopilot: () => void;
  onNavigateTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenAiCopilot,
  onNavigateTab,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { user, switchRole, logout } = useAuth();
  const { currentCurrency, currencyRates, setCurrency, rateNotice } = useCurrency();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const availableCurrencies = Object.values(currencyRates);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
        {/* Zone 1: Brand Wordmark & Search */}
        <div className="flex items-center gap-6">
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              onNavigateTab('dashboard');
            }}
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display hover:opacity-90 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white shadow-xs">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>
            <span className="font-display tracking-tight">TripNest</span>
          </a>

          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search trips, destinations, activities...</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Zone 2: Navigation Links & Live Currency Rate Notice */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigateTab('trips')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            My Trips
          </button>
          <button
            onClick={() => onNavigateTab('discover')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Discover
          </button>
          <button
            onClick={() => onNavigateTab('budget')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Budget
          </button>
          <span className="text-xs text-slate-400 font-mono tabular-nums border-l border-slate-200 dark:border-slate-800 pl-4">
            {rateNotice}
          </span>
        </nav>

        {/* Zone 3: Primary Actions (Currency, AI Copilot, Notifications, Single Theme Toggle, Login/Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition-colors font-mono tabular-nums cursor-pointer"
            >
              <span>{currentCurrency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCurrencyDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCurrencyDropdown(false)} />
                <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Select Currency
                  </div>
                  {availableCurrencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.code);
                        setShowCurrencyDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                        currentCurrency === c.code
                          ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{c.symbol} {c.code}</span>
                      <span className="text-[10px] text-slate-400">{c.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* AI Copilot Quick Trigger */}
          <button
            onClick={onOpenAiCopilot}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:from-indigo-700 hover:to-indigo-800 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">TripNest AI</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                2
              </span>
            </button>
            <NotificationPopover
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onNavigateToTrip={() => onNavigateTab('trips')}
            />
          </div>

          {/* SINGLE Working Theme Mode Toggle (Moon for Dark / Sun for Light) */}
          <button
            onClick={onToggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
            aria-label={isDarkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
            title={isDarkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          {/* User Authentication: Either Login Button OR User Profile Menu */}
          {user ? (
            /* Logged In: Show Profile Dropdown */
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 p-1 pl-1.5 pr-2 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user.fullName || 'User'}
                  referrerPolicy="no-referrer"
                  className="h-6 w-6 rounded-lg object-cover"
                />
                <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {user.fullName?.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                  <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-100">
                    <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                          <Shield className="w-3 h-3" />
                          <span>Role: {user.role}</span>
                        </div>
                        {user.isGoogleUser && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            Google
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Switch Demo Persona (RBAC)
                      </div>
                      <button
                        onClick={() => {
                          switchRole('TRAVELER');
                          setShowUserDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          user.role === 'TRAVELER'
                            ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5" />
                          Traveler
                        </span>
                        {user.role === 'TRAVELER' && <Check className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => {
                          switchRole('GROUP_ADMIN');
                          setShowUserDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          user.role === 'GROUP_ADMIN'
                            ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          Group Admin
                        </span>
                        {user.role === 'GROUP_ADMIN' && <Check className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => {
                          switchRole('ADMIN');
                          setShowUserDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          user.role === 'ADMIN'
                            ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5" />
                          Admin Console
                        </span>
                        {user.role === 'ADMIN' && <Check className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Logged Out: Show Single Clean Login Button */
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Login / Google Auth Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};
