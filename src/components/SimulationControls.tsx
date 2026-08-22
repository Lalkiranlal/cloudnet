import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  AlertTriangle, 
  CopyCheck, 
  RefreshCw,
  Sparkles,
  Sliders
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
      onNewEvent(result.event, `Live Twitter Post: ${result.event.city}`);
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
        onNewEvent(result.event, `Open-Meteo Live Synop: ${randomCity.name} (${liveData.telemetry?.temperatureC}°C)`);
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
    <div className="glass-card p-3 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      
      {/* Title */}
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-slate-900">
            Live Stream Testbed:
          </span>
          <span className="text-[11px] text-slate-500 ml-1.5 hidden sm:inline">
            Test live Twitter #IMD tweets, Open-Meteo sensors, and AI filters
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        
        <button
          onClick={handleSimulateTweet}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Twitter className="w-3.5 h-3.5 text-sky-500" />
          <span>Simulate #IMD Tweet</span>
        </button>

        <button
          onClick={handleFetchOpenMeteo}
          disabled={isFetchingApi}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isFetchingApi ? 'animate-spin' : ''}`} />
          <span>{isFetchingApi ? 'Querying...' : 'Fetch Live Weather API'}</span>
        </button>

        <button
          onClick={handleTriggerDuplicate}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
          title="Test duplicate detection algorithm"
        >
          <CopyCheck className="w-3.5 h-3.5 text-purple-600" />
          <span>Test Dedup</span>
        </button>

        <button
          onClick={handleTriggerSpam}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
          title="Test AI fake/spam classification"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Test Spam Guard</span>
        </button>

        <button
          onClick={() => setAutoStreamActive(!autoStreamActive)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
            autoStreamActive
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {autoStreamActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{autoStreamActive ? 'Live Stream Active (12s)' : 'Auto Stream'}</span>
        </button>

      </div>

    </div>
  );
};
