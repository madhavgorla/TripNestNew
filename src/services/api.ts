import {
  Trip,
  ItineraryDay,
  Activity,
  Expense,
  Group,
  TravelDocument,
  NotificationItem,
  Destination,
  CurrencyRate,
  DestinationWeather,
  RouteOptimizationResult,
  RouteOptimizationOptions,
  TravelInsurancePolicy,
  DestinationCurrencyInfo,
  BudgetAdjustmentRecommendation,
  Review,
  RatingSummary,
  CreateReviewInput,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('tripnest_token') || 'jwt_token_usr-1_default';
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export const api = {
  // Auth
  async login(email: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async loginWithGoogle(payload?: { email?: string; fullName?: string; avatarUrl?: string }) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    return res.json();
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  // Trips
  async getTrips(): Promise<{ success: boolean; data: Trip[] }> {
    const res = await fetch(`${API_BASE}/trips`, { headers: getAuthHeader() });
    return res.json();
  },

  async getTrip(id: string): Promise<{ success: boolean; data: Trip }> {
    const res = await fetch(`${API_BASE}/trips/${id}`, { headers: getAuthHeader() });
    return res.json();
  },

  async createTrip(data: Partial<Trip>): Promise<{ success: boolean; data: Trip }> {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateTrip(id: string, data: Partial<Trip>): Promise<{ success: boolean; data: Trip }> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteTrip(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  // Itinerary & Activities
  async getItinerary(tripId: string): Promise<{ success: boolean; data: ItineraryDay[] }> {
    const res = await fetch(`${API_BASE}/itineraries/trip/${tripId}`, { headers: getAuthHeader() });
    return res.json();
  },

  async addItineraryDay(data: Partial<ItineraryDay>): Promise<{ success: boolean; data: ItineraryDay }> {
    const res = await fetch(`${API_BASE}/itineraries`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async addActivity(data: Partial<Activity>): Promise<{ success: boolean; data: Activity }> {
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateActivity(id: string, data: Partial<Activity>): Promise<{ success: boolean; data: Activity }> {
    const res = await fetch(`${API_BASE}/activities/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteActivity(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/activities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async toggleActivityComplete(id: string): Promise<{ success: boolean; data: Activity }> {
    const res = await fetch(`${API_BASE}/activities/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  // Expenses & Settlements
  async getExpenses(tripId: string): Promise<{ success: boolean; data: Expense[] }> {
    const res = await fetch(`${API_BASE}/expenses/trip/${tripId}`, { headers: getAuthHeader() });
    return res.json();
  },

  async addExpense(data: Partial<Expense>): Promise<{ success: boolean; data: Expense }> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteExpense(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async getSettlements(tripId: string): Promise<{ success: boolean; data: any[]; balances: Record<string, number> }> {
    const res = await fetch(`${API_BASE}/expenses/settlements/${tripId}`, { headers: getAuthHeader() });
    return res.json();
  },

  // Destinations
  async getDestinations(category?: string, search?: string, region?: string): Promise<{ success: boolean; data: Destination[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (region) params.append('region', region);
    const res = await fetch(`${API_BASE}/destinations?${params.toString()}`);
    return res.json();
  },

  async getDestination(id: string): Promise<{ success: boolean; data: Destination }> {
    const res = await fetch(`${API_BASE}/destinations/${id}`);
    return res.json();
  },

  // Groups
  async getGroups(): Promise<{ success: boolean; data: Group[] }> {
    const res = await fetch(`${API_BASE}/groups`, { headers: getAuthHeader() });
    return res.json();
  },

  async getGroupByTrip(tripId: string): Promise<{ success: boolean; data: Group | null }> {
    const res = await fetch(`${API_BASE}/groups/trip/${tripId}`, { headers: getAuthHeader() });
    return res.json();
  },

  async inviteGroupMember(groupId: string, email: string, role: string): Promise<{ success: boolean; message: string; data: Group }> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/invite`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ email, role }),
    });
    return res.json();
  },

  // Documents
  async getDocuments(tripId: string): Promise<{ success: boolean; data: TravelDocument[] }> {
    const res = await fetch(`${API_BASE}/documents/trip/${tripId}`, { headers: getAuthHeader() });
    return res.json();
  },

  async addDocument(data: Partial<TravelDocument>): Promise<{ success: boolean; data: TravelDocument }> {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteDocument(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<{ success: boolean; data: NotificationItem[] }> {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeader() });
    return res.json();
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  // Favorites
  async getFavorites(): Promise<{ success: boolean; data: Destination[] }> {
    const res = await fetch(`${API_BASE}/favorites`, { headers: getAuthHeader() });
    return res.json();
  },

  async toggleFavorite(destinationId: string): Promise<{ success: boolean; isFavorited: boolean }> {
    const res = await fetch(`${API_BASE}/favorites/toggle`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ destinationId }),
    });
    return res.json();
  },

  // Currency & Weather
  async getCurrencyRates(): Promise<{ success: boolean; data: Record<string, CurrencyRate> }> {
    const res = await fetch(`${API_BASE}/currency/rates`);
    return res.json();
  },

  async getWeather(city: string): Promise<{ success: boolean; data: DestinationWeather }> {
    const res = await fetch(`${API_BASE}/weather/${encodeURIComponent(city)}`);
    return res.json();
  },

  // Analytics
  async getTravelerAnalytics(): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE}/analytics/traveler`, { headers: getAuthHeader() });
    return res.json();
  },

  async getAdminAnalytics(): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE}/analytics/admin`, { headers: getAuthHeader() });
    return res.json();
  },

  // Reports
  async getTripReport(tripId: string): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE}/reports/trip/${tripId}`, { headers: getAuthHeader() });
    return res.json();
  },

  // AI Copilot
  async sendAiChat(message: string, tripId: string, conversationHistory?: any[]): Promise<{ success: boolean; data: { reply: string; actions: any[] } }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ message, tripId, conversationHistory }),
    });
    return res.json();
  },

  async planTripWithAi(params: { destination: string; days?: number; budget?: number; currency?: string; travelStyle?: string; travelers?: number }): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE}/ai/plan-trip`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // Trip Memories
  async getTripMemories(tripId: string): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE}/memories/trip/${tripId}`, { headers: getAuthHeader() });
    return res.json();
  },

  async generateTripMemories(payload: { tripId: string; tone?: string; userNotes?: string }): Promise<{ success: boolean; data: any; engine?: string }> {
    const res = await fetch(`${API_BASE}/ai/memories`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // AI Route Optimization
  async optimizeDailyRoute(payload: {
    tripId: string;
    dayId: string;
    activities?: Activity[];
    options?: RouteOptimizationOptions;
  }): Promise<{ success: boolean; data: RouteOptimizationResult; message?: string }> {
    const res = await fetch(`${API_BASE}/ai/optimize-daily-route`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async reorderDayActivities(
    dayId: string,
    activities: Activity[]
  ): Promise<{ success: boolean; data: ItineraryDay; message?: string }> {
    const res = await fetch(`${API_BASE}/itineraries/${dayId}/reorder`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ activities }),
    });
    return res.json();
  },

  // Travel Insurance & AI Reminders
  async getInsurancePolicy(tripId: string): Promise<{ success: boolean; data: TravelInsurancePolicy | null }> {
    const res = await fetch(`${API_BASE}/insurance/trip/${tripId}`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async saveInsurancePolicy(policyData: Partial<TravelInsurancePolicy>): Promise<{ success: boolean; data: TravelInsurancePolicy; message?: string }> {
    const res = await fetch(`${API_BASE}/insurance`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(policyData),
    });
    return res.json();
  },

  async auditInsurancePolicy(payload: { tripId: string; policy?: Partial<TravelInsurancePolicy> }): Promise<{ success: boolean; data: TravelInsurancePolicy; message?: string }> {
    const res = await fetch(`${API_BASE}/ai/audit-insurance`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Smart Currency Converter & AI Budget Adjustments
  async getDestinationCurrencyInfo(destination: string): Promise<{ success: boolean; data: DestinationCurrencyInfo }> {
    const res = await fetch(`${API_BASE}/currency/destination/${encodeURIComponent(destination)}`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async getAiBudgetAdjustment(payload: {
    tripId: string;
    destination: string;
    totalBudget: number;
    currency: string;
    expenses?: any[];
    durationDays?: number;
  }): Promise<{ success: boolean; data: BudgetAdjustmentRecommendation; message?: string }> {
    const res = await fetch(`${API_BASE}/ai/budget-adjustment`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Ratings & Reviews API
  async getReviews(params?: {
    targetType?: string;
    targetId?: string;
    rating?: number;
    travelerType?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<{ success: boolean; data: { reviews: Review[]; summary: RatingSummary } }> {
    const query = new URLSearchParams();
    if (params?.targetType) query.append('targetType', params.targetType);
    if (params?.targetId) query.append('targetId', params.targetId);
    if (params?.rating) query.append('rating', params.rating.toString());
    if (params?.travelerType) query.append('travelerType', params.travelerType);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/reviews${qs}`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async getFeaturedReviews(): Promise<{ success: boolean; data: Review[] }> {
    const res = await fetch(`${API_BASE}/reviews/featured`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async createReview(payload: CreateReviewInput): Promise<{
    success: boolean;
    message?: string;
    data: { review: Review; summary: RatingSummary };
  }> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async voteReviewHelpful(reviewId: string): Promise<{
    success: boolean;
    data: { reviewId: string; helpfulVotes: number; hasVoted: boolean };
  }> {
    const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}/helpful`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },
};

