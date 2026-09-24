import React, { useState, useEffect } from 'react';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  Plus,
  Compass,
  MapPin,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Review, RatingSummary, CreateReviewInput, TravelerType } from '../../types';
import { api } from '../../services/api';
import { StarRating } from './StarRating';
import { ReviewComposerModal } from './ReviewComposerModal';

interface RatingAndReviewSectionProps {
  targetType: 'destination' | 'trip' | 'activity';
  targetId: string;
  targetName: string;
  className?: string;
  compact?: boolean;
}

export const RatingAndReviewSection: React.FC<RatingAndReviewSectionProps> = ({
  targetType,
  targetId,
  targetName,
  className = '',
  compact = false,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Filters and Sorting
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [selectedTravelerType, setSelectedTravelerType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [votedReviewIds, setVotedReviewIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [targetId, selectedStarFilter, selectedTravelerType, sortBy]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReviews({
        targetType,
        targetId,
        rating: selectedStarFilter || undefined,
        travelerType: selectedTravelerType === 'All' ? undefined : selectedTravelerType,
        sortBy,
      });

      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    try {
      const res = await api.voteReviewHelpful(reviewId);
      if (res.success && res.data) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpfulVotes: res.data.helpfulVotes,
                }
              : r
          )
        );

        setVotedReviewIds((prev) => {
          const next = new Set(prev);
          if (res.data.hasVoted) {
            next.add(reviewId);
          } else {
            next.delete(reviewId);
          }
          return next;
        });
      }
    } catch (err) {
      console.warn('Failed to vote review helpful:', err);
    }
  };

  const handleCreateReview = async (input: CreateReviewInput): Promise<boolean> => {
    try {
      const res = await api.createReview(input);
      if (res.success && res.data) {
        setReviews((prev) => [res.data.review, ...prev]);
        setSummary(res.data.summary);
        setToastMessage('Your review has been published! Thank you for helping travelers.');
        setTimeout(() => setToastMessage(null), 4000);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to submit review:', err);
      return false;
    }
  };

  const travelerTypes = ['All', 'Solo', 'Couple', 'Family', 'Friends', 'Business'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>Traveler Ratings & Reviews</span>
            </h3>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {targetName}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Authentic feedback, local tips, and scores from verified travelers who visited this place.
          </p>
        </div>

        <button
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Overall Score Card & Breakdown */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          {/* Big Score Block */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
            <span className="text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">
              {summary.averageRating.toFixed(1)}
            </span>
            <div className="mt-2">
              <StarRating rating={summary.averageRating} size="md" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Based on {summary.totalReviews} verified traveler review{summary.totalReviews === 1 ? '' : 's'}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{summary.recommendPercentage}% of travelers recommend</span>
            </div>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-2 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Rating Distribution
            </span>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.ratingDistribution[star as 1 | 2 | 3 | 4 | 5] || 0;
              const pct = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;
              const isSelected = selectedStarFilter === star;

              return (
                <button
                  key={star}
                  onClick={() => setSelectedStarFilter(isSelected ? null : star)}
                  className={`group flex items-center gap-2 text-xs transition-colors rounded-lg px-2 py-1 -mx-2 cursor-pointer ${
                    isSelected ? 'bg-amber-50 dark:bg-amber-950/40 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title={`Filter by ${star} star reviews`}
                >
                  <span className="flex items-center gap-1 w-10 shrink-0 font-medium text-slate-700 dark:text-slate-300">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-amber-500' : 'bg-amber-400 group-hover:bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                    {pct}% ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-Ratings Category Breakdown */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-3 px-2 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Category Breakdown
            </span>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Value for Money</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {summary.subRatingsAverage?.valueForMoney.toFixed(1) || '4.8'} / 5
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                  <div
                    className="h-1.5 bg-indigo-500 rounded-full"
                    style={{ width: `${((summary.subRatingsAverage?.valueForMoney || 4.8) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Safety & Comfort</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {summary.subRatingsAverage?.safety.toFixed(1) || '4.9'} / 5
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                  <div
                    className="h-1.5 bg-emerald-500 rounded-full"
                    style={{ width: `${((summary.subRatingsAverage?.safety || 4.9) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Food & Dining</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {summary.subRatingsAverage?.foodAndDining.toFixed(1) || '4.9'} / 5
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                  <div
                    className="h-1.5 bg-amber-500 rounded-full"
                    style={{ width: `${((summary.subRatingsAverage?.foodAndDining || 4.9) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Walkability & Transit</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {summary.subRatingsAverage?.walkability.toFixed(1) || '4.7'} / 5
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                  <div
                    className="h-1.5 bg-purple-500 rounded-full"
                    style={{ width: `${((summary.subRatingsAverage?.walkability || 4.7) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Sentiment Synthesis Banner */}
      {summary?.aiSummary && (
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/50 via-white to-indigo-50/50 p-4 dark:border-purple-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
              AI Community Sentiment Summary
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {summary.aiSummary}
            </p>
          </div>
        </div>
      )}

      {/* Filter and Sorting Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
        {/* Traveler Type Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Type:</span>
          </span>
          {travelerTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTravelerType(type)}
              className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedTravelerType === type
                  ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Active Star Filter Clear Button & Sorting */}
        <div className="flex items-center gap-3">
          {selectedStarFilter && (
            <button
              onClick={() => setSelectedStarFilter(null)}
              className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 cursor-pointer"
            >
              <span>{selectedStarFilter}★ only</span>
              <span>×</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border-0 bg-transparent py-1 text-xs font-semibold text-slate-700 focus:ring-0 dark:text-slate-200 cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="helpful">Most Helpful</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p className="mt-2 text-xs font-semibold text-slate-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              No reviews match your filter
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Be the first to share your journey tips and experiences with other travelers.
            </p>
            <button
              onClick={() => setIsComposerOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write the First Review</span>
            </button>
          </div>
        ) : (
          reviews.map((rev) => {
            const hasVoted = votedReviewIds.has(rev.id) || (rev.votedUserIds && rev.votedUserIds.includes('usr-1'));

            return (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-3"
              >
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={rev.userName}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {rev.userName}
                        </h4>
                        {rev.verifiedTraveler && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {rev.travelerType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {rev.userCountry || 'Global Explorer'} • Visited in {rev.tripDate || 'Recent Visit'}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating Badge */}
                  <div className="text-right shrink-0">
                    <StarRating rating={rev.rating} size="sm" />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Review Title & Body */}
                <div className="space-y-1.5">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rev.title}
                  </h5>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {rev.comment}
                  </p>
                </div>

                {/* Photos if any */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {rev.photos.map((photo, pIdx) => (
                      <img
                        key={pIdx}
                        src={photo}
                        alt="Traveler upload"
                        className="h-20 w-28 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ))}
                  </div>
                )}

                {/* Sub-Ratings Chips */}
                {rev.subRatings && (
                  <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-slate-500">
                    <span className="rounded-lg bg-slate-50 px-2 py-0.5 dark:bg-slate-800/60 font-medium">
                      Value: <strong className="text-slate-700 dark:text-slate-200">{rev.subRatings.valueForMoney}★</strong>
                    </span>
                    <span className="rounded-lg bg-slate-50 px-2 py-0.5 dark:bg-slate-800/60 font-medium">
                      Safety: <strong className="text-slate-700 dark:text-slate-200">{rev.subRatings.safety}★</strong>
                    </span>
                    <span className="rounded-lg bg-slate-50 px-2 py-0.5 dark:bg-slate-800/60 font-medium">
                      Food: <strong className="text-slate-700 dark:text-slate-200">{rev.subRatings.foodAndDining}★</strong>
                    </span>
                    <span className="rounded-lg bg-slate-50 px-2 py-0.5 dark:bg-slate-800/60 font-medium">
                      Walkability: <strong className="text-slate-700 dark:text-slate-200">{rev.subRatings.walkability}★</strong>
                    </span>
                  </div>
                )}

                {/* Helpful Voting Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleHelpfulVote(rev.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        hasVoted
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-current' : ''}`} />
                      <span>Helpful ({rev.helpfulVotes || 0})</span>
                    </button>
                    {rev.wouldRecommend && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">
                        ✓ Recommends this journey
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Verified TripNest Community Review
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer Modal */}
      <ReviewComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetName={targetName}
        onSubmit={handleCreateReview}
      />
    </div>
  );
};
