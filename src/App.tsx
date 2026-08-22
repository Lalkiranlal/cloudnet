import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { LiveTicker } from './components/LiveTicker';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { MapView } from './components/MapView';
import { LiveFeedList } from './components/LiveFeedList';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { CitizenReportModal } from './components/CitizenReportModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EventDetailModal } from './components/EventDetailModal';
import { SimulationControls } from './components/SimulationControls';
import { MultiSourceFeedsView } from './components/MultiSourceFeedsView';
import { WeatherEvent, FilterState } from './types/weather';
import { getStoredEvents, getAdminAuthState } from './services/storage';
import { generateSimulatedTweet, fetchLiveCityWeather } from './services/weatherApi';
import { addEventWithProcessing } from './services/storage';
import { MAJOR_INDIAN_CITIES } from './data/initialEvents';
import { Bell, CheckCircle2, ShieldAlert, Sparkles, X } from 'lucide-react';

export function App() {
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'admin' | 'feeds'>('dashboard');
  
  // Modals
  const [isCitizenModalOpen, setIsCitizenModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Admin Auth
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Live Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter State
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    categories: [],
    sources: [],
    verificationStatuses: [],
    stateFilter: 'All States',
    cityFilter: '',
    dateRange: 'all',
    severityLevels: []
  });

  // Initialize data and listeners
  useEffect(() => {
    setEvents(getStoredEvents());
    setIsAdminAuthenticated(getAdminAuthState());

    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setEvents(e.detail);
      }
    };

    window.addEventListener('blure_events_updated', handleStorageUpdate);
    return () => window.removeEventListener('blure_events_updated', handleStorageUpdate);
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // 1. Search Query
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matches =
          event.title.toLowerCase().includes(q) ||
          event.description.toLowerCase().includes(q) ||
          event.city.toLowerCase().includes(q) ||
          event.state.toLowerCase().includes(q) ||
          event.sourceAuthor.toLowerCase().includes(q) ||
          (event.hashtags && event.hashtags.some(h => h.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      // 2. Event Category Filter
      if (filter.categories.length > 0) {
        if (!filter.categories.includes(event.category)) return false;
      }

      // 3. Source Filter
      if (filter.sources.length > 0) {
        if (!filter.sources.includes(event.source)) return false;
      }

      // 4. Verification Status Filter
      if (filter.verificationStatuses.length > 0) {
        if (!filter.verificationStatuses.includes(event.verificationStatus)) return false;
      }

      // 5. State Filter
      if (filter.stateFilter !== 'All States') {
        if (event.state !== filter.stateFilter) return false;
      }

      // 6. Date Range Filter
      if (filter.dateRange !== 'all') {
        const eventTime = new Date(event.timestamp).getTime();
        const now = new Date().getTime();
        const diffHours = (now - eventTime) / (1000 * 60 * 60);

        if (filter.dateRange === 'today' && diffHours > 24) return false;
        if (filter.dateRange === '24h' && diffHours > 24) return false;
        if (filter.dateRange === '7d' && diffHours > 168) return false;
      }

      return true;
    });
  }, [events, filter]);

  // Handle Event Selection
  const handleSelectEvent = (event: WeatherEvent) => {
    setSelectedEvent(event);
  };

  const handleOpenDetailModal = (event: WeatherEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 5000);
  };

  // Handlers for Live Simulation Toolbar
  const handleSimulationNewEvent = (newEvent: WeatherEvent, msg: string) => {
    showToast(msg);
  };

  const handleTriggerApiSync = async () => {
    const city = MAJOR_INDIAN_CITIES[Math.floor(Math.random() * MAJOR_INDIAN_CITIES.length)];
    const data = await fetchLiveCityWeather(city);
    if (data) {
      addEventWithProcessing(data);
      showToast(`Fetched live synoptic telemetry for ${city.name}`);
    }
  };

  const handleTriggerTweetSync = () => {
    const tweet = generateSimulatedTweet();
    addEventWithProcessing(tweet);
    showToast(`Ingested new Twitter #IMD post: ${tweet.city}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-cyan-400 selection:text-navy-950">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCitizenModal={() => setIsCitizenModalOpen(true)}
        onOpenAdminLoginModal={() => setIsAdminLoginModalOpen(true)}
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
        totalEventsCount={events.length}
      />

      {/* Live Breaking Alert Marquee Ticker */}
      <LiveTicker
        events={events}
        onSelectEvent={handleOpenDetailModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Simulation & Evaluation Toolbar (Always accessible at top) */}
        <SimulationControls onNewEvent={handleSimulationNewEvent} />

        {/* Tab 1: Live Dashboard & Map View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top 4 KPI Metrics */}
            <StatsOverview events={events} />

            {/* 5-Way Interactive Filter Suite */}
            <FilterBar
              filter={filter}
              setFilter={setFilter}
              totalMatches={filteredEvents.length}
            />

            {/* Map & Live Stream Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Interactive Leaflet Dark Map */}
              <div className="lg:col-span-8">
                <MapView
                  events={filteredEvents}
                  selectedEvent={selectedEvent}
                  onSelectEvent={handleSelectEvent}
                  onOpenReportModal={() => setIsCitizenModalOpen(true)}
                />
              </div>

              {/* Real-time Streaming Feed List */}
              <div className="lg:col-span-4">
                <LiveFeedList
                  events={filteredEvents}
                  selectedEvent={selectedEvent}
                  onSelectEvent={handleSelectEvent}
                  onOpenDetails={handleOpenDetailModal}
                />
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Analytics & Trends */}
        {activeTab === 'analytics' && (
          <AnalyticsCharts events={events} />
        )}

        {/* Tab 3: Admin Operational Verification */}
        {activeTab === 'admin' && (
          <AdminPanel
            events={events}
            setEvents={setEvents}
            isAdminAuthenticated={isAdminAuthenticated}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
            onOpenLoginModal={() => setIsAdminLoginModalOpen(true)}
            onInspectEvent={handleOpenDetailModal}
          />
        )}

        {/* Tab 4: Multi-Source Ingestion Pipelines */}
        {activeTab === 'feeds' && (
          <MultiSourceFeedsView
            events={events}
            onTriggerApiFetch={handleTriggerApiSync}
            onTriggerTweet={handleTriggerTweetSync}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-navy-800/80 bg-navy-950/90 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white tracking-wider">CLOUD NET</span>
            <span>• National Weather Event Aggregation & AI Verification Platform</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
            <span>IMD Open Telemetry</span>
            <span>•</span>
            <span>Open-Meteo Integration</span>
            <span>•</span>
            <span className="text-cyan-400">Vercel Ready</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <CitizenReportModal
        isOpen={isCitizenModalOpen}
        onClose={() => setIsCitizenModalOpen(false)}
        onReportSubmitted={(newEvent) => {
          showToast(`Report logged! AI Confidence: ${newEvent.confidenceScore}% (${newEvent.verificationStatus.toUpperCase()})`);
          setSelectedEvent(newEvent);
        }}
      />

      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          setActiveTab('admin');
          showToast('Admin officer authenticated successfully.');
        }}
      />

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setIsDetailModalOpen(false)}
        onSelectEventById={(id) => {
          const match = events.find(e => e.id === id);
          if (match) setSelectedEvent(match);
        }}
      />

      {/* Real-time Ingestion Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-navy-900/95 border border-cyan-400/40 text-slate-100 shadow-2xl backdrop-blur-xl animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
