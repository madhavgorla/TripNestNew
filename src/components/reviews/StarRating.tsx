import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (newRating: number) => void;
  showValue?: boolean;
  valueClassName?: string;
  totalReviews?: number;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Disappointing',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Exceptional',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'sm',
  interactive = false,
  onChange,
  showValue = false,
  valueClassName = 'text-xs font-bold text-slate-800 dark:text-slate-200 ml-1.5',
  totalReviews,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center gap-0.5" onMouseLeave={() => interactive && setHoverRating(null)}>
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = activeRating >= starValue;
          const isHalf = !isFilled && activeRating >= starValue - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              className={`relative transition-transform ${
                interactive ? 'cursor-pointer hover:scale-115 active:scale-95 p-0.5' : 'cursor-default'
              }`}
              title={interactive ? `${starValue} Star${starValue > 1 ? 's' : ''} (${RATING_LABELS[starValue] || ''})` : undefined}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                }`}
              />
            </button>
          );
        })}
      </div>

      {interactive && hoverRating !== null && (
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2 animate-in fade-in">
          {RATING_LABELS[hoverRating]}
        </span>
      )}

      {showValue && hoverRating === null && (
        <span className={valueClassName}>
          {rating > 0 ? rating.toFixed(1) : 'New'}
          {totalReviews !== undefined && (
            <span className="text-slate-400 font-normal text-[11px] ml-1">
              ({totalReviews})
            </span>
          )}
        </span>
      )}
    </div>
  );
};
