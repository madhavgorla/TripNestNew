import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { TripProvider, useTrip } from './context/TripContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { SearchModal } from './components/common/SearchModal';
import { TripCreationWizard } from './components/trips/TripCreationWizard';
import { AiCopilot } from './components/ai/AiCopilot';
import { DashboardView } from './components/dashboard/DashboardView';
import { TripWorkspace } from './components/trips/TripWorkspace';
import { DiscoverView } from './components/destinations/DiscoverView';
import { FavoritesView } from './components/favorites/FavoritesView';
import { BudgetManager } from './components/budget/BudgetManager';
import { GroupManager } from './components/groups/GroupManager';
import { DocumentVault } from './components/documents/DocumentVault';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AdminConsole } from './components/admin/AdminConsole';
import { SettingsView } from './components/settings/SettingsView';
import { CommunityReviewsPage } from './components/reviews/CommunityReviewsPage';
import { SpringBootArchitectureHub } from './components/architecture/SpringBootArchitectureHub';
import { Destination } from './types';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const { activeTrip, setActiveTripById, createTrip } = useTrip();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tripnest_dark_mode') === 'true';
  });

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tripnest_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tripnest_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Keyboard shortcut Cmd+K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePlanDestination = async (dest: Destination) => {
    const created = await createTrip({
      tripName: `${dest.name} Discovery Journey`,
      destination: dest.name,
      country: dest.country,
      budget: dest.averageCostPerDay * 5,
      travelers: 2,
      coverImage: dest.imageUrl,
      travelStyle: 'Standard',
      startDate: '2026-11-01',
      endDate: '2026-11-06',
    });
    if (created) {
      setCurrentTab('trips');
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Strict 3-zone Top Navigation Bar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'ai-copilot') {
              setIsAiCopilotOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          onOpenCreateTrip={() => setIsCreateTripOpen(true)}
        />

        {/* Primary Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            {currentTab === 'dashboard' && (
              <DashboardView
                onOpenCreateTrip={() => setIsCreateTripOpen(true)}
                onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
                onSelectTrip={(id) => {
                  setActiveTripById(id);
                  setCurrentTab('trips');
                }}
              />
            )}

            {currentTab === 'trips' && (
              <TripWorkspace onOpenAiCopilot={() => setIsAiCopilotOpen(true)} />
            )}

            {currentTab === 'discover' && (
              <DiscoverView onPlanTripForDestination={handlePlanDestination} />
            )}

            {currentTab === 'favorites' && (
              <FavoritesView onPlanTrip={handlePlanDestination} />
            )}

            {currentTab === 'groups' && <GroupManager />}

            {currentTab === 'budget' && (
              activeTrip ? (
                <BudgetManager
                  tripId={activeTrip.id}
                  totalBudget={activeTrip.budget}
                  tripCurrency={activeTrip.currency}
                />
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Select a trip to view budget and logged expenses.
                </div>
              )
            )}

            {currentTab === 'documents' && <DocumentVault />}

            {(currentTab === 'ratings' || currentTab === 'reviews') && (
              <CommunityReviewsPage />
            )}

            {(currentTab === 'architecture' || currentTab === 'backend') && (
              <SpringBootArchitectureHub />
            )}

            {currentTab === 'analytics' && <AnalyticsView />}

            {currentTab === 'admin' && <AdminConsole />}

            {currentTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'ai-copilot') {
            setIsAiCopilotOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTrip={(tripId) => {
          setActiveTripById(tripId);
          setCurrentTab('trips');
        }}
        onSelectDestination={() => {
          setCurrentTab('discover');
        }}
      />

      {/* Trip Creation Wizard Modal */}
      <TripCreationWizard
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        onTripCreated={(newId) => {
          setActiveTripById(newId);
          setCurrentTab('trips');
        }}
      />

      {/* TripNest AI Copilot Chat Drawer */}
      <AiCopilot
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <TripProvider>
          <MainAppContent />
        </TripProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
