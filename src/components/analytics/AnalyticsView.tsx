import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Globe,
  Compass,
  DollarSign,
  Download,
  Printer,
  Calendar,
  PieChart,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api';
import { useTrip } from '../../context/TripContext';
import { useCurrency } from '../../context/CurrencyContext';

export const AnalyticsView: React.FC = () => {
  const { trips, activeTrip, itineraryDays, expenses } = useTrip();
  const { formatPrice, currentCurrency } = useCurrency();

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTravelerAnalytics().then((res) => {
      if (res.success) setAnalytics(res.data);
      setLoading(false);
    });
  }, []);

  const totalSpentAllTrips = trips.reduce((acc, t) => acc + (t.spent || 0), 0);
  const averageSpent = trips.length > 0 ? Math.round(totalSpentAllTrips / trips.length) : 0;
  const uniqueCountries = new Set(trips.map((t) => t.country)).size;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Travel Analytics & Financial Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spending patterns, destination frequency, category ratios, and downloadable trip briefs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ trips, activeTrip, expenses, itineraryDays }, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `tripnest_report_${activeTrip?.destination || 'travel'}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Journeys</span>
            <Compass className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {trips.length}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Active & Planned</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Countries Visited</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {uniqueCountries}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Across Europe & Asia</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Spend</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatPrice(totalSpentAllTrips, 'USD')}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Cumulative traveler outlay</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Avg. Trip Outlay</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatPrice(averageSpent, 'USD')}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Per journey average</span>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Expenditure Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Spending by Travel Category
              </h3>
              <p className="text-xs text-slate-500">Historical expenditure distribution</p>
            </div>
            <PieChart className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="space-y-3">
            {(analytics?.expensesByCategory || [
              { category: 'Flights', amount: 1450, percentage: 38 },
              { category: 'Accommodation', amount: 1200, percentage: 31 },
              { category: 'Food & Dining', amount: 480, percentage: 13 },
              { category: 'Activities & Tours', amount: 420, percentage: 11 },
              { category: 'Local Transportation', amount: 250, percentage: 7 },
            ]).map((item: any) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{item.category}</span>
                  <span className="font-mono tabular-nums">
                    {formatPrice(item.amount, 'USD')} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Journey Activity Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Travel Frequency
              </h3>
              <p className="text-xs text-slate-500">Number of itineraries planned per month</p>
            </div>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {(analytics?.monthlyTrips || [
              { month: 'Jun', count: 1 },
              { month: 'Jul', count: 2 },
              { month: 'Aug', count: 1 },
              { month: 'Sep', count: 0 },
              { month: 'Oct', count: 2 },
              { month: 'Nov', count: 1 },
            ]).map((m: any) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full max-w-[28px] rounded-t-lg bg-indigo-500/80 hover:bg-indigo-600 transition-all"
                  style={{ height: `${Math.max(12, m.count * 60)}px` }}
                />
                <span className="text-[10px] font-mono font-semibold text-slate-500">
                  {m.month}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-3">
            Peak travel season: July & October 2026
          </p>
        </div>
      </div>

      {/* Printable Trip Brief Summary Card */}
      {activeTrip && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Official Itinerary Report
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {activeTrip.tripName} ({activeTrip.destination}, {activeTrip.country})
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">
                {activeTrip.startDate} → {activeTrip.endDate}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {itineraryDays.length} Days Planned • {expenses.length} Expenses Logged
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px] uppercase">Travelers</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{activeTrip.travelers} Persons</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px] uppercase">Allocated Budget</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">
                {formatPrice(activeTrip.budget, activeTrip.currency)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px] uppercase">Actual Spent</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">
                {formatPrice(activeTrip.spent, activeTrip.currency)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px] uppercase">Travel Style</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{activeTrip.travelStyle}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
