import { WeatherEvent, VerificationStatus } from '../types/weather';
import { INITIAL_WEATHER_EVENTS } from '../data/initialEvents';
import { evaluateEventRules } from './processingEngine';

const STORAGE_KEY = 'blure_weather_events_v1';
const ADMIN_AUTH_KEY = 'blure_admin_auth_v1';

export function getStoredEvents(): WeatherEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WEATHER_EVENTS));
      return INITIAL_WEATHER_EVENTS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse stored events, resetting to defaults:', e);
    return INITIAL_WEATHER_EVENTS;
  }
}

export function saveEvents(events: WeatherEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    // Trigger storage event for cross-component reactive sync
    window.dispatchEvent(new CustomEvent('blure_events_updated', { detail: events }));
  } catch (e) {
    console.error('Failed to save events to localStorage:', e);
  }
}

export function addEventWithProcessing(
  rawEvent: Omit<WeatherEvent, 'id' | 'verificationStatus' | 'confidenceScore'> & {
    id?: string;
  }
): { event: WeatherEvent; isDuplicate: boolean; isFlagged: boolean; flagReason?: string } {
  const currentEvents = getStoredEvents();
  
  const ruleResult = evaluateEventRules(
    {
      text: `${rawEvent.title} ${rawEvent.description} ${rawEvent.rawText || ''}`,
      category: rawEvent.category,
      latitude: rawEvent.latitude,
      longitude: rawEvent.longitude,
      timestamp: rawEvent.timestamp,
      source: rawEvent.source,
      isOfficialSource: rawEvent.isOfficialSource
    },
    currentEvents
  );

  const newId = rawEvent.id || `evt-${rawEvent.source.slice(0, 3)}-${Date.now()}`;
  
  const fullEvent: WeatherEvent = {
    ...rawEvent,
    id: newId,
    verificationStatus: ruleResult.initialStatus,
    confidenceScore: ruleResult.confidence,
    aiClassificationCategory: ruleResult.suggestedCategory,
    aiClassificationConfidence: ruleResult.confidence,
    flagReason: ruleResult.flagReason,
    mergedWithId: ruleResult.matchedEventId,
    duplicateCount: ruleResult.isDuplicate ? 1 : 0
  };

  // If duplicate, also increment duplicate count on the parent event
  let updatedList = [fullEvent, ...currentEvents];
  if (ruleResult.isDuplicate && ruleResult.matchedEventId) {
    updatedList = updatedList.map(e => {
      if (e.id === ruleResult.matchedEventId) {
        return { ...e, duplicateCount: (e.duplicateCount || 0) + 1 };
      }
      return e;
    });
  }

  saveEvents(updatedList);
  return {
    event: fullEvent,
    isDuplicate: ruleResult.isDuplicate,
    isFlagged: ruleResult.isFlagged,
    flagReason: ruleResult.flagReason
  };
}

export function updateEventStatus(
  eventId: string,
  newStatus: VerificationStatus,
  flagReason?: string
): WeatherEvent[] {
  const events = getStoredEvents();
  const updated = events.map(e => {
    if (e.id === eventId) {
      return {
        ...e,
        verificationStatus: newStatus,
        flagReason: flagReason || e.flagReason,
        confidenceScore: newStatus === 'verified' ? 95 : newStatus === 'flagged' ? 20 : e.confidenceScore
      };
    }
    return e;
  });
  saveEvents(updated);
  return updated;
}

export function deleteEvent(eventId: string): WeatherEvent[] {
  const events = getStoredEvents();
  const updated = events.filter(e => e.id !== eventId);
  saveEvents(updated);
  return updated;
}

export function resetToSeedData(): WeatherEvent[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WEATHER_EVENTS));
  window.dispatchEvent(new CustomEvent('blure_events_updated', { detail: INITIAL_WEATHER_EVENTS }));
  return INITIAL_WEATHER_EVENTS;
}

export function exportEventsAsJson(events: WeatherEvent[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `cloudnet_weather_dataset_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportEventsAsCsv(events: WeatherEvent[]): void {
  const headers = ['ID', 'Timestamp', 'City', 'State', 'Latitude', 'Longitude', 'Category', 'Severity', 'Source', 'VerificationStatus', 'ConfidenceScore', 'Title', 'FlagReason'];
  
  const rows = events.map(e => [
    `"${e.id}"`,
    `"${e.timestamp}"`,
    `"${e.city}"`,
    `"${e.state}"`,
    e.latitude,
    e.longitude,
    `"${e.category}"`,
    `"${e.severity}"`,
    `"${e.source}"`,
    `"${e.verificationStatus}"`,
    e.confidenceScore,
    `"${e.title.replace(/"/g, '""')}"`,
    `"${(e.flagReason || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodeURI(csvContent));
  downloadAnchor.setAttribute('download', `cloudnet_weather_records_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function getAdminAuthState(): boolean {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthState(isAuthed: boolean): void {
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, isAuthed ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to store admin auth:', e);
  }
}
