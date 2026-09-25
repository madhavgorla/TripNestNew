import axios, { AxiosInstance, AxiosResponse } from 'axios';
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

// Configurable API base URL: defaults to '/api' (Express dev server / Vite proxy),
// or can be pointed directly to Spring Boot backend running on http://localhost:8080/api
export const getActiveApiBaseUrl = (): string => {
  return localStorage.getItem('tripnest_backend_url') || '/api';
};

export const setActiveApiBaseUrl = (url: string) => {
  if (!url || url.trim() === '') {
    localStorage.removeItem('tripnest_backend_url');
  } else {
    localStorage.setItem('tripnest_backend_url', url.trim());
  }
  // Reconfigure axios baseURL dynamically
  apiClient.defaults.baseURL = getActiveApiBaseUrl();
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getActiveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Automatically injects JWT Bearer token into Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tripnest_token') || 'jwt_token_usr-1_default';
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Sync current active base URL in case it changed in localStorage
    config.baseURL = getActiveApiBaseUrl();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardized handling of error codes and response envelopes
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('TripNest API 401 Unauthorized - Session may be expired.');
    }
    return Promise.reject(error);
  }
);

// Unified API Service powered by Axios
export const api = {
  // Client instance for custom requests or inspector
  client: apiClient,

  // Auth Endpoints (Spring Security JWT & Google OAuth)
  async login(email: string, password?: string) {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  async register(data: any) {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  async loginWithGoogle(payload?: { email?: string; fullName?: string; avatarUrl?: string }) {
    const res = await apiClient.post('/auth/google', payload || {});
    return res.data;
  },

  async getCurrentUser() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Trips Endpoints
  async getTrips(): Promise<{ success: boolean; data: Trip[] }> {
    const res = await apiClient.get<{ success: boolean; data: Trip[] }>('/trips');
    return res.data;
  },

  async getTrip(id: string): Promise<{ success: boolean; data: Trip }> {
    const res = await apiClient.get<{ success: boolean; data: Trip }>(`/trips/${id}`);
    return res.data;
  },

  async createTrip(data: Partial<Trip>): Promise<{ success: boolean; data: Trip }> {
    const res = await apiClient.post<{ success: boolean; data: Trip }>('/trips', data);
    return res.data;
  },

  async updateTrip(id: string, data: Partial<Trip>): Promise<{ success: boolean; data: Trip }> {
    const res = await apiClient.put<{ success: boolean; data: Trip }>(`/trips/${id}`, data);
    return res.data;
  },

  async deleteTrip(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/trips/${id}`);
    return res.data;
  },

  // Itinerary & Activities Endpoints
  async getItinerary(tripId: string): Promise<{ success: boolean; data: ItineraryDay[] }> {
    const res = await apiClient.get<{ success: boolean; data: ItineraryDay[] }>(`/itineraries/trip/${tripId}`);
    return res.data;
  },

  async addItineraryDay(data: Partial<ItineraryDay>): Promise<{ success: boolean; data: ItineraryDay }> {
    const res = await apiClient.post<{ success: boolean; data: ItineraryDay }>('/itineraries', data);
    return res.data;
  },

  async addActivity(data: Partial<Activity>): Promise<{ success: boolean; data: Activity }> {
    const res = await apiClient.post<{ success: boolean; data: Activity }>('/activities', data);
    return res.data;
  },

  async updateActivity(id: string, data: Partial<Activity>): Promise<{ success: boolean; data: Activity }> {
    const res = await apiClient.put<{ success: boolean; data: Activity }>(`/activities/${id}`, data);
    return res.data;
  },

  async deleteActivity(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<{ success: boolean }>(`/activities/${id}`);
    return res.data;
  },

  async toggleActivityComplete(id: string): Promise<{ success: boolean; data: Activity }> {
    const res = await apiClient.patch<{ success: boolean; data: Activity }>(`/activities/${id}/toggle`);
    return res.data;
  },

  // Expenses & Settlements Endpoints
  async getExpenses(tripId: string): Promise<{ success: boolean; data: Expense[] }> {
    const res = await apiClient.get<{ success: boolean; data: Expense[] }>(`/expenses/trip/${tripId}`);
    return res.data;
  },

  async addExpense(data: Partial<Expense>): Promise<{ success: boolean; data: Expense }> {
    const res = await apiClient.post<{ success: boolean; data: Expense }>('/expenses', data);
    return res.data;
  },

  async deleteExpense(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<{ success: boolean }>(`/expenses/${id}`);
    return res.data;
  },

  async getSettlements(tripId: string): Promise<{ success: boolean; data: any[]; balances: Record<string, number> }> {
    const res = await apiClient.get<{ success: boolean; data: any[]; balances: Record<string, number> }>(`/expenses/settlements/${tripId}`);
    return res.data;
  },

  // Destinations Endpoints
  async getDestinations(category?: string, search?: string, region?: string): Promise<{ success: boolean; data: Destination[] }> {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (region) params.region = region;
    const res = await apiClient.get<{ success: boolean; data: Destination[] }>('/destinations', { params });
    return res.data;
  },

  async getDestination(id: string): Promise<{ success: boolean; data: Destination }> {
    const res = await apiClient.get<{ success: boolean; data: Destination }>(`/destinations/${id}`);
    return res.data;
  },

  // Groups Endpoints
  async getGroups(): Promise<{ success: boolean; data: Group[] }> {
    const res = await apiClient.get<{ success: boolean; data: Group[] }>('/groups');
    return res.data;
  },

  async getGroupByTrip(tripId: string): Promise<{ success: boolean; data: Group | null }> {
    const res = await apiClient.get<{ success: boolean; data: Group | null }>(`/groups/trip/${tripId}`);
    return res.data;
  },

  async inviteGroupMember(groupId: string, email: string, role: string): Promise<{ success: boolean; message: string; data: Group }> {
    const res = await apiClient.post<{ success: boolean; message: string; data: Group }>(`/groups/${groupId}/invite`, { email, role });
    return res.data;
  },

  // Documents Endpoints
  async getDocuments(tripId: string): Promise<{ success: boolean; data: TravelDocument[] }> {
    const res = await apiClient.get<{ success: boolean; data: TravelDocument[] }>(`/documents/trip/${tripId}`);
    return res.data;
  },

  async addDocument(data: Partial<TravelDocument>): Promise<{ success: boolean; data: TravelDocument }> {
    const res = await apiClient.post<{ success: boolean; data: TravelDocument }>('/documents', data);
    return res.data;
  },

  async deleteDocument(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<{ success: boolean }>(`/documents/${id}`);
    return res.data;
  },

  // Notifications Endpoints
  async getNotifications(): Promise<{ success: boolean; data: NotificationItem[] }> {
    const res = await apiClient.get<{ success: boolean; data: NotificationItem[] }>('/notifications');
    return res.data;
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const res = await apiClient.post<{ success: boolean }>('/notifications/read-all');
    return res.data;
  },

  // Favorites Endpoints
  async getFavorites(): Promise<{ success: boolean; data: Destination[] }> {
    const res = await apiClient.get<{ success: boolean; data: Destination[] }>('/favorites');
    return res.data;
  },

  async toggleFavorite(destinationId: string): Promise<{ success: boolean; isFavorited: boolean }> {
    const res = await apiClient.post<{ success: boolean; isFavorited: boolean }>('/favorites/toggle', { destinationId });
    return res.data;
  },

  // Currency & Weather Endpoints
  async getCurrencyRates(): Promise<{ success: boolean; data: Record<string, CurrencyRate> }> {
    const res = await apiClient.get<{ success: boolean; data: Record<string, CurrencyRate> }>('/currency/rates');
    return res.data;
  },

  async getWeather(city: string): Promise<{ success: boolean; data: DestinationWeather }> {
    const res = await apiClient.get<{ success: boolean; data: DestinationWeather }>(`/weather/${encodeURIComponent(city)}`);
    return res.data;
  },

  // Analytics Endpoints
  async getTravelerAnalytics(): Promise<{ success: boolean; data: any }> {
    const res = await apiClient.get<{ success: boolean; data: any }>('/analytics/traveler');
    return res.data;
  },

  async getAdminAnalytics(): Promise<{ success: boolean; data: any }> {
    const res = await apiClient.get<{ success: boolean; data: any }>('/analytics/admin');
    return res.data;
  },

  // Reports
  async getTripReport(tripId: string): Promise<{ success: boolean; data: any }> {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/reports/trip/${tripId}`);
    return res.data;
  },

  // AI Copilot Endpoints
  async sendAiChat(message: string, tripId: string, conversationHistory?: any[]): Promise<{ success: boolean; data: { reply: string; actions: any[] } }> {
    const res = await apiClient.post<{ success: boolean; data: { reply: string; actions: any[] } }>('/ai/chat', { message, tripId, conversationHistory });
    return res.data;
  },

  async planTripWithAi(params: { destination: string; days?: number; budget?: number; currency?: string; travelStyle?: string; travelers?: number }): Promise<{ success: boolean; data: any }> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/ai/plan-trip', params);
    return res.data;
  },

  // Trip Memories Endpoints
  async getTripMemories(tripId: string): Promise<{ success: boolean; data: any }> {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/memories/trip/${tripId}`);
    return res.data;
  },

  async generateTripMemories(payload: { tripId: string; tone?: string; userNotes?: string }): Promise<{ success: boolean; data: any; engine?: string }> {
    const res = await apiClient.post<{ success: boolean; data: any; engine?: string }>('/ai/memories', payload);
    return res.data;
  },

  // AI Route Optimization Endpoints
  async optimizeDailyRoute(payload: {
    tripId: string;
    dayId: string;
    activities?: Activity[];
    options?: RouteOptimizationOptions;
  }): Promise<{ success: boolean; data: RouteOptimizationResult; message?: string }> {
    const res = await apiClient.post<{ success: boolean; data: RouteOptimizationResult; message?: string }>('/ai/optimize-daily-route', payload);
    return res.data;
  },

  async reorderDayActivities(
    dayId: string,
    activities: Activity[]
  ): Promise<{ success: boolean; data: ItineraryDay; message?: string }> {
    const res = await apiClient.post<{ success: boolean; data: ItineraryDay; message?: string }>(`/itineraries/${dayId}/reorder`, { activities });
    return res.data;
  },

  // Travel Insurance & AI Reminders Endpoints
  async getInsurancePolicy(tripId: string): Promise<{ success: boolean; data: TravelInsurancePolicy | null }> {
    const res = await apiClient.get<{ success: boolean; data: TravelInsurancePolicy | null }>(`/insurance/trip/${tripId}`);
    return res.data;
  },

  async saveInsurancePolicy(policyData: Partial<TravelInsurancePolicy>): Promise<{ success: boolean; data: TravelInsurancePolicy; message?: string }> {
    const res = await apiClient.post<{ success: boolean; data: TravelInsurancePolicy; message?: string }>('/insurance', policyData);
    return res.data;
  },

  async auditInsurancePolicy(payload: { tripId: string; policy?: Partial<TravelInsurancePolicy> }): Promise<{ success: boolean; data: TravelInsurancePolicy; message?: string }> {
    const res = await apiClient.post<{ success: boolean; data: TravelInsurancePolicy; message?: string }>('/ai/audit-insurance', payload);
    return res.data;
  },

  // Smart Currency Converter & AI Budget Adjustments Endpoints
  async getDestinationCurrencyInfo(destination: string): Promise<{ success: boolean; data: DestinationCurrencyInfo }> {
    const res = await apiClient.get<{ success: boolean; data: DestinationCurrencyInfo }>(`/currency/destination/${encodeURIComponent(destination)}`);
    return res.data;
  },

  async getAiBudgetAdjustment(payload: {
    tripId: string;
    destination: string;
    totalBudget: number;
    currency: string;
    expenses?: any[];
    durationDays?: number;
  }): Promise<{ success: boolean; data: BudgetAdjustmentRecommendation; message?: string }> {
    const res = await apiClient.post<{ success: boolean; data: BudgetAdjustmentRecommendation; message?: string }>('/ai/budget-adjustment', payload);
    return res.data;
  },

  // Ratings & Reviews Endpoints (Spring Boot ReviewController)
  async getReviews(params?: {
    targetType?: string;
    targetId?: string;
    rating?: number;
    travelerType?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<{ success: boolean; data: { reviews: Review[]; summary: RatingSummary } }> {
    const res = await apiClient.get<{ success: boolean; data: { reviews: Review[]; summary: RatingSummary } }>('/reviews', { params });
    return res.data;
  },

  async getFeaturedReviews(): Promise<{ success: boolean; data: Review[] }> {
    const res = await apiClient.get<{ success: boolean; data: Review[] }>('/reviews/featured');
    return res.data;
  },

  async createReview(payload: CreateReviewInput): Promise<{
    success: boolean;
    message?: string;
    data: { review: Review; summary: RatingSummary };
  }> {
    const res = await apiClient.post<{
      success: boolean;
      message?: string;
      data: { review: Review; summary: RatingSummary };
    }>('/reviews', payload);
    return res.data;
  },

  async voteReviewHelpful(reviewId: string): Promise<{
    success: boolean;
    data: { reviewId: string; helpfulVotes: number; hasVoted: boolean };
  }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { reviewId: string; helpfulVotes: number; hasVoted: boolean };
    }>(`/reviews/${encodeURIComponent(reviewId)}/helpful`);
    return res.data;
  },

  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/reviews/${encodeURIComponent(reviewId)}`);
    return res.data;
  },
};
