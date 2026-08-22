import React from 'react';
import { 
  X, 
  MapPin, 
  Radio, 
  Users, 
  Copy, 
  Gauge
} from 'lucide-react';
import { Twitter } from './icons/TwitterIcon';
import { WeatherEvent } from '../types/weather';
import { CATEGORY_CONFIG } from '../data/initialEvents';

interface EventDetailModalProps {
  event: WeatherEvent | null;
  onClose: () => void;
  onSelectEventById?: (id: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose
}) => {
  if (!event) return null;

  const config = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.rainfall;

  const copyCoords = () => {
    navigator.clipboard.writeText(`${event.latitude}, ${event.longitude}`);
    alert('GPS coordinates copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0d162b] border border-slate-700 rounded-2xl shadow-xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <span 
              className="p-2 rounded-lg text-lg border"
              style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', color: config.color }}
            >
              {event.category === 'rainfall' ? '🌧' :
                event.category === 'thunderstorm' ? '⚡' :
                event.category === 'flooding' ? '🌊' :
                event.category === 'heatwave' ? '🔥' :
                event.category === 'fog' ? '🌫' :
                event.category === 'dust storm' ? '🌪' : '💨'}
            </span>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: config.color }}>
                  {config.label}
                </span>
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded ${
                  event.severity === 'extreme' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  event.severity === 'severe' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {event.severity}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white mt-0.5">
                {event.city}, {event.state}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          
          <div>
            <h4 className="text-xs font-semibold text-slate-100">{event.title}</h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {event.description}
            </p>
          </div>

          {event.mediaUrl && (
            <div className="space-y-1">
              <span className="text-slate-400 font-medium text-[11px]">Media Evidence</span>
              <div className="rounded-xl overflow-hidden border border-slate-800 h-48 w-full relative">
                <img src={event.mediaUrl} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-300 border border-slate-800 font-mono">
                  Geo: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          )}

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Timestamp</span>
              <div className="font-mono text-slate-200 mt-0.5 text-[11px]">
                {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {new Date(event.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">GPS Location</span>
              <div className="font-mono text-slate-200 mt-0.5 text-[11px] truncate">
                {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
              </div>
              <button 
                onClick={copyCoords}
                className="text-[10px] text-sky-400 hover:underline flex items-center mt-0.5"
              >
                <Copy className="w-2.5 h-2.5 mr-1" /> Copy
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Source</span>
              <div className="capitalize font-medium text-slate-200 mt-0.5 flex items-center space-x-1">
                {event.source === 'twitter' && <Twitter className="w-3 h-3 text-slate-400" />}
                {event.source === 'api' && <Radio className="w-3 h-3 text-slate-400" />}
                {event.source === 'citizen' && <Users className="w-3 h-3 text-slate-400" />}
                <span>{event.source}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {event.sourceAuthor}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Status</span>
              <div className="mt-0.5">
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-semibold ${
                  event.verificationStatus === 'verified' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  event.verificationStatus === 'flagged' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                  event.verificationStatus === 'duplicate' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                  'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {event.verificationStatus}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                Score: {event.confidenceScore}%
              </div>
            </div>

          </div>

          {/* Telemetry */}
          {event.telemetry && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-slate-300 font-medium flex items-center text-[11px]">
                <Gauge className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                Live Sensor Telemetry
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {event.telemetry.temperatureC !== undefined && (
                  <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-400">Temp</span>
                    <p className="font-mono text-slate-200 font-bold">{event.telemetry.temperatureC}°C</p>
                  </div>
                )}
                {event.telemetry.precipitationMm !== undefined && (
                  <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-400">Precip</span>
                    <p className="font-mono text-slate-200 font-bold">{event.telemetry.precipitationMm} mm</p>
                  </div>
                )}
                {event.telemetry.windSpeedKmh !== undefined && (
                  <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-400">Wind</span>
                    <p className="font-mono text-slate-200 font-bold">{event.telemetry.windSpeedKmh} km/h</p>
                  </div>
                )}
                {event.telemetry.humidityPct !== undefined && (
                  <div className="p-1.5 bg-slate-950 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-400">Humidity</span>
                    <p className="font-mono text-slate-200 font-bold">{event.telemetry.humidityPct}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {event.rawText && (
            <div className="space-y-1">
              <span className="text-slate-400 font-medium text-[11px]">Raw Payload</span>
              <pre className="p-2.5 bg-slate-950 rounded-lg text-[10px] font-mono text-slate-400 overflow-x-auto border border-slate-850 leading-relaxed whitespace-pre-wrap">
                {event.rawText}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
