import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { WeatherEvent, EventCategory, WeatherMood } from '../types/weather';
import { CATEGORY_CONFIG } from '../data/initialEvents';
import { 
  Crosshair, 
  Maximize2, 
  Radio, 
  Sparkles,
  Info
} from 'lucide-react';

interface MapViewProps {
  events: WeatherEvent[];
  selectedEvent: WeatherEvent | null;
  onSelectEvent: (event: WeatherEvent) => void;
  onOpenReportModal: () => void;
  onMoodChange?: (mood: WeatherMood) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onMoodChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [pulseEnabled, setPulseEnabled] = useState<boolean>(true);

  // Initialize Leaflet Map with Light CartoDB Voyager Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.3511148, 78.6677428],
      zoom: 5,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: false
    });

    // Light CartoDB Voyager Basemap for clean, bright, friendly readability
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | IMD Open Data',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when events or pulse state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    events.forEach(event => {
      if (isNaN(event.latitude) || isNaN(event.longitude)) return;

      const config = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.rainfall;
      const isSevere = event.severity === 'severe' || event.severity === 'extreme';
      const isSelected = selectedEvent?.id === event.id;

      // Custom Clean Frosted HTML Marker Pin
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 38px; height: 38px;">
          ${pulseEnabled && isSevere ? `
            <div class="pulse-ring-light absolute rounded-full" style="width: 40px; height: 40px; background-color: ${config.color}; opacity: 0.35;"></div>
          ` : ''}
          <div class="custom-weather-pin relative z-10 flex items-center justify-center rounded-2xl shadow-md transition-transform ${isSelected ? 'scale-125 ring-4 ring-sky-400' : ''}" 
               style="width: 32px; height: 32px; background: #ffffff; border: 2px solid ${config.color}; box-shadow: 0 4px 12px rgba(0,0,0,0.12);">
            <span style="font-size: 16px;">
              ${config.emoji}
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-weather-pin-container',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -19]
      });

      const marker = L.marker([event.latitude, event.longitude], { icon: customIcon });

      // Click Marker -> Center Map, Select Event, and Shift UI Weather Mood!
      marker.on('click', () => {
        onSelectEvent(event);
        if (onMoodChange) {
          onMoodChange(event.category);
        }
      });

      // Build popup content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1.5 font-sans text-slate-800';
      popupDiv.style.minWidth = '240px';
      popupDiv.style.maxWidth = '290px';

      popupDiv.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <span class="text-xs font-bold px-2 py-0.5 rounded-lg flex items-center space-x-1" style="background: ${config.bgHex}; color: ${config.color}; border: 1px solid ${config.color}30;">
            <span>${config.emoji}</span>
            <span>${config.label}</span>
          </span>
          <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
            event.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
            event.verificationStatus === 'flagged' ? 'bg-rose-100 text-rose-800' :
            event.verificationStatus === 'duplicate' ? 'bg-purple-100 text-purple-800' :
            'bg-amber-100 text-amber-800'
          }">
            ${event.verificationStatus}
          </span>
        </div>

        <div class="mt-2">
          <h4 class="text-xs font-bold text-slate-900 leading-snug">${event.title}</h4>
          <p class="text-[11px] text-slate-600 mt-1 line-clamp-2">${event.description}</p>
        </div>

        ${event.mediaUrl ? `
          <div class="mt-2 rounded-xl overflow-hidden border border-slate-200 h-28 w-full">
            <img src="${event.mediaUrl}" alt="${event.category}" class="w-full h-full object-cover" />
          </div>
        ` : ''}

        <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>📍 <strong>${event.city}, ${event.state}</strong></span>
          <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
            ${event.source}
          </span>
        </div>

        <button id="btn-view-intel-${event.id}" class="mt-2.5 w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer">
          <span>View Incident Details</span>
        </button>
      `;

      marker.bindPopup(popupDiv);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-intel-${event.id}`);
        if (btn) {
          btn.onclick = () => onSelectEvent(event);
        }
      });

      marker.addTo(markersGroupRef.current!);
    });
  }, [events, pulseEnabled, selectedEvent, onSelectEvent, onMoodChange]);

  // Center on selected event
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedEvent) return;
    if (!isNaN(selectedEvent.latitude) && !isNaN(selectedEvent.longitude)) {
      mapInstanceRef.current.flyTo([selectedEvent.latitude, selectedEvent.longitude], 10, {
        duration: 1.0
      });
    }
  }, [selectedEvent]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([22.3511148, 78.6677428], 5, { duration: 0.8 });
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 11, { duration: 1.0 });
        }
      },
      err => {
        console.warn('Geolocation error:', err);
        alert('Could not access location.');
      }
    );
  };

  return (
    <div className="relative w-full h-[560px] rounded-3xl overflow-hidden glass-card shadow-lg border border-white/80">
      
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Floating Pill */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl text-xs font-bold text-slate-800 flex items-center space-x-2 border border-slate-200/80 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Interactive Weather Map</span>
          <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
            {events.length} Events
          </span>
        </div>
      </div>

      {/* Bottom Right Floating Action Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-2">
        <button
          onClick={() => setPulseEnabled(!pulseEnabled)}
          className={`p-2.5 rounded-2xl text-xs font-semibold backdrop-blur-md border transition-all shadow-md ${
            pulseEnabled
              ? 'bg-sky-600 text-white border-sky-500'
              : 'bg-white/90 text-slate-700 border-slate-200'
          }`}
          title="Toggle Pulse Waves"
        >
          <Radio className="w-4 h-4" />
        </button>

        <button
          onClick={handleLocateMe}
          className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-sky-600 border border-slate-200 shadow-md transition-all cursor-pointer"
          title="Locate My Position"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          onClick={handleRecenter}
          className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-slate-800 hover:text-sky-600 text-xs font-bold border border-slate-200 shadow-md transition-all cursor-pointer"
          title="Reset Zoom to India"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>India View</span>
        </button>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center space-x-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-md text-xs font-medium text-slate-700">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tap pin to change mood:</span>
        <div className="flex items-center space-x-1"><span>🌧️</span><span>Rain</span></div>
        <div className="flex items-center space-x-1"><span>⚡</span><span>Storm</span></div>
        <div className="flex items-center space-x-1"><span>🌊</span><span>Flood</span></div>
        <div className="flex items-center space-x-1"><span>🔥</span><span>Heat</span></div>
        <div className="flex items-center space-x-1"><span>🌫️</span><span>Fog</span></div>
        <div className="flex items-center space-x-1"><span>🌪️</span><span>Dust</span></div>
        <div className="flex items-center space-x-1"><span>💨</span><span>Wind</span></div>
      </div>

    </div>
  );
};
