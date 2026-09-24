import { Trip, ItineraryDay, Expense, TripMemoryReflection, MemoryTone, MemoryHighlight, MemorySuperlative, HighlightReelSlide, TripMemoryPhoto } from '../types';

const STORAGE_PREFIX = 'tripnest_memories_';

export function loadMemoriesFromStorage(tripId: string): TripMemoryReflection | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tripId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load memories from storage', e);
  }
  return null;
}

export function saveMemoriesToStorage(tripId: string, memory: TripMemoryReflection): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${tripId}`, JSON.stringify(memory));
  } catch (e) {
    console.warn('Failed to save memories to storage', e);
  }
}

// Destination curated photo mappings
const DESTINATION_PHOTOS: Record<string, string[]> = {
  rome: [
    '/src/assets/images/dest_rome_colosseum_1790172766150.jpg',
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1000&auto=format&fit=crop&q=80',
  ],
  goa: [
    '/src/assets/images/dest_goa_beach_1790172797821.jpg',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1000&auto=format&fit=crop&q=80',
  ],
  bali: [
    '/src/assets/images/dest_bali_temple_1790172783309.jpg',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1000&auto=format&fit=crop&q=80',
  ],
  paris: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1000&auto=format&fit=crop&q=80',
  ],
  tokyo: [
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop&q=80',
  ],
};

function getCuratedPhotos(destName: string, coverImage?: string): string[] {
  const key = destName.toLowerCase();
  for (const [k, urls] of Object.entries(DESTINATION_PHOTOS)) {
    if (key.includes(k)) {
      return coverImage ? [coverImage, ...urls.filter((u) => u !== coverImage)] : urls;
    }
  }
  return [
    coverImage || '/src/assets/images/hero_travel_workspace_1790172750348.jpg',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
  ];
}

export function generateLocalMemoryReflection(
  trip: Trip,
  itineraryDays: ItineraryDay[],
  expenses: Expense[],
  tone: MemoryTone = 'poetic',
  userNotes?: string
): TripMemoryReflection {
  const allActivities = itineraryDays.flatMap((d) => d.activities || []);
  const completed = allActivities.filter((a) => a.isCompleted);
  const foodActivities = allActivities.filter((a) => a.category === 'Food');
  const sightActivities = allActivities.filter((a) => a.category === 'Sightseeing' || a.category === 'Culture');
  const photosPool = getCuratedPhotos(trip.destination, trip.coverImage);

  // Extract key moments from real itinerary
  const keyHighlights: MemoryHighlight[] = allActivities.slice(0, 5).map((act, i) => {
    const badges = ['Iconic Highlight', 'Golden Hour', 'Chef Pick', 'Hidden Gem', 'Must-See Wonder'];
    return {
      id: `hl-${act.id || i + 1}`,
      dayNumber: act.dayId?.includes('1') ? 1 : act.dayId?.includes('2') ? 2 : act.dayId?.includes('3') ? 3 : (i % 3) + 1,
      title: act.name,
      description: act.description || `Special memory at ${act.location || trip.destination}.`,
      category: act.category || 'Sightseeing',
      badge: badges[i % badges.length],
      location: act.location || trip.destination,
      imageUrl: photosPool[(i + 1) % photosPool.length],
    };
  });

  // Extract food
  const bestMeals: string[] = [];
  if (foodActivities.length > 0) {
    foodActivities.forEach((f) => {
      bestMeals.push(`${f.name} — ${f.description || 'Authentic regional flavors and warm ambiance.'}`);
    });
  } else {
    bestMeals.push(
      `Artisanal trattoria specialties and local wine in ${trip.destination}`,
      `Handmade local desserts and morning espresso in the historic center`,
      `Sunset al-fresco terrace dinner overlooking the illuminated landmarks`
    );
  }

  // Unforgettable moments
  const unforgettableMoments: string[] = [
    sightActivities[0]
      ? `Standing before ${sightActivities[0].name} in the gentle morning light`
      : `Watching the dawn break over ${trip.destination}'s timeless skyline`,
    sightActivities[1]
      ? `Exploring the historic corners of ${sightActivities[1].name} with travel companions`
      : `Getting lost in picturesque alleyways and discovering unexpected courtyards`,
    `Sharing late-night travel stories and laughter after a full day of explorations`,
  ];

  // Superlatives
  const superlatives: MemorySuperlative[] = [
    {
      id: 'sup-1',
      title: 'Pavement Master & Marathoner',
      awardEmoji: '👟',
      description: `Covered over ${((itineraryDays.length || 3) * 13200).toLocaleString()} steps navigating cobblestone roads and viewpoints.`,
      recipient: trip.ownerName || 'Explorer',
    },
    {
      id: 'sup-2',
      title: 'Gastronomy Champion',
      awardEmoji: '🍝',
      description: `Never left a plate unfinished and hunted down the most authentic local flavors.`,
      recipient: trip.travelers > 1 ? 'Travel Crew' : trip.ownerName,
    },
    {
      id: 'sup-3',
      title: 'Golden Hour Photographer',
      awardEmoji: '📸',
      description: 'Captured breathtaking lighting and preserved memories at every scenic stop.',
      recipient: 'Memory Maker',
    },
    {
      id: 'sup-4',
      title: 'Spirit of Adventure',
      awardEmoji: '✨',
      description: 'Embraced spontaneous detours, unexpected discoveries, and local conversations.',
      recipient: 'All Travelers',
    },
  ];

  // Narrative generation based on tone
  let title = `${trip.destination} Unveiled: A Chronicle of Wonder`;
  let tagline = `Footsteps through history, golden horizons, and shared laughter in ${trip.destination}`;
  let narrative = '';

  if (tone === 'poetic') {
    title = `Echoes of ${trip.destination}: An Odyssey of Light`;
    tagline = `Where cobblestones whisper ancient stories and sunsets linger like warm poetry.`;
    narrative = `From our very first sunrise in ${trip.destination}, time seemed to surrender its usual haste. The soft morning light kissed aged stone facades, while the aroma of freshly ground coffee and warm bakeries drifted through narrow passageways. Stepping forward alongside ${trip.travelers} travel companions, each cobblestone became a quiet verse in a journey we would never forget.\n\n` +
      `Our days were illuminated by unforgettable landmarks: tracing the contours of centuries past, pausing in serene courtyards where fountains sang soft melodies, and lingering into the purple dusk of evening piazzas. Meals were celebrated as sacred pauses—sharing steaming regional specialties, crisp local wine, and conversation that unspooled like silk into the midnight air.\n\n` +
      `Now, as bags are unpacked and tickets become keepsakes, the true souvenir remains intangible: the golden glow in our memories, the echoes of shared laughter, and that quiet certainty that a piece of our souls remains forever woven into the fabric of ${trip.destination}.`;
  } else if (tone === 'adventurous') {
    title = `${trip.destination} Expedition: Conquered & Celebrated`;
    tagline = `High mileage, epic sights, and zero regrets across ${trip.destination}!`;
    narrative = `We hit the ground running in ${trip.destination} and never tapped the brakes! Across ${itineraryDays.length || 4} action-packed days, our squad clocked thousands of steps, navigated labyrinthine neighborhoods, and ticked off iconic bucket-list landmarks with unstoppable energy.\n\n` +
      `From morning expeditions through towering historic monuments to scrambling up panoramic lookout points for that million-dollar view, every hour was high-voltage discovery. We dove into bustling markets, sampled street eats that challenged our palates, and embraced every spontaneous detour off the tourist track.\n\n` +
      `The mission was thoroughly accomplished: unforgettable adrenaline, sore feet, camera rolls filled with thousands of shots, and stories that will be retold around dinner tables for decades to come.`;
  } else if (tone === 'cultural') {
    title = `The Cultural Tapestry of ${trip.destination}`;
    tagline = `A deep immersion into heritage, architecture, and living traditions.`;
    narrative = `To travel through ${trip.destination} is to hold a conversation with living history. Walking through ${itineraryDays[0]?.title || 'ancient avenues'}, the monumental scale of human artistry and devotion stood etched in every arch, fresco, and vaulted ceiling.\n\n` +
      `Our days were defined by thoughtful appreciation—listening to the historical context of masterpieces, observing local artisans at their craft, and understanding how age-old customs continue to thrive in the modern rhythm of the city. Gastronomy formed an equally vital textbook, celebrating century-old recipes passed down through generations.\n\n` +
      `We depart not merely as sightseers, but as enriched witnesses to a culture of profound resilience and beauty, carrying home a wider perspective and deep respect for the legacy of ${trip.destination}.`;
  } else {
    // social
    title = `The Ultimate ${trip.destination} Highlight Reel 🔥`;
    tagline = `Vibes, views, and unforgettable moments with the crew in ${trip.destination}!`;
    narrative = `If you weren’t there, you truly missed out! Our ${trip.destination} trip was pure magic from start to finish. Between spontaneous gelato stops, sunset rooftop toasts, and non-stop photo sessions at every picturesque corner, this trip set a brand new standard for group travel goals.\n\n` +
      `Major highlights included conquering the biggest landmarks before the tour buses showed up, discovering hole-in-the-wall eateries where we ate like royalty, and wandering lantern-lit streets until the early hours. The inside jokes were legendary and the energy was unmatched.\n\n` +
      `10/10 would pack bags and do it all over again tomorrow. Here's to the memories, the camera roll chaos, and the greatest travel crew ever assembled!`;
  }

  // Highlight reel slides
  const slides: HighlightReelSlide[] = [
    {
      id: 'slide-1',
      type: 'intro',
      title: `${trip.destination} Journey Recap`,
      subtitle: `${trip.startDate} — ${trip.endDate}`,
      content: `A celebration of ${itineraryDays.length || 4} days, ${allActivities.length || 6} milestones, and ${trip.travelers} travelers united by wanderlust.`,
      imageUrl: photosPool[0],
      stats: `${itineraryDays.length || 4} Days • ${trip.travelers} Travelers`,
    },
    {
      id: 'slide-2',
      type: 'highlight',
      title: keyHighlights[0]?.title || 'Day 1 Wonder',
      subtitle: `Milestone 1 • ${keyHighlights[0]?.badge || 'Top Pick'}`,
      content: keyHighlights[0]?.description || `Our journey kicked off in style at ${trip.destination}.`,
      badge: 'Unforgettable Sight',
      imageUrl: photosPool[1] || photosPool[0],
    },
    {
      id: 'slide-3',
      type: 'culinary',
      title: 'Flavors & Feasts',
      subtitle: 'Taste Memories',
      content: bestMeals[0] || `Unforgettable culinary moments and shared laughter around the table in ${trip.destination}.`,
      badge: 'Gastronomy',
      imageUrl: photosPool[2] || photosPool[0],
    },
    {
      id: 'slide-4',
      type: 'superlative',
      title: 'Squad Superlatives & Honors',
      subtitle: 'Travel Awards Unlocked',
      content: `${superlatives[0].awardEmoji} ${superlatives[0].title}: ${superlatives[0].description}`,
      badge: 'Superlatives',
      imageUrl: photosPool[3] || photosPool[1] || photosPool[0],
    },
    {
      id: 'slide-5',
      type: 'epilogue',
      title: 'Until Next Time',
      subtitle: 'Treasured Forever',
      content: `“We travel not to escape life, but for life not to escape us.” Rome & beyond will always call us back.`,
      stats: 'Memories safely archived',
      imageUrl: photosPool[0],
    },
  ];

  // Photos
  const photos: TripMemoryPhoto[] = photosPool.map((url, idx) => ({
    id: `ph-${idx + 1}`,
    tripId: trip.id,
    url,
    caption: idx === 0
      ? `Iconic panorama of ${trip.destination}`
      : idx === 1
      ? 'Golden hour light bathing historical avenues'
      : idx === 2
      ? 'Warm dinner ambiance and local delicacies'
      : 'Scenic streetscape and treasured moments',
    location: trip.destination,
    date: trip.startDate,
  }));

  const milestones = {
    totalDays: itineraryDays.length || 3,
    totalActivities: allActivities.length || 8,
    completedActivities: completed.length || allActivities.length || 6,
    estimatedSteps: (itineraryDays.length || 3) * 13800,
    estimatedKmWalked: Math.round(((itineraryDays.length || 3) * 10.2) * 10) / 10,
    favoriteDayTitle: itineraryDays[0]?.title || `Day 1 in ${trip.destination}`,
    topCategory: sightActivities.length >= foodActivities.length ? 'Sightseeing & Historic Monuments' : 'Food & Gastronomy',
  };

  return {
    tripId: trip.id,
    title,
    tagline,
    summaryNarrative: narrative,
    tone,
    keyHighlights,
    bestMealsAndFlavors: bestMeals,
    unforgettableMoments,
    superlatives,
    slides,
    milestones,
    photos,
    userNotes: userNotes || '',
    generatedAt: new Date().toISOString(),
  };
}

export async function fetchOrGenerateMemories(
  trip: Trip,
  itineraryDays: ItineraryDay[],
  expenses: Expense[],
  tone: MemoryTone = 'poetic',
  userNotes?: string
): Promise<TripMemoryReflection> {
  // Check local cache first
  const existing = loadMemoriesFromStorage(trip.id);
  if (existing && existing.tone === tone && !userNotes) {
    return existing;
  }

  // Attempt backend API with Gemini AI
  try {
    const res = await fetch('/api/ai/memories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tripId: trip.id,
        tone,
        userNotes,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        saveMemoriesToStorage(trip.id, data.data);
        return data.data;
      }
    }
  } catch (err) {
    console.warn('Backend memory generation failed, using intelligent local generator:', err);
  }

  // Graceful local fallback
  const generated = generateLocalMemoryReflection(trip, itineraryDays, expenses, tone, userNotes);
  saveMemoriesToStorage(trip.id, generated);
  return generated;
}
