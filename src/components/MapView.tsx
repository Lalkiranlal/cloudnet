import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { WeatherEvent } from '../types/weather';
import { CATEGORY_CONFIG } from '../data/initialEvents';
import { 
  Crosshair, 
  Maximize2, 
  Radio
} from 'lucide-react';

interface MapViewProps {
  events: WeatherEvent[];
  selectedEvent: WeatherEvent | null;
  onSelectEvent: (event: WeatherEvent) => void;
  onOpenReportModal: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  events,
  selectedEvent,
  onSelectEvent
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [pulseEnabled, setPulseEnabled] = useState<boolean>(true);

  // Initialize Map
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

    // Clean Dark Map Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
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

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    events.forEach(event => {
      if (isNaN(event.latitude) || isNaN(event.longitude)) return;

      const config = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.rainfall;
      const isSevere = event.severity === 'severe' || event.severity === 'extreme';
      const isSelected = selectedEvent?.id === event.id;

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
          ${pulseEnabled && isSevere ? `
            <div class="pulse-ring absolute rounded-full" style="width: 34px; height: 34px; background-color: ${config.color}; opacity: 0.35;"></div>
          ` : ''}
          <div class="weather-marker-pin relative z-10 flex items-center justify-center rounded-full transition-transform ${isSelected ? 'scale-125' : ''}" 
               style="width: 28px; height: 28px; background: #0b1325; border: 2px solid ${config.color};">
            <span style="font-size: 13px;">
              ${event.category === 'rainfall' ? '🌧' :
                event.category === 'thunderstorm' ? '⚡' :
                event.category === 'flooding' ? '🌊' :
                event.category === 'heatwave' ? '🔥' :
                event.category === 'fog' ? '🌫' :
                event.category === 'dust storm' ? '🌪' : '💨'}
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-weather-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([event.latitude, event.longitude], { icon: customIcon });

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 text-slate-200 text-xs font-sans';
      popupDiv.style.minWidth = '230px';
      popupDiv.style.maxWidth = '280px';

      popupDiv.innerHTML = `
        <div class="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span class="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded" style="background: rgba(255,255,255,0.06); color: ${config.color}; border: 1px solid rgba(255,255,255,0.1);">
            ${config.label}
          </span>
          <span class="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded ${
            event.verificationStatus === 'verified' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
            event.verificationStatus === 'flagged' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
            event.verificationStatus === 'duplicate' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
            'bg-amber-950 text-amber-400 border border-amber-800'
          }">
            ${event.verificationStatus}
          </span>
        </div>

        <div class="mt-2">
          <h4 class="text-xs font-semibold text-white leading-tight">${event.title}</h4>
          <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">${event.description}</p>
        </div>

        ${event.mediaUrl ? `
          <div class="mt-2 rounded-lg overflow-hidden border border-slate-800 h-24 w-full">
            <img src="${event.mediaUrl}" alt="${event.category}" class="w-full h-full object-cover" />
          </div>
        ` : ''}

        <div class="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>📍 <strong class="text-slate-200">${event.city}, ${event.state}</strong></span>
          <span class="font-mono text-slate-400 uppercase">${event.source}</span>
        </div>

        <button id="btn-view-intel-${event.id}" class="mt-2.5 w-full py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-colors flex items-center justify-center cursor-pointer">
          <span>View Incident Intel</span>
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
  }, [events, pulseEnabled, selectedEvent, onSelectEvent]);

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
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden matte-card border border-slate-800 shadow-md">
      
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Badge */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col space-y-2">
        <div className="bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-md text-xs font-medium text-slate-300 flex items-center space-x-2 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Synoptic Radar View</span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
            {events.length} Pins
          </span>
        </div>
      </div>

      {/* Bottom Right Controls */}
      <div className="absolute bottom-3.5 right-3.5 z-10 flex items-center space-x-2">
        <button
          onClick={() => setPulseEnabled(!pulseEnabled)}
          className={`p-2 rounded-lg text-xs border transition-colors ${
            pulseEnabled
              ? 'bg-slate-800 text-sky-300 border-slate-700'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title="Toggle Pulse Animations"
        >
          <Radio className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleLocateMe}
          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm"
          title="Locate My Position"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleRecenter}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 hover:border-slate-700 transition-colors shadow-sm"
          title="Reset Zoom"
        >
          <Maximize2 className="w-3 h-3" />
          <span>India View</span>
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3.5 left-3.5 z-10 hidden sm:flex items-center space-x-3 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px]">
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          <span className="text-slate-300">Rain</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span className="text-slate-300">Storm</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span className="text-slate-300">Flood</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
          <span className="text-slate-300">Heat</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span className="text-slate-300">Fog</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="text-slate-300">Dust</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span className="text-slate-300">Wind</span>
        </div>
      </div>

    </div>
  );
};
