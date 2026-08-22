import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CopyCheck, 
  Trash2, 
  Search, 
  Download, 
  CheckCircle, 
  Eye, 
  Lock, 
  RotateCcw
} from 'lucide-react';
import { WeatherEvent, VerificationStatus } from '../types/weather';
import { CATEGORY_CONFIG } from '../data/initialEvents';
import { 
  updateEventStatus, 
  deleteEvent, 
  exportEventsAsCsv, 
  exportEventsAsJson,
  resetToSeedData
} from '../services/storage';

interface AdminPanelProps {
  events: WeatherEvent[];
  setEvents: React.Dispatch<React.SetStateAction<WeatherEvent[]>>;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (authed: boolean) => void;
  onOpenLoginModal: () => void;
  onInspectEvent: (event: WeatherEvent) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  events,
  setEvents,
  isAdminAuthenticated,
  onOpenLoginModal,
  onInspectEvent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'confidence' | 'severity'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (!isAdminAuthenticated) {
    return (
      <div className="matte-card p-10 rounded-2xl text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center mx-auto border border-slate-700">
          <Lock className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">
            Operational Verification Console
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Authorized IMD officers only. Enter PIN to triage unverified citizen reports and confirm alerts.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onOpenLoginModal}
            className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
          >
            Unlock Console (PIN: admin123)
          </button>
        </div>
      </div>
    );
  }

  const handleVerify = (id: string) => {
    const updated = updateEventStatus(id, 'verified');
    setEvents(updated);
  };

  const handleFlag = (id: string) => {
    const reason = prompt('Enter flag/spam reason:', 'Failed meteorological corroboration or suspicious content.');
    if (reason !== null) {
      const updated = updateEventStatus(id, 'flagged', reason);
      setEvents(updated);
    }
  };

  const handleDuplicate = (id: string) => {
    const updated = updateEventStatus(id, 'duplicate');
    setEvents(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this event record?')) {
      const updated = deleteEvent(id);
      setEvents(updated);
    }
  };

  const handleResetData = () => {
    if (confirm('Reset database to default seed weather dataset?')) {
      const reset = resetToSeedData();
      setEvents(reset);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.sourceAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || e.verificationStatus === statusFilter;
    const matchesSource = sourceFilter === 'all' || e.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  }).sort((a, b) => {
    if (sortBy === 'time') {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? tB - tA : tA - tB;
    } else if (sortBy === 'confidence') {
      return sortOrder === 'desc' ? b.confidenceScore - a.confidenceScore : a.confidenceScore - b.confidenceScore;
    } else {
      const sevOrder = { extreme: 4, severe: 3, moderate: 2, low: 1 };
      const sA = sevOrder[a.severity] || 0;
      const sB = sevOrder[b.severity] || 0;
      return sortOrder === 'desc' ? sB - sA : sA - sB;
    }
  });

  const verifiedTotal = events.filter(e => e.verificationStatus === 'verified').length;
  const unverifiedTotal = events.filter(e => e.verificationStatus === 'unverified').length;
  const flaggedTotal = events.filter(e => e.verificationStatus === 'flagged').length;

  return (
    <div className="space-y-4">
      
      {/* Header & Export Actions */}
      <div className="matte-card p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white">
              Incident Verification & Moderation Console
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Audit queue for verifying crowdsourced observations and social media signals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => exportEventsAsCsv(filteredEvents)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportEventsAsJson(filteredEvents)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors"
            title="Reset Database"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Triage Status Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            statusFilter === 'all'
              ? 'bg-slate-800 border-sky-500/50 text-white'
              : 'matte-card text-slate-400 hover:bg-slate-850'
          }`}
        >
          <div className="text-[10px] uppercase font-medium">All Records</div>
          <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">{events.length}</div>
        </button>

        <button
          onClick={() => setStatusFilter('unverified')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            statusFilter === 'unverified'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'matte-card text-slate-400 hover:bg-slate-850'
          }`}
        >
          <div className="text-[10px] text-amber-400 uppercase font-medium">Pending Triage</div>
          <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">{unverifiedTotal}</div>
        </button>

        <button
          onClick={() => setStatusFilter('verified')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            statusFilter === 'verified'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'matte-card text-slate-400 hover:bg-slate-850'
          }`}
        >
          <div className="text-[10px] text-emerald-400 uppercase font-medium">Verified</div>
          <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">{verifiedTotal}</div>
        </button>

        <button
          onClick={() => setStatusFilter('flagged')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            statusFilter === 'flagged'
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              : 'matte-card text-slate-400 hover:bg-slate-850'
          }`}
        >
          <div className="text-[10px] text-rose-400 uppercase font-medium">Flagged Spam</div>
          <div className="text-lg font-bold font-mono text-rose-300 mt-0.5">{flaggedTotal}</div>
        </button>
      </div>

      {/* Table Search & Controls */}
      <div className="matte-card p-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, city, author or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full matte-input pl-9 pr-3 py-1.5 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center space-x-2.5 text-xs">
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="matte-input px-2 py-1 rounded text-xs appearance-none cursor-pointer"
            >
              <option value="time" className="bg-slate-900">Timestamp</option>
              <option value="confidence" className="bg-slate-900">Confidence Score</option>
              <option value="severity" className="bg-slate-900">Severity</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs"
          >
            {sortOrder === 'desc' ? '↓ New' : '↑ Old'}
          </button>
        </div>
      </div>

      {/* High-Density Moderation Data Table */}
      <div className="matte-card rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3.5">Event & ID</th>
                <th className="py-2.5 px-3">Location & Time</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">AI Score</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 text-xs">
                    No reports match moderation filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => {
                  const config = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.rainfall;

                  return (
                    <tr key={event.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-2.5 px-3.5 max-w-xs">
                        <div className="font-mono text-[10px] text-sky-400">{event.id}</div>
                        <div className="font-medium text-slate-100 truncate mt-0.5">
                          {event.title}
                        </div>
                        {event.flagReason && (
                          <div className="text-[10px] text-rose-400 mt-0.5 line-clamp-1 italic">
                            ⚠️ {event.flagReason}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-200">{event.city}, {event.state}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span 
                          className="px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold"
                          style={{ background: 'rgba(255,255,255,0.06)', color: config.color, border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          {config.label}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="capitalize px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                          {event.source}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-medium ${
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
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-mono text-xs font-semibold text-slate-200">
                          {event.confidenceScore}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onInspectEvent(event)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleVerify(event.id)}
                            className="p-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors"
                            title="Mark Verified"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleFlag(event.id)}
                            className="p-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800 transition-colors"
                            title="Flag Spam"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDuplicate(event.id)}
                            className="p-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-400 border border-purple-800 transition-colors"
                            title="Mark Duplicate"
                          >
                            <CopyCheck className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-1 rounded bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
