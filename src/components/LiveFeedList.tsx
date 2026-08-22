import React from 'react';
import { 
  Radio, 
  Users, 
  MapPin, 
  Clock, 
  ChevronRight,
  CloudRain
} from 'lucide-react';
import { Twitter } from './icons/TwitterIcon';
import { WeatherEvent } from '../types/weather';
import { CATEGORY_CONFIG } from '../data/initialEvents';

interface LiveFeedListProps {
  events: WeatherEvent[];
  selectedEvent: WeatherEvent | null;
  onSelectEvent: (event: WeatherEvent) => void;
  onOpenDetails: (event: WeatherEvent) => void;
}

export const LiveFeedList: React.FC<LiveFeedListProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onOpenDetails
}) => {

  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'twitter':
        return <Twitter className="w-3 h-3 text-slate-400" />;
      case 'api':
        return <Radio className="w-3 h-3 text-slate-400" />;
      case 'citizen':
        return <Users className="w-3 h-3 text-slate-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="matte-card rounded-xl overflow-hidden flex flex-col h-[540px]">
      
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Live Stream Feed
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {events.length} reports
        </span>
      </div>

      {/* Scrollable Event List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 divide-y divide-slate-800/40">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <CloudRain className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-medium">No weather incidents match current filters</p>
          </div>
        ) : (
          events.map(event => {
            const config = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.rainfall;
            const isSelected = selectedEvent?.id === event.id;

            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className={`pt-2 first:pt-0 p-3 rounded-lg transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-slate-800/90 border border-sky-500/40'
                    : 'hover:bg-slate-850/60 border border-transparent'
                }`}
              >
                {/* Category & Status Row */}
                <div className="flex items-center justify-between mb-1.5">
                  <span 
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.06)', color: config.color, border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {config.label}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded ${
                      event.verificationStatus === 'verified'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                        : event.verificationStatus === 'flagged'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                        : event.verificationStatus === 'duplicate'
                        ? 'bg-purple-950/60 text-purple-400 border border-purple-800'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                    }`}>
                      {event.verificationStatus}
                    </span>

                    <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                      event.severity === 'extreme' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800' :
                      event.severity === 'severe' ? 'bg-amber-950 text-amber-300 font-medium border border-amber-800' :
                      'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-xs font-medium text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-1">
                  {event.title}
                </h4>

                {/* Description snippet */}
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                {/* Metadata & Footer */}
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center font-medium text-slate-300">
                      <MapPin className="w-2.5 h-2.5 text-slate-400 mr-1" />
                      {event.city}, {event.state}
                    </span>

                    <span className="flex items-center text-slate-500 font-mono">
                      <Clock className="w-2.5 h-2.5 mr-0.5" />
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {getSourceIcon(event.source)}
                      <span className="capitalize text-slate-300">{event.source}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(event);
                      }}
                      className="p-0.5 rounded text-slate-400 hover:text-sky-300 transition-colors"
                      title="Inspect Details"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
