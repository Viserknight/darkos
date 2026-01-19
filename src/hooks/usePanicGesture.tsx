import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface ShakeDetectionOptions {
  threshold?: number; // Acceleration threshold to detect shake
  timeout?: number; // Time window to detect multiple shakes (ms)
  shakeCount?: number; // Number of shakes required to trigger
  onShakeDetected: () => void;
  enabled: boolean;
}

interface SwipePattern {
  direction: 'up' | 'down' | 'left' | 'right';
  timestamp: number;
}

interface PanicGestureOptions {
  panicPattern?: ('up' | 'down' | 'left' | 'right')[]; // e.g., ['left', 'right', 'left', 'right']
  patternTimeout?: number; // Time window to complete pattern (ms)
  onPanicGestureDetected: () => void;
  enabled: boolean;
}

export function useShakeDetection({
  threshold = 15,
  timeout = 1000,
  shakeCount = 3,
  onShakeDetected,
  enabled
}: ShakeDetectionOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const shakeCountRef = useRef(0);
  const lastShakeRef = useRef(0);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // Check if DeviceMotionEvent is supported
    const supported = 'DeviceMotionEvent' in window;
    setIsSupported(supported);
  }, []);

  useEffect(() => {
    if (!enabled || !isSupported) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x, y, z } = acceleration;
      if (x === null || y === null || z === null) return;

      // Calculate acceleration change
      const deltaX = Math.abs(x - lastAccelRef.current.x);
      const deltaY = Math.abs(y - lastAccelRef.current.y);
      const deltaZ = Math.abs(z - lastAccelRef.current.z);
      const totalDelta = deltaX + deltaY + deltaZ;

      lastAccelRef.current = { x, y, z };

      const now = Date.now();

      // Detect shake if acceleration exceeds threshold
      if (totalDelta > threshold) {
        // Reset count if timeout exceeded
        if (now - lastShakeRef.current > timeout) {
          shakeCountRef.current = 0;
        }

        shakeCountRef.current++;
        lastShakeRef.current = now;

        // Trigger if shake count reached
        if (shakeCountRef.current >= shakeCount) {
          shakeCountRef.current = 0;
          onShakeDetected();
        }
      }
    };

    // Request permission on iOS 13+
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            setIsActive(true);
          } else {
            toast.error('Motion permission denied');
          }
        } catch (error) {
          console.error('Error requesting motion permission:', error);
        }
      } else {
        // Non-iOS devices
        window.addEventListener('devicemotion', handleMotion);
        setIsActive(true);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      setIsActive(false);
    };
  }, [enabled, isSupported, threshold, timeout, shakeCount, onShakeDetected]);

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        return permission === 'granted';
      } catch (error) {
        return false;
      }
    }
    return true;
  }, []);

  return {
    isSupported,
    isActive,
    requestPermission
  };
}

export function usePanicGesture({
  panicPattern = ['left', 'right', 'left', 'right'],
  patternTimeout = 3000,
  onPanicGestureDetected,
  enabled
}: PanicGestureOptions) {
  const [swipeHistory, setSwipeHistory] = useState<SwipePattern[]>([]);
  const [patternProgress, setPatternProgress] = useState(0);

  const recordSwipe = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!enabled) return;

    const now = Date.now();
    
    setSwipeHistory(prev => {
      // Filter out old swipes
      const recent = prev.filter(s => now - s.timestamp < patternTimeout);
      const updated = [...recent, { direction, timestamp: now }];

      // Check if pattern matches
      const patternLength = panicPattern.length;
      if (updated.length >= patternLength) {
        const lastSwipes = updated.slice(-patternLength);
        const matches = lastSwipes.every((s, i) => s.direction === panicPattern[i]);
        
        if (matches) {
          setTimeout(() => {
            onPanicGestureDetected();
            setSwipeHistory([]);
            setPatternProgress(0);
          }, 0);
          return [];
        }
      }

      // Update progress
      let progress = 0;
      for (let i = 0; i < Math.min(updated.length, patternLength); i++) {
        const swipeIndex = updated.length - patternLength + i;
        if (swipeIndex >= 0 && updated[swipeIndex]?.direction === panicPattern[i]) {
          progress++;
        } else {
          break;
        }
      }
      setPatternProgress(progress);

      return updated;
    });
  }, [enabled, panicPattern, patternTimeout, onPanicGestureDetected]);

  const resetPattern = useCallback(() => {
    setSwipeHistory([]);
    setPatternProgress(0);
  }, []);

  return {
    recordSwipe,
    resetPattern,
    patternProgress,
    patternLength: panicPattern.length,
    panicPattern
  };
}
