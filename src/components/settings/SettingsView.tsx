import React, { useState } from 'react';
import { User, Shield, Bell, DollarSign, Globe, Check, RefreshCw, Download, FileArchive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

export const SettingsView: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { currentCurrency, currencyRates, setCurrency } = useCurrency();

  const [savedNotice, setSavedNotice] = useState(false);
  const [notifFlight, setNotifFlight] = useState(true);
  const [notifBudget, setNotifBudget] = useState(true);
  const [notifAi, setNotifAi] = useState(true);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          User Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your traveler profile, default currency, and role permissions.
        </p>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h2>
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={user?.fullName || 'User'}
            referrerPolicy="no-referrer"
            className="h-16 w-16 rounded-2xl object-cover"
          />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.fullName || 'Guest Traveler'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'guest@tripnest.com'}</p>
            <span className="inline-block mt-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              Role: {user?.role || 'TRAVELER'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={user?.fullName}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Country
            </label>
            <input
              type="text"
              defaultValue={user?.country}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Currency Preference */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Default Display Currency</h2>
        </div>
        <p className="text-xs text-slate-500">
          All prices in itineraries, activities, and budget settlements will automatically convert using live exchange rates.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.values(currencyRates).map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                currentCurrency === c.code
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950 dark:text-white'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
              }`}
            >
              <span>{c.code} ({c.symbol})</span>
              <span className="text-[10px] text-slate-400 font-normal">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Preferences */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Notification Alerts</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Flight Check-in Alerts</p>
              <p className="text-[11px] text-slate-400">Receive 48-hour boarding pass and terminal notifications</p>
            </div>
            <input
              type="checkbox"
              checked={notifFlight}
              onChange={(e) => setNotifFlight(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Budget Warning Milestones</p>
              <p className="text-[11px] text-slate-400">Alert when spending exceeds 75% and 90% of total budget</p>
            </div>
            <input
              type="checkbox"
              checked={notifBudget}
              onChange={(e) => setNotifBudget(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">TripNest AI Proactive Suggestions</p>
              <p className="text-[11px] text-slate-400">Local weather advisories and personalized activity proposals</p>
            </div>
            <input
              type="checkbox"
              checked={notifAi}
              onChange={(e) => setNotifAi(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Complete Project Source Code (.zip) Download Section */}
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Download Complete Project Code (.zip)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get the full source code (React, TypeScript, Express, Tailwind, Vite, icons, data models, and configs) ready to run.
              </p>
            </div>
          </div>

          <a
            href="/tripnest-complete-code.zip"
            download="tripnest-complete-code.zip"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .ZIP</span>
          </a>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
