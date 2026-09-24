import React, { useState } from 'react';
import {
  X,
  Star,
  Sparkles,
  Send,
  ThumbsUp,
  MapPin,
  Compass,
  Check,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { CreateReviewInput, ReviewSubRatings, TravelerType } from '../../types';
import { StarRating } from './StarRating';

interface ReviewComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'destination' | 'trip' | 'activity';
  targetId: string;
  targetName: string;
  onSubmit: (review: CreateReviewInput) => Promise<boolean>;
}

export const ReviewComposerModal: React.FC<ReviewComposerModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [travelerType, setTravelerType] = useState<TravelerType>('Couple');
  const [tripDate, setTripDate] = useState('Recent Visit');
  const [wouldRecommend, setWouldRecommend] = useState(true);

  // Sub-ratings
  const [valueForMoney, setValueForMoney] = useState<number>(5);
  const [safety, setSafety] = useState<number>(5);
  const [foodAndDining, setFoodAndDining] = useState<number>(5);
  const [walkability, setWalkability] = useState<number>(5);

  const [photoInput, setPhotoInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const travelerTypes: TravelerType[] = ['Solo', 'Couple', 'Family', 'Friends', 'Business'];

  const handleAddPhoto = () => {
    if (!photoInput.trim()) return;
    setPhotos((prev) => [...prev, photoInput.trim()]);
    setPhotoInput('');
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please provide a brief headline or title for your review.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 15) {
      setErrorMessage('Please share at least a couple of sentences (15+ characters) about your experience.');
      return;
    }

    setIsSubmitting(true);
    try {
      const subRatings: ReviewSubRatings = {
        valueForMoney,
        safety,
        foodAndDining,
        walkability,
      };

      const payload: CreateReviewInput = {
        targetType,
        targetId,
        targetName,
        rating,
        subRatings,
        title: title.trim(),
        comment: comment.trim(),
        travelerType,
        tripDate,
        wouldRecommend,
        photos: photos.length > 0 ? photos : undefined,
      };

      const success = await onSubmit(payload);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Share Your Experience & Rating
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>Reviewing: <strong className="text-slate-700 dark:text-slate-200">{targetName}</strong></span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Primary Star Rating Selector */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 dark:border-amber-950/40 dark:bg-amber-950/20 text-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 mb-2">
              Overall Journey Rating
            </label>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onChange={(val) => setRating(val)}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-amber-700/80 dark:text-amber-400">
              Click to select 1 to 5 stars
            </p>
          </div>

          {/* Sub-Ratings Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Value for Money</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{valueForMoney} / 5</span>
              </div>
              <StarRating rating={valueForMoney} size="sm" interactive onChange={setValueForMoney} />
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Safety & Security</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{safety} / 5</span>
              </div>
              <StarRating rating={safety} size="sm" interactive onChange={setSafety} />
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Food & Dining</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{foodAndDining} / 5</span>
              </div>
              <StarRating rating={foodAndDining} size="sm" interactive onChange={setFoodAndDining} />
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Walkability & Transit</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{walkability} / 5</span>
              </div>
              <StarRating rating={walkability} size="sm" interactive onChange={setWalkability} />
            </div>
          </div>

          {/* Traveler Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Who did you travel with?
            </label>
            <div className="flex flex-wrap gap-2">
              {travelerTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTravelerType(type)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    travelerType === type
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Comment */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Review Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unforgettable evenings in Trastevere and historic sights!"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Review & Tips
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share insider recommendations, highlights, favorite meals, transit tips, or things you wish you knew before visiting..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Recommend Toggle & Visit Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                When did you visit?
              </label>
              <input
                type="text"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                placeholder="e.g. Autumn 2025 or Recent"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-3 pt-4 sm:pt-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                Would you recommend this destination?
              </label>
              <button
                type="button"
                onClick={() => setWouldRecommend(!wouldRecommend)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  wouldRecommend ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    wouldRecommend ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
