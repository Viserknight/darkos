import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StealthRecordingOptions {
  type: 'audio' | 'video';
  autoStopAfterMinutes?: number;
}

export function useStealthRecording() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<number | null>(null);
  const autoStopTimeoutRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startStealthRecording = useCallback(async (options: StealthRecordingOptions) => {
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    try {
      const constraints = options.type === 'video' 
        ? { video: { facingMode: 'environment' }, audio: true }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { 
          type: options.type === 'video' ? 'video/webm' : 'audio/webm' 
        });
        
        await saveStealthRecording(blob, options.type);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        // Clear intervals
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        
        setIsRecording(false);
        setRecordingType(null);
        setRecordingDuration(0);
      };

      mediaRecorder.start(1000); // Collect data every second for reliability
      mediaRecorderRef.current = mediaRecorder;
      
      // Track duration
      durationIntervalRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Auto-stop if specified
      if (options.autoStopAfterMinutes) {
        autoStopTimeoutRef.current = window.setTimeout(() => {
          stopStealthRecording();
        }, options.autoStopAfterMinutes * 60 * 1000);
      }

      setIsRecording(true);
      setRecordingType(options.type);
      
      // Stealth: No toast notification, no visible indicator
      console.log('Stealth recording started:', options.type);
      return true;
    } catch (error) {
      console.error('Failed to start stealth recording:', error);
      return false;
    }
  }, [user]);

  const stopStealthRecording = useCallback(() => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      console.log('Stealth recording stopped');
      return true;
    }
    return false;
  }, [isRecording]);

  const saveStealthRecording = async (blob: Blob, type: 'audio' | 'video') => {
    if (!user) return;

    try {
      // Get current location
      let location: { lat: number; lng: number } | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {
        // Location not available
      }

      // Upload to storage
      const fileName = `${user.id}/stealth_${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(fileName, blob);

      if (uploadError) {
        console.error('Upload error:', uploadError);
      }

      let fileUrl = null;
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('evidence')
          .getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      // Save record with stealth flag in transcription
      await supabase
        .from('evidence_recordings')
        .insert({
          user_id: user.id,
          recording_type: type,
          file_url: fileUrl,
          location_lat: location?.lat,
          location_lng: location?.lng,
          transcription: `[STEALTH] Duration: ${recordingDuration}s`
        });

      console.log('Stealth recording saved securely');
    } catch (error) {
      console.error('Failed to save stealth recording:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    recordingType,
    recordingDuration,
    formattedDuration: formatDuration(recordingDuration),
    startStealthRecording,
    stopStealthRecording
  };
}
