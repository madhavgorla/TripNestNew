import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Activity } from '../../types';

interface TripMapProps {
  center: { lat: number; lng: number };
  activities: Activity[];
  selectedActivityId?: string;
  onSelectActivity?: (activityId: string) => void;
  destinationName?: string;
  dayTitle?: string;
  viewScope?: 'day' | 'all';
  onToggleScope?: () => void;
}

export const TripMap: React.FC<TripMapProps> = ({
  center,
  activities,
  selectedActivityId,
  onSelectActivity,
  destinationName = 'Destination',
  dayTitle,
  viewScope = 'day',
  onToggleScope,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center when trip destination changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], 13);
    }
  }, [center.lat, center.lng]);

  // Update Markers and Polyline Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const routeCoords: [number, number][] = [];

    activities.forEach((act, index) => {
      const lat = act.coordinates?.lat || center.lat + (index % 3 - 1) * 0.008;
      const lng = act.coordinates?.lng || center.lng + (Math.floor(index / 3) - 1) * 0.008;
      routeCoords.push([lat, lng]);

      // Category color
      let pinColor = '#4f46e5'; // default indigo
      if (act.category === 'Food') pinColor = '#f97316'; // orange
      if (act.category === 'Hotel') pinColor = '#06b6d4'; // cyan
      if (act.category === 'Culture' || act.category === 'Sightseeing') pinColor = '#6366f1';
      if (act.category === 'Entertainment') pinColor = '#ec4899'; // pink
      if (act.category === 'Nature') pinColor = '#10b981'; // emerald

      const isSelected = act.id === selectedActivityId;

      // Custom SVG Pin Icon
      const customIcon = L.divIcon({
        className: 'custom-trip-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            background-color: ${pinColor};
            border: 2.5px solid white;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            color: white;
            font-size: ${isSelected ? '13px' : '11px'};
            font-weight: bold;
            font-family: 'Plus Jakarta Sans', sans-serif;
            transition: transform 0.2s ease;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          ">
            <span>${index + 1}</span>
          </div>
        `,
        iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
        iconAnchor: [isSelected ? 19 : 15, isSelected ? 19 : 15],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; min-width: 160px;">
          <div style="font-size: 10px; font-weight: 700; color: ${pinColor}; text-transform: uppercase; letter-spacing: 0.5px;">
            ${act.startTime} • ${act.category}
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 2px;">
            ${act.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            ${act.location}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #16a34a; margin-top: 4px;">
            ${act.cost > 0 ? `${act.currency} ${act.cost}` : 'Free Activity'}
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectActivity) onSelectActivity(act.id);
      });

      markersRef.current[act.id] = marker;
    });

    // Draw route polyline between activities if 2 or more stops
    if (routeCoords.length >= 2) {
      polylineRef.current = L.polyline(routeCoords, {
        color: '#4f46e5',
        weight: 3.5,
        opacity: 0.8,
        dashArray: '6, 8',
      }).addTo(map);
    }
  }, [activities, selectedActivityId, center.lat, center.lng, onSelectActivity]);

  // Center on selected activity
  useEffect(() => {
    if (selectedActivityId && markersRef.current[selectedActivityId] && mapInstanceRef.current) {
      const marker = markersRef.current[selectedActivityId];
      mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true });
      marker.openPopup();
    }
  }, [selectedActivityId]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Overlay Badge & Route Scope Switcher */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 rounded-xl bg-white/95 p-1.5 shadow-md backdrop-blur-md dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800">
        <div className="px-2 py-0.5">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {dayTitle || `${destinationName} Route`}
          </p>
          <p className="text-[10px] text-slate-500">
            {activities.length} sequential {activities.length === 1 ? 'stop' : 'stops'} mapped
          </p>
        </div>

        {onToggleScope && (
          <button
            onClick={onToggleScope}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {viewScope === 'day' ? 'Show All Days' : 'Focus Today'}
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-[1000] hidden sm:flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-md dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-[10px]">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-600" /> Sight</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Food</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-500" /> Hotel</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Nature</span>
      </div>
    </div>
  );
};
