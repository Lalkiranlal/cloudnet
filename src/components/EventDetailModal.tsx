import React from 'react';
import { 
  X, 
  MapPin, 
  Radio, 
  Users, 
  Copy, 
  Gauge,
  Sparkles
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div 
          className="px-6 py-5 border-b border-slate-100 flex items-center justify-between"
          style={{ background: config.bgHex }}
        >
          <div className="flex items-center space-x-3">
            <span 
              className="p-2.5 rounded-2xl text-2xl bg-white shadow-sm border border-slate-200/60"
            >
              {config.emoji}
            </span>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: config.color }}>
                  {config.label}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  event.severity === 'extreme' ? 'bg-rose-600 text-white' :
                  event.severity === 'severe' ? 'bg-orange-500 text-white' :
                  'bg-white text-slate-700 shadow-xs'
                }`}>
                  {event.severity} severity
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {event.city}, {event.state}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/80 text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          
          <div>
            <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium">
              {event.description}
            </p>
          </div>

          {event.mediaUrl && (
            <div className="space-y-1.5">
              <span className="text-slate-500 font-bold">Photo Evidence</span>
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-52 w-full relative shadow-sm">
                <img src={event.mediaUrl} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-slate-900/80 text-[11px] text-white font-mono shadow-sm">
                  GPS: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          )}

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Timestamp</span>
              <div className="font-mono text-slate-900 font-bold mt-0.5 text-xs">
                {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {new Date(event.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Location</span>
              <div className="font-mono text-slate-900 font-bold mt-0.5 text-xs truncate">
                {event.latitude.toFixed(3)}, {event.longitude.toFixed(3)}
              </div>
              <button 
                onClick={copyCoords}
                className="text-[10px] text-sky-600 font-semibold hover:underline flex items-center mt-0.5"
              >
                <Copy className="w-2.5 h-2.5 mr-1" /> Copy GPS
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Source</span>
              <div className="capitalize font-bold text-slate-900 mt-0.5 flex items-center space-x-1">
                {event.source === 'twitter' && <Twitter className="w-3 h-3 text-sky-600" />}
                {event.source === 'api' && <Radio className="w-3 h-3 text-teal-600" />}
                {event.source === 'citizen' && <Users className="w-3 h-3 text-purple-600" />}
                <span>{event.source}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {event.sourceAuthor}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Status</span>
              <div className="mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  event.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                  event.verificationStatus === 'flagged' ? 'bg-rose-100 text-rose-800' :
                  event.verificationStatus === 'duplicate' ? 'bg-purple-100 text-purple-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {event.verificationStatus}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                Score: {event.confidenceScore}%
              </div>
            </div>

          </div>

          {/* Telemetry */}
          {event.telemetry && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-slate-800 font-bold flex items-center text-xs">
                <Gauge className="w-4 h-4 text-sky-600 mr-1.5" />
                Live Sensor Telemetry
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {event.telemetry.temperatureC !== undefined && (
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium">Temp</span>
                    <p className="font-mono text-slate-900 font-extrabold">{event.telemetry.temperatureC}°C</p>
                  </div>
                )}
                {event.telemetry.precipitationMm !== undefined && (
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium">Precip</span>
                    <p className="font-mono text-sky-600 font-extrabold">{event.telemetry.precipitationMm} mm</p>
                  </div>
                )}
                {event.telemetry.windSpeedKmh !== undefined && (
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium">Wind</span>
                    <p className="font-mono text-teal-600 font-extrabold">{event.telemetry.windSpeedKmh} km/h</p>
                  </div>
                )}
                {event.telemetry.humidityPct !== undefined && (
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium">Humidity</span>
                    <p className="font-mono text-purple-600 font-extrabold">{event.telemetry.humidityPct}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {event.rawText && (
            <div className="space-y-1">
              <span className="text-slate-400 font-bold text-[11px]">Raw Payload</span>
              <pre className="p-3 bg-slate-900 rounded-2xl text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {event.rawText}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
