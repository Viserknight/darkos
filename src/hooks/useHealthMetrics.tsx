import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type EmotionalState = 'calm' | 'anxious' | 'scared' | 'stressed' | 'happy' | 'sad';

interface HealthMetrics {
  heartRate: number;
  stressLevel: number;
  emotionalState: EmotionalState;
}

export function useHealthMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<HealthMetrics>({
    heartRate: 72,
    stressLevel: 25,
    emotionalState: 'calm'
  });
  const [isAnomalyDetected, setIsAnomalyDetected] = useState(false);

  // Simulate biometric data with realistic variations
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        // Simulate realistic heart rate variations
        const baseHR = 72;
        const variation = Math.sin(Date.now() / 10000) * 8 + (Math.random() - 0.5) * 4;
        const newHR = Math.round(baseHR + variation);

        // Simulate stress level
        const baseStress = 25;
        const stressVariation = Math.sin(Date.now() / 20000) * 15 + (Math.random() - 0.5) * 5;
        const newStress = Math.max(0, Math.min(100, Math.round(baseStress + stressVariation)));

        // Determine emotional state based on metrics
        let newState: EmotionalState = 'calm';
        if (newStress > 70) newState = 'stressed';
        else if (newStress > 50) newState = 'anxious';
        else if (newHR > 100) newState = 'scared';
        else if (newStress < 20 && newHR < 70) newState = 'happy';

        // Check for anomalies (high stress or heart rate)
        const hasAnomaly = newStress > 75 || newHR > 110 || newHR < 50;
        setIsAnomalyDetected(hasAnomaly);

        return {
          heartRate: newHR,
          stressLevel: newStress,
          emotionalState: newState
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Save metrics periodically if user is logged in
  const saveMetrics = useCallback(async () => {
    if (!user) return;

    try {
      await supabase.from('health_metrics').insert({
        user_id: user.id,
        heart_rate: metrics.heartRate,
        stress_level: metrics.stressLevel,
        emotional_state: metrics.emotionalState
      });
    } catch (error) {
      console.error('Failed to save health metrics:', error);
    }
  }, [user, metrics]);

  // Simulate stress spike for testing
  const triggerStressSpike = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      heartRate: 120,
      stressLevel: 85,
      emotionalState: 'scared'
    }));
    setIsAnomalyDetected(true);
  }, []);

  // Reset to calm state
  const resetToCalm = useCallback(() => {
    setMetrics({
      heartRate: 68,
      stressLevel: 15,
      emotionalState: 'calm'
    });
    setIsAnomalyDetected(false);
  }, []);

  return {
    metrics,
    isAnomalyDetected,
    saveMetrics,
    triggerStressSpike,
    resetToCalm
  };
}
