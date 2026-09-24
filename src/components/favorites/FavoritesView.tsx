import React, { useState, useEffect } from 'react';
import { Heart, Plus, MapPin, Star, Sun, Compass } from 'lucide-react';
import { Destination } from '../../types';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

interface FavoritesViewProps {
  onPlanTrip: (dest: Destination) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onPlanTrip }) => {
  const { formatPrice } = useCurrency();
  const [favorites, setFavorites] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await api.getFavorites();
      if (res.success) setFavorites(res.data);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.toggleFavorite(id);
    setFavorites((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Your Saved Destinations ({favorites.length})
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Dream destinations earmarked for upcoming holidays and group getaways.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <Heart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No favorites saved yet</p>
          <p className="text-xs text-slate-400 mt-1">Browse the Discover tab and click the heart icon on any destination.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((dest) => (
            <div
              key={dest.id}
              className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all flex flex-col justify-between"
            >
              <div className="relative h-48 w-full">
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <button
                  onClick={(e) => removeFavorite(dest.id, e)}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-rose-500 shadow-md hover:scale-110 transition-transform"
                >
                  <Heart className="w-4 h-4 fill-rose-500" />
                </button>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-base font-bold drop-shadow-xs">{dest.name}</h3>
                  <p className="text-xs text-white/90 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-300" />
                    <span>{dest.country}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {dest.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400">Best: {dest.bestTimeToVisit}</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {formatPrice(dest.averageCostPerDay, 'USD')} / day
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onPlanTrip(dest)}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start Planning Journey</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
