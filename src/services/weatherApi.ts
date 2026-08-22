import { WeatherEvent, EventCategory, SeverityLevel } from '../types/weather';
import { MAJOR_INDIAN_CITIES } from '../data/initialEvents';

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    surface_pressure: number;
  };
}

/**
 * Maps WMO weather code to IMD standard category and severity
 */
function mapWmoToCategory(
  code: number,
  tempC: number,
  windKmh: number,
  precipMm: number
): { category: EventCategory; severity: SeverityLevel; description: string } {
  // Extreme heat check
  if (tempC >= 42) {
    return {
      category: 'heatwave',
      severity: tempC >= 45 ? 'extreme' : 'severe',
      description: `Surface thermometer registering ${tempC.toFixed(1)}°C with dry westerly winds.`
    };
  }

  // Strong wind check
  if (windKmh >= 50) {
    return {
      category: 'strong wind',
      severity: windKmh >= 70 ? 'extreme' : 'severe',
      description: `High velocity surface winds gusting at ${windKmh.toFixed(1)} km/h.`
    };
  }

  // Thunderstorm codes: 95, 96, 99
  if ([95, 96, 99].includes(code)) {
    return {
      category: 'thunderstorm',
      severity: 'severe',
      description: `Convective thunder activity with intense lightning bursts and squall fronts.`
    };
  }

  // Fog codes: 45, 48
  if ([45, 48].includes(code)) {
    return {
      category: 'fog',
      severity: 'moderate',
      description: `Atmospheric fog reducing surface horizontal visibility.`
    };
  }

  // Flooding check (high precipitation accumulation)
  if (precipMm > 25) {
    return {
      category: 'flooding',
      severity: 'extreme',
      description: `Excessive localized deluge of ${precipMm.toFixed(1)}mm/hr triggering urban drainage surcharge.`
    };
  }

  // Default rain / showers
  if (precipMm > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      category: 'rainfall',
      severity: precipMm > 15 ? 'severe' : 'moderate',
      description: `Continuous precipitation spells measuring ${precipMm.toFixed(1)}mm.`
    };
  }

  // Default fallback for calm conditions
  return {
    category: 'rainfall',
    severity: 'low',
    description: `Localized meteorological sensor observation: Temp ${tempC.toFixed(1)}°C, Humidity ${precipMm}%.`
  };
}

/**
 * Fetch live current weather from Open-Meteo API for an Indian city
 */
