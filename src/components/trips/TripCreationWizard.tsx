import React, { useState } from 'react';
import { X, Sparkles, MapPin, Calendar, Users, DollarSign, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { useCurrency } from '../../context/CurrencyContext';
import { TravelStyle } from '../../types';
import { api } from '../../services/api';

interface TripCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated?: (tripId: string) => void;
}

export const TripCreationWizard: React.FC<TripCreationWizardProps> = ({ isOpen, onClose, onTripCreated }) => {
  const { createTrip, addActivity, addItineraryDay } = useTrip();
  const { currentCurrency, currencyRates } = useCurrency();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateWithAi, setGenerateWithAi] = useState(true);

  // Form State
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('Rome');
  const [country, setCountry] = useState('Italy');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-20');
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(2500);
  const [currency, setCurrency] = useState(currentCurrency);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('Standard');

  if (!isOpen) return null;

  const popularDestinations = [
    { name: 'Rome', country: 'Italy' },
    { name: 'Goa', country: 'India' },
    { name: 'Bali', country: 'Indonesia' },
    { name: 'Paris', country: 'France' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'London', country: 'United Kingdom' },
    { name: 'Dubai', country: 'United Arab Emirates' },
  ];

  const travelStyles: { label: TravelStyle; desc: string }[] = [
    { label: 'Budget', desc: 'Hostels, local transit, street delicacies' },
    { label: 'Standard', desc: 'Boutique hotels, guided passes, cozy trattorias' },
    { label: 'Luxury', desc: '5-star resorts, private transfers, fine dining' },
    { label: 'Adventure', desc: 'Hiking, water sports, offbeat exploration' },
    { label: 'Family', desc: 'Kid-friendly pace, family suites, easy meals' },
    { label: 'Couple', desc: 'Romantic sunsets, wine tasting, scenic walks' },
    { label: 'Solo', desc: 'Flexible pacing, social cafes, photo spots' },
    { label: 'Business', desc: 'Fast Wi-Fi, central location, airport express' },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newTrip = await createTrip({
        tripName: tripName.trim() || `${destination} Adventure`,
        destination,
        country,
        startDate,
        endDate,
        travelers: Number(travelers) || 1,
        budget: Number(budget) || 2000,
        currency,
        travelStyle,
      });

      if (newTrip) {
        // If AI generation requested, call AI planner
        if (generateWithAi) {
          try {
            const aiRes = await api.planTripWithAi({
              destination,
              days: 4,
              budget: Number(budget),
              currency,
              travelStyle,
              travelers: Number(travelers),
            });

            if (aiRes.success && aiRes.data && aiRes.data.days) {
              for (const day of aiRes.data.days.slice(0, 3)) {
                await addItineraryDay(day.title, startDate);
                for (const act of day.activities) {
                  await addActivity({
                    name: act.name,
                    description: act.description,
                    startTime: act.startTime,
                    endTime: act.endTime,
                    location: act.location,
                    category: act.category,
                    cost: act.cost,
                    priority: act.priority || 'Medium',
                  });
                }
              }
            }
          } catch (e) {
            console.warn('AI generation during creation:', e);
          }
        }

        if (onTripCreated) onTripCreated(newTrip.id);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Trip Planner Wizard • Step {step} of 4
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {step === 1 && 'Where are you heading?'}
              {step === 2 && 'When and who is traveling?'}
              {step === 3 && 'Set your budget & style'}
              {step === 4 && 'TripNest AI Supercharger'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Trip Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rome Autumn Escape 2026"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Destination
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {popularDestinations.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => {
                        setDestination(d.name);
                        setCountry(d.country);
                        if (!tripName) setTripName(`${d.name} Journey`);
                      }}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        destination === d.name
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-white'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{d.name}</span>
                      <span className="text-[10px] text-slate-400">{d.country}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Or Custom Destination
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="City name"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-1/3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Number of Travelers
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTravelers(num)}
                      className={`flex h-10 w-12 items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                        travelers === num
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {num === 5 ? '5+' : num}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    value={travelers}
                    onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                    className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Estimated Budget
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono tabular-nums text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {Object.values(currencyRates).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Travel Style
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {travelStyles.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setTravelStyle(s.label)}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                        travelStyle === s.label
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-white'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{s.label}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 p-4 dark:border-indigo-950 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                    <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">TripNest AI Copilot</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Auto-generate a day-by-day itinerary with attractions, restaurants, and schedule optimization.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-white p-3 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${generateWithAi ? 'text-indigo-600' : 'text-slate-300'}`} />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Create my itinerary with AI
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={generateWithAi}
                    onChange={(e) => setGenerateWithAi(e.target.checked)}
                    className="h-4 w-4 rounded accent-indigo-600"
                  />
                </div>
              </div>

              {/* Trip Summary Preview */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Destination:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{destination}, {country}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Dates:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{startDate} to {endDate}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Travelers & Style:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{travelers} Person(s) • {travelStyle}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Budget:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums">{currency} {budget}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-800/30">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Crafting Journey...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Launch Trip</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
