import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Compass,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Activity,
  UserCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminConsole: React.FC = () => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminAnalytics().then((res) => {
      if (res.success) setAdminData(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Banner */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 dark:border-rose-950 dark:bg-rose-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              TripNest System Administration Console
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Logged in as <span className="font-semibold text-rose-600 dark:text-rose-400">{user?.fullName}</span> (Role: {user?.role}). System health, global database mirrors, and RBAC governance.
            </p>
          </div>
        </div>
      </div>

      {/* Global Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {adminData?.totalUsers || 1420}
          </p>
          <span className="text-[10px] text-emerald-600 mt-1 block font-semibold">+18% this month</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Trips Provisioned</span>
            <Compass className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {adminData?.totalTripsCreated || 3120}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">185 currently active</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Volume Logged</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            $124,500
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Multi-currency volume</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>System Health</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            99.98%
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">PostgreSQL & Spring Boot</span>
        </div>
      </div>

      {/* Users and Top Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Registered Travelers & Roles
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(adminData?.recentUsers || []).map((u: any) => (
              <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={u.avatarUrl}
                    alt={u.fullName}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Top Booked Destinations
          </h3>
          <div className="space-y-3">
            {(adminData?.topDestinations || [
              { name: 'Rome', tripsCount: 420 },
              { name: 'Bali', tripsCount: 380 },
              { name: 'Goa', tripsCount: 310 },
              { name: 'Paris', tripsCount: 290 },
              { name: 'Tokyo', tripsCount: 260 },
            ]).map((d: any, idx: number) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {idx + 1}. {d.name}
                </span>
                <span className="font-mono text-slate-500 font-bold">
                  {d.tripsCount} itineraries
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
