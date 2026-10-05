import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  TrendingDown,
  Navigation,
  Check,
  X,
  RefreshCw,
  Sliders,
  Footprints,
  Compass,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  Trip,
  ItineraryDay,
  Activity,
  RouteOptimizationResult,
  RouteOptimizationMode,
} from '../../types';
import { optimizeDailyRouteFlow } from '../../services/routeOptimizer';
import { useTrip } from '../../context/TripContext';

interface RouteOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  day: ItineraryDay;
  onApplied?: () => void;
}

export const RouteOptimizationModal: React.FC<RouteOptimizationModalProps> = ({
  isOpen,
  onClose,
  trip,
  day,
  onApplied,
}) => {
  const { reorderDayActivities } = useTrip();

  const [isLoading, setIsLoading] = useState(true);
  const [optimizationResult, setOptimizationResult] = useState<RouteOptimizationResult | null>(null);
  const [mode, setMode] = useState<RouteOptimizationMode>('balanced');
  const [keepFirstFixed, setKeepFirstFixed] = useState(false);
  const [selectedView, setSelectedView] = useState<'optimized' | 'original'>('optimized');
  const [isApplying, setIsApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch optimization on mount or when settings change
  const fetchOptimization = async (customMode = mode, customKeepFirst = keepFirstFixed) => {
    setIsLoading(true);
    try {
      const result = await optimizeDailyRouteFlow(trip, day, {
        mode: customMode,
        keepFirstFixed: customKeepFirst,
      });
      setOptimizationResult(result);
    } catch (err) {
      console.error('Failed to compute route optimization:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOptimization(mode, keepFirstFixed);
    }
  }, [isOpen, day.id]);

  if (!isOpen) return null;

  const handleApply = async (applySuggestedTimes: boolean = true) => {
    if (!optimizationResult) return;
    setIsApplying(true);

    try {
      const activitiesToSave: Activity[] = optimizationResult.optimizedActivities.map((opt) => {
        // Create clean Activity item
        const cleaned: Activity = {
          id: opt.id,
          dayId: opt.dayId,
          tripId: opt.tripId,
          name: opt.name,
          description: opt.description,
          startTime: applySuggestedTimes && opt.suggestedStartTime ? opt.suggestedStartTime : opt.startTime,
          endTime: applySuggestedTimes && opt.suggestedEndTime ? opt.suggestedEndTime : opt.endTime,
          location: opt.location,
          category: opt.category,
          cost: opt.cost,
          currency: opt.currency,
          notes: opt.notes,
          priority: opt.priority,
          isCompleted: opt.isCompleted,
          coordinates: opt.coordinates,
        };
        return cleaned;
      });

      const success = await reorderDayActivities(day.id, activitiesToSave);
      if (success) {
        setToastMessage('Route optimized successfully!');
        if (onApplied) onApplied();
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      console.error('Error applying route:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food':
        return 'bg-orange-500 text-white';
      case 'Hotel':
        return 'bg-cyan-500 text-white';
      case 'Sightseeing':
      case 'Culture':
        return 'bg-indigo-600 text-white';
      case 'Entertainment':
        return 'bg-pink-500 text-white';
      case 'Nature':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 overflow-hidden">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg animate-in slide-in-from-top-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  AI Map Route & Sequence Optimizer
                </h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {optimizationResult?.algorithm === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Geospatial TSP Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {trip.destination} • Day {day.dayNumber}: {day.title} ({day.activities.length} stops)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preferences & Mode Selection Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Strategy:
              </span>
              <div className="flex items-center gap-1">
                {(['balanced', 'fastest_transit', 'crowd_timing'] as RouteOptimizationMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      fetchOptimization(m, keepFirstFixed);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      mode === m
                        ? 'bg-white text-indigo-600 shadow-xs border border-indigo-200 dark:bg-slate-700 dark:text-white dark:border-indigo-500 font-bold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {m === 'balanced' && '⚡ Balanced Flow'}
                    {m === 'fastest_transit' && '🚶 Shortest Walk'}
                    {m === 'crowd_timing' && '🌅 Timing & Sunset'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepFirstFixed}
                  onChange={(e) => {
                    setKeepFirstFixed(e.target.checked);
                    fetchOptimization(mode, e.target.checked);
                  }}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Lock 1st stop (e.g. hotel/morning booking)</span>
              </label>

              <button
                onClick={() => fetchOptimization(mode, keepFirstFixed)}
                disabled={isLoading}
                className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
                <span>Re-solve</span>
              </button>
            </div>
          </div>

          {/* Key Savings Metrics Cards */}
          {optimizationResult && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Time Saved Card */}
              <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-4 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-teal-950/10 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Transit Time Saved
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    -{optimizationResult.timeSavedMinutes} mins
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                    {optimizationResult.optimizedTransitMinutes} min
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {optimizationResult.originalTransitMinutes} min
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400">
                  {optimizationResult.timeSavedMinutes > 0
                    ? `Saves ~${optimizationResult.timeSavedMinutes} minutes previously spent backtracking.`
                    : 'Current order already close to optimal.'}
                </p>
              </div>

              {/* Distance Saved Card */}
              <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-blue-50/40 p-4 dark:border-indigo-900/60 dark:from-indigo-950/30 dark:to-blue-950/10 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Walking & Distance
                  </span>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                    -{optimizationResult.distanceSavedKm} km
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-indigo-950 dark:text-indigo-100">
                    {optimizationResult.optimizedDistanceKm} km
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {optimizationResult.originalDistanceKm} km
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-indigo-700/80 dark:text-indigo-400">
                  Total point-to-point transit path across city.
                </p>
              </div>

              {/* Efficiency Score Card */}
              <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-purple-50/40 p-4 dark:border-violet-900/60 dark:from-violet-950/30 dark:to-purple-950/10 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    Efficiency Gain
                  </span>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800 dark:bg-violet-900/60 dark:text-violet-300">
                    +{optimizationResult.efficiencyPercentage}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-violet-950 dark:text-violet-100">
                    +{optimizationResult.efficiencyPercentage}%
                  </span>
                  <span className="text-xs text-violet-600 dark:text-violet-300 font-medium">
                    Route optimization
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-violet-700/80 dark:text-violet-400">
                  Directional linear route with seamless transfers.
                </p>
              </div>
            </div>
          )}

          {/* AI Strategy Rationale */}
          {optimizationResult?.summaryReasoning && (
            <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  AI Route Strategy: {optimizationResult.geographicalStrategy}
                </h4>
                <p className="text-xs text-indigo-900/80 dark:text-indigo-300 leading-relaxed">
                  {optimizationResult.summaryReasoning}
                </p>
              </div>
            </div>
          )}

          {/* Comparison View Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedView('optimized')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedView === 'optimized'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Suggested Order ({optimizationResult?.optimizedActivities.length || 0})</span>
                </button>
                <button
                  onClick={() => setSelectedView('original')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedView === 'original'
                      ? 'bg-slate-800 text-white dark:bg-slate-700'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Current Schedule ({day.activities.length})</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400">
                {selectedView === 'optimized'
                  ? 'Ordered by geographical proximity & daylight hours'
                  : 'Original timeline'}
              </span>
            </div>

            {/* List of Waypoints */}
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Computing optimal landmark corridor with Gemini AI...
                </p>
                <p className="text-[11px] text-slate-400">
                  Evaluating transit walking distances and crowd patterns in {trip.destination}
                </p>
              </div>
            ) : selectedView === 'optimized' && optimizationResult ? (
              <div className="space-y-3 relative pl-4">
                {optimizationResult.optimizedActivities.map((act, index) => (
                  <React.Fragment key={act.id}>
                    {/* Transit Leg Indicator between stops */}
                    {index > 0 && act.transitFromPrevious && (
                      <div className="flex items-center gap-3 py-1.5 pl-4 -ml-4">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <Navigation className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-1 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {act.transitFromPrevious.mode === 'walking' ? '🚶 Walk' : '🚌 Transit'}{' '}
                            {act.transitFromPrevious.durationMinutes} min
                          </span>
                          <span>•</span>
                          <span>{act.transitFromPrevious.distanceKm} km</span>
                          {act.transitFromPrevious.transitTip && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500 dark:text-slate-400 italic">
                                {act.transitFromPrevious.transitTip}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Landmark Activity Card */}
                    <div className="relative rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs hover:border-indigo-300 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Number Badge */}
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${getCategoryColor(
                              act.category
                            )} shadow-xs`}
                          >
                            {index + 1}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                {act.suggestedStartTime} - {act.suggestedEndTime}
                              </span>
                              {act.startTime !== act.suggestedStartTime && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  was {act.startTime}
                                </span>
                              )}
                              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                {act.category}
                              </span>
                              {act.priority === 'High' && (
                                <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                                  Priority
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {act.name}
                            </h4>

                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{act.location}</span>
                            </p>

                            {act.orderRationale && (
                              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium pt-0.5">
                                💡 {act.orderRationale}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Cost tag */}
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {act.cost > 0 ? `${act.currency} ${act.cost}` : 'Free'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              /* Original Unoptimized List */
              <div className="space-y-2.5">
                {day.activities.map((act, index) => (
                  <div
                    key={act.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-slate-500">
                              {act.startTime} - {act.endTime}
                            </span>
                            <span className="text-[10px] text-slate-400">• {act.category}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {act.name}
                          </h4>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{act.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Applying this optimization updates the daily activity order and adjusts start times with realistic transit buffers.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={isApplying}
              className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => handleApply(true)}
              disabled={isApplying || !optimizationResult}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isApplying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Applying Route...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply AI Optimized Route</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
