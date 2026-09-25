import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  Sparkles,
  Trash2,
  Share2,
  Map as MapIcon,
  ListOrdered,
  FileCheck,
  UserCheck,
  ChevronRight,
  TrendingUp,
  CloudSun,
  Download,
  FileText,
  CheckSquare,
  Film,
  Star,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { useCurrency } from '../../context/CurrencyContext';
import { DestinationWeather } from '../../types';
import { api } from '../../services/api';
import { ItineraryTimeline } from '../itinerary/ItineraryTimeline';
import { TripMap } from '../maps/TripMap';
import { BudgetManager } from '../budget/BudgetManager';
import { GroupManager } from '../groups/GroupManager';
import { DocumentVault } from '../documents/DocumentVault';
import { TripWeatherForecast } from './TripWeatherForecast';
import { DownloadItineraryModal } from './DownloadItineraryModal';
import { ShareItineraryModal } from './ShareItineraryModal';
import { PackingChecklist } from '../packing/PackingChecklist';
import { TripMemories } from '../memories/TripMemories';
import { RatingAndReviewSection } from '../reviews/RatingAndReviewSection';

interface TripWorkspaceProps {
  onOpenAiCopilot: () => void;
  onPreviewPublicLink?: (token: string) => void;
}

export const TripWorkspace: React.FC<TripWorkspaceProps> = ({ onOpenAiCopilot, onPreviewPublicLink }) => {
  const { activeTrip, itineraryDays, expenses, deleteTrip, trips, setActiveTripById } = useTrip();
  const { formatPrice } = useCurrency();

  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'itinerary' | 'budget' | 'group' | 'documents' | 'packing' | 'weather' | 'memories' | 'reviews'>('itinerary');
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(undefined);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [mapViewScope, setMapViewScope] = useState<'day' | 'all'>('day');
  const [layoutMode, setLayoutMode] = useState<'split' | 'timeline' | 'map'>('split');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<DestinationWeather | null>(null);

  // Preload destination weather data for PDF generation and sync
  useEffect(() => {
    if (activeTrip?.destination) {
      api.getWeather(activeTrip.destination).then((res) => {
        if (res.success && res.data) {
          setWeatherData(res.data);
        }
      }).catch((err) => console.warn('Could not load destination weather for PDF:', err));
    }
  }, [activeTrip?.destination]);

  if (!activeTrip) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Active Trip Selected</p>
        <p className="text-xs text-slate-400 mt-1">Select an existing journey or build a new one with AI.</p>
      </div>
    );
  }

  // Flatten all activities for the map
  const allActivities = itineraryDays.flatMap((day) => day.activities);

  const totalSpent = activeTrip.spent || 0;
  const budgetRatio = Math.min(100, Math.round((totalSpent / (activeTrip.budget || 1)) * 100));

  return (
    <div className="space-y-6">
      {/* Hero Workspace Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative h-56 sm:h-64 w-full">
          <img
            src={activeTrip.coverImage}
            alt={activeTrip.tripName}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Top Bar Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow-xs backdrop-blur-md">
                {activeTrip.status}
              </span>
              <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
                {activeTrip.travelStyle} Style
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveWorkspaceTab('memories')}
                className="flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white px-3 py-1 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-xs border border-white/30"
                title="View Trip Memories & Highlight Reel"
              >
                <Film className="w-3.5 h-3.5 text-cyan-300" />
                <span>Memories</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white px-3 py-1 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-xs border border-indigo-400/40"
                title="Share Itinerary (Public Link & Collaborators)"
              >
                <Share2 className="w-3.5 h-3.5 text-teal-300" />
                <span>Share</span>
              </button>

              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white px-3 py-1 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-xs border border-white/30"
                title="Download Itinerary as PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Itinerary</span>
              </button>

              <button
                onClick={onOpenAiCopilot}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:from-indigo-700 hover:to-purple-700 backdrop-blur-md transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>TripNest AI</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${activeTrip.tripName}"?`)) {
                    deleteTrip(activeTrip.id);
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-slate-200 hover:bg-rose-600 hover:text-white backdrop-blur-md transition-all"
                title="Delete Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Title & Stats */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-xs font-display">
                {activeTrip.tripName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-200">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {activeTrip.destination}, {activeTrip.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-300" />
                  {activeTrip.startDate} to {activeTrip.endDate}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-300" />
                  {activeTrip.travelers} Traveler(s)
                </span>
              </div>
            </div>

            {/* Budget Progress Bar Chip */}
            <div className="w-full sm:w-64 rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/20">
              <div className="flex justify-between text-xs font-semibold">
                <span>Budget Progress</span>
                <span className="font-mono tabular-nums">
                  {formatPrice(totalSpent, activeTrip.currency)} / {formatPrice(activeTrip.budget, activeTrip.currency)}
                </span>
              </div>
              <div className="mt-2 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    budgetRatio > 90 ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${budgetRatio}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-2 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveWorkspaceTab('itinerary')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                activeWorkspaceTab === 'itinerary'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Itinerary & Map
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('budget')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                activeWorkspaceTab === 'budget'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Budget & Expenses
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('group')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                activeWorkspaceTab === 'group'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Travel Group
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('documents')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                activeWorkspaceTab === 'documents'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Document Vault
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('packing')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeWorkspaceTab === 'packing'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Packing Checklist</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('weather')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeWorkspaceTab === 'weather'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>Weather & Trends</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('memories')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeWorkspaceTab === 'memories'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-indigo-500" />
              <span>Trip Memories</span>
              {activeTrip.status === 'COMPLETED' && (
                <span className="ml-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[10px] font-bold">
                  ★
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('reviews')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeWorkspaceTab === 'reviews'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Ratings & Reviews</span>
            </button>
          </div>

          {activeWorkspaceTab === 'itinerary' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 shadow-2xs transition-colors cursor-pointer"
                title="Generate Public URL or Invite Collaborators"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Share Link</span>
              </button>

              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Download Itinerary as PDF"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Export PDF</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setLayoutMode('split')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    layoutMode === 'split' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setLayoutMode('timeline')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    layoutMode === 'timeline' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Timeline Only
                </button>
                <button
                  onClick={() => setLayoutMode('map')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    layoutMode === 'map' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Map Only
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeWorkspaceTab === 'itinerary' && (
        <div className="space-y-6">
          {/* Real-time 5-Day Weather Forecast Widget */}
          <TripWeatherForecast
            destination={activeTrip.destination}
            country={activeTrip.country}
            coordinates={activeTrip.coordinates}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Itinerary Timeline Column */}
            {(layoutMode === 'split' || layoutMode === 'timeline') && (
              <div className={layoutMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'}>
                <ItineraryTimeline
                  days={itineraryDays}
                  selectedActivityId={selectedActivityId}
                  onSelectActivity={(actId) => setSelectedActivityId(actId)}
                  tripCurrency={activeTrip.currency}
                  trip={activeTrip}
                  activeDayIndex={activeDayIndex}
                  onDayChange={setActiveDayIndex}
                />
              </div>
            )}

            {/* Interactive Leaflet Map Column */}
            {(layoutMode === 'split' || layoutMode === 'map') && (
              <div
                className={`sticky top-20 ${
                  layoutMode === 'split' ? 'lg:col-span-5 h-[580px]' : 'lg:col-span-12 h-[680px]'
                }`}
              >
                {(() => {
                  const currentDay = itineraryDays[activeDayIndex] || itineraryDays[0];
                  const mapActivities =
                    mapViewScope === 'day' && currentDay?.activities.length > 0
                      ? currentDay.activities
                      : allActivities;
                  const dayTitle =
                    mapViewScope === 'day' && currentDay
                      ? `Day ${currentDay.dayNumber}: ${currentDay.title}`
                      : `${activeTrip.destination} (All Stops)`;

                  return (
                    <TripMap
                      center={activeTrip.coordinates || { lat: 41.9028, lng: 12.4964 }}
                      activities={mapActivities}
                      selectedActivityId={selectedActivityId}
                      onSelectActivity={(actId) => setSelectedActivityId(actId)}
                      destinationName={activeTrip.destination}
                      dayTitle={dayTitle}
                      viewScope={mapViewScope}
                      onToggleScope={() =>
                        setMapViewScope((prev) => (prev === 'day' ? 'all' : 'day'))
                      }
                    />
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {activeWorkspaceTab === 'weather' && (
        <div className="space-y-6">
          <TripWeatherForecast
            destination={activeTrip.destination}
            country={activeTrip.country}
            coordinates={activeTrip.coordinates}
          />
        </div>
      )}

      {activeWorkspaceTab === 'budget' && (
        <BudgetManager
          tripId={activeTrip.id}
          totalBudget={activeTrip.budget}
          tripCurrency={activeTrip.currency}
        />
      )}

      {activeWorkspaceTab === 'group' && <GroupManager />}

      {activeWorkspaceTab === 'documents' && <DocumentVault />}

      {activeWorkspaceTab === 'packing' && (
        <PackingChecklist
          trip={activeTrip}
          itineraryDays={itineraryDays}
          weatherData={weatherData}
        />
      )}

      {activeWorkspaceTab === 'memories' && (
        <TripMemories
          trip={activeTrip}
          itineraryDays={itineraryDays}
          expenses={expenses}
        />
      )}

      {activeWorkspaceTab === 'reviews' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <RatingAndReviewSection
            targetType="destination"
            targetId={activeTrip.destination}
            targetName={`${activeTrip.destination}, ${activeTrip.country}`}
          />
        </div>
      )}

      {/* Download Itinerary PDF Modal */}
      <DownloadItineraryModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        trip={activeTrip}
        itineraryDays={itineraryDays}
        weatherData={weatherData}
      />

      {/* Share Itinerary Modal */}
      <ShareItineraryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trip={activeTrip}
        onPreviewPublicLink={onPreviewPublicLink}
      />
    </div>
  );
};
