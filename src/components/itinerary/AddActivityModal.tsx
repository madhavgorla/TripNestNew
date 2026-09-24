import React, { useState } from 'react';
import { X, Clock, MapPin, DollarSign, Tag, Check, Calendar } from 'lucide-react';
import { ActivityCategory, Activity } from '../../types';
import { useTrip } from '../../context/TripContext';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: string;
  tripCurrency: string;
  initialActivity?: Activity | null;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  dayId,
  tripCurrency,
  initialActivity,
}) => {
  const { addActivity, updateActivity } = useTrip();

  const [name, setName] = useState(initialActivity?.name || '');
  const [description, setDescription] = useState(initialActivity?.description || '');
  const [startTime, setStartTime] = useState(initialActivity?.startTime || '10:00');
  const [endTime, setEndTime] = useState(initialActivity?.endTime || '12:00');
  const [location, setLocation] = useState(initialActivity?.location || '');
  const [category, setCategory] = useState<ActivityCategory>(initialActivity?.category || 'Sightseeing');
  const [cost, setCost] = useState(initialActivity?.cost || 0);
  const [notes, setNotes] = useState(initialActivity?.notes || '');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>(initialActivity?.priority || 'Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories: ActivityCategory[] = [
    'Sightseeing',
    'Food',
    'Hotel',
    'Transport',
    'Adventure',
    'Shopping',
    'Entertainment',
    'Culture',
    'Nature',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (initialActivity) {
        await updateActivity(initialActivity.id, {
          name,
          description,
          startTime,
          endTime,
          location,
          category,
          cost: Number(cost) || 0,
          notes,
          priority,
        });
      } else {
        await addActivity({
          dayId,
          name,
          description,
          startTime,
          endTime,
          location: location || 'City Landmark',
          category,
          cost: Number(cost) || 0,
          currency: tripCurrency,
          notes,
          priority,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {initialActivity ? 'Edit Activity' : 'Add Activity to Itinerary'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Activity Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vatican Museums & Sistine Chapel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Location / Address
            </label>
            <input
              type="text"
              placeholder="e.g. Piazza Navona, 00186 Rome"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Cost ({tripCurrency})
              </label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono tabular-nums text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Travel Notes
            </label>
            <textarea
              rows={2}
              placeholder="Reservation details, dress code tips, booking codes..."
              value={notes || description}
              onChange={(e) => {
                setDescription(e.target.value);
                setNotes(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Priority:</span>
              {(['Low', 'Medium', 'High'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    priority === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialActivity ? 'Save Changes' : 'Add Activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
