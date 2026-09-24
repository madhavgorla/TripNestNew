import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, ItineraryDay, Activity, Expense, TravelDocument, Group } from '../types';
import { api } from '../services/api';

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  itineraryDays: ItineraryDay[];
  expenses: Expense[];
  documents: TravelDocument[];
  group: Group | null;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveTripById: (tripId: string) => void;
  createTrip: (tripData: Partial<Trip>) => Promise<Trip | null>;
  updateTrip: (tripId: string, tripData: Partial<Trip>) => Promise<boolean>;
  deleteTrip: (tripId: string) => Promise<boolean>;
  addItineraryDay: (title?: string, date?: string) => Promise<boolean>;
  addActivity: (activityData: Partial<Activity>) => Promise<boolean>;
  updateActivity: (activityId: string, activityData: Partial<Activity>) => Promise<boolean>;
  deleteActivity: (activityId: string) => Promise<boolean>;
  toggleActivityComplete: (activityId: string) => Promise<boolean>;
  reorderDayActivities: (dayId: string, activities: Activity[]) => Promise<boolean>;
  addExpense: (expenseData: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (expenseId: string) => Promise<boolean>;
  addDocument: (docData: Partial<TravelDocument>) => Promise<boolean>;
  deleteDocument: (docId: string) => Promise<boolean>;
  inviteMember: (email: string, role: string) => Promise<boolean>;
  applyAiProposal: (action: any) => Promise<boolean>;
  refreshActiveTripData: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('itinerary');

  // Load all trips initially
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTrips();
      if (res.success && res.data.length > 0) {
        setTrips(res.data);
        // Default to Rome trip or first trip
        const defaultTrip = res.data.find((t) => t.id === 'trip-rome-2026') || res.data[0];
        setActiveTrip(defaultTrip);
        await loadTripDetails(defaultTrip.id);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTripDetails = async (tripId: string) => {
    try {
      const [itinRes, expRes, docRes, grpRes] = await Promise.all([
        api.getItinerary(tripId),
        api.getExpenses(tripId),
        api.getDocuments(tripId),
        api.getGroupByTrip(tripId),
      ]);

      if (itinRes.success) setItineraryDays(itinRes.data);
      if (expRes.success) setExpenses(expRes.data);
      if (docRes.success) setDocuments(docRes.data);
      if (grpRes.success) setGroup(grpRes.data);
    } catch (err) {
      console.error('Failed to load trip details:', err);
    }
  };

  const setActiveTripById = async (tripId: string) => {
    const found = trips.find((t) => t.id === tripId);
    if (found) {
      setActiveTrip(found);
      await loadTripDetails(found.id);
    }
  };

  const refreshActiveTripData = async () => {
    if (activeTrip) {
      const tripRes = await api.getTrip(activeTrip.id);
      if (tripRes.success) {
        setActiveTrip(tripRes.data);
        setTrips((prev) => prev.map((t) => (t.id === tripRes.data.id ? tripRes.data : t)));
      }
      await loadTripDetails(activeTrip.id);
    }
  };

  const createTrip = async (tripData: Partial<Trip>): Promise<Trip | null> => {
    try {
      const res = await api.createTrip(tripData);
      if (res.success && res.data) {
        setTrips((prev) => [res.data, ...prev]);
        setActiveTrip(res.data);
        await loadTripDetails(res.data.id);
        return res.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const updateTrip = async (tripId: string, tripData: Partial<Trip>): Promise<boolean> => {
    try {
      const res = await api.updateTrip(tripId, tripData);
      if (res.success && res.data) {
        setTrips((prev) => prev.map((t) => (t.id === tripId ? res.data : t)));
        if (activeTrip?.id === tripId) {
          setActiveTrip(res.data);
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const deleteTrip = async (tripId: string): Promise<boolean> => {
    try {
      const res = await api.deleteTrip(tripId);
      if (res.success) {
        const remaining = trips.filter((t) => t.id !== tripId);
        setTrips(remaining);
        if (activeTrip?.id === tripId) {
          if (remaining.length > 0) {
            setActiveTrip(remaining[0]);
            loadTripDetails(remaining[0].id);
          } else {
            setActiveTrip(null);
            setItineraryDays([]);
            setExpenses([]);
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const addItineraryDay = async (title?: string, date?: string): Promise<boolean> => {
    if (!activeTrip) return false;
    const nextDayNum = itineraryDays.length + 1;
    const res = await api.addItineraryDay({
      tripId: activeTrip.id,
      dayNumber: nextDayNum,
      title: title || `Day ${nextDayNum}`,
      date: date || activeTrip.startDate,
      summary: `Day ${nextDayNum} planned activities`,
    });
    if (res.success) {
      setItineraryDays((prev) => [...prev, res.data]);
      return true;
    }
    return false;
  };

  const addActivity = async (activityData: Partial<Activity>): Promise<boolean> => {
    if (!activeTrip) return false;
    const res = await api.addActivity({
      ...activityData,
      tripId: activeTrip.id,
    });
    if (res.success && res.data) {
      setItineraryDays((prev) =>
        prev.map((day) => {
          if (day.id === res.data.dayId) {
            return { ...day, activities: [...day.activities, res.data] };
          }
          return day;
        })
      );
      return true;
    }
    return false;
  };

  const updateActivity = async (activityId: string, activityData: Partial<Activity>): Promise<boolean> => {
    const res = await api.updateActivity(activityId, activityData);
    if (res.success && res.data) {
      setItineraryDays((prev) =>
        prev.map((day) => ({
          ...day,
          activities: day.activities.map((act) => (act.id === activityId ? res.data : act)),
        }))
      );
      return true;
    }
    return false;
  };

  const deleteActivity = async (activityId: string): Promise<boolean> => {
    const res = await api.deleteActivity(activityId);
    if (res.success) {
      setItineraryDays((prev) =>
        prev.map((day) => ({
          ...day,
          activities: day.activities.filter((act) => act.id !== activityId),
        }))
      );
      return true;
    }
    return false;
  };

  const toggleActivityComplete = async (activityId: string): Promise<boolean> => {
    const res = await api.toggleActivityComplete(activityId);
    if (res.success && res.data) {
      setItineraryDays((prev) =>
        prev.map((day) => ({
          ...day,
          activities: day.activities.map((act) => (act.id === activityId ? res.data : act)),
        }))
      );
      return true;
    }
    return false;
  };

  const reorderDayActivities = async (dayId: string, newActivities: Activity[]): Promise<boolean> => {
    // Optimistically update local state immediately
    setItineraryDays((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, activities: newActivities } : day))
    );

    try {
      const res = await api.reorderDayActivities(dayId, newActivities);
      if (res.success && res.data) {
        setItineraryDays((prev) =>
          prev.map((day) => (day.id === dayId ? res.data : day))
        );
        return true;
      }
    } catch (err) {
      console.warn('Backend reorder failed, kept optimistic state:', err);
    }
    return true;
  };

  const addExpense = async (expenseData: Partial<Expense>): Promise<boolean> => {
    if (!activeTrip) return false;
    const res = await api.addExpense({
      ...expenseData,
      tripId: activeTrip.id,
    });
    if (res.success && res.data) {
      setExpenses((prev) => [res.data, ...prev]);
      // Update local spent total
      setActiveTrip((prev) => (prev ? { ...prev, spent: (prev.spent || 0) + res.data.amount } : null));
      return true;
    }
    return false;
  };

  const deleteExpense = async (expenseId: string): Promise<boolean> => {
    const toDelete = expenses.find((e) => e.id === expenseId);
    const res = await api.deleteExpense(expenseId);
    if (res.success) {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      if (toDelete && activeTrip) {
        setActiveTrip({ ...activeTrip, spent: Math.max(0, (activeTrip.spent || 0) - toDelete.amount) });
      }
      return true;
    }
    return false;
  };

  const addDocument = async (docData: Partial<TravelDocument>): Promise<boolean> => {
    if (!activeTrip) return false;
    const res = await api.addDocument({
      ...docData,
      tripId: activeTrip.id,
    });
    if (res.success && res.data) {
      setDocuments((prev) => [res.data, ...prev]);
      return true;
    }
    return false;
  };

  const deleteDocument = async (docId: string): Promise<boolean> => {
    const res = await api.deleteDocument(docId);
    if (res.success) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      return true;
    }
    return false;
  };

  const inviteMember = async (email: string, role: string): Promise<boolean> => {
    if (!group) return false;
    const res = await api.inviteGroupMember(group.id, email, role);
    if (res.success && res.data) {
      setGroup(res.data);
      return true;
    }
    return false;
  };

  const applyAiProposal = async (action: any): Promise<boolean> => {
    if (!activeTrip) return false;
    try {
      if (action.type === 'ADD_ACTIVITY') {
        const targetDay = itineraryDays.find((d) => d.dayNumber === (action.payload.dayNumber || 1)) || itineraryDays[0];
        if (targetDay) {
          await addActivity({
            dayId: targetDay.id,
            name: action.payload.name,
            description: action.payload.description,
            startTime: action.payload.startTime || '14:00',
            endTime: action.payload.endTime || '16:00',
            location: action.payload.location || `${activeTrip.destination} Center`,
            category: action.payload.category || 'Sightseeing',
            cost: action.payload.cost || 0,
            priority: action.payload.priority || 'Medium',
          });
          return true;
        }
      } else if (action.type === 'OPTIMIZE_BUDGET') {
        const savingsRatio = 1 - (action.payload.targetSavingsPercentage || 10) / 100;
        const newBudget = Math.round(activeTrip.budget * savingsRatio);
        await updateTrip(activeTrip.id, { budget: newBudget });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to apply AI proposal:', err);
      return false;
    }
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        itineraryDays,
        expenses,
        documents,
        group,
        isLoading,
        activeTab,
        setActiveTab,
        setActiveTripById,
        createTrip,
        updateTrip,
        deleteTrip,
        addItineraryDay,
        addActivity,
        updateActivity,
        deleteActivity,
        toggleActivityComplete,
        reorderDayActivities,
        addExpense,
        deleteExpense,
        addDocument,
        deleteDocument,
        inviteMember,
        applyAiProposal,
        refreshActiveTripData,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within a TripProvider');
  return context;
};
