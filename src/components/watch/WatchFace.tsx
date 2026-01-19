import { useState, useEffect } from 'react';
import { Heart, Shield, Mic, AlertTriangle, CheckCircle2, Clock, Vibrate } from 'lucide-react';
import { useHealthMetrics, EmotionalState } from '@/hooks/useHealthMetrics';
import { useAutoCheckIn } from '@/hooks/useAutoCheckIn';
import { cn } from '@/lib/utils';

interface WatchFaceProps {
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void;
  isListening: boolean;
  sosActive: boolean;
  shakeEnabled?: boolean;
  patternProgress?: number;
  patternLength?: number;
}

const emotionColors: Record<EmotionalState, string> = {
  calm: 'text-safe',
  happy: 'text-safe',
  anxious: 'text-warning',
  stressed: 'text-warning',
  scared: 'text-sos',
  sad: 'text-calm'
};

const emotionLabels: Record<EmotionalState, string> = {
  calm: 'Calm',
  happy: 'Happy',
  anxious: 'Anxious',
  stressed: 'Stressed',
  scared: 'Elevated',
  sad: 'Low'
};

export function WatchFace({ onSwipe, isListening, sosActive, shakeEnabled, patternProgress = 0, patternLength = 4 }: WatchFaceProps) {
  const [time, setTime] = useState(new Date());
  const { metrics, isAnomalyDetected } = useHealthMetrics();
  const { nextCheckIn, timeUntilNextFormatted, confirmCheckIn } = useAutoCheckIn();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const point = 'touches' in e ? e.touches[0] : e;
    setTouchStart({ x: point.clientX, y: point.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStart) return;
    
    const point = 'changedTouches' in e ? e.changedTouches[0] : e;
    const deltaX = point.clientX - touchStart.x;
    const deltaY = point.clientY - touchStart.y;
    const threshold = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold) onSwipe('right');
      else if (deltaX < -threshold) onSwipe('left');
    } else {
      if (deltaY > threshold) onSwipe('down');
      else if (deltaY < -threshold) onSwipe('up');
    }
    setTouchStart(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className={cn(
        "relative w-full h-full flex flex-col items-center justify-center p-6 select-none",
        sosActive && "bg-sos/10"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
    >
      {/* Status Bar */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-6">
        <div className="flex items-center gap-1">
          {isListening && (
            <div className="flex items-center gap-1 text-primary">
              <Mic className="w-3 h-3 animate-pulse" />
              <span className="text-xs">Voice</span>
            </div>
          )}
          {shakeEnabled && (
            <div className="flex items-center gap-1 text-secondary ml-1">
              <Vibrate className="w-3 h-3" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Pattern progress indicator */}
          {patternProgress > 0 && (
            <div className="flex gap-0.5">
              {Array.from({ length: patternLength }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i < patternProgress ? "bg-warning" : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}
          {isAnomalyDetected ? (
            <AlertTriangle className="w-4 h-4 text-warning animate-pulse" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-safe" />
          )}
          <Shield className={cn(
            "w-4 h-4",
            sosActive ? "text-sos animate-pulse" : "text-primary"
          )} />
        </div>
      </div>

      {/* Time Display */}
      <div className="text-center mb-4">
        <div className="text-5xl font-bold tracking-tight text-foreground">
          {formatTime(time)}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {formatDate(time)}
        </div>
      </div>

      {/* Health Metrics Ring */}
      <div className="relative w-32 h-32 mb-4">
        {/* Background ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          {/* Stress level ring */}
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke={metrics.stressLevel > 60 ? 'hsl(var(--sos-red))' : 
                   metrics.stressLevel > 40 ? 'hsl(var(--warning-amber))' : 
                   'hsl(var(--safe-green))'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(metrics.stressLevel / 100) * 352} 352`}
            className="transition-all duration-500"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Heart className={cn(
            "w-6 h-6 animate-heartbeat",
            metrics.heartRate > 100 ? "text-sos" : 
            metrics.heartRate > 85 ? "text-warning" : 
            "text-sos/70"
          )} />
          <span className="text-2xl font-bold">{metrics.heartRate}</span>
          <span className="text-xs text-muted-foreground">BPM</span>
        </div>
      </div>

      {/* Emotional State */}
      <div className={cn(
        "text-sm font-medium",
        emotionColors[metrics.emotionalState]
      )}>
        {emotionLabels[metrics.emotionalState]}
      </div>

      {/* Next Check-in Indicator */}
      {nextCheckIn && timeUntilNextFormatted && (
        <button
          onClick={() => confirmCheckIn(nextCheckIn.id)}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-primary/20 rounded-full hover:bg-primary/30 transition-colors"
        >
          <Clock className="w-3 h-3 text-primary" />
          <span className="text-xs text-primary font-medium">{timeUntilNextFormatted}</span>
        </button>
      )}

      {/* Swipe hints */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="text-xs text-muted-foreground/50">
          Swipe ↑ for apps
        </span>
      </div>
    </div>
  );
}
