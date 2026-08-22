import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  AlertTriangle, 
  CopyCheck, 
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Twitter } from './icons/TwitterIcon';
import { WeatherEvent } from '../types/weather';
import { generateSimulatedTweet, fetchLiveCityWeather } from '../services/weatherApi';
import { MAJOR_INDIAN_CITIES } from '../data/initialEvents';
import { addEventWithProcessing } from '../services/storage';

interface SimulationControlsProps {
  onNewEvent: (event: WeatherEvent, msg: string) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ onNewEvent }) => {
  const [autoStreamActive, setAutoStreamActive] = useState<boolean>(false);
  const [isFetchingApi, setIsFetchingApi] = useState<boolean>(false);

  useEffect(() => {
    if (!autoStreamActive) return;

    const interval = setInterval(() => {
      const tweet = generateSimulatedTweet();
      const result = addEventWithProcessing(tweet);
      onNewEvent(result.event, `Ingested: ${result.event.city}`);
    }, 12000);

    return () => clearInterval(interval);
  }, [autoStreamActive, onNewEvent]);

  const handleSimulateTweet = () => {
    const tweet = generateSimulatedTweet();
    const result = addEventWithProcessing(tweet);
    onNewEvent(result.event, `Twitter #IMD Post: ${result.event.city}`);
  };

  const handleFetchOpenMeteo = async () => {
    setIsFetchingApi(true);
    const randomCity = MAJOR_INDIAN_CITIES[Math.floor(Math.random() * MAJOR_INDIAN_CITIES.length)];
    
    try {
      const liveData = await fetchLiveCityWeather(randomCity);
      if (liveData) {
        const result = addEventWithProcessing(liveData);
        onNewEvent(result.event, `Telemetry: ${randomCity.name} (${liveData.telemetry?.temperatureC}°C)`);
      } else {
        alert('Could not connect to Open-Meteo API.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingApi(false);
    }
  };

  const handleTriggerDuplicate = () => {
    const result = addEventWithProcessing({
      source: 'citizen',
      sourceAuthor: 'Rohan (Duplicate Test)',
      timestamp: new Date().toISOString(),
      city: 'Mumbai',
      state: 'Maharashtra',
      latitude: 19.0790,
      longitude: 72.8790,
      category: 'rainfall',
      severity: 'severe',
      title: 'Water rising near Dadar station',
      description: 'Heavy rainfall in Dadar, roads flooded near market.',
      rawText: 'Heavy rain in Dadar #MumbaiRains'
    });

    onNewEvent(result.event, `Duplicate engine: Merged into active ${result.event.city} cluster.`);
  };

  const handleTriggerSpam = () => {
    const result = addEventWithProcessing({
      source: 'twitter',
      sourceAuthor: 'CryptoBotSpam',
      sourceHandle: '@FreeCoinsPromo',
      timestamp: new Date().toISOString(),
      city: 'Kolkata',
      state: 'West Bengal',
      latitude: 22.5726,
      longitude: 88.3639,
      category: 'thunderstorm',
      severity: 'low',
      title: 'Suspicious promotional post',
      description: 'Earn free crypto online! Click bit.ly/giveaway for free bitcoin while it rains in Kolkata! #IMD',
      rawText: 'Earn free crypto online! Click bit.ly/giveaway for free bitcoin while it rains in Kolkata! #IMD'
    });

    onNewEvent(result.event, `AI Spam Guard: Intercepted and flagged.`);
  };

  return (
    <div className="matte-card p-3 rounded-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      
      {/* Title */}
      <div className="flex items-center space-x-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-300">
          Evaluation Testbed:
        </span>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Test real-time streams, Open-Meteo API & verification rules
        </span>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        
        <button
          onClick={handleSimulateTweet}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-[11px] transition-colors cursor-pointer"
        >
          <Twitter className="w-3 h-3 text-slate-400" />
          <span>Simulate #IMD Tweet</span>
        </button>

        <button
          onClick={handleFetchOpenMeteo}
          disabled={isFetchingApi}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-[11px] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 text-slate-400 ${isFetchingApi ? 'animate-spin' : ''}`} />
          <span>{isFetchingApi ? 'Querying...' : 'Fetch Open-Meteo API'}</span>
        </button>

        <button
          onClick={handleTriggerDuplicate}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-[11px] transition-colors cursor-pointer"
          title="Test duplicate detection algorithm"
        >
          <CopyCheck className="w-3 h-3 text-slate-400" />
          <span>Test Dedup</span>
        </button>

        <button
          onClick={handleTriggerSpam}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-[11px] transition-colors cursor-pointer"
          title="Test AI fake/spam classification"
        >
          <AlertTriangle className="w-3 h-3 text-slate-400" />
          <span>Test Spam Guard</span>
        </button>

        <button
          onClick={() => setAutoStreamActive(!autoStreamActive)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
            autoStreamActive
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
              : 'bg-slate-850 text-slate-400 border-slate-750 hover:text-slate-200'
          }`}
        >
          {autoStreamActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{autoStreamActive ? 'Live Stream (12s)' : 'Auto Stream'}</span>
        </button>

      </div>

    </div>
  );
};
