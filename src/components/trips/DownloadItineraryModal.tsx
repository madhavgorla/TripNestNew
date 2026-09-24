import React, { useState } from 'react';
import {
  FileText,
  Download,
  X,
  Check,
  Calendar,
  MapPin,
  DollarSign,
  CloudSun,
  ShieldCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Trip, ItineraryDay, DestinationWeather } from '../../types';
import { generateTripItineraryPdf } from '../../services/pdfExport';
import { useCurrency } from '../../context/CurrencyContext';

interface DownloadItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  itineraryDays: ItineraryDay[];
  weatherData?: DestinationWeather | null;
}

export const DownloadItineraryModal: React.FC<DownloadItineraryModalProps> = ({
  isOpen,
  onClose,
  trip,
  itineraryDays,
  weatherData,
}) => {
  const { formatPrice } = useCurrency();
  const [includeBudget, setIncludeBudget] = useState(true);
  const [includeWeather, setIncludeWeather] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const totalActivities = itineraryDays.reduce((acc, d) => acc + (d.activities?.length || 0), 0);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setDownloadSuccess(false);

      // Add a slight micro-delay for smooth UI feedback
      await new Promise((resolve) => setTimeout(resolve, 350));

      await generateTripItineraryPdf(trip, itineraryDays, {
        includeBudget,
        includeWeather,
        includeNotes,
        weatherData,
      });

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Unable to generate PDF at this time. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Export Itinerary to PDF
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download an offline, printable travel booklet formatted for your journey.
            </p>
          </div>
        </div>

        {/* Trip Overview Card */}
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {trip.tripName}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>{trip.destination}, {trip.country}</span>
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {trip.status}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-3 text-center dark:border-slate-700/60">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Duration</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {itineraryDays.length} Days
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Activities</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {totalActivities} Total
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Budget</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {formatPrice(trip.budget || 0, trip.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Export Options Checklist */}
        <div className="mt-4 space-y-2.5">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Select Document Sections:
          </p>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Day-by-Day Schedule & Timeline
                </p>
                <p className="text-[10px] text-slate-400">Chronological list of all {totalActivities} activities</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Included</span>
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Budget & Financial Summary
                </p>
                <p className="text-[10px] text-slate-400">Allocated budget, recorded spending, and remaining balance</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeBudget}
              onChange={(e) => setIncludeBudget(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-2.5">
              <CloudSun className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Weather & Climate Advisory
                </p>
                <p className="text-[10px] text-slate-400">Destination temperature, condition, and packing guidance</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeWeather}
              onChange={(e) => setIncludeWeather(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Activity Notes & Booking References
                </p>
                <p className="text-[10px] text-slate-400">Ticket details, confirmation numbers, and local travel tips</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeNotes}
              onChange={(e) => setIncludeNotes(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
            />
          </label>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-700 hover:to-sky-700 transition-all cursor-pointer disabled:opacity-75"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Compiling PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF Itinerary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
