import React, { useState, useEffect } from 'react';
import { Search, Compass, MapPin, Calendar, ArrowRight, X } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { api } from '../../services/api';
import { Destination } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrip: (tripId: string) => void;
  onSelectDestination: (destId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectTrip, onSelectDestination }) => {
  const [query, setQuery] = useState('');
  const { trips } = useTrip();
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getDestinations().then((res) => {
        if (res.success) setDestinations(res.data);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const filteredTrips = q
    ? trips.filter((t) => t.tripName.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q))
    : trips.slice(0, 3);

  const filteredDestinations = q
    ? destinations.filter((d) => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q))
    : destinations.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search trips, destinations, attractions, Rome, Goa, Bali..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Trips Section */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              My Trips ({filteredTrips.length})
            </span>
            <div className="mt-2 space-y-1">
              {filteredTrips.length === 0 ? (
                <p className="text-xs text-slate-400 py-1">No matching trips found</p>
              ) : (
                filteredTrips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => {
                      onSelectTrip(trip.id);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{trip.tripName}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-2">
                          <span>{trip.destination}, {trip.country}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {trip.startDate}
                          </span>
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Destinations Section */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              World Destinations ({filteredDestinations.length})
            </span>
            <div className="mt-2 space-y-1">
              {filteredDestinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => {
                    onSelectDestination(dest.id);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{dest.name}, {dest.country}</p>
                      <p className="text-xs text-slate-400">{dest.category} • ⭐ {dest.rating} • Best: {dest.bestTimeToVisit}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
