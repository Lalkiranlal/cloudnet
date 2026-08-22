import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Camera, 
  Navigation, 
  CheckCircle2, 
  Send, 
  CloudRain,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventCategory, SeverityLevel, WeatherEvent } from '../types/weather';
import { CATEGORY_CONFIG, INDIAN_STATES, MAJOR_INDIAN_CITIES } from '../data/initialEvents';
import { addEventWithProcessing } from '../services/storage';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: (newEvent: WeatherEvent) => void;
}

const PRESET_DEMO_PHOTOS = [
  { label: 'Flooded Street', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80' },
  { label: 'Heavy Downpour', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80' },
  { label: 'Lightning Storm', url: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=600&auto=format&fit=crop&q=80' },
  { label: 'Dust Storm', url: 'https://images.unsplash.com/photo-1545134969-8debd725b002?w=600&auto=format&fit=crop&q=80' },
];

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  onReportSubmitted
}) => {
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState<EventCategory>('rainfall');
  const [severity, setSeverity] = useState<SeverityLevel>('moderate');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [latitude, setLatitude] = useState<number>(19.0760);
  const [longitude, setLongitude] = useState<number>(72.8777);
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    event: WeatherEvent;
    isDuplicate: boolean;
    isFlagged: boolean;
    flagReason?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);
        setLocationSuccess(true);

        let closest = MAJOR_INDIAN_CITIES[0];
        let minDist = 999999;
        MAJOR_INDIAN_CITIES.forEach(c => {
          const dist = Math.hypot(c.lat - lat, c.lng - lng);
          if (dist < minDist) {
            minDist = dist;
            closest = c;
          }
        });
        if (minDist < 1.5) {
          setCity(closest.name);
          setState(closest.state);
        }
      },
      err => {
        console.warn('GPS Error:', err);
        setIsLocating(false);
        alert('Could not retrieve precise location. Please adjust City and State manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCitySelect = (cityName: string) => {
    setCity(cityName);
    const matched = MAJOR_INDIAN_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (matched) {
      setState(matched.state);
      setLatitude(matched.lat);
      setLongitude(matched.lng);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Please enter a description of the weather event.');
      return;
    }

    const title = `${CATEGORY_CONFIG[category].label} in ${city}`;

    const result = addEventWithProcessing({
      source: 'citizen',
      sourceAuthor: authorName.trim() ? `${authorName.trim()} (Citizen)` : 'Citizen Reporter',
      timestamp: new Date().toISOString(),
      city: city.trim() || 'Unknown City',
      state: state || 'Maharashtra',
      latitude: Number(latitude) || 19.0760,
      longitude: Number(longitude) || 72.8777,
      category,
      severity,
      title,
      description: description.trim(),
      rawText: description.trim(),
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaUrl ? 'image' : 'none'
    });

    setSubmissionResult(result);
    onReportSubmitted(result.event);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleResetModal = () => {
    setSubmissionResult(null);
    setDescription('');
    setMediaUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0d162b] border border-slate-700 rounded-2xl shadow-xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-800 text-sky-400 border border-slate-700">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Submit Weather Observation
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct citizen crowdsource pipeline to IMD
              </p>
            </div>
          </div>

          <button
            onClick={handleResetModal}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {submissionResult ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-semibold text-white">Observation Successfully Logged</h4>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  ID: <strong>{submissionResult.event.id}</strong>
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border text-left text-xs ${
                submissionResult.isDuplicate
                  ? 'bg-purple-950/40 border-purple-800 text-purple-200'
                  : submissionResult.isFlagged
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              }`}>
                <div className="flex items-center space-x-1.5 font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AI Verdict: {submissionResult.event.verificationStatus.toUpperCase()}</span>
                </div>
                
                {submissionResult.isDuplicate && (
                  <p className="text-[11px] text-slate-300">
                    Nearby event detected in {submissionResult.event.city}. Merged into active incident cluster.
                  </p>
                )}

                {submissionResult.isFlagged && (
                  <p className="text-[11px] text-slate-300">
                    Flagged: {submissionResult.flagReason}
                  </p>
                )}

                {!submissionResult.isDuplicate && !submissionResult.isFlagged && (
                  <p className="text-[11px] text-slate-300">
                    Submitted clean. Queued for verification (Score: {submissionResult.event.confidenceScore}%).
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleResetModal}
                  className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors"
                >
                  Done & View Map
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Reporter Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul V."
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full matte-input px-3 py-1.5 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Event Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full matte-input px-3 py-1.5 rounded-lg appearance-none cursor-pointer"
                  >
                    {Object.values(CATEGORY_CONFIG).map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Severity Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'moderate', 'severe', 'extreme'] as SeverityLevel[]).map(lvl => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSeverity(lvl)}
                      className={`py-1.5 rounded-lg text-center font-medium capitalize text-xs transition-colors ${
                        severity === lvl
                          ? lvl === 'extreme' ? 'bg-rose-900 text-rose-200 border border-rose-700'
                          : lvl === 'severe' ? 'bg-amber-900 text-amber-200 border border-amber-700'
                          : 'bg-sky-500 text-slate-950 font-semibold'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 mr-1" /> Location
                  </span>

                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={isLocating}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-[11px] transition-colors cursor-pointer"
                  >
                    <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detecting...' : 'Auto GPS'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => handleCitySelect(e.target.value)}
                      placeholder="City"
                      className="w-full matte-input px-3 py-1.5 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full matte-input px-3 py-1.5 rounded-lg appearance-none cursor-pointer"
                    >
                      {INDIAN_STATES.filter(s => s !== 'All States').map(s => (
                        <option key={s} value={s} className="bg-slate-900 text-slate-100">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div>Lat: <input type="number" step="0.0001" value={latitude} onChange={(e) => setLatitude(parseFloat(e.target.value))} className="w-full matte-input px-2 py-0.5 rounded font-mono mt-0.5" /></div>
                  <div>Lng: <input type="number" step="0.0001" value={longitude} onChange={(e) => setLongitude(parseFloat(e.target.value))} className="w-full matte-input px-2 py-0.5 rounded font-mono mt-0.5" /></div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Observations <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe rain, flood depth, wind gusts, damage or conditions..."
                  className="w-full matte-input px-3 py-1.5 rounded-lg text-xs resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300 font-medium">
                  Photo Evidence (Optional)
                </label>
                
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500">Presets:</span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_DEMO_PHOTOS.map(p => (
                      <button
                        type="button"
                        key={p.label}
                        onClick={() => setMediaUrl(p.url)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          mediaUrl === p.url
                            ? 'bg-slate-800 text-sky-300 border-sky-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {mediaUrl && (
                  <div className="relative rounded-lg overflow-hidden h-20 border border-slate-800 mt-1">
                    <img src={mediaUrl} alt="Evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded hover:bg-slate-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Observation</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
