import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Film,
  Play,
  RotateCcw,
  Copy,
  Check,
  Award,
  Utensils,
  MapPin,
  Calendar,
  Compass,
  Heart,
  Camera,
  Share2,
  Download,
  Plus,
  Trash2,
  Quote,
  Flame,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  Footprints,
} from 'lucide-react';
import { Trip, ItineraryDay, Expense, TripMemoryReflection, MemoryTone, TripMemoryPhoto } from '../../types';
import { useTrip } from '../../context/TripContext';
import { HighlightReelModal } from './HighlightReelModal';
import { fetchOrGenerateMemories, saveMemoriesToStorage, loadMemoriesFromStorage } from '../../services/memoryGenerator';

interface TripMemoriesProps {
  trip: Trip;
  itineraryDays: ItineraryDay[];
  expenses: Expense[];
}

export const TripMemories: React.FC<TripMemoriesProps> = ({
  trip,
  itineraryDays,
  expenses,
}) => {
  const { updateTrip } = useTrip();

  const [memory, setMemory] = useState<TripMemoryReflection | null>(() => loadMemoriesFromStorage(trip.id));
  const [selectedTone, setSelectedTone] = useState<MemoryTone>('poetic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHighlightReel, setShowHighlightReel] = useState(false);
  const [copiedNarrative, setCopiedNarrative] = useState(false);
  const [userNotes, setUserNotes] = useState(memory?.userNotes || '');
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoLocation, setNewPhotoLocation] = useState(trip.destination);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize or fetch memory if not cached
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!memory) {
        setIsGenerating(true);
        const res = await fetchOrGenerateMemories(trip, itineraryDays, expenses, selectedTone);
        if (isMounted) {
          setMemory(res);
          setIsGenerating(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [trip.id]);

  const handleRegenerate = async (toneToUse = selectedTone) => {
    setIsGenerating(true);
    setStatusMessage('Crafting AI reflections with Gemini...');
    try {
      const regenerated = await fetchOrGenerateMemories(trip, itineraryDays, expenses, toneToUse, userNotes);
      setMemory(regenerated);
      saveMemoriesToStorage(trip.id, regenerated);
      setStatusMessage('Reflection & highlight reel updated successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      console.error('Failed to regenerate reflection', e);
      setStatusMessage('Generation completed with local intelligent engine.');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToneChange = (tone: MemoryTone) => {
    setSelectedTone(tone);
    handleRegenerate(tone);
  };

  const handleCopyNarrative = () => {
    if (!memory) return;
    const textToCopy = `✨ ${memory.title} ✨\n\n"${memory.tagline}"\n\n${memory.summaryNarrative}\n\n🏆 Unforgettable Highlights:\n${memory.keyHighlights.map((h) => `• ${h.title}: ${h.description}`).join('\n')}\n\n🍝 Flavors & Meals:\n${memory.bestMealsAndFlavors.map((m) => `• ${m}`).join('\n')}\n\n— Chronicled via TripNest AI`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedNarrative(true);
      setTimeout(() => setCopiedNarrative(false), 2500);
    }
  };

  const handleMarkAsCompleted = () => {
    updateTrip(trip.id, { status: 'COMPLETED' });
    setStatusMessage('🎉 Trip marked as Completed! Memories and highlight reels are ready.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !memory) return;

    const newPhoto: TripMemoryPhoto = {
      id: `ph-user-${Date.now()}`,
      tripId: trip.id,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || `Memories in ${newPhotoLocation}`,
      location: newPhotoLocation.trim() || trip.destination,
      date: new Date().toISOString().split('T')[0],
    };

    const updated = {
      ...memory,
      photos: [newPhoto, ...memory.photos],
    };

    setMemory(updated);
    saveMemoriesToStorage(trip.id, updated);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setShowAddPhotoModal(false);
  };

  const handleDeletePhoto = (photoId: string) => {
    if (!memory) return;
    const updated = {
      ...memory,
      photos: memory.photos.filter((p) => p.id !== photoId),
    };
    setMemory(updated);
    saveMemoriesToStorage(trip.id, updated);
  };

  const isCompleted = trip.status === 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Toast message */}
      {statusMessage && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-xs font-semibold text-indigo-900 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-indigo-500 hover:text-indigo-700">
            ✕
          </button>
        </div>
      )}

      {/* Hero Memories Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl dark:border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isCompleted ? 'Completed Trip Chronicle' : 'Trip Reflections & Memories'}</span>
              </span>
              <span className="text-xs text-slate-300">• {trip.destination}, {trip.country}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
              {memory?.title || `${trip.destination} Memories & Highlights`}
            </h1>
            <p className="mt-2 text-sm text-indigo-200/90 leading-relaxed font-light italic">
              "{memory?.tagline || `Chronicling the moments, milestones, and shared laughter across ${trip.destination}.`}"
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                {trip.startDate} to {trip.endDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-indigo-400" />
                {memory?.milestones?.estimatedSteps ? `~${memory.milestones.estimatedSteps.toLocaleString()} Steps Walked` : 'Walked & Explored'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                {memory?.milestones?.completedActivities || itineraryDays.reduce((acc, d) => acc + (d.activities?.length || 0), 0)} Milestones Logged
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Highlight Reel Action */}
            <button
              onClick={() => setShowHighlightReel(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-lg hover:from-indigo-600 hover:to-cyan-600 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Film className="w-4 h-4 text-white animate-pulse" />
              <span>Launch Highlight Reel</span>
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </button>

            {!isCompleted && (
              <button
                onClick={handleMarkAsCompleted}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-md cursor-pointer"
                title="Mark this trip as completed"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mark as Completed</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 h-48 w-48 rounded-full bg-cyan-600/15 blur-2xl pointer-events-none" />
      </div>

      {/* Control Strip: Tone Selection & AI Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Narrative Tone:</span>
          </span>

          <button
            onClick={() => handleToneChange('poetic')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedTone === 'poetic'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            🌟 Nostalgic & Poetic
          </button>
          <button
            onClick={() => handleToneChange('adventurous')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedTone === 'adventurous'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            ⚡ High-Energy Adventure
          </button>
          <button
            onClick={() => handleToneChange('cultural')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedTone === 'cultural'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            🏛️ Cultural Deep-Dive
          </button>
          <button
            onClick={() => handleToneChange('social')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedTone === 'social'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            📱 Social Highlight Reel
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>{showNotesDrawer ? 'Hide Notes' : 'Personal Notes'}</span>
          </button>

          <button
            disabled={isGenerating}
            onClick={() => handleRegenerate()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Summarizing...' : 'Regenerate AI Reflection'}</span>
          </button>
        </div>
      </div>

      {/* User Notes Drawer / Reflection Prompt */}
      {showNotesDrawer && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-950 dark:bg-indigo-950/20 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Add Traveler Notes or Secret Moments
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              AI weaves these personal memories into your narrative
            </span>
          </div>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="e.g. The hilarious midnight gelato run in Trastevere, the rain shower during the Colosseum tour, or Lara's reaction to the Trevi coin toss..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleRegenerate()}
              disabled={isGenerating}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weave into Memory</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Memory Chronicle Narrative */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                The Journey Narrative
              </h2>
              <p className="text-[11px] text-slate-400">
                AI reflection chronicled from your itinerary logs, check-ins, and dining records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNarrative}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Copy narrative to clipboard"
            >
              {copiedNarrative ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Story</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowHighlightReel(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Watch Reel</span>
            </button>
          </div>
        </div>

        {/* Narrative Prose */}
        <div className="mt-6 prose prose-slate dark:prose-invert max-w-none">
          {memory?.summaryNarrative ? (
            memory.summaryNarrative.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-serif my-4">
                {paragraph}
              </p>
            ))
          ) : (
            <div className="flex items-center justify-center p-8 text-xs text-slate-400">
              Generating your trip reflection narrative...
            </div>
          )}
        </div>
      </div>

      {/* Grid: Unforgettable Moments & Culinary Delights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unforgettable Moments */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unforgettable Moments</h3>
              <p className="text-[11px] text-slate-400">Standout highlights from your itinerary logs</p>
            </div>
          </div>

          <div className="space-y-3">
            {memory?.unforgettableMoments?.map((moment, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800/80 dark:bg-slate-800/50"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold dark:bg-amber-950 dark:text-amber-300">
                  {idx + 1}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {moment}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Flavors & Culinary Delights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Flavors & Feasts</h3>
              <p className="text-[11px] text-slate-400">Culinary highlights from trattorias and markets</p>
            </div>
          </div>

          <div className="space-y-3">
            {memory?.bestMealsAndFlavors?.map((meal, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800/80 dark:bg-slate-800/50"
              >
                <span className="text-base shrink-0">🍝</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {meal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trip Superlatives & Travel Awards */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Trip Superlatives & Squad Badges
              </h2>
              <p className="text-[11px] text-slate-400">
                Honorary awards unlocked based on your itinerary pace, food stops, and exploration logs.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {memory?.superlatives?.map((sup) => (
            <div
              key={sup.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-850 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{sup.awardEmoji}</span>
                  {sup.recipient && (
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {sup.recipient}
                    </span>
                  )}
                </div>
                <h4 className="mt-3 text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {sup.title}
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {sup.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Scrapbook & Photos Gallery */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Memory Scrapbook & Visual Gallery
              </h2>
              <p className="text-[11px] text-slate-400">
                Cherished snapshots and visual highlights from your {trip.destination} journey.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddPhotoModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory Photo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memory?.photos?.map((photo) => (
            <div
              key={photo.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850 shadow-2xs hover:shadow-md transition-all"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to destination cover if broken URL
                    (e.target as HTMLImageElement).src = trip.coverImage || '/src/assets/images/hero_travel_workspace_1790172750348.jpg';
                  }}
                />
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white/80 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-black/80 transition-all cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                  {photo.caption}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-500" />
                    <span>{photo.location || trip.destination}</span>
                  </span>
                  {photo.date && <span>{photo.date}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Photo Modal */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Photo to Memory Scrapbook
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add a picture URL or photo from your {trip.destination} journey.
            </p>

            <form onSubmit={handleAddPhoto} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Caption / Memory Story
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunset view over the ancient forum..."
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Specific Location
                </label>
                <input
                  type="text"
                  placeholder={trip.destination}
                  value={newPhotoLocation}
                  onChange={(e) => setNewPhotoLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Highlight Reel Story Modal */}
      {showHighlightReel && memory?.slides && (
        <HighlightReelModal
          isOpen={showHighlightReel}
          onClose={() => setShowHighlightReel(false)}
          slides={memory.slides}
          trip={trip}
        />
      )}
    </div>
  );
};
