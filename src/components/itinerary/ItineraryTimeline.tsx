import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Circle,
  MoreVertical,
  Trash2,
  Edit2,
  Tag,
  DollarSign,
  AlertCircle,
  Sparkles,
  Navigation,
  Undo2,
  Route,
  Footprints,
} from 'lucide-react';
import { ItineraryDay, Activity, ActivityCategory, Trip } from '../../types';
import { useTrip } from '../../context/TripContext';
import { useCurrency } from '../../context/CurrencyContext';
import { AddActivityModal } from './AddActivityModal';
import { RouteOptimizationModal } from './RouteOptimizationModal';
import { calculateHaversineDistanceKm } from '../../services/routeOptimizer';

interface ItineraryTimelineProps {
  days: ItineraryDay[];
  selectedActivityId?: string;
  onSelectActivity: (activityId: string) => void;
  tripCurrency: string;
  trip?: Trip;
  activeDayIndex?: number;
  onDayChange?: (index: number) => void;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  days,
  selectedActivityId,
  onSelectActivity,
  tripCurrency,
  trip,
  activeDayIndex: controlledDayIndex,
  onDayChange,
}) => {
  const { addItineraryDay, toggleActivityComplete, deleteActivity, reorderDayActivities } = useTrip();
  const { formatPrice } = useCurrency();

  const [internalDayIndex, setInternalDayIndex] = useState(0);
  const activeDayIndex = controlledDayIndex !== undefined ? controlledDayIndex : internalDayIndex;
  const setActiveDayIndex = (idx: number) => {
    if (onDayChange) onDayChange(idx);
    else setInternalDayIndex(idx);
  };

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [undoHistory, setUndoHistory] = useState<Record<string, Activity[]>>({});
  const [justOptimized, setJustOptimized] = useState(false);

  const currentDay = days[activeDayIndex] || days[0];

  const categories = ['All', 'Sightseeing', 'Food', 'Hotel', 'Culture', 'Entertainment', 'Nature'];

  const filteredActivities = currentDay?.activities.filter((act) => {
    if (categoryFilter === 'All') return true;
    return act.category.toLowerCase() === categoryFilter.toLowerCase();
  }) || [];

  // Calculate day route metrics
  const dayActivities = currentDay?.activities || [];
  let dayTotalDistKm = 0;
  for (let i = 0; i < dayActivities.length - 1; i++) {
    const a1 = dayActivities[i];
    const a2 = dayActivities[i + 1];
    if (a1.coordinates && a2.coordinates) {
      dayTotalDistKm += calculateHaversineDistanceKm(
        a1.coordinates.lat,
        a1.coordinates.lng,
        a2.coordinates.lat,
        a2.coordinates.lng
      );
    } else {
      dayTotalDistKm += 1.2;
    }
  }
  dayTotalDistKm = Math.round(dayTotalDistKm * 10) / 10;
  const estimatedWalkingMins = Math.round(dayTotalDistKm * 13 + (dayActivities.length - 1) * 4);
  const potentialSavingsMins = Math.max(25, Math.round(estimatedWalkingMins * 0.35));

  const handleOpenOptimize = () => {
    if (currentDay && currentDay.activities.length > 0) {
      // Save snapshot for undo
      setUndoHistory((prev) => ({
        ...prev,
        [currentDay.id]: [...currentDay.activities],
      }));
    }
    setShowOptimizeModal(true);
  };

  const handleUndoReorder = async () => {
    if (!currentDay || !undoHistory[currentDay.id]) return;
    const prevList = undoHistory[currentDay.id];
    await reorderDayActivities(currentDay.id, prevList);
    setUndoHistory((prev) => {
      const copy = { ...prev };
      delete copy[currentDay.id];
      return copy;
    });
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Food':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'Hotel':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800';
      case 'Sightseeing':
      case 'Culture':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
      case 'Nature':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Entertainment':
        return 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Day Selector Tabs & Add Day */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5">
          {days.map((day, idx) => (
            <button
              key={day.id}
              onClick={() => setActiveDayIndex(idx)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                activeDayIndex === idx
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              <span>Day {day.dayNumber}</span>
              <span className="text-[10px] opacity-70 font-normal">({day.activities.length})</span>
            </button>
          ))}

          <button
            onClick={() => addItineraryDay(`Day ${days.length + 1}`)}
            className="flex items-center gap-1 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Day</span>
          </button>
        </div>

        <button
          onClick={() => {
            setEditingActivity(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Day Overview Banner */}
      {currentDay && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {currentDay.date}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {currentDay.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentDay.summary}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-1 sm:pt-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    categoryFilter === cat
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* AI Route Optimizer Strip */}
          {currentDay && currentDay.activities.length >= 2 && trip && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-slate-50 p-3 border border-indigo-100 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 dark:border-indigo-900/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shrink-0 shadow-xs">
                  <Route className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Daily Route Optimizer
                    </span>
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Save ~{potentialSavingsMins}m
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentDay.activities.length} waypoints • ~{dayTotalDistKm} km path • AI arranges landmarks to minimize backtracking
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {undoHistory[currentDay.id] && (
                  <button
                    onClick={handleUndoReorder}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Revert to previous order"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Undo Order</span>
                  </button>
                )}

                <button
                  onClick={handleOpenOptimize}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-indigo-700 hover:to-violet-700 transition-all cursor-pointer"
                  title="Optimize route order using AI"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Optimize Route</span>
                </button>
              </div>
            </div>
          )}

          {/* Activities Timeline */}
          <div className="mt-4 relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {filteredActivities.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">No activities scheduled for this filter.</p>
                <button
                  onClick={() => {
                    setEditingActivity(null);
                    setShowAddModal(true);
                  }}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  + Add the first activity
                </button>
              </div>
            ) : (
              filteredActivities.map((act, index) => {
                const isSelected = act.id === selectedActivityId;
                const prevAct = index > 0 ? filteredActivities[index - 1] : null;
                let legDist = 0;
                if (prevAct && prevAct.coordinates && act.coordinates) {
                  legDist = calculateHaversineDistanceKm(
                    prevAct.coordinates.lat,
                    prevAct.coordinates.lng,
                    act.coordinates.lat,
                    act.coordinates.lng
                  );
                } else if (prevAct) {
                  legDist = 0.9;
                }
                const legMins = Math.max(5, Math.round(legDist * 13));

                return (
                  <React.Fragment key={act.id}>
                    {/* Transit Connector between consecutive timeline stops */}
                    {index > 0 && (
                      <div className="flex items-center gap-2 -my-2 py-1 text-[10px] text-slate-400 dark:text-slate-500 pl-1 font-mono">
                        <div className="flex items-center gap-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 px-2 py-0.5 border border-slate-200/60 dark:border-slate-700/60">
                          <Navigation className="w-2.5 h-2.5 text-indigo-500" />
                          <span>{legDist > 2.5 ? '🚌 Transit' : '🚶 Walk'} ~{legMins}m ({legDist} km)</span>
                        </div>
                      </div>
                    )}

                    <div
                      onClick={() => onSelectActivity(act.id)}
                      className={`relative rounded-xl border p-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/30 dark:border-indigo-500 dark:bg-indigo-950/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/80'
                      } ${act.isCompleted ? 'opacity-60' : ''}`}
                    >
                      {/* Timeline Node Point */}
                      <div
                        className={`absolute -left-[27px] top-4.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 ${
                          act.isCompleted ? 'border-emerald-500 bg-emerald-50' : 'border-indigo-600'
                        }`}
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            act.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                        />
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {/* Completion Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActivityComplete(act.id);
                            }}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            {act.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {act.startTime} - {act.endTime}
                              </span>
                              <span
                                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getCategoryBadgeClass(
                                  act.category
                                )}`}
                              >
                                {act.category}
                              </span>
                              {act.priority === 'High' && (
                                <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                                  Priority
                                </span>
                              )}
                            </div>

                            <h4
                              className={`text-sm font-bold text-slate-900 dark:text-white mt-1 ${
                                act.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                              }`}
                            >
                              {act.name}
                            </h4>

                            {act.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {act.description}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                              {act.location && (
                                <span className="flex items-center gap-1 text-[11px]">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {act.location}
                                </span>
                              )}
                              <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                                {act.cost > 0 ? formatPrice(act.cost, act.currency) : 'Free'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingActivity(act);
                              setShowAddModal(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteActivity(act.id);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {showAddModal && currentDay && (
        <AddActivityModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingActivity(null);
          }}
          dayId={currentDay.id}
          tripCurrency={tripCurrency}
          initialActivity={editingActivity}
        />
      )}

      {/* AI Route Optimization Modal */}
      {showOptimizeModal && currentDay && trip && (
        <RouteOptimizationModal
          isOpen={showOptimizeModal}
          onClose={() => setShowOptimizeModal(false)}
          trip={trip}
          day={currentDay}
          onApplied={() => {
            setJustOptimized(true);
            setTimeout(() => setJustOptimized(false), 3000);
          }}
        />
      )}
    </div>
  );
};
