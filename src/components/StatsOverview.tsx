import React from 'react';
import { 
  Database, 
  ShieldCheck, 
  CopyCheck, 
  AlertTriangle, 
  Radio, 
  Users
} from 'lucide-react';
import { Twitter } from './icons/TwitterIcon';
import { WeatherEvent } from '../types/weather';

interface StatsOverviewProps {
  events: WeatherEvent[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ events }) => {
  const total = events.length;
  const verifiedCount = events.filter(e => e.verificationStatus === 'verified').length;
  const unverifiedCount = events.filter(e => e.verificationStatus === 'unverified').length;
  const flaggedCount = events.filter(e => e.verificationStatus === 'flagged').length;
  const duplicateCount = events.filter(e => e.verificationStatus === 'duplicate').length;

  const twitterCount = events.filter(e => e.source === 'twitter').length;
  const apiCount = events.filter(e => e.source === 'api').length;
  const citizenCount = events.filter(e => e.source === 'citizen').length;

  const severeCount = events.filter(e => e.severity === 'severe' || e.severity === 'extreme').length;
  const verifiedPct = total > 0 ? Math.round((verifiedCount / total) * 100) : 0;
  const affectedStatesCount = new Set(events.map(e => e.state)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Total Reports & Sources */}
      <div className="matte-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Multi-Source Reports
          </span>
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
            <Database className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white font-sans">{total}</span>
          <span className="text-[11px] text-emerald-400 font-medium">
            Active Feed
          </span>
        </div>

        {/* Breakdown by source */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1" title="Twitter #IMD Posts">
            <Twitter className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-slate-300 text-[11px]">{twitterCount}</span>
          </span>
          <span className="flex items-center space-x-1" title="Open-Meteo Weather API Telemetry">
            <Radio className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-slate-300 text-[11px]">{apiCount}</span>
          </span>
          <span className="flex items-center space-x-1" title="Citizen Crowd Reports">
            <Users className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-slate-300 text-[11px]">{citizenCount}</span>
          </span>
        </div>
      </div>

      {/* Card 2: AI Verification Quality */}
      <div className="matte-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Verification Rate
          </span>
          <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-emerald-400 font-sans">{verifiedPct}%</span>
          <span className="text-xs text-slate-400">
            ({verifiedCount} Verified)
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${total ? (verifiedCount / total) * 100 : 0}%` }} 
              className="bg-emerald-500 h-full" 
            />
            <div 
              style={{ width: `${total ? (unverifiedCount / total) * 100 : 0}%` }} 
              className="bg-amber-500 h-full" 
            />
            <div 
              style={{ width: `${total ? (flaggedCount / total) * 100 : 0}%` }} 
              className="bg-rose-500 h-full" 
            />
            <div 
              style={{ width: `${total ? (duplicateCount / total) * 100 : 0}%` }} 
              className="bg-purple-500 h-full" 
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>{verifiedCount} Ver</span>
            <span>{unverifiedCount} Pend</span>
            <span>{flaggedCount} Flag</span>
          </div>
        </div>
      </div>

      {/* Card 3: AI Dedup & Spam Filter */}
      <div className="matte-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            AI Dedup & Spam Filter
          </span>
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
            <CopyCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-200 font-sans">
            {duplicateCount + flaggedCount}
          </span>
          <span className="text-xs text-slate-400">Interceptions</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            <strong className="text-slate-200 font-mono">{duplicateCount}</strong> Duplicates
          </span>
          <span>
            <strong className="text-rose-400 font-mono">{flaggedCount}</strong> Spam/Fake
          </span>
        </div>
      </div>

      {/* Card 4: High Severity Warnings */}
      <div className="matte-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            High Severity Warnings
          </span>
          <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-amber-400 font-sans">{severeCount}</span>
          <span className="text-xs text-slate-400">Alerts</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span><strong className="text-slate-200 font-mono">{affectedStatesCount}</strong> Active States</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
            Watch / Alert
          </span>
        </div>
      </div>

    </div>
  );
};