export async function fetchLiveCityWeather(
  cityObj: (typeof MAJOR_INDIAN_CITIES)[0]
): Promise<WeatherEvent | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityObj.lat}&longitude=${cityObj.lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m,surface_pressure&timezone=Asia%2FKolkata`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP error: ${response.status}`);
    }

    const data: OpenMeteoResponse = await response.json();
    const curr = data.current;

    const { category, severity, description } = mapWmoToCategory(
      curr.weather_code,
      curr.temperature_2m,
      curr.wind_gusts_10m || curr.wind_speed_10m,
      curr.precipitation
    );

    const newEvent: WeatherEvent = {
      id: `evt-api-live-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      source: 'api',
      sourceAuthor: `Open-Meteo Telemetry [${cityObj.name.toUpperCase()}]`,
      isOfficialSource: true,
      timestamp: new Date().toISOString(),
      city: cityObj.name,
      state: cityObj.state,
      latitude: cityObj.lat,
      longitude: cityObj.lng,
      category,
      severity,
      title: `Live IMD Synoptic Feed: ${cityObj.name} (${category.toUpperCase()})`,
      description: `${description} Open-Meteo synoptic station observation at ${cityObj.name}, ${cityObj.state}.`,
      rawText: `SYNOP ${cityObj.name.toUpperCase()} TEMP=${curr.temperature_2m}C HUM=${curr.relative_humidity_2m}% WIND=${curr.wind_speed_10m}KMH RAIN=${curr.precipitation}MM PRESS=${curr.surface_pressure}HPA`,
      mediaType: 'none',
      verificationStatus: 'verified',
      confidenceScore: 99,
      aiClassificationCategory: category,
      aiClassificationConfidence: 98,
      telemetry: {
        temperatureC: curr.temperature_2m,
        humidityPct: curr.relative_humidity_2m,
        windSpeedKmh: curr.wind_speed_10m,
        precipitationMm: curr.precipitation,
        pressureHpa: curr.surface_pressure
      }
    };

    return newEvent;
  } catch (error) {
    console.warn(`Could not fetch live Open-Meteo weather for ${cityObj.name}:`, error);
    return null;
  }
}

/**
 * Generator for live simulated Twitter/X #IMD posts to demo real-time stream
 */
const TWEET_TEMPLATES = [
  {
    author: 'Mumbai Rain Alert',
    handle: '@MumbaiRainsLive',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    category: 'rainfall' as EventCategory,
    severity: 'severe' as SeverityLevel,
    text: 'Heavy monsoon downpour lashed Dadar and Kurla. Visibility down on Western Express Highway. #IMD warns of red alert! #MumbaiRains',
    media: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80'
  },
  {
    author: 'Delhi Weather Monitor',
    handle: '@DelhiWeatherGov',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    category: 'thunderstorm' as EventCategory,
    severity: 'severe' as SeverityLevel,
    text: 'Sudden squall and severe thunderstorm hit Central Delhi and Connaught Place. Lightning bolts spotted! #IMD #DelhiWeather #Lightning',
    media: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=600&auto=format&fit=crop&q=80'
  },
  {
    author: 'Rajasthan Sky Tracker',
    handle: '@DesertWeatherIn',
    city: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    category: 'dust storm' as EventCategory,
    severity: 'severe' as SeverityLevel,
    text: 'Sudden high velocity dust storm (Andhi) sweeping across Jaipur bypass. Yellow skies and 60 km/h wind gusts. #IMD #Jaipur #DustStorm',
    media: 'https://images.unsplash.com/photo-1545134969-8debd725b002?w=600&auto=format&fit=crop&q=80'
  },
  {
    author: 'Assam Disaster News',
    handle: '@AssamDisasterMgmt',
    city: 'Guwahati',
    state: 'Assam',
    lat: 26.1445,
    lng: 91.7362,
    category: 'strong wind' as EventCategory,
    severity: 'extreme' as SeverityLevel,
    text: 'Severe cyclonic storm winds measuring 75 km/h recorded along Brahmaputra riverbanks. River navigation suspended. #IMD #AssamStorm',
    media: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=600&auto=format&fit=crop&q=80'
  }
];

export function generateSimulatedTweet(): WeatherEvent {
  const t = TWEET_TEMPLATES[Math.floor(Math.random() * TWEET_TEMPLATES.length)];
  // Add small random coordinate jitter (~2-5km)
  const jitterLat = (Math.random() - 0.5) * 0.05;
  const jitterLng = (Math.random() - 0.5) * 0.05;

  return {
    id: `evt-tw-live-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    source: 'twitter',
    sourceAuthor: t.author,
    sourceHandle: t.handle,
    isOfficialSource: false,
    timestamp: new Date().toISOString(),
    city: t.city,
    state: t.state,
    latitude: t.lat + jitterLat,
    longitude: t.lng + jitterLng,
    category: t.category,
    severity: t.severity,
    title: `Live Twitter Stream (#IMD): ${t.city} ${t.category.toUpperCase()}`,
    description: t.text,
    rawText: t.text,
    hashtags: ['#IMD', `#${t.city}Weather`, `#${t.category.replace(' ', '')}`],
    mediaUrl: t.media,
    mediaType: 'image',
    verificationStatus: 'unverified',
    confidenceScore: 78,
    aiClassificationCategory: t.category,
    aiClassificationConfidence: 88
  };
}
