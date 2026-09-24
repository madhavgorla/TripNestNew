export type Role = 'TRAVELER' | 'GROUP_ADMIN' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  country: string;
  preferredCurrency: string;
  travelPreferences: string[];
  role: Role;
  isGoogleUser?: boolean;
  provider?: 'local' | 'google';
  createdAt: string;
}

export type TripStatus = 'PLANNING' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type TripVisibility = 'PRIVATE' | 'GROUP' | 'PUBLIC';
export type TravelStyle = 'Budget' | 'Standard' | 'Luxury' | 'Adventure' | 'Family' | 'Couple' | 'Solo' | 'Business';

export interface Trip {
  id: string;
  tripName: string;
  description: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  spent: number;
  currency: string;
  status: TripStatus;
  visibility: TripVisibility;
  coverImage: string;
  ownerId: string;
  ownerName: string;
  travelStyle: TravelStyle;
  groupId?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type ActivityCategory = 
  | 'Sightseeing'
  | 'Food'
  | 'Hotel'
  | 'Transport'
  | 'Adventure'
  | 'Shopping'
  | 'Entertainment'
  | 'Culture'
  | 'Nature'
  | 'Other';

export interface Activity {
  id: string;
  dayId: string;
  tripId: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  category: ActivityCategory;
  cost: number;
  currency: string;
  notes?: string;
  imageUrl?: string;
  priority: 'Low' | 'Medium' | 'High';
  isCompleted: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ItineraryDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  title: string;
  summary: string;
  activities: Activity[];
}

export type ExpenseCategory =
  | 'Flights'
  | 'Accommodation'
  | 'Food'
  | 'Transportation'
  | 'Activities'
  | 'Shopping'
  | 'Entertainment'
  | 'Insurance'
  | 'Other';

export interface ExpenseSplit {
  userId: string;
  userName: string;
  amount: number;
  settled: boolean;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  paidById: string;
  paidByName: string;
  paymentMethod: 'Credit Card' | 'Cash' | 'Bank Transfer' | 'UPI' | 'Other';
  notes?: string;
  receiptUrl?: string;
  splits: ExpenseSplit[];
}

export interface Settlement {
  fromUser: string;
  toUser: string;
  amount: number;
  currency: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Owner' | 'Admin' | 'Member';
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  tripId?: string;
  members: GroupMember[];
  createdAt: string;
}

export type DocumentCategory =
  | 'Passport'
  | 'Visa'
  | 'Flight Tickets'
  | 'Hotel Bookings'
  | 'Travel Insurance'
  | 'Identity Documents'
  | 'Other';

export interface TravelDocument {
  id: string;
  tripId: string;
  name: string;
  category: DocumentCategory;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  expiryDate?: string;
  fileUrl: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'TRIP' | 'BUDGET' | 'GROUP' | 'WEATHER' | 'AI' | 'DOCUMENT';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  category: 'Popular' | 'Trending' | 'Adventure' | 'Beaches' | 'Mountains' | 'Historical' | 'Luxury' | 'Budget Friendly' | 'Culture';
  rating: number;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  averageCostPerDay: number;
  bestTimeToVisit: string;
  currentWeather: {
    temp: number;
    condition: string;
    icon: string;
  };
  topAttractions: {
    name: string;
    description: string;
    imageUrl?: string;
    estimatedCost: number;
  }[];
  travelTips: string[];
  safetyInfo: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface CurrencyRate {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number;
}

export interface WeatherForecastDay {
  day: string;
  date: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  humidity: number;
  icon: string;
  precipitationChance?: number;
  windSpeed?: string;
  uvIndex?: number;
  packingTip?: string;
}

export interface DestinationWeather {
  city: string;
  currentTemp: number;
  condition: string;
  humidity: number;
  windSpeed: string;
  icon: string;
  forecast: WeatherForecastDay[];
  uvIndex?: number;
  precipitationChance?: number;
  isRealtime?: boolean;
  timezone?: string;
  lastUpdated?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: AIProposalAction[];
  structuredData?: any;
}

export interface AIProposalAction {
  id: string;
  type: 'ADD_ACTIVITY' | 'REARRANGE_ITINERARY' | 'OPTIMIZE_BUDGET' | 'GENERATE_PACKING_LIST' | 'CHANGE_TRIP_DETAILS';
  label: string;
  description: string;
  payload: any;
  status: 'PENDING' | 'APPLIED' | 'DISMISSED';
}

export type PackingCategory =
  | 'Essentials & Documents'
  | 'Clothing & Apparel'
  | 'Toiletries & Health'
  | 'Electronics & Tech'
  | 'Activity Gear'
  | 'Custom';

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  category: PackingCategory;
  isPacked: boolean;
  quantity: number;
  reason?: string;
  isEssential?: boolean;
  assignedTo?: string;
  custom?: boolean;
}

export type MemoryTone = 'poetic' | 'adventurous' | 'social' | 'cultural';

export interface MemoryHighlight {
  id: string;
  dayNumber?: number;
  title: string;
  description: string;
  category: string;
  badge?: string;
  location?: string;
  imageUrl?: string;
}

export interface MemorySuperlative {
  id: string;
  title: string;
  recipient?: string;
  awardEmoji: string;
  description: string;
}

export interface HighlightReelSlide {
  id: string;
  type: 'intro' | 'highlight' | 'culinary' | 'superlative' | 'epilogue';
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  badge?: string;
  stats?: string;
}

export interface TripMemoryPhoto {
  id: string;
  tripId: string;
  url: string;
  caption: string;
  location?: string;
  date?: string;
  activityId?: string;
}

export interface MemoryMilestones {
  totalDays: number;
  totalActivities: number;
  completedActivities: number;
  estimatedSteps: number;
  estimatedKmWalked: number;
  favoriteDayTitle: string;
  topCategory: string;
}

export interface TripMemoryReflection {
  tripId: string;
  title: string;
  tagline: string;
  summaryNarrative: string;
  tone: MemoryTone;
  keyHighlights: MemoryHighlight[];
  bestMealsAndFlavors: string[];
  unforgettableMoments: string[];
  superlatives: MemorySuperlative[];
  slides: HighlightReelSlide[];
  milestones: MemoryMilestones;
  photos: TripMemoryPhoto[];
  userNotes?: string;
  generatedAt: string;
}

export type RouteOptimizationMode = 'balanced' | 'fastest_transit' | 'crowd_timing' | 'scenic';

export interface RouteTransitLeg {
  fromActivityId: string;
  toActivityId: string;
  mode: 'walking' | 'transit' | 'driving';
  durationMinutes: number;
  distanceKm: number;
  transitTip?: string;
}

export interface OptimizedActivityItem extends Activity {
  suggestedStartTime: string;
  suggestedEndTime: string;
  transitFromPrevious?: {
    durationMinutes: number;
    distanceKm: number;
    mode: 'walking' | 'transit' | 'driving';
    transitTip?: string;
  };
  orderRationale?: string;
}

export interface RouteOptimizationResult {
  dayId: string;
  dayTitle?: string;
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  originalTransitMinutes: number;
  optimizedTransitMinutes: number;
  timeSavedMinutes: number;
  efficiencyPercentage: number;
  summaryReasoning: string;
  geographicalStrategy: string;
  optimizedActivities: OptimizedActivityItem[];
  legs: RouteTransitLeg[];
  algorithm: 'gemini-3.8-flash' | 'geospatial-tsp';
}

export interface RouteOptimizationOptions {
  mode?: RouteOptimizationMode;
  keepFirstFixed?: boolean;
  startHour?: string;
  transitPreference?: 'walking' | 'transit';
}

// Travel Insurance & AI Reminders
export interface AiCoverageReminder {
  id: string;
  type: 'GAP' | 'EXPIRATION' | 'REQUIREMENT' | 'TIP';
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  title: string;
  description: string;
  recommendation: string;
  relatedCategory?: string;
}

export interface TravelInsurancePolicy {
  id: string;
  tripId: string;
  provider: string;
  policyNumber: string;
  policyHolderName: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  emergencyHotline: string;
  assistanceEmail?: string;
  currency: string;
  medicalExpenseLimit: number;
  emergencyEvacuationLimit: number;
  tripCancellationLimit: number;
  baggageLossLimit: number;
  deductible: number;
  coversAdventureSports: boolean;
  coversRentalCar: boolean;
  coversCovid: boolean;
  coversPreExistingConditions: boolean;
  notes?: string;
  lastAiAuditDate?: string;
  aiAuditScore?: number;
  aiReminders?: AiCoverageReminder[];
}

// Smart Currency & Local Spending Adjustments
export interface DestinationPriceBenchmark {
  item: string;
  localPrice: number;
  usdPrice: number;
  note: string;
  icon?: string;
}

export interface DestinationCurrencyInfo {
  destination: string;
  country: string;
  localCurrencyCode: string;
  localCurrencySymbol: string;
  localCurrencyName: string;
  exchangeRateToUSD: number; // e.g. 1 EUR = 1.087 USD
  exchangeRateFromUSD: number; // e.g. 1 USD = 0.92 EUR
  twentyFourHourChange: number; // e.g. +0.45%
  lastUpdated: string;
  priceBenchmarks: DestinationPriceBenchmark[];
}

export interface CategoryBudgetAdjustment {
  category: string;
  currentAmount: number;
  suggestedAmount: number;
  percentageChange: number;
  rationale: string;
}

export interface BudgetAdjustmentRecommendation {
  tripId: string;
  destination: string;
  suggestedTotalBudget: number;
  currentTotalBudget: number;
  difference: number;
  currency: string;
  localCurrencyCode: string;
  localDailyAverageCost: number;
  fxImpactSummary: string;
  spendingTrendRationale: string;
  categoryAdjustments: CategoryBudgetAdjustment[];
  spendingTips: string[];
}

// -------------------------------------------------------------
// RATINGS & REVIEWS
// -------------------------------------------------------------

export type TravelerType = 'Solo' | 'Couple' | 'Family' | 'Friends' | 'Business';

export interface ReviewSubRatings {
  valueForMoney: number; // 1-5
  safety: number; // 1-5
  foodAndDining: number; // 1-5
  walkability: number; // 1-5
}

export interface Review {
  id: string;
  targetType: 'destination' | 'trip' | 'activity';
  targetId: string;
  targetName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userCountry?: string;
  rating: number; // 1-5
  subRatings?: ReviewSubRatings;
  title: string;
  comment: string;
  travelerType: TravelerType;
  tripDate?: string;
  wouldRecommend: boolean;
  helpfulVotes: number;
  votedUserIds?: string[];
  photos?: string[];
  createdAt: string;
  verifiedTraveler?: boolean;
}

export interface RatingSummary {
  targetId: string;
  targetName: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  subRatingsAverage: ReviewSubRatings;
  recommendPercentage: number;
  aiHighlights?: string[];
  aiSummary?: string;
}

export interface CreateReviewInput {
  targetType: 'destination' | 'trip' | 'activity';
  targetId: string;
  targetName: string;
  rating: number;
  subRatings?: ReviewSubRatings;
  title: string;
  comment: string;
  travelerType: TravelerType;
  tripDate?: string;
  wouldRecommend: boolean;
  photos?: string[];
}

