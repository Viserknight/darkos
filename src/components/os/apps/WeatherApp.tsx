import { useState } from "react";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  MapPin
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
  wind: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  icon: React.ReactNode;
  gradient: string;
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: React.ReactNode;
}

const weatherData: WeatherData = {
  location: "Cosmic Station Alpha",
  temperature: 22,
  condition: "Partly Cloudy",
  high: 26,
  low: 18,
  humidity: 65,
  wind: 12,
  visibility: 10,
  pressure: 1013,
  sunrise: "06:42",
  sunset: "19:15",
  icon: <Cloud className="w-20 h-20" />,
  gradient: "from-blue-500 via-purple-500 to-indigo-600",
};

const forecast: ForecastDay[] = [
  { day: "Mon", high: 24, low: 17, condition: "Sunny", icon: <Sun className="w-8 h-8" /> },
  { day: "Tue", high: 23, low: 16, condition: "Cloudy", icon: <Cloud className="w-8 h-8" /> },
  { day: "Wed", high: 20, low: 14, condition: "Rain", icon: <CloudRain className="w-8 h-8" /> },
  { day: "Thu", high: 18, low: 12, condition: "Rain", icon: <CloudRain className="w-8 h-8" /> },
  { day: "Fri", high: 21, low: 15, condition: "Cloudy", icon: <Cloud className="w-8 h-8" /> },
  { day: "Sat", high: 25, low: 18, condition: "Sunny", icon: <Sun className="w-8 h-8" /> },
  { day: "Sun", high: 27, low: 20, condition: "Sunny", icon: <Sun className="w-8 h-8" /> },
];

const hourlyForecast = [
  { time: "Now", temp: 22, icon: <Cloud className="w-5 h-5" /> },
  { time: "14:00", temp: 24, icon: <Sun className="w-5 h-5" /> },
  { time: "15:00", temp: 25, icon: <Sun className="w-5 h-5" /> },
  { time: "16:00", temp: 26, icon: <Sun className="w-5 h-5" /> },
  { time: "17:00", temp: 24, icon: <Cloud className="w-5 h-5" /> },
  { time: "18:00", temp: 22, icon: <Cloud className="w-5 h-5" /> },
  { time: "19:00", temp: 20, icon: <Cloud className="w-5 h-5" /> },
  { time: "20:00", temp: 19, icon: <Cloud className="w-5 h-5" /> },
];

const WeatherApp = () => {
  return (
    <div className="h-full flex flex-col bg-background/50">
      <ScrollArea className="flex-1">
        {/* Current Weather */}
        <div className={`p-6 bg-gradient-to-br ${weatherData.gradient}`}>
          <div className="flex items-center gap-1 text-white/80 text-sm mb-2">
            <MapPin className="w-4 h-4" />
            {weatherData.location}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-7xl font-light text-white">
                {weatherData.temperature}°
              </div>
              <div className="text-white/80 text-lg mt-1">{weatherData.condition}</div>
              <div className="text-white/60 text-sm mt-1">
                H:{weatherData.high}° L:{weatherData.low}°
              </div>
            </div>
            <div className="text-white/80">
              {weatherData.icon}
            </div>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-3">Hourly Forecast</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {hourlyForecast.map((hour, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-2 min-w-[60px] p-3 rounded-xl ${
                  index === 0 ? "glass" : ""
                }`}
              >
                <span className="text-xs text-muted-foreground">{hour.time}</span>
                <div className="text-foreground">{hour.icon}</div>
                <span className="text-sm font-medium text-foreground">{hour.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-3">7-Day Forecast</h3>
          <div className="space-y-3">
            {forecast.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <span className="w-12 text-sm text-foreground">{day.day}</span>
                <div className="flex items-center gap-3 flex-1 justify-center">
                  <div className="text-foreground">{day.icon}</div>
                  <span className="text-xs text-muted-foreground w-16">{day.condition}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground">{day.high}°</span>
                  <div className="w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-orange-400" />
                  <span className="text-muted-foreground">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Details */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Thermometer className="w-4 h-4" />
                FEELS LIKE
              </div>
              <div className="text-2xl font-medium text-foreground">21°</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Droplets className="w-4 h-4" />
                HUMIDITY
              </div>
              <div className="text-2xl font-medium text-foreground">{weatherData.humidity}%</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Wind className="w-4 h-4" />
                WIND
              </div>
              <div className="text-2xl font-medium text-foreground">{weatherData.wind} km/h</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Eye className="w-4 h-4" />
                VISIBILITY
              </div>
              <div className="text-2xl font-medium text-foreground">{weatherData.visibility} km</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Gauge className="w-4 h-4" />
                PRESSURE
              </div>
              <div className="text-2xl font-medium text-foreground">{weatherData.pressure} hPa</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <Sunrise className="w-4 h-4" />
                SUNRISE / SUNSET
              </div>
              <div className="text-lg font-medium text-foreground">
                {weatherData.sunrise} / {weatherData.sunset}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default WeatherApp;
