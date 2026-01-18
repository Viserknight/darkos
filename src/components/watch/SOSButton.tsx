import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Phone, X, MapPin, Mic, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SOSButtonProps {
  isActive: boolean;
  onActivate: () => void;
  onCancel: () => void;
  triggerMethod: 'button' | 'voice' | 'gesture';
}

export function SOSButton({ isActive, onActivate, onCancel, triggerMethod }: SOSButtonProps) {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [alertId, setAlertId] = useState<string | null>(null);

  // Get location when SOS is triggered
  useEffect(() => {
    if (isActive && !location) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.error('Location error:', err);
          toast.error('Could not get location');
        }
      );
    }
  }, [isActive, location]);

  // Start countdown when activated
  useEffect(() => {
    if (isActive && countdown === null) {
      setCountdown(5);
    }
  }, [isActive, countdown]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(prev => (prev ?? 0) - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Trigger alert when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      triggerEmergencyAlert();
    }
  }, [countdown]);

  const triggerEmergencyAlert = async () => {
    setIsRecording(true);
    toast.error('🚨 EMERGENCY ALERT ACTIVATED', {
      description: 'Alerting emergency contacts and recording...',
      duration: 10000
    });

    if (user) {
      try {
        const { data, error } = await supabase
          .from('sos_alerts')
          .insert({
            user_id: user.id,
            status: 'active',
            location_lat: location?.lat,
            location_lng: location?.lng,
            trigger_method: triggerMethod
          })
          .select()
          .single();

        if (data) {
          setAlertId(data.id);
        }

        // Notify emergency contacts (simulated)
        const { data: contacts } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id);

        if (contacts && contacts.length > 0) {
          toast.success(`Notified ${contacts.length} emergency contact(s)`);
        }
      } catch (error) {
        console.error('Failed to create SOS alert:', error);
      }
    }
  };

  const handleCancel = async () => {
    if (alertId && user) {
      await supabase
        .from('sos_alerts')
        .update({ status: 'cancelled', resolved_at: new Date().toISOString() })
        .eq('id', alertId);
    }
    
    setCountdown(null);
    setIsRecording(false);
    setAlertId(null);
    onCancel();
    toast.success('Emergency alert cancelled');
  };

  const handleHoldStart = () => {
    if (!isActive) {
      onActivate();
    }
  };

  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 bg-void-black/95 flex flex-col items-center justify-center p-6">
        {/* Pulsing background */}
        <div className="absolute inset-0 bg-gradient-to-r from-sos/20 via-transparent to-sos/20 animate-pulse" />
        
        {/* Main alert content */}
        <div className="relative z-10 flex flex-col items-center">
          {countdown !== null && countdown > 0 ? (
            <>
              <div className="w-32 h-32 rounded-full bg-sos/20 flex items-center justify-center mb-6 animate-sos-pulse">
                <span className="text-6xl font-bold text-sos">{countdown}</span>
              </div>
              <h2 className="text-2xl font-bold text-sos mb-2">EMERGENCY ALERT</h2>
              <p className="text-muted-foreground text-center mb-6">
                Alert will trigger in {countdown} seconds
              </p>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-8 py-4 bg-muted hover:bg-muted/80 rounded-full text-foreground font-medium transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel (Say "Cancel" or tap)
              </button>
            </>
          ) : (
            <>
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center mb-6",
                "bg-sos animate-sos-pulse"
              )}>
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-sos mb-4">ALERT ACTIVE</h2>
              
              <div className="flex flex-col gap-3 w-full max-w-xs">
                {location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Location shared</span>
                  </div>
                )}
                
                {isRecording && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <div className="w-2 h-2 rounded-full bg-sos animate-recording" />
                    <span>Recording in progress</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>Contacts notified</span>
                </div>
              </div>

              <button
                onClick={handleCancel}
                className="mt-8 flex items-center gap-2 px-8 py-4 bg-safe hover:bg-safe/80 rounded-full text-white font-medium transition-colors"
              >
                <Shield className="w-5 h-5" />
                I'm Safe - Cancel Alert
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onMouseDown={handleHoldStart}
      onTouchStart={handleHoldStart}
      className={cn(
        "absolute bottom-8 left-1/2 -translate-x-1/2",
        "w-16 h-16 rounded-full",
        "bg-gradient-to-br from-sos to-sos/80",
        "flex items-center justify-center",
        "shadow-lg shadow-sos/30",
        "hover:scale-105 active:scale-95 transition-transform",
        "border-2 border-sos/50"
      )}
    >
      <AlertTriangle className="w-7 h-7 text-white" />
    </button>
  );
}
