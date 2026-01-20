import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type AnalysisType = 'face_recognition' | 'environment_scan' | 'license_plate' | 'general';

interface AnalysisResult {
  analysis: string;
  imageUrl?: string;
  timestamp: Date;
  type: AnalysisType;
}

export function useFaceRecognition() {
  const { user } = useAuth();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsCapturing(true);
      return true;
    } catch (error) {
      console.error('Failed to start camera:', error);
      toast.error('Could not access camera');
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  const captureAndAnalyze = useCallback(async (analysisType: AnalysisType = 'face_recognition') => {
    if (!videoRef.current || !isCapturing) {
      toast.error('Camera not active');
      return null;
    }

    setIsAnalyzing(true);

    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // Send to analysis function
      const { data, error } = await supabase.functions.invoke('analyze-safety', {
        body: { image: imageDataUrl, analysisType }
      });

      if (error) {
        throw error;
      }

      const result: AnalysisResult = {
        analysis: data.analysis,
        imageUrl: imageDataUrl,
        timestamp: new Date(),
        type: analysisType
      };

      setLastAnalysis(result);
      setAnalysisHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10

      // Save to evidence if user is logged in
      if (user) {
        let location: { lat: number; lng: number } | null = null;
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch {
          // Location not available
        }

        await supabase
          .from('evidence_recordings')
          .insert({
            user_id: user.id,
            recording_type: 'photo',
            transcription: `[${analysisType.toUpperCase()}] ${data.analysis}`,
            location_lat: location?.lat,
            location_lng: location?.lng
          });
      }

      toast.success('Analysis complete');
      return result;
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isCapturing, user]);

  const quickCapture = useCallback(async (analysisType: AnalysisType = 'face_recognition') => {
    // Quick capture: start camera, capture, analyze, stop
    const started = await startCamera('environment');
    if (!started) return null;

    // Wait for camera to initialize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = await captureAndAnalyze(analysisType);
    stopCamera();
    
    return result;
  }, [startCamera, captureAndAnalyze, stopCamera]);

  return {
    isCapturing,
    isAnalyzing,
    lastAnalysis,
    analysisHistory,
    videoRef,
    startCamera,
    stopCamera,
    captureAndAnalyze,
    quickCapture
  };
}
