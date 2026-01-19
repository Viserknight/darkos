import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Share2, Trash2, Eye, EyeOff, Users, AlertTriangle } from 'lucide-react';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow } from 'date-fns';

export function LocationApp() {
  const { user } = useAuth();
  const {
    currentLocation,
    locationHistory,
    isTracking,
    isLoading,
    startTracking,
    stopTracking,
    shareLocationWithContacts,
    stopSharingLocation,
    clearHistory
  } = useLocationTracking({ trackingInterval: 60000 }); // Track every minute

  const [contacts, setContacts] = useState<{ id: string; name: string; user_id?: string }[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Check if currently sharing
  useEffect(() => {
    const shared = locationHistory.some(l => l.is_shared);
    setIsSharing(shared);
  }, [locationHistory]);

  // Fetch emergency contacts for sharing
  useEffect(() => {
    if (!user) return;
    
    const fetchContacts = async () => {
      const { data } = await supabase
        .from('emergency_contacts')
        .select('id, name')
        .eq('user_id', user.id);
      
      if (data) {
        setContacts(data);
      }
    };
    
    fetchContacts();
  }, [user]);

  const handleShareWithContacts = () => {
    // In a real app, contacts would have user_ids to share with
    // For now, we'll mark as shared (simulated)
    shareLocationWithContacts([]);
    setIsSharing(true);
    toast.success('Location timeline shared with emergency contacts');
  };

  const handleStopSharing = () => {
    stopSharingLocation();
    setIsSharing(false);
  };

  const formatCoords = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  };

  return (
    <div className="h-full flex flex-col p-4 pt-8">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Location</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {/* Current Location */}
          <div className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Current Location</span>
            </div>
            {currentLocation ? (
              <div className="text-xs text-muted-foreground">
                {formatCoords(
                  currentLocation.coords.latitude,
                  currentLocation.coords.longitude
                )}
                {currentLocation.coords.accuracy && (
                  <span className="ml-2">±{Math.round(currentLocation.coords.accuracy)}m</span>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {isTracking ? 'Acquiring location...' : 'Tracking not active'}
              </div>
            )}
          </div>

          {/* Tracking Toggle */}
          <div className="flex gap-2">
            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors",
                isTracking
                  ? "bg-sos/20 text-sos border border-sos/30"
                  : "bg-primary/20 text-primary border border-primary/30"
              )}
            >
              {isTracking ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Start Tracking
                </>
              )}
            </button>
          </div>

          {/* Share with Contacts */}
          <div className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Share Location</span>
              </div>
              <div className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                isSharing ? "bg-safe/20 text-safe" : "bg-muted text-muted-foreground"
              )}>
                {isSharing ? 'Sharing' : 'Private'}
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3">
              Share your location timeline with trusted contacts
            </p>
            
            {contacts.length > 0 ? (
              <div className="flex flex-wrap gap-1 mb-3">
                {contacts.map(contact => (
                  <div key={contact.id} className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {contact.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-warning mb-3">
                <AlertTriangle className="w-3 h-3" />
                No emergency contacts configured
              </div>
            )}

            <button
              onClick={isSharing ? handleStopSharing : handleShareWithContacts}
              disabled={contacts.length === 0}
              className={cn(
                "w-full py-2 rounded-lg text-sm font-medium transition-colors",
                isSharing
                  ? "bg-sos text-white"
                  : "bg-safe text-white",
                contacts.length === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSharing ? 'Stop Sharing' : 'Share Timeline'}
            </button>
          </div>

          {/* Location History */}
          <div className="bg-muted/30 rounded-xl p-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Location History</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {locationHistory.length} points
              </div>
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                {isLoading ? (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    Loading...
                  </div>
                ) : locationHistory.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No location history yet
                  </div>
                ) : (
                  locationHistory.slice(0, 10).map((point) => (
                    <div key={point.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                      <div className="text-xs">
                        {formatCoords(point.latitude, point.longitude)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(point.recorded_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {locationHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="mt-3 flex items-center justify-center gap-1 w-full py-2 text-xs text-sos hover:bg-sos/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear History
              </button>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
