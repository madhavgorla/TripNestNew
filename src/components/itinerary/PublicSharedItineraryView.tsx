import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Eye,
  Edit3,
  Copy,
  Plus,
  CheckCircle2,
  Circle,
  ExternalLink,
  Download,
  Share2,
  Lock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Trash2,
  X,
  Compass,
  Check,
  Film,
  Users,
} from 'lucide-react';
import {
  Trip,
  ItineraryDay,
  Activity,
  PublicItineraryData,
  ShareAccessLevel,
  ActivityCategory,
} from '../../types';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useTrip } from '../../context/TripContext';
import { generateTripItineraryPdf } from '../../services/pdfExport';

interface PublicSharedItineraryViewProps {
  shareToken: string;
  onExit?: () => void;
  onTripCloned?: (newTripId: string) => void;
}

export const PublicSharedItineraryView: React.FC<PublicSharedItineraryViewProps> = ({
  shareToken,
  onExit,
  onTripCloned,
}) => {
  const { formatPrice } = useCurrency();
  const { setActiveTripById, refreshActiveTripData } = useTrip();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [requirePasscode, setRequirePasscode] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [itineraryData, setItineraryData] = useState<PublicItineraryData | null>(null);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Quick activity adder state (for Editor mode)
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActCategory, setNewActCategory] = useState<ActivityCategory>('Sightseeing');
  const [newActStartTime, setNewActStartTime] = useState('11:00');
  const [newActEndTime, setNewActEndTime] = useState('12:30');
  const [newActLocation, setNewActLocation] = useState('');
  const [newActDescription, setNewActDescription] = useState('');
  const [newActCost, setNewActCost] = useState('0');
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  useEffect(() => {
    if (shareToken) {
      fetchPublicItinerary();
    }
  }, [shareToken]);

  const fetchPublicItinerary = async (passcode?: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getPublicItinerary(shareToken, passcode);
      if (res.requirePasscode) {
        setRequirePasscode(true);
      } else if (res.success && res.data) {
        setItineraryData(res.data);
        setRequirePasscode(false);
      } else {
        setErrorMsg(res.message || 'Unable to load shared itinerary.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'This share link could not be found or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeInput.trim()) return;
    fetchPublicItinerary(passcodeInput.trim());
  };

  // Toggle activity completion (Editor mode only)
  const handleToggleActivity = async (activityId: string) => {
    if (!itineraryData || itineraryData.accessLevel !== 'EDITOR') return;
    try {
      await api.togglePublicActivity(shareToken, activityId);
      // Local optimistic update
      setItineraryData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          itineraryDays: prev.itineraryDays.map((d) => ({
            ...d,
            activities: d.activities.map((a) =>
              a.id === activityId ? { ...a, isCompleted: !a.isCompleted } : a
            ),
          })),
        };
      });
    } catch (err) {
      console.error('Failed to toggle activity:', err);
    }
  };

  // Delete activity (Editor mode only)
  const handleDeleteActivity = async (activityId: string) => {
    if (!itineraryData || itineraryData.accessLevel !== 'EDITOR') return;
    if (!confirm('Are you sure you want to remove this activity from the shared itinerary?')) return;
    try {
      await api.deletePublicActivity(shareToken, activityId);
      setItineraryData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          itineraryDays: prev.itineraryDays.map((d) => ({
            ...d,
            activities: d.activities.filter((a) => a.id !== activityId),
          })),
        };
      });
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  // Add activity (Editor mode only)
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itineraryData || itineraryData.accessLevel !== 'EDITOR') return;
    const currentDay = itineraryData.itineraryDays[selectedDayIndex];
    if (!currentDay) return;

    try {
      setIsSavingActivity(true);
      const res = await api.addPublicActivity(shareToken, {
        dayId: currentDay.id,
        name: newActName,
        category: newActCategory,
        startTime: newActStartTime,
        endTime: newActEndTime,
        location: newActLocation || currentDay.title,
        description: newActDescription,
        cost: parseFloat(newActCost) || 0,
        currency: itineraryData.trip.currency || 'USD',
      });

      if (res.success && res.data) {
        setItineraryData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            itineraryDays: prev.itineraryDays.map((d, idx) =>
              idx === selectedDayIndex
                ? { ...d, activities: [...d.activities, res.data] }
                : d
            ),
          };
        });

        // Reset composer
        setNewActName('');
        setNewActLocation('');
        setNewActDescription('');
        setNewActCost('0');
        setIsAddActivityOpen(false);
      }
    } catch (err) {
      console.error('Failed to add activity:', err);
      alert('Unable to add activity right now.');
    } finally {
      setIsSavingActivity(false);
    }
  };

  // Clone trip into user's personal trips
  const handleCloneTrip = async () => {
    try {
      setIsCloning(true);
      const res = await api.clonePublicItinerary(shareToken);
      if (res.success && res.data) {
        setCloneSuccess(true);
        await refreshActiveTripData();
        setTimeout(() => {
          if (onTripCloned) {
            onTripCloned(res.data.trip.id);
          } else {
            setActiveTripById(res.data.trip.id);
            if (onExit) onExit();
          }
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to clone itinerary:', err);
      alert('Unable to clone itinerary. Cloning might be restricted by the owner.');
    } finally {
      setIsCloning(false);
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    if (!itineraryData) return;
    try {
      setIsExportingPdf(true);
      await generateTripItineraryPdf(itineraryData.trip, itineraryData.itineraryDays, {
        includeBudget: itineraryData.shareInfo.includeBudget,
        includeWeather: false,
        includeNotes: true,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Render Passcode Screen
  if (requirePasscode) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Passcode Protected Itinerary
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            The creator of this trip has protected it with a security passcode. Enter the passcode to unlock and view the itinerary.
          </p>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <input
              type="password"
              required
              placeholder="Enter access passcode..."
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-center text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Unlock Itinerary
            </button>
          </form>

          {onExit && (
            <button
              onClick={onExit}
              className="mt-4 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Return to TripNest
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Loading Shared TripNest Itinerary...
        </p>
        <p className="text-xs text-slate-400 mt-1">Retrieving schedules, routes, and activities.</p>
      </div>
    );
  }

  // Render Error
  if (errorMsg || !itineraryData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Shared Link Not Available
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
            {errorMsg || 'This itinerary link has either expired, been revoked by the owner, or is invalid.'}
          </p>
          {onExit && (
            <button
              onClick={onExit}
              className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white py-3 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Return to TripNest Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const { trip, itineraryDays, accessLevel, shareInfo } = itineraryData;
  const currentDay = itineraryDays[selectedDayIndex] || itineraryDays[0];
  const isEditor = accessLevel === 'EDITOR';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-500 text-white shadow-xs">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold tracking-tight font-display text-sm">TripNest Public Itinerary</span>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {shareInfo.allowCloning && (
            <button
              onClick={handleCloneTrip}
              disabled={isCloning}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                cloneSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {cloneSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Cloned to Trips!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCloning ? 'Cloning...' : 'Clone to My Trips'}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExportingPdf ? 'Exporting...' : 'PDF'}</span>
          </button>
        </div>
      </header>

      {/* Access Permission Notice Banner */}
      <div
        className={`border-b px-4 py-2.5 sm:px-8 text-xs font-medium flex items-center justify-between transition-colors ${
          isEditor
            ? 'bg-purple-500/10 border-purple-500/20 text-purple-800 dark:text-purple-300'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-2 max-w-3xl">
          {isEditor ? (
            <>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white">
                <Edit3 className="w-3 h-3" />
              </div>
              <span>
                <strong>Collaborator Mode (Editor Access):</strong> You can add activities, change schedules, and check off visited places. Changes sync in real-time.
              </span>
            </>
          ) : (
            <>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Eye className="w-3 h-3" />
              </div>
              <span>
                <strong>Read-Only Mode:</strong> Shared by <strong>{trip.ownerName}</strong> for viewing. No accidental edits can be made.
              </span>
            </>
          )}
        </div>

        <span className="hidden md:inline-block font-mono text-[11px] opacity-80">
          Token: {shareInfo.token}
        </span>
      </div>

      {/* Main Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="relative h-60 sm:h-72 w-full">
            <img
              src={trip.coverImage}
              alt={trip.tripName}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow-xs backdrop-blur-md">
                {trip.status}
              </span>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-black/40 text-white px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20">
                  Curated by {trip.ownerName}
                </span>
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-xs">
                  {trip.travelStyle} Style
                </span>
              </div>
            </div>

            <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-display drop-shadow-xs">
                  {trip.tripName}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-200">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {trip.destination}, {trip.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-300" />
                    {trip.startDate} to {trip.endDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-300" />
                    {trip.travelers} Traveler(s)
                  </span>
                </div>
              </div>

              {shareInfo.includeBudget && trip.budget > 0 && (
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/20 text-xs">
                  <span className="text-[10px] text-slate-300 block uppercase">Shared Trip Budget</span>
                  <span className="text-base font-bold font-mono">
                    {formatPrice(trip.budget, trip.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description & Overview */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              {trip.description}
            </p>
          </div>
        </div>

        {/* Days Selector Bar & Editor Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {itineraryDays.map((day, idx) => (
              <button
                key={day.id}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDayIndex === idx
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>Day {day.dayNumber}</span>
                <span className="text-[10px] opacity-70">({day.activities?.length || 0})</span>
              </button>
            ))}
          </div>

          {isEditor && (
            <button
              onClick={() => setIsAddActivityOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Activity to Day {selectedDayIndex + 1}</span>
            </button>
          )}
        </div>

        {/* Current Day Header */}
        {currentDay && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Day {currentDay.dayNumber} Plan • {currentDay.date}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentDay.title}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {currentDay.activities.length} activity item(s) scheduled
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
              "{currentDay.summary}"
            </p>

            {/* Activities Timeline */}
            <div className="mt-6 space-y-3.5">
              {currentDay.activities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
                  No activities scheduled for this day yet.
                  {isEditor && ' Click "+ Add Activity" above to add an excursion.'}
                </div>
              ) : (
                currentDay.activities.map((act) => (
                  <div
                    key={act.id}
                    className={`group rounded-2xl border p-4 transition-all ${
                      act.isCompleted
                        ? 'border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-950/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Completion Toggle */}
                        {isEditor ? (
                          <button
                            onClick={() => handleToggleActivity(act.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Toggle completion status"
                          >
                            {act.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                        ) : (
                          <div className="mt-0.5 text-slate-300 dark:text-slate-700">
                            {act.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              {act.startTime} - {act.endTime}
                            </span>
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {act.category}
                            </span>
                            {act.priority && (
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                  act.priority === 'High'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {act.priority} Priority
                              </span>
                            )}
                          </div>

                          <h4
                            className={`text-sm font-bold mt-1 text-slate-900 dark:text-white ${
                              act.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                          >
                            {act.name}
                          </h4>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{act.location}</span>
                          </p>

                          {act.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                              {act.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right metadata / Editor actions */}
                      <div className="flex items-center gap-2">
                        {shareInfo.includeBudget && act.cost > 0 && (
                          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            {formatPrice(act.cost, trip.currency)}
                          </span>
                        )}

                        {isEditor && (
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal: Add Activity */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setIsAddActivityOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Add Activity to Day {selectedDayIndex + 1}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Collaboratively suggest or add an event to the shared schedule.
            </p>

            <form onSubmit={handleAddActivity} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset drinks at Trastevere"
                  value={newActName}
                  onChange={(e) => setNewActName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newActCategory}
                    onChange={(e) => setNewActCategory(e.target.value as ActivityCategory)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Food">Food & Dining</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Transport">Transport</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Culture">Culture</option>
                    <option value="Nature">Nature</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Piazza di Santa Maria"
                    value={newActLocation}
                    onChange={(e) => setNewActLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newActStartTime}
                    onChange={(e) => setNewActStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">End Time</label>
                  <input
                    type="time"
                    value={newActEndTime}
                    onChange={(e) => setNewActEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Est. Cost</label>
                  <input
                    type="number"
                    value={newActCost}
                    onChange={(e) => setNewActCost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional details, booking references, or recommendations..."
                  value={newActDescription}
                  onChange={(e) => setNewActDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingActivity}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 font-bold text-white shadow-xs cursor-pointer"
                >
                  {isSavingActivity ? 'Adding...' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
