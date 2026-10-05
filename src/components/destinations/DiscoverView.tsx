import React, { useState, useEffect } from 'react';
import {
  Search,
  Heart,
  Star,
  Compass,
  CloudSun,
  Sun,
  CloudRain,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Info,
  Shield,
  Plus,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Destination } from '../../types';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { RatingAndReviewSection } from '../reviews/RatingAndReviewSection';

interface DiscoverViewProps {
  onPlanTripForDestination: (dest: Destination) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onPlanTripForDestination }) => {
  const { formatPrice, currentCurrency } = useCurrency();

  const [activeTab, setActiveTab] = useState<'places' | 'reviews'>('places');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['dest-rome', 'dest-bali', 'dest-jaipur']);
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [reviewsTargetDestId, setReviewsTargetDestId] = useState<string>('dest-rome');
  const [isLoading, setIsLoading] = useState(false);

  const regions = [
    { label: 'All Places', value: 'All' },
    { label: 'India 🇮🇳', value: 'India' },
    { label: 'International ✈️', value: 'International' },
    { label: 'Europe 🇪🇺', value: 'Europe' },
    { label: 'Asia 🌏', value: 'Asia' },
    { label: 'Americas 🌎', value: 'Americas' },
  ];

  const categories = [
    'All',
    'Culture',
    'Mountains',
    'Beaches',
    'Historical',
    'Adventure',
    'Popular',
    'Trending',
    'Luxury',
  ];

  useEffect(() => {
    loadDestinations();
  }, [selectedCategory, selectedRegion, searchQuery]);

  const loadDestinations = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDestinations(
        selectedCategory === 'All' ? undefined : selectedCategory,
        searchQuery || undefined,
        selectedRegion === 'All' ? undefined : selectedRegion
      );
      if (res.success) {
        setDestinations(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (destId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleFavorite(destId);
      if (res.success) {
        if (res.isFavorited) {
          setFavoriteIds((prev) => [...prev, destId]);
        } else {
          setFavoriteIds((prev) => prev.filter((id) => id !== destId));
        }
      }
    } catch (err) {}
  };

  const indiaCount = destinations.filter((d) => d.country.toLowerCase() === 'india').length;
  const intlCount = destinations.filter((d) => d.country.toLowerCase() !== 'india').length;

  return (
    <div className="space-y-6">
      {/* Search and Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Discover Destinations
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {destinations.length} places
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Explore breathtaking destinations across India and worldwide with live weather, daily budget insights, and must-see attractions.
          </p>
        </div>

        {/* Global Destination Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Jaipur, Paris, Swiss Alps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Switcher: Explore Places vs Community Ratings & Reviews */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('places')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'places'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Explore Places & Sights</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Ratings & Reviews Hub</span>
        </button>
      </div>

      {activeTab === 'reviews' ? (
        <div className="space-y-6">
          {/* Destination Selector for Reviews */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Destination to View Ratings:
              </span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                {destinations.find((d) => d.id === reviewsTargetDestId)?.name || 'Rome'}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {destinations.map((d) => {
                const isSelected = reviewsTargetDestId === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setReviewsTargetDestId(d.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span>{d.name}</span>
                    <span className="text-[11px] text-amber-400 font-bold">★ {d.rating}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Rating & Review Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <RatingAndReviewSection
              key={reviewsTargetDestId}
              targetType="destination"
              targetId={reviewsTargetDestId}
              targetName={destinations.find((d) => d.id === reviewsTargetDestId)?.name || 'Rome'}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Region Selector Pills (India vs International vs Regional) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-y border-slate-100 py-3 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Region:
          </span>
          {regions.map((reg) => (
            <button
              key={reg.value}
              onClick={() => setSelectedRegion(reg.value)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRegion === reg.value
                  ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Quick Summary Counts */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>India: {indiaCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>International: {intlCount}</span>
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
          Style:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-750'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Destinations Grid */}
      {destinations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <Compass className="mx-auto w-10 h-10 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
            No destinations found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Try adjusting your search query or reset your filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedRegion('All');
              setSearchQuery('');
            }}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => {
            const isFav = favoriteIds.includes(dest.id);
            const isIndia = dest.country.toLowerCase() === 'india';

            return (
              <div
                key={dest.id}
                onClick={() => setSelectedDest(dest)}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow-xs backdrop-blur-md">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{dest.rating}</span>
                    </div>

                    {isIndia ? (
                      <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-md">
                        🇮🇳 India
                      </span>
                    ) : (
                      <span className="rounded-full bg-indigo-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-md">
                        ✈️ {dest.region}
                      </span>
                    )}
                  </div>

                  {/* Favorite Heart Button */}
                  <button
                    onClick={(e) => toggleFavorite(dest.id, e)}
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-xs hover:scale-110 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`}
                    />
                  </button>

                  {/* Location Title Over Image */}
                  <div className="absolute bottom-3 left-3 text-white pr-3">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-bold drop-shadow-xs font-display">{dest.name}</h3>
                      <span className="rounded bg-black/40 px-1.5 py-0.2 text-[10px] font-semibold text-slate-200 backdrop-blur-xs">
                        {dest.category}
                      </span>
                    </div>
                    <p className="text-xs text-white/90 drop-shadow-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-indigo-300" />
                      <span>{dest.country}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {dest.shortDescription}
                  </p>

                  <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{dest.currentWeather?.temp}°C • {dest.currentWeather?.condition}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Avg. Daily Cost</span>
                      <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        {formatPrice(dest.averageCostPerDay, 'USD')} / day
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                      Best: {dest.bestTimeToVisit}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlanTripForDestination(dest);
                      }}
                      className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Plan Trip</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Destination Detailed Modal */}
      {selectedDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="relative h-64 sm:h-72 w-full">
              <img
                src={selectedDest.imageUrl}
                alt={selectedDest.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <button
                onClick={() => setSelectedDest(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6 text-white pr-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-600/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {selectedDest.category}
                  </span>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                    {selectedDest.region}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mt-1.5 font-display">
                  {selectedDest.name}, {selectedDest.country}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  ⭐ {selectedDest.rating} Rating • Best Season: {selectedDest.bestTimeToVisit}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedDest.longDescription}
              </p>

              {/* Weather & Average Cost Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Current Climate
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedDest.currentWeather?.temp}°C ({selectedDest.currentWeather?.condition})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Avg. Daily Cost
                  </span>
                  <p className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {formatPrice(selectedDest.averageCostPerDay, 'USD')}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Safety Status
                  </span>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedDest.safetyInfo}
                  </p>
                </div>
              </div>

              {/* Top Attractions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2.5">
                  Must-Visit Attractions & Experiences
                </h4>
                <div className="space-y-2">
                  {selectedDest.topAttractions.map((att, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{att.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{att.description}</p>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300 shrink-0 ml-3">
                        {att.estimatedCost > 0 ? formatPrice(att.estimatedCost, 'USD') : 'Free'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Travel Tips */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Insider Travel Tips
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {selectedDest.travelTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Verified Traveler Ratings & Reviews Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <RatingAndReviewSection
                  targetType="destination"
                  targetId={selectedDest.id}
                  targetName={selectedDest.name}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedDest(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const dest = selectedDest;
                    setSelectedDest(null);
                    onPlanTripForDestination(dest);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Build Itinerary for {selectedDest.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
