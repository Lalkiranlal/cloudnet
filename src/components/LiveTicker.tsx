import React from 'react';
import { AlertCircle, CloudRain, Zap, Flame, Wind } from 'lucide-react';
import { WeatherEvent } from '../types/weather';

interface LiveTickerProps {
  events: WeatherEvent[];
  onSelectEvent: (event: WeatherEvent) => void;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ events, onSelectEvent }) => {
  const severeEvents = events.filter(
    e => (e.severity === 'severe' || e.severity === 'extreme') && e.verificationStatus !== 'flagged'
  ).slice(0, 8);

  if (severeEvents.length === 0) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rainfall':
      case 'flooding':
        return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
      case 'thunderstorm':
        return <Zap className="w-3.5 h-3.5 text-purple-400" />;
      case 'heatwave':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'dust storm':
      case 'strong wind':
        return <Wind className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="w-full bg-[#0b1325] border-b border-slate-800/80 px-6 py-2 overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex items-center">
        
        {/* Urgent Alert Pill */}
        <div className="flex-shrink-0 flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide mr-4 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>IMD ADVISORY</span>
        </div>

        {/* Scrolling Event Ticker */}
        <div className="overflow-hidden whitespace-nowrap flex-1 relative">
          <div className="inline-flex space-x-8 animate-ticker">
            {[...severeEvents, ...severeEvents].map((event, idx) => (
              <button
                key={`${event.id}-ticker-${idx}`}
                onClick={() => onSelectEvent(event)}
                className="inline-flex items-center space-x-2 text-xs text-slate-300 hover:text-sky-300 transition-colors group cursor-pointer"
              >
                {getCategoryIcon(event.category)}
                <span className="font-semibold text-slate-200 group-hover:text-sky-300">
                  {event.city}:
                </span>
                <span className="text-slate-400 group-hover:text-slate-200">
                  {event.title}
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {event.severity.toUpperCase()}
                </span>
                <span className="text-slate-600 font-bold">•</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
