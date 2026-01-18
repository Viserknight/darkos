import { Heart, Activity, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { useHealthMetrics } from '@/hooks/useHealthMetrics';
import { cn } from '@/lib/utils';

export function HealthApp() {
  const { metrics, isAnomalyDetected, triggerStressSpike, resetToCalm } = useHealthMetrics();

  const getHeartRateStatus = () => {
    if (metrics.heartRate > 100) return { label: 'Elevated', color: 'text-sos' };
    if (metrics.heartRate > 85) return { label: 'Active', color: 'text-warning' };
    if (metrics.heartRate < 60) return { label: 'Low', color: 'text-calm' };
    return { label: 'Normal', color: 'text-safe' };
  };

  const getStressStatus = () => {
    if (metrics.stressLevel > 70) return { label: 'High', color: 'text-sos', bg: 'bg-sos/20' };
    if (metrics.stressLevel > 40) return { label: 'Moderate', color: 'text-warning', bg: 'bg-warning/20' };
    return { label: 'Low', color: 'text-safe', bg: 'bg-safe/20' };
  };

  const heartStatus = getHeartRateStatus();
  const stressStatus = getStressStatus();

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Health Monitor</h2>
      </div>

      {/* Alert banner */}
      {isAnomalyDetected && (
        <div className="bg-sos/20 border border-sos/30 rounded-xl p-3 mb-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-sos animate-pulse" />
          <div>
            <p className="text-sm font-medium text-sos">Elevated readings detected</p>
            <p className="text-xs text-muted-foreground">
              Take deep breaths. Tap if you need help.
            </p>
          </div>
        </div>
      )}

      {/* Heart Rate Card */}
      <div className="glass rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className={cn("w-5 h-5 animate-heartbeat", heartStatus.color)} />
            <span className="text-sm font-medium">Heart Rate</span>
          </div>
          <span className={cn("text-xs px-2 py-1 rounded-full", 
            heartStatus.color === 'text-sos' ? 'bg-sos/20' :
            heartStatus.color === 'text-warning' ? 'bg-warning/20' :
            'bg-safe/20',
            heartStatus.color
          )}>
            {heartStatus.label}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{metrics.heartRate}</span>
          <span className="text-sm text-muted-foreground">BPM</span>
        </div>
        {/* Heart rate graph simulation */}
        <div className="mt-3 flex items-end gap-1 h-12">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t",
                metrics.heartRate > 100 ? 'bg-sos/50' :
                metrics.heartRate > 85 ? 'bg-warning/50' :
                'bg-safe/50'
              )}
              style={{
                height: `${30 + Math.sin((Date.now() / 200) + i) * 20 + Math.random() * 10}%`
              }}
            />
          ))}
        </div>
      </div>

      {/* Stress Level Card */}
      <div className="glass rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className={cn("w-5 h-5", stressStatus.color)} />
            <span className="text-sm font-medium">Stress Level</span>
          </div>
          <span className={cn("text-xs px-2 py-1 rounded-full", stressStatus.bg, stressStatus.color)}>
            {stressStatus.label}
          </span>
        </div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-4xl font-bold">{metrics.stressLevel}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        {/* Stress bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              metrics.stressLevel > 70 ? 'bg-sos' :
              metrics.stressLevel > 40 ? 'bg-warning' :
              'bg-safe'
            )}
            style={{ width: `${metrics.stressLevel}%` }}
          />
        </div>
      </div>

      {/* Emotional State Card */}
      <div className="glass rounded-xl p-4 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Emotional State</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
            metrics.emotionalState === 'calm' ? 'bg-safe/20' :
            metrics.emotionalState === 'happy' ? 'bg-safe/20' :
            metrics.emotionalState === 'anxious' ? 'bg-warning/20' :
            metrics.emotionalState === 'stressed' ? 'bg-warning/20' :
            metrics.emotionalState === 'scared' ? 'bg-sos/20' :
            'bg-calm/20'
          )}>
            {metrics.emotionalState === 'calm' ? '😌' :
             metrics.emotionalState === 'happy' ? '😊' :
             metrics.emotionalState === 'anxious' ? '😰' :
             metrics.emotionalState === 'stressed' ? '😣' :
             metrics.emotionalState === 'scared' ? '😨' :
             '😢'}
          </div>
          <div>
            <p className="text-lg font-medium capitalize">{metrics.emotionalState}</p>
            <p className="text-xs text-muted-foreground">
              Based on biometric readings
            </p>
          </div>
        </div>
      </div>

      {/* Test controls (for demo) */}
      <div className="glass rounded-xl p-4 mt-auto">
        <p className="text-xs text-muted-foreground mb-2">Demo Controls</p>
        <div className="flex gap-2">
          <button
            onClick={triggerStressSpike}
            className="flex-1 bg-sos/20 hover:bg-sos/30 text-sos rounded-lg px-3 py-2 text-xs font-medium"
          >
            Simulate Stress
          </button>
          <button
            onClick={resetToCalm}
            className="flex-1 bg-safe/20 hover:bg-safe/30 text-safe rounded-lg px-3 py-2 text-xs font-medium"
          >
            Reset to Calm
          </button>
        </div>
      </div>
    </div>
  );
}
