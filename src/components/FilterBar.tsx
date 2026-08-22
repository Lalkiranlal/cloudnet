import React from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CloudRain, 
  Zap, 
  Waves, 
  Sun, 
  CloudFog, 
  Wind, 
  Tornado,
  Radio,
  Users
} from 'lucide-react';
import { Twitter } from './icons/TwitterIcon';
import { FilterState, EventCategory, ReportSource, VerificationStatus } from '../types/weather';
import { CATEGORY_CONFIG, INDIAN_STATES } from '../data/initialEvents';

interface FilterBarProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
}

const CATEGORY_ITEMS: { id: EventCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'rainfall', label: 'Rainfall', icon: <CloudRain className="w-3.5 h-3.5" /> },
  { id: 'thunderstorm', label: 'Thunderstorm', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'flooding', label: 'Flooding', icon: <Waves className="w-3.5 h-3.5" /> },
  { id: 'heatwave', label: 'Heatwave', icon: <Sun className="w-3.5 h-3.5" /> },
  { id: 'fog', label: 'Fog', icon: <CloudFog className="w-3.5 h-3.5" /> },
  { id: 'dust storm', label: 'Dust Storm', icon: <Wind className="w-3.5 h-3.5" /> },
  { id: 'strong wind', label: 'Strong Wind', icon: <Tornado className="w-3.5 h-3.5" /> },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter, totalMatches }) => {
  
  const handleCategoryToggle = (category: EventCategory) => {
    setFilter(prev => {
      const exists = prev.categories.includes(category);
      if (exists) {
        return { ...prev, categories: prev.categories.filter(c => c !== category) };
      } else {
        return { ...prev, categories: [...prev.categories, category] };
      }
    });
  };

  const handleSourceToggle = (source: ReportSource) => {
    setFilter(prev => {
      const exists = prev.sources.includes(source);
      if (exists) {
        return { ...prev, sources: prev.sources.filter(s => s !== source) };
      } else {
        return { ...prev, sources: [...prev.sources, source] };
      }
    });
  };

  const handleStatusToggle = (status: VerificationStatus) => {
    setFilter(prev => {
      const exists = prev.verificationStatuses.includes(status);
      if (exists) {
        return { ...prev, verificationStatuses: prev.verificationStatuses.filter(s => s !== status) };
      } else {
        return { ...prev, verificationStatuses: [...prev.verificationStatuses, status] };
      }
    });
  };

  const resetFilters = () => {
    setFilter({
      searchQuery: '',
      categories: [],
      sources: [],
      verificationStatuses: [],
      stateFilter: 'All States',
      cityFilter: '',
      dateRange: 'all',
      severityLevels: []
    });
  };

  const hasActiveFilters =
    filter.searchQuery ||
    filter.categories.length > 0 ||
    filter.sources.length > 0 ||
    filter.verificationStatuses.length > 0 ||
    filter.stateFilter !== 'All States' ||
    filter.dateRange !== 'all';

  return (
    <div className="matte-card p-4 rounded-xl mb-6 space-y-3.5">
      
      {/* Row 1: Search, State, Date Preset & Reset */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by keyword, city, hashtag or source..."
            value={filter.searchQuery}
            onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full matte-input pl-10 pr-4 py-2 rounded-lg text-xs placeholder-slate-500"
          />
        </div>

        {/* State Filter Dropdown */}
        <div className="md:col-span-3 relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={filter.stateFilter}
            onChange={(e) => setFilter(prev => ({ ...prev, stateFilter: e.target.value }))}
            className="w-full matte-input pl-10 pr-8 py-2 rounded-lg text-xs appearance-none cursor-pointer"
          >
            {INDIAN_STATES.map(st => (
              <option key={st} value={st} className="bg-slate-900 text-slate-100">
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Selector */}
        <div className="md:col-span-3 relative">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={filter.dateRange}
            onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as any }))}
            className="w-full matte-input pl-10 pr-8 py-2 rounded-lg text-xs appearance-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-100">All Recorded Dates</option>
            <option value="today" className="bg-slate-900 text-slate-100">Today Only</option>
            <option value="24h" className="bg-slate-900 text-slate-100">Last 24 Hours</option>
            <option value="7d" className="bg-slate-900 text-slate-100">Last 7 Days</option>
          </select>
        </div>

        {/* Matches & Reset Button */}
        <div className="md:col-span-2 flex items-center justify-between space-x-2">
          <span className="text-xs font-mono text-slate-300 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 w-full text-center">
            <strong>{totalMatches}</strong> matching
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              title="Reset All Filters"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Row 2: 7 Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
        <span className="text-[11px] font-medium text-slate-400 mr-2 flex items-center">
          <Filter className="w-3 h-3 mr-1" /> Category:
        </span>
        
        {CATEGORY_ITEMS.map(item => {
          const isSelected = filter.categories.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleCategoryToggle(item.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                isSelected
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-medium'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Row 3: Verification Status & Multi-Source Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
        
        {/* Verification Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1 flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1 text-slate-400" /> Status:
          </span>

          {(['verified', 'unverified', 'flagged', 'duplicate'] as VerificationStatus[]).map(status => {
            const isSelected = filter.verificationStatuses.includes(status);
            return (
              <button
                key={status}
                onClick={() => handleStatusToggle(status)}
                className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors ${
                  isSelected
                    ? status === 'verified'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700'
                      : status === 'flagged'
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-700'
                      : status === 'duplicate'
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-700'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-700'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-300'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Source Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Source:</span>

          <button
            onClick={() => handleSourceToggle('twitter')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
              filter.sources.includes('twitter')
                ? 'bg-slate-800 text-sky-300 border border-sky-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-300'
            }`}
          >
            <Twitter className="w-2.5 h-2.5 text-slate-400" />
            <span>Twitter #IMD</span>
          </button>

          <button
            onClick={() => handleSourceToggle('api')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
              filter.sources.includes('api')
                ? 'bg-slate-800 text-teal-300 border border-teal-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-300'
            }`}
          >
            <Radio className="w-2.5 h-2.5 text-slate-400" />
            <span>Weather API</span>
          </button>

          <button
            onClick={() => handleSourceToggle('citizen')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
              filter.sources.includes('citizen')
                ? 'bg-slate-800 text-purple-300 border border-purple-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-300'
            }`}
          >
            <Users className="w-2.5 h-2.5 text-slate-400" />
            <span>Citizen Reports</span>
          </button>
        </div>

      </div>

    </div>
  );
};
