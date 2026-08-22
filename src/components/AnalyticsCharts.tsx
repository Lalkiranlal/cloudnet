import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { WeatherEvent, EventCategory } from '../types/weather';
import { CATEGORY_CONFIG } from '../data/initialEvents';
import { TrendingUp, PieChart, BarChart2, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsChartsProps {
  events: WeatherEvent[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ events }) => {
  
  const categoriesList: EventCategory[] = [
    'rainfall',
    'thunderstorm',
    'flooding',
    'heatwave',
    'fog',
    'dust storm',
    'strong wind'
  ];

  const categoryCounts = categoriesList.map(cat => 
    events.filter(e => e.category === cat).length
  );

  const categoryLabels = categoriesList.map(cat => CATEGORY_CONFIG[cat].label);
  const categoryColors = [
    '#38bdf8', // rainfall
    '#c084fc', // thunderstorm
    '#60a5fa', // flooding
    '#fb923c', // heatwave
    '#94a3b8', // fog
    '#facc15', // dust storm
    '#2dd4bf', // strong wind
  ];

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryCounts,
        backgroundColor: categoryColors,
        borderColor: '#0d162b',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter, sans-serif' },
          boxWidth: 10,
          padding: 8
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        padding: 8
      }
    }
  };

  // Top Affected States (Horizontal Bar)
  const stateCounts: Record<string, number> = {};
  events.forEach(e => {
    stateCounts[e.state] = (stateCounts[e.state] || 0) + 1;
  });

  const sortedStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const barData = {
    labels: sortedStates.map(s => s[0]),
    datasets: [
      {
        label: 'Weather Incidents Recorded',
        data: sortedStates.map(s => s[1]),
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        borderColor: '#38bdf8',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1'
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10, family: 'monospace' } }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#cbd5e1', font: { size: 11, family: 'Inter' } }
      }
    }
  };

  // 24-Hour Incident Time-Series Trend
  const timeLabels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  const trendData = [3, 5, 8, 14, 18, 22, 19, events.length];

  const lineData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Hourly Incident Ingestion Rate',
        data: trendData,
        fill: true,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.08)',
        tension: 0.3,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#0d162b',
        pointBorderWidth: 2,
        pointRadius: 3
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1'
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10, family: 'monospace' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10, family: 'monospace' } }
      }
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header Banner */}
      <div className="matte-card p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white">
              Meteorological Trend & Geographic Distribution Analytics
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Aggregation across 7 IMD disaster categories and Indian geographic regions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
            Dataset: <strong className="text-sky-400 font-mono">{events.length}</strong>
          </div>
        </div>
      </div>

      {/* Grid of 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Chart 1: Category Breakdown Doughnut */}
        <div className="lg:col-span-6 matte-card p-4 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <PieChart className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Category Breakdown (7 Types)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Distribution
            </span>
          </div>

          <div className="h-60 relative flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Chart 2: Top Affected States Bar Chart */}
        <div className="lg:col-span-6 matte-card p-4 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Top Affected States & Hotspots
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Ranked
            </span>
          </div>

          <div className="h-60 relative">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Chart 3: 24h Trendline Full Width */}
        <div className="lg:col-span-12 matte-card p-4 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                24-Hour Temporal Ingestion Pattern
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.2 rounded border border-slate-800">
              Diurnal Cycle
            </span>
          </div>

          <div className="h-52 relative">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

      </div>

    </div>
  );
};
