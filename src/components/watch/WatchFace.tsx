import { useState, useEffect } from 'react';
import { Heart, Shield, Mic, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useHealthMetrics, EmotionalState } from '@/hooks/useHealthMetrics';
import { cn } from '@/lib/utils';

interface WatchFaceProps {
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void;
  isListening: boolean;
  sosActive: boolean;
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

export function WatchFace({ onSwipe, isListening, sosActive }: WatchFaceProps) {
  const [time, setTime] = useState(new Date());
  const { metrics, isAnomalyDetected } = useHealthMetrics();
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
              <span className="text-xs">Active</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
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

      {/* Swipe hints */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="text-xs text-muted-foreground/50">
          Swipe for apps
        </span>
      </div>
    </div>
  );
}
