import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  recorded_at: string;
  is_shared: boolean;
}

interface UseLocationTrackingOptions {
  autoTrack?: boolean;
  trackingInterval?: number; // in milliseconds
}

export function useLocationTracking(options: UseLocationTrackingOptions = {}) {
  const { autoTrack = false, trackingInterval = 30000 } = options;
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch location history from database
  const fetchLocationHistory = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('location_history')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setLocationHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch location history:', err);
      setError('Failed to load location history');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save location to database
  const saveLocation = useCallback(async (position: GeolocationPosition) => {
    if (!user) return;

    try {
      const { error: insertError } = await supabase
        .from('location_history')
        .insert({
          user_id: user.id,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          is_shared: false,
          shared_with: []
        });

      if (insertError) throw insertError;
      
      // Refresh history
      fetchLocationHistory();
    } catch (err) {
      console.error('Failed to save location:', err);
    }
  }, [user, fetchLocationHistory]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
          resolve(position);
        },
        (err) => {
          setError(err.message);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Start continuous tracking
  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      toast.error('Location tracking not supported');
      return;
    }

    setIsTracking(true);
    toast.success('Location tracking started');

    // Get initial location and save
    try {
      const position = await getCurrentLocation();
      await saveLocation(position);
    } catch (err) {
      console.error('Initial location error:', err);
    }

    // Set up interval for periodic saves
    intervalRef.current = setInterval(async () => {
      try {
        const position = await getCurrentLocation();
        await saveLocation(position);
      } catch (err) {
        console.error('Tracking interval error:', err);
      }
    }, trackingInterval);

    // Watch for significant changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(position);
      },
      (err) => {
        console.error('Watch position error:', err);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000
      }
    );
  }, [getCurrentLocation, saveLocation, trackingInterval]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
    toast.success('Location tracking stopped');
  }, []);

  // Share location with contacts
  const shareLocationWithContacts = useCallback(async (contactUserIds: string[]) => {
    if (!user || locationHistory.length === 0) return;

    try {
      // Update the last 24 hours of location history to be shared
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { error: updateError } = await supabase
        .from('location_history')
        .update({
          is_shared: true,
          shared_with: contactUserIds
        })
        .eq('user_id', user.id)
        .gte('recorded_at', oneDayAgo);

      if (updateError) throw updateError;
      
      toast.success(`Location shared with ${contactUserIds.length} contact(s)`);
      fetchLocationHistory();
    } catch (err) {
      console.error('Failed to share location:', err);
      toast.error('Failed to share location');
    }
  }, [user, locationHistory, fetchLocationHistory]);

  // Stop sharing location
  const stopSharingLocation = useCallback(async () => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('location_history')
        .update({
          is_shared: false,
          shared_with: []
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      
      toast.success('Location sharing stopped');
      fetchLocationHistory();
    } catch (err) {
      console.error('Failed to stop sharing:', err);
      toast.error('Failed to stop sharing');
    }
  }, [user, fetchLocationHistory]);

  // Clear location history
  const clearHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('location_history')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setLocationHistory([]);
      toast.success('Location history cleared');
    } catch (err) {
      console.error('Failed to clear history:', err);
      toast.error('Failed to clear history');
    }
  }, [user]);

  // Auto-track on mount if enabled
  useEffect(() => {
    if (autoTrack && user) {
      startTracking();
    }
    return () => {
      stopTracking();
    };
  }, [autoTrack, user]);

  // Fetch history on mount
  useEffect(() => {
    if (user) {
      fetchLocationHistory();
    }
  }, [user, fetchLocationHistory]);

  return {
    currentLocation,
    locationHistory,
    isTracking,
    isLoading,
    error,
    startTracking,
    stopTracking,
    getCurrentLocation,
    shareLocationWithContacts,
    stopSharingLocation,
    clearHistory,
    refreshHistory: fetchLocationHistory
  };
}
