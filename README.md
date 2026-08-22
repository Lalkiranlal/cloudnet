# CloudNet ☁️
### National IMD Weather Monitoring, Multi-Source Ingestion & AI Verification Platform

**CloudNet** is an intelligent, multi-source weather incident aggregator and verification platform built to track extreme weather events across India in compliance with India Meteorological Department (IMD) guidelines.

---

## 🌟 Key Features

1. **Multi-Source Ingestion**:
   - **Twitter / X Stream**: Ingestion pipeline tracking `#IMD`, `#WeatherAlert`, `#MumbaiRains`, `#CycloneAlert`, `#Monsoon2026`.
   - **Open-Meteo Synoptic API**: Real-time telemetry (Temperature, Humidity, Rain Rate, Wind Speed, Gusts, Pressure) across Indian weather stations.
   - **Citizen Crowdsourcing**: GPS-enabled incident submission with auto-location, category selection, severity grading, and photo evidence.

2. **Automated AI & Rule-Based Processing**:
   - **Spatial-Temporal Duplicate Detection**: Haversine formula clustering (18 km radius & 4-hour window).
   - **Spam & Fraud Interception**: Indian geographic bounding-box validation ($5^\circ\text{N} - 38^\circ\text{N}, 67^\circ\text{E} - 99^\circ\text{E}$) and spam keyword filtering.
   - **7 IMD Disaster Categories**: NLP classifier for *Rainfall, Thunderstorm, Flooding, Heatwave, Fog, Dust Storm, Strong Wind*.

3. **Public Dashboard & Interactive Map**:
   - Leaflet dark cartographic map with category-coded pins & pulse rings.
   - 5-Way Filtering: Date Range, 7 Categories, State/City selector, Verification Status, and Source.
   - Real-time Chart.js Analytics: 24h temporal trends, category distribution doughnut, and top affected states.

4. **Admin Operational Verification Console**:
   - Protected officer access (Default PIN: `admin123`).
   - 1-click status updates: `Verify`, `Flag Spam`, `Mark Duplicate`, `Delete`.
   - 1-click dataset export to CSV and JSON.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/Lalkiranlal/cloudnet.git
cd cloudnet

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## ⚡ Deployment to Vercel

This repository includes `vercel.json` optimized for zero-config Vercel deployment:

```bash
npx vercel
```
Or import directly via [Vercel Dashboard](https://vercel.com/new).

---

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Matte Navy theme), Lucide Icons
- **Mapping**: Leaflet.js
- **Data Visualization**: Chart.js & React-Chartjs-2
- **APIs**: Open-Meteo Weather API
