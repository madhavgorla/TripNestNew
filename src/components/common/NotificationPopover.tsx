import React, { useState, useEffect } from 'react';
import { Bell, Check, Compass, DollarSign, Users, CloudSun, Sparkles, FileText, BellOff } from 'lucide-react';
import { NotificationItem } from '../../types';
import { api } from '../../services/api';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTrip?: (tripId: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ isOpen, onClose, onNavigateToTrip }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDndEnabled, setIsDndEnabled] = useState<boolean>(() => {
    return localStorage.getItem('tripnest_dnd_mode') === 'true';
  });

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      setIsDndEnabled(localStorage.getItem('tripnest_dnd_mode') === 'true');
    }
  }, [isOpen]);

  const toggleDnd = () => {
    const nextVal = !isDndEnabled;
    setIsDndEnabled(nextVal);
    localStorage.setItem('tripnest_dnd_mode', String(nextVal));
    window.dispatchEvent(new Event('storage'));
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success) setNotifications(res.data);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TRIP': return <Compass className="w-4 h-4 text-indigo-500" />;
      case 'BUDGET': return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'GROUP': return <Users className="w-4 h-4 text-blue-500" />;
      case 'WEATHER': return <CloudSun className="w-4 h-4 text-amber-500" />;
      case 'AI': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'DOCUMENT': return <FileText className="w-4 h-4 text-cyan-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              {notifications.filter((n) => !n.isRead).length} new
            </span>
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* DND (Do Not Disturb) Moon Mode Control Bar */}
        <div className="my-2 flex items-center justify-between rounded-xl bg-purple-50 p-2.5 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-purple-900">
              <BellOff className={`w-4 h-4 ${isDndEnabled ? 'text-purple-600 dark:text-purple-300' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>Do Not Disturb (DND)</span>
                {isDndEnabled && (
                  <span className="rounded bg-purple-200 px-1 text-[9px] font-bold text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                    Active
                  </span>
                )}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isDndEnabled ? 'Alerts and sound chimes are muted' : 'Mute non-urgent trip and flight push alerts'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleDnd}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isDndEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isDndEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No new notifications</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markAsRead(notif.id);
                  if (notif.actionUrl && onNavigateToTrip) {
                    onNavigateToTrip(notif.actionUrl);
                    onClose();
                  }
                }}
                className={`flex gap-3 py-3 px-2 rounded-xl transition-colors cursor-pointer ${
                  notif.isRead
                    ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    : 'bg-indigo-50/40 hover:bg-indigo-50/70 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40'
                }`}
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{notif.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                </div>
                {!notif.isRead && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
