import { Trip, ItineraryDay, DestinationWeather, PackingItem, PackingCategory } from '../types';

/**
 * Intelligently generates a tailored packing checklist based on:
 * 1. Destination climate, current temperature, and meteorological forecast
 * 2. Scheduled itinerary activities (walking, hiking, swimming, culture, dining)
 * 3. Trip duration and number of travelers
 */
export function generateSmartPackingList(
  trip: Trip,
  itineraryDays: ItineraryDay[],
  weather: DestinationWeather | null
): PackingItem[] {
  const tripId = trip.id;
  const items: PackingItem[] = [];

  const addItem = (
    name: string,
    category: PackingCategory,
    quantity: number = 1,
    reason?: string,
    isEssential: boolean = false
  ) => {
    // Avoid duplicate names
    if (items.some((i) => i.name.toLowerCase() === name.toLowerCase())) return;

    items.push({
      id: `pack-${tripId}-${category.slice(0, 3)}-${items.length + 1}-${Math.random().toString(36).slice(2, 6)}`,
      tripId,
      name,
      category,
      isPacked: false,
      quantity,
      reason,
      isEssential,
      custom: false,
    });
  };

  // Calculate duration in days
  const numDays = Math.max(itineraryDays.length, 3);

  // Scan all activities
  const allActivities = itineraryDays.flatMap((d) => d.activities || []);
  const activityText = allActivities
    .map((a) => `${a.name} ${a.description} ${a.category} ${a.location}`)
    .join(' ')
    .toLowerCase();

  const isHiking = /hike|trek|trail|mountain|nature|walk|climb/.test(activityText);
  const isBeachWater = /beach|swim|snorkel|boat|cruise|dive|ocean|sea|pool|water/.test(activityText);
  const isReligiousCultural = /temple|church|cathedral|mosque|shrine|vatican|basilica/.test(activityText);
  const isFineDining = /dinner|michelin|opera|theatre|fine dining|formal|gala/.test(activityText);
  const isHeavyWalking = /tour|walking|explore|ruins|colosseum|forum|palace|museum/.test(activityText) || numDays > 3;

  // Meteorological factors
  const avgTemp = weather?.currentTemp ?? 22;
  const hasRain =
    (weather?.precipitationChance && weather.precipitationChance >= 30) ||
    weather?.condition.toLowerCase().includes('rain') ||
    weather?.condition.toLowerCase().includes('drizzle') ||
    weather?.forecast?.some((f) => (f.precipitationChance ?? 0) >= 40);
  const isHot = avgTemp >= 24 || (weather?.uvIndex ?? 5) >= 6;
  const isCold = avgTemp <= 14;

  // ==========================================
  // 1. ESSENTIALS & TRAVEL DOCUMENTS
  // ==========================================
  addItem('Passport & National Photo ID', 'Essentials & Documents', 1, 'International transit necessity', true);
  addItem('Flight / Train Tickets & Boarding Passes', 'Essentials & Documents', 1, 'Transit vouchers saved offline', true);
  addItem('Travel Insurance Policy & Emergency Contacts', 'Essentials & Documents', 1, 'Proof of medical coverage abroad', true);
  addItem('Credit / Debit Cards (No Foreign FX Fee)', 'Essentials & Documents', 2, 'Primary + backup card', true);
  addItem('Local Cash Currency', 'Essentials & Documents', 1, `Local cash for small merchants in ${trip.country || trip.destination}`, false);
  addItem('Hotel / Accommodation Confirmations', 'Essentials & Documents', 1, 'Check-in vouchers', true);

  // ==========================================
  // 2. CLOTHING & APPAREL (Climate-Tailored)
  // ==========================================
  addItem('Comfortable Walking Sneakers', 'Clothing & Apparel', 1, isHeavyWalking ? 'Essential for extensive daily city & site walking' : 'Everyday transit footwear', true);
  addItem('Breathable Everyday T-Shirts / Tops', 'Clothing & Apparel', Math.min(numDays + 1, 7), `${numDays}-day journey wardrobe rotation`);
  addItem('Comfortable Walking Pants / Chinos', 'Clothing & Apparel', Math.min(Math.ceil(numDays / 2), 4), 'Versatile day exploration wear');
  addItem('Underwear & Socks', 'Clothing & Apparel', Math.min(numDays + 2, 8), 'Daily essentials with extra pair', true);
  addItem('Comfortable Sleepwear / Loungewear', 'Clothing & Apparel', 2, 'Hotel relaxation');

  // Climate specific apparel
  if (hasRain) {
    addItem('Compact Windproof Travel Umbrella', 'Clothing & Apparel', 1, 'Rain predicted in local forecast', true);
    addItem('Lightweight Waterproof Rain Jacket', 'Clothing & Apparel', 1, 'Breathable shell for rainy forecast days');
  }

  if (isHot) {
    addItem('UV Polarized Sunglasses', 'Clothing & Apparel', 1, `High UV index (${weather?.uvIndex ?? 6}) protection`, true);
    addItem('Wide-Brim Sun Hat or Baseball Cap', 'Clothing & Apparel', 1, 'Sun protection for outdoor excursions');
    addItem('Light Linen Shirts or Summer Shorts', 'Clothing & Apparel', 2, `Comfortable for warm ${avgTemp}°C temperatures`);
  }

  if (isCold) {
    addItem('Insulated Packable Down Jacket', 'Clothing & Apparel', 1, `Chilly ${avgTemp}°C climate expected`, true);
    addItem('Thermal Base Layers / Fleece Pullover', 'Clothing & Apparel', 2, 'Layering for cool mornings and evenings');
    addItem('Warm Wool Scarf & Beanie', 'Clothing & Apparel', 1, 'Evening wind and chill defense');
  }

  if (isReligiousCultural) {
    addItem('Modest Attire (Covered Shoulders & Knees)', 'Clothing & Apparel', 1, 'Required dress code for historic temples, basilicas & holy sites');
  }

  if (isFineDining) {
    addItem('Smart Casual / Evening Outfit & Dress Shoes', 'Clothing & Apparel', 1, 'Dress code for fine dining & evening entertainment');
  }

  // ==========================================
  // 3. TOILETRIES & HEALTH
  // ==========================================
  addItem('SPF 50+ Broad Spectrum Sunscreen', 'Toiletries & Health', 1, isHot ? 'Crucial for high UV radiation outdoors' : 'Daily UV defense', true);
  addItem('Toothbrush, Floss & Travel Toothpaste', 'Toiletries & Health', 1, 'Daily dental care', true);
  addItem('Prescription Medications & Prescriptions', 'Toiletries & Health', 1, 'Sufficient supply for entire trip duration', true);
  addItem('Blister Bandages & Mini First Aid Kit', 'Toiletries & Health', 1, 'Foot care for active sightseeing days');
  addItem('Travel-Size Deodorant & Skincare', 'Toiletries & Health', 1, 'Carry-on approved (<100ml / 3.4oz)');
  addItem('Hand Sanitizer & Disinfectant Wipes', 'Toiletries & Health', 1, 'Sanitary hygiene on transit & public transport');

  if (isHot || isBeachWater) {
    addItem('Insect Repellent Spray', 'Toiletries & Health', 1, 'Outdoor and evening mosquito protection');
    addItem('Soothing Aloe Vera / After-Sun Lotion', 'Toiletries & Health', 1, 'Skin relief after sun exposure');
  }

  // ==========================================
  // 4. ELECTRONICS & TECH
  // ==========================================
  // Suggest adapter based on country
  let adapterNote = 'Universal multi-socket adapter';
  const destLower = (trip.country + ' ' + trip.destination).toLowerCase();
  if (/italy|france|spain|germany|europe/.test(destLower)) {
    adapterNote = 'Type C/F adapter (European 230V)';
  } else if (/japan/.test(destLower)) {
    adapterNote = 'Type A/B adapter (100V 2-flat pin)';
  } else if (/uk|england|london/.test(destLower)) {
    adapterNote = 'Type G adapter (3-pin rectangular)';
  } else if (/india/.test(destLower)) {
    adapterNote = 'Type D/M adapter (3 round pins)';
  }

  addItem(`Universal Travel Power Adapter (${adapterNote})`, 'Electronics & Tech', 1, `Compatible with electrical outlets in ${trip.destination}`, true);
  addItem('High-Capacity Power Bank (10,000mAh+)', 'Electronics & Tech', 1, 'Keep smartphone charged for maps, camera & tickets all day', true);
  addItem('Smartphone Fast-Charging Cables', 'Electronics & Tech', 2, 'Primary and backup lightning/USB-C cables', true);
  addItem('Noise-Cancelling Earbuds / Headphones', 'Electronics & Tech', 1, 'Flight & train travel sound isolation');

  // ==========================================
  // 5. ACTIVITY-SPECIFIC GEAR
  // ==========================================
  addItem('Lightweight Daypack Backpack', 'Activity Gear', 1, 'Carry water, jacket & essentials during day trips', true);
  addItem('Reusable Insulated Water Bottle', 'Activity Gear', 1, 'Stay hydrated throughout walking itineraries');

  if (isBeachWater) {
    addItem('Swimwear & Quick-Dry Rash Guard', 'Activity Gear', 2, 'Suggested for beach & water activities');
    addItem('Waterproof Phone Pouch / Dry Bag', 'Activity Gear', 1, 'Protect electronics on boat & beach outings', true);
    addItem('Microfiber Quick-Dry Beach Towel', 'Activity Gear', 1, 'Compact towel for shore days');
  }

  if (isHiking) {
    addItem('Sturdy Trail / Hiking Shoes', 'Activity Gear', 1, 'Grip and ankle support for uneven terrain');
    addItem('Collapsible Trekking Poles', 'Activity Gear', 1, 'Stability on mountain trails');
  }

  return items;
}
