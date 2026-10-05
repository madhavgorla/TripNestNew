import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  CloudDrizzle,
  Droplets,
  Wind,
  Sparkles,
  RefreshCw,
  Thermometer,
  Umbrella,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { DestinationWeather, WeatherForecastDay } from '../../types';
import { api } from '../../services/api';

interface TripWeatherForecastProps {
  destination: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
}

export const TripWeatherForecast: React.FC<TripWeatherForecastProps> = ({
  destination,
  country,
}) => {
  const [weather, setWeather] = useState<DestinationWeather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getWeather(destination);
      if (res.success && res.data) {
        setWeather(res.data);
      } else {
        setError('Unable to load live weather trends.');
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Weather service temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destination) {
      fetchWeatherData();
    }
  }, [destination]);

  // Temperature conversion helper
  const formatTemp = (celsius: number) => {
    if (unit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  // Weather icon mapping
  const renderWeatherIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName?.toLowerCase()) {
      case 'sun':
        return <Sun className={`${className} text-amber-500 animate-spin-slow`} />;
      case 'cloudsun':
        return <CloudSun className={`${className} text-amber-400`} />;
      case 'cloud':
        return <Cloud className={`${className} text-slate-400`} />;
      case 'cloudrain':
        return <CloudRain className={`${className} text-blue-500`} />;
      case 'clouddrizzle':
        return <CloudDrizzle className={`${className} text-cyan-500`} />;
      case 'cloudlightning':
        return <CloudLightning className={`${className} text-purple-500`} />;
      case 'cloudsnow':
        return <CloudSnow className={`${className} text-indigo-300`} />;
      case 'cloudfog':
        return <CloudFog className={`${className} text-slate-400`} />;
      default:
        return <CloudSun className={`${className} text-amber-400`} />;
    }
  };

  // Get UV index descriptor
  const getUvDescriptor = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50' };
    return { text: 'Very High', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50' };
  };

  const selectedDay: WeatherForecastDay | undefined = weather?.forecast?.[selectedDayIndex] || weather?.forecast?.[0];

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-sky-50/30 to-indigo-50/20 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20 transition-all">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xs">
            {weather ? renderWeatherIcon(weather.icon, 'w-5 h-5 text-white') : <CloudSun className="w-5 h-5 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-1.5">
                <span>{destination} Weather Forecast</span>
                {country && (
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    ({country})
                  </span>
                )}
              </h2>
              {weather?.isRealtime && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-Time</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>5-Day Meteorological Trends & Packing Guidance</span>
              {weather?.lastUpdated && (
                <span className="text-[10px] text-slate-400 font-mono">
                  • Updated {weather.lastUpdated}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls: C/F Toggle, Refresh & Collapse */}
        <div className="flex items-center gap-2">
          {/* Celsius / Fahrenheit Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 shadow-2xs">
            <button
              onClick={() => setUnit('C')}
              className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                unit === 'C'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('F')}
              className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                unit === 'F'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              °F
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchWeatherData}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Refresh Live Forecast"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
            title={isCollapsed ? 'Expand Forecast' : 'Collapse Forecast'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="mt-4 space-y-4">
          {loading && !weather ? (
            <div className="flex items-center justify-center py-8 text-xs text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500 mr-2" />
              Fetching live weather trends for {destination}...
            </div>
          ) : error && !weather ? (
            <div className="rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {error}
            </div>
          ) : weather ? (
            <>
              {/* Top Banner: Current Conditions & At-a-Glance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-2xl bg-white/70 p-4 backdrop-blur-md border border-white/60 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-2xs">
                {/* Left: Big Temp & Condition */}
                <div className="md:col-span-5 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-100/70 dark:bg-sky-950/50">
                    {renderWeatherIcon(weather.icon, 'w-10 h-10')}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                        {formatTemp(weather.currentTemp)}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {weather.condition}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Current conditions in {weather.city}
                      {weather.timezone && (
                        <span className="ml-1 text-[11px] text-slate-400">({weather.timezone})</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: 4 Quick Environmental Metrics */}
                <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      <span>Humidity</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {weather.humidity}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <Wind className="w-3.5 h-3.5 text-teal-500" />
                      <span>Wind</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {weather.windSpeed}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <Umbrella className="w-3.5 h-3.5 text-blue-500" />
                      <span>Precipitation</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {weather.precipitationChance ?? 10}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>UV Index</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">
                        {weather.uvIndex ?? 5.2}
                      </span>
                      {weather.uvIndex !== undefined && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${getUvDescriptor(weather.uvIndex).color}`}>
                          {getUvDescriptor(weather.uvIndex).text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-Day Weather Trend Cards Grid */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                    5-Day Weather Trend
                  </span>
                  <span className="text-[11px]">Select any day for personalized packing advice</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {weather.forecast.map((day, idx) => {
                    const isSelected = selectedDayIndex === idx;
                    const precip = day.precipitationChance ?? 10;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`group relative flex flex-col items-center rounded-2xl p-3 text-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-slate-800'
                            : 'border-slate-200/80 bg-white/60 hover:bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        {/* Day & Date Header */}
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {day.day}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {day.date}
                        </span>

                        {/* Weather Icon */}
                        <div className="my-2 flex h-9 w-9 items-center justify-center transition-transform group-hover:scale-110">
                          {renderWeatherIcon(day.icon, 'w-7 h-7')}
                        </div>

                        {/* Condition Name */}
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate w-full">
                          {day.condition}
                        </span>

                        {/* Temp Range Bar */}
                        <div className="mt-2 flex items-baseline gap-1 font-mono text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatTemp(day.tempMax)}
                          </span>
                          <span className="text-[10px] text-slate-400">/</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {formatTemp(day.tempMin)}
                          </span>
                        </div>

                        {/* Rain/Precipitation Badge */}
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                          <Droplets className="w-3 h-3" />
                          <span>{precip}%</span>
                        </div>

                        {/* Selection Indicator Dot */}
                        {isSelected && (
                          <div className="absolute -bottom-1 h-1.5 w-6 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Insight & Packing Advisory Card */}
              {selectedDay && (
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-sky-50/70 p-3.5 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-sky-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                          {selectedDay.day} ({selectedDay.date}) Weather Advisory:
                        </span>
                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          {selectedDay.condition} • High {formatTemp(selectedDay.tempMax)} / Low {formatTemp(selectedDay.tempMin)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedDay.packingTip || 'Pleasant outdoor climate. Comfortable walking shoes and casual layers recommended.'}
                      </p>
                    </div>
                  </div>

                  {/* Day specific highlights */}
                  <div className="flex items-center gap-3 shrink-0 text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/80 dark:border-slate-700/50">
                    <span className="flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-teal-500" />
                      <span>{selectedDay.windSpeed || '12 km/h'}</span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>UV {selectedDay.uvIndex ?? 5.5}</span>
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
