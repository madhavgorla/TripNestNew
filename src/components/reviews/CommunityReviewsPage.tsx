import React, { useState, useEffect } from 'react';
import {
  Star,
  Award,
  Sparkles,
  MapPin,
  Compass,
  Plus,
  ThumbsUp,
  Filter,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { Destination, Review } from '../../types';
import { api } from '../../services/api';
import { RatingAndReviewSection } from './RatingAndReviewSection';
import { ReviewComposerModal } from './ReviewComposerModal';
import { useCurrency } from '../../context/CurrencyContext';

interface CommunityReviewsPageProps {
  onPlanTrip?: (destination: Destination) => void;
}

export const CommunityReviewsPage: React.FC<CommunityReviewsPageProps> = ({ onPlanTrip }) => {
  const { formatPrice } = useCurrency();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestId, setSelectedDestId] = useState<string>('dest-rome');
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [isGlobalComposerOpen, setIsGlobalComposerOpen] = useState(false);
  const [composerTargetDest, setComposerTargetDest] = useState<{ id: string; name: string }>({
    id: 'dest-rome',
    name: 'Rome',
  });

  useEffect(() => {
    loadDestinationsAndFeatured();
  }, []);

  const loadDestinationsAndFeatured = async () => {
    try {
      const destRes = await api.getDestinations();
      if (destRes.success && destRes.data) {
        setDestinations(destRes.data);
      }
      const featuredRes = await api.getFeaturedReviews();
      if (featuredRes.success && featuredRes.data) {
        setFeaturedReviews(featuredRes.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentDest = destinations.find((d) => d.id === selectedDestId) || {
    id: 'dest-rome',
    name: 'Rome',
    country: 'Italy',
    rating: 4.9,
    imageUrl: '/src/assets/images/dest_rome_colosseum_1790172766150.jpg',
  };

  const handleOpenComposer = (destId: string, destName: string) => {
    setComposerTargetDest({ id: destId, name: destName });
    setIsGlobalComposerOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md border border-amber-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Verified Community Ratings & Reviews</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-display">
            Traveler Ratings & Honest Reviews
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Unfiltered scores, insider food tips, walkability notes, and safety ratings from travelers who have explored these destinations firsthand.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenComposer(currentDest.id, currentDest.name)}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-all cursor-pointer"
            >
              <Star className="w-4 h-4 fill-slate-950" />
              <span>Write a Destination Review</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Pattern */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-24 -bottom-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* Destination Quick Selector Carousel / Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Select Destination to View & Add Reviews</span>
          </h2>
          <span className="text-xs text-slate-400">
            {destinations.length > 0 ? `${destinations.length} destinations available` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {destinations.map((dest) => {
            const isSelected = selectedDestId === dest.id;
            return (
              <button
                key={dest.id}
                onClick={() => setSelectedDestId(dest.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md scale-102'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>{dest.name}</span>
                <span className={`flex items-center gap-0.5 text-[11px] font-bold ${
                  isSelected ? 'text-amber-300' : 'text-amber-500'
                }`}>
                  <Star className="w-3 h-3 fill-current" />
                  <span>{dest.rating}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Rating & Review Section for Selected Destination */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <RatingAndReviewSection
          key={selectedDestId}
          targetType="destination"
          targetId={selectedDestId}
          targetName={currentDest.name}
        />
      </div>

      {/* Global Review Composer Modal */}
      <ReviewComposerModal
        isOpen={isGlobalComposerOpen}
        onClose={() => setIsGlobalComposerOpen(false)}
        targetType="destination"
        targetId={composerTargetDest.id}
        targetName={composerTargetDest.name}
        onSubmit={async (review) => {
          const res = await api.createReview(review);
          if (res.success) {
            setSelectedDestId(review.targetId);
            return true;
          }
          return false;
        }}
      />
    </div>
  );
};
