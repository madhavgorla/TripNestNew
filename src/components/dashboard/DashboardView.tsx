import React from 'react';
import {
  Compass,
  Calendar,
  Wallet,
  Users,
  Sparkles,
  ArrowRight,
  Plus,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { useCurrency } from '../../context/CurrencyContext';

interface DashboardViewProps {
  onOpenCreateTrip: () => void;
  onOpenAiCopilot: () => void;
  onNavigateToTab: (tab: string) => void;
  onSelectTrip: (tripId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenCreateTrip,
  onOpenAiCopilot,
  onNavigateToTab,
  onSelectTrip,
}) => {
  const { user } = useAuth();
  const { trips, activeTrip, itineraryDays } = useTrip();
  const { formatPrice, currentCurrency } = useCurrency();

  const totalSpent = trips.reduce((acc, t) => acc + (t.spent || 0), 0);
  const upcomingTrips = trips.filter((t) => t.status === 'UPCOMING' || t.status === 'PLANNING');

  // Days till next trip
  let daysUntilNext = 18;
  if (activeTrip && activeTrip.startDate) {
    const diff = new Date(activeTrip.startDate).getTime() - new Date().getTime();
    daysUntilNext = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Travel Operating System</span>
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Traveler'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your next journey to <span className="font-semibold text-slate-800 dark:text-slate-200">{activeTrip?.destination || 'Rome'}</span> takes off in <span className="font-bold text-indigo-600 dark:text-indigo-400">{daysUntilNext} days</span>. All day plans and documents are synchronized.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenCreateTrip}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Trip</span>
              </button>
              <button
                onClick={onOpenAiCopilot}
                className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 px-4 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>TripNest AI Copilot</span>
              </button>
            </div>
          </div>

          <div className="hidden md:block w-48 h-36 rounded-2xl overflow-hidden shadow-md shrink-0 border border-slate-200 dark:border-slate-700">
            <img
              src={activeTrip?.coverImage || '/src/assets/images/hero_travel_workspace_1790172750348.jpg'}
              alt="Active Trip"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Upcoming Trips</span>
            <Compass className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {upcomingTrips.length}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Rome & Goa scheduled</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Countdown</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {daysUntilNext} Days
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">To {activeTrip?.destination}</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Outlay</span>
            <Wallet className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatPrice(totalSpent, 'USD')}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Tracked across expenses</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Travel Squad</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {activeTrip?.travelers || 2} Persons
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Group sync active</span>
        </div>
      </div>

      {/* Active Trip Spotlight & Today's Schedule */}
      {activeTrip && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Spotlight Card */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Featured Journey
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {activeTrip.status}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <img
                  src={activeTrip.coverImage}
                  alt={activeTrip.tripName}
                  referrerPolicy="no-referrer"
                  className="h-20 w-24 rounded-2xl object-cover shadow-xs"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeTrip.tripName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{activeTrip.destination}, {activeTrip.country}</span>
                    <span>•</span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeTrip.startDate}</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    {activeTrip.description}
                  </p>
                </div>
              </div>

              {/* Quick metrics in card */}
              <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Budget</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {formatPrice(activeTrip.budget, activeTrip.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Logged</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {formatPrice(activeTrip.spent, activeTrip.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Travelers</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeTrip.travelers} Guests
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                {itineraryDays.length} Days Planned
              </span>
              <button
                onClick={() => {
                  onSelectTrip(activeTrip.id);
                  onNavigateToTab('trips');
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
              >
                <span>Open Full Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Schedule Preview */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Day 1 Highlights
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {itineraryDays[0]?.date || 'Oct 10'}
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {(itineraryDays[0]?.activities.slice(0, 3) || []).map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
                  >
                    <span className="font-mono text-slate-400 text-[11px] whitespace-nowrap mt-0.5">
                      {act.startTime}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{act.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{act.location}</p>
                    </div>
                    <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      {act.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onSelectTrip(activeTrip.id);
                onNavigateToTab('trips');
              }}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <span>View All Activities & Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Other Trips Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
            All Your Journeys ({trips.length})
          </h3>
          <button
            onClick={() => onNavigateToTab('trips')}
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Manage Trips
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => {
                onSelectTrip(trip.id);
                onNavigateToTab('trips');
              }}
              className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-44 w-full">
                <img
                  src={trip.coverImage}
                  alt={trip.tripName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-slate-900 shadow-xs backdrop-blur-md">
                    {trip.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h4 className="text-base font-bold drop-shadow-xs">{trip.tripName}</h4>
                  <p className="text-xs text-white/90 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-300" />
                    <span>{trip.destination}, {trip.country}</span>
                  </p>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {trip.startDate}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                    {formatPrice(trip.budget, trip.currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
