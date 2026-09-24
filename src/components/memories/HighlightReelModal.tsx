import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Share2,
  Award,
  Utensils,
  MapPin,
  Calendar,
  Compass,
} from 'lucide-react';
import { HighlightReelSlide, Trip } from '../../types';

interface HighlightReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: HighlightReelSlide[];
  trip: Trip;
}

export const HighlightReelModal: React.FC<HighlightReelModalProps> = ({
  isOpen,
  onClose,
  slides,
  trip,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const durationPerSlideMs = 5500;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  }, [slides.length]);

  // Auto-advance timer when playing
  useEffect(() => {
    if (!isOpen || !isPlaying || slides.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, durationPerSlideMs);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentIndex, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, nextSlide, prevSlide]);

  if (!isOpen || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `✨ Check out our Trip Memory Highlight Reel for ${trip.tripName} in ${trip.destination}! ${currentSlide.title}: "${currentSlide.content}"`
      );
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const getSlideIcon = (type: string) => {
    switch (type) {
      case 'culinary':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'superlative':
        return <Award className="w-5 h-5 text-indigo-400" />;
      case 'highlight':
        return <Compass className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-all">
      {/* Modal Container */}
      <div className="relative flex flex-col h-[90vh] max-h-[750px] w-full max-w-lg overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800">
        {/* Background Image / Ambient Gradient */}
        <div className="absolute inset-0">
          {currentSlide.imageUrl ? (
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="h-full w-full object-cover opacity-45 scale-105 transition-all duration-1000 ease-out"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        </div>

        {/* Top Progress Segment Bars */}
        <div className="relative z-20 flex gap-1.5 p-4 pb-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/20 backdrop-blur-xs cursor-pointer"
              onClick={() => {
                setCurrentIndex(idx);
                setIsPlaying(true);
              }}
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  idx < currentIndex
                    ? 'w-full'
                    : idx === currentIndex
                    ? isPlaying
                      ? 'w-full transition-all duration-[5500ms] ease-linear'
                      : 'w-1/2'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Header Controls */}
        <div className="relative z-20 flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-cyan-400 backdrop-blur-xs">
              {getSlideIcon(currentSlide.type)}
            </span>
            <div>
              <p className="text-xs font-bold leading-none text-white">{trip.destination}</p>
              <p className="text-[10px] text-slate-300 mt-0.5">{trip.startDate} • {trip.travelers} Travelers</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Share Slide"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer ml-1"
              title="Close Reel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tap navigation areas (Left / Right click zones) */}
        <div className="absolute inset-0 z-10 flex">
          <div className="h-full w-1/3 cursor-w-resize" onClick={prevSlide} />
          <div className="h-full w-1/3 cursor-pointer" onClick={() => setIsPlaying(!isPlaying)} />
          <div className="h-full w-1/3 cursor-e-resize" onClick={nextSlide} />
        </div>

        {/* Slide Content Area */}
        <div className="relative z-20 flex flex-1 flex-col justify-end p-6 pb-8 pointer-events-none">
          {/* Badge */}
          {currentSlide.badge && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/30 px-3 py-1 text-[11px] font-semibold text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
                <Sparkles className="w-3 h-3" />
                <span>{currentSlide.badge}</span>
              </span>
            </div>
          )}

          {/* Subtitle / Chapter */}
          {currentSlide.subtitle && (
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90 mb-1">
              {currentSlide.subtitle}
            </p>
          )}

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            {currentSlide.title}
          </h2>

          {/* Narrative Content */}
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-200 line-clamp-5 drop-shadow-sm font-light">
            {currentSlide.content}
          </p>

          {/* Stats or Footer tag */}
          {currentSlide.stats && (
            <div className="mt-4 flex items-center gap-2 pt-2 border-t border-white/15">
              <span className="text-xs font-medium text-amber-300">✦ {currentSlide.stats}</span>
            </div>
          )}
        </div>

        {/* Bottom Interactive Controls */}
        <div className="relative z-20 flex items-center justify-between border-t border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-md">
          <button
            onClick={prevSlide}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              {currentIndex + 1} of {slides.length}
            </span>
            {currentIndex === slides.length - 1 && (
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setIsPlaying(true);
                }}
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay</span>
              </button>
            )}
          </div>

          <button
            onClick={nextSlide}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Copied toast */}
        {copiedShare && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 rounded-xl bg-indigo-600/90 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-md animate-fade-in">
            Highlight caption copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};
