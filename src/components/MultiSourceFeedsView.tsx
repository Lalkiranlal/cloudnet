import React from 'react';
import { 
  Radio, 
  Users, 
  Database
} from 'lucide-react';
import { Twitter } from './icons/TwitterIcon';
import { WeatherEvent } from '../types/weather';

interface MultiSourceFeedsViewProps {
  events: WeatherEvent[];
  onTriggerApiFetch: () => void;
  onTriggerTweet: () => void;
}

export const MultiSourceFeedsView: React.FC<MultiSourceFeedsViewProps> = ({
  events,
  onTriggerApiFetch,
  onTriggerTweet
}) => {
  const twitterEvents = events.filter(e => e.source === 'twitter');
  const apiEvents = events.filter(e => e.source === 'api');
  const citizenEvents = events.filter(e => e.source === 'citizen');

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="matte-card p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white">
              Multi-Source Ingestion Streams & Telemetry Pipelines
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Standardized ETL pipeline collecting weather signals from Twitter #IMD, Open-Meteo API & citizen reports.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={onTriggerTweet}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer"
          >
            <Twitter className="w-3 h-3 text-slate-400" />
            <span>Poll Twitter #IMD</span>
          </button>

          <button
            onClick={onTriggerApiFetch}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer"
          >
            <Radio className="w-3 h-3 text-slate-400" />
            <span>Sync Open-Meteo</span>
          </button>
        </div>
      </div>

      {/* 3 Pipeline Stream Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Pipeline 1: Twitter / X Stream */}
        <div className="matte-card p-4 rounded-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                <Twitter className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Twitter / X Stream</h3>
                <span className="text-[10px] text-slate-400 font-mono">#IMD #WeatherAlert</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.2 rounded border border-slate-800">
              {twitterEvents.length} posts
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
            {twitterEvents.map(t => (
              <div key={t.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-sky-400">{t.sourceAuthor}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] line-clamp-2">{t.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>📍 {t.city}, {t.state}</span>
                  <span className="text-slate-400 font-mono">Score: {t.confidenceScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline 2: Open-Meteo Public API */}
        <div className="matte-card p-4 rounded-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Open-Meteo API</h3>
                <span className="text-[10px] text-slate-400 font-mono">api.open-meteo.com</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.2 rounded border border-slate-800">
              {apiEvents.length} synops
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
            {apiEvents.map(a => (
              <div key={a.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-teal-400">{a.sourceAuthor}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Auto-Verified</span>
                </div>
                <p className="text-slate-300 text-[10px] font-mono bg-slate-950 p-1.5 rounded border border-slate-850">
                  {a.rawText}
                </p>
                {a.telemetry && (
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-mono">
                    <div className="bg-slate-950 p-1 rounded text-slate-300">{a.telemetry.temperatureC}°C</div>
                    <div className="bg-slate-950 p-1 rounded text-slate-300">{a.telemetry.precipitationMm}mm</div>
                    <div className="bg-slate-950 p-1 rounded text-slate-300">{a.telemetry.windSpeedKmh}km/h</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline 3: Citizen Crowdsourced Portal */}
        <div className="matte-card p-4 rounded-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Citizen Crowd Reports</h3>
                <span className="text-[10px] text-slate-400 font-mono">GPS-Enabled</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.2 rounded border border-slate-800">
              {citizenEvents.length} reports
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
            {citizenEvents.map(c => (
              <div key={c.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-purple-400">{c.sourceAuthor}</span>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded ${
                    c.verificationStatus === 'verified' ? 'bg-emerald-950 text-emerald-400' :
                    c.verificationStatus === 'duplicate' ? 'bg-purple-950 text-purple-400' :
                    c.verificationStatus === 'flagged' ? 'bg-rose-950 text-rose-400' :
                    'bg-amber-950 text-amber-400'
                  }`}>
                    {c.verificationStatus}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{c.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>📍 {c.city}, {c.state}</span>
                  <span className="font-mono text-slate-500">GPS: {c.latitude.toFixed(2)}, {c.longitude.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
