import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ClockDisguiseAppProps {
  onSecretCodeEntered?: () => void;
  secretCode?: string;
}

export function ClockDisguiseApp({ 
  onSecretCodeEntered, 
  secretCode = '1234' 
}: ClockDisguiseAppProps) {
  const [time, setTime] = useState(new Date());
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showSeconds, setShowSeconds] = useState(true);
  const [use24Hour, setUse24Hour] = useState(true);
  const [showDigital, setShowDigital] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Secret unlock: Tap center 5 times quickly
  const handleCenterTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime < 500) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 5 && onSecretCodeEntered) {
        onSecretCodeEntered();
        setTapCount(0);
      }
    } else {
      setTapCount(1);
    }
    setLastTapTime(now);
  }, [tapCount, lastTapTime, onSecretCodeEntered]);

  const formatTime = (date: Date) => {
    if (use24Hour) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: false 
      });
    }
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Analog clock calculations
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {/* Toggle between analog and digital */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={() => setShowDigital(!showDigital)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showDigital ? 'Analog' : 'Digital'}
        </button>
      </div>

      {showDigital ? (
        /* Digital Clock */
        <div 
          className="text-center cursor-pointer select-none"
          onClick={handleCenterTap}
        >
          <div className="text-5xl font-bold tracking-tight font-mono mb-2">
            {formatTime(time)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(time)}
          </div>
        </div>
      ) : (
        /* Analog Clock */
        <div 
          className="relative w-48 h-48 cursor-pointer"
          onClick={handleCenterTap}
        >
          {/* Clock face */}
          <div className="absolute inset-0 rounded-full bg-muted/30 border-2 border-muted">
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x = 50 + 42 * Math.cos(angle);
              const y = 50 + 42 * Math.sin(angle);
              return (
                <div
                  key={i}
                  className={cn(
                    "absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2",
                    i % 3 === 0 ? "bg-foreground" : "bg-muted-foreground"
                  )}
                  style={{ left: `${x}%`, top: `${y}%` }}
                />
              );
            })}

            {/* Hour hand */}
            <div
              className="absolute left-1/2 bottom-1/2 w-1.5 h-16 origin-bottom -translate-x-1/2 rounded-full bg-foreground"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />

            {/* Minute hand */}
            <div
              className="absolute left-1/2 bottom-1/2 w-1 h-20 origin-bottom -translate-x-1/2 rounded-full bg-primary"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />

            {/* Second hand */}
            {showSeconds && (
              <div
                className="absolute left-1/2 bottom-1/2 w-0.5 h-[88px] origin-bottom -translate-x-1/2 rounded-full bg-sos"
                style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}
              />
            )}

            {/* Center dot */}
            <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={() => setUse24Hour(!use24Hour)}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted/30 transition-colors"
        >
          {use24Hour ? '12h' : '24h'}
        </button>
        <button
          onClick={() => setShowSeconds(!showSeconds)}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted/30 transition-colors"
        >
          {showSeconds ? 'Hide sec' : 'Show sec'}
        </button>
      </div>

      {/* Subtle tap indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1 h-1 rounded-full transition-colors",
                i < tapCount ? "bg-primary/40" : "bg-transparent"
              )} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
