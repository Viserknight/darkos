import { useState, useCallback } from 'react';
import { WatchFace } from './WatchFace';
import { SOSButton } from './SOSButton';
import { CheckInApp } from './apps/CheckInApp';
import { EvidenceApp } from './apps/EvidenceApp';
import { ContactsApp } from './apps/ContactsApp';
import { HealthApp } from './apps/HealthApp';
import { WatchNotesApp } from './apps/WatchNotesApp';
import { WatchAIApp } from './apps/WatchAIApp';
import { SettingsWatchApp } from './apps/SettingsWatchApp';
import { LocationApp } from './apps/LocationApp';
import { EmergencyCallApp } from './apps/EmergencyCallApp';
import { useVoiceActivation } from '@/hooks/useVoiceActivation';
import { useAuth } from '@/hooks/useAuth';
import { Clock, Shield, Video, Users, Heart, FileText, Bot, Settings, ChevronLeft, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type AppType = 'home' | 'checkin' | 'evidence' | 'contacts' | 'health' | 'notes' | 'ai' | 'settings' | 'location' | 'emergency';

const apps = [
  { id: 'checkin' as AppType, name: 'Check-in', icon: Clock, color: 'text-primary' },
  { id: 'evidence' as AppType, name: 'Evidence', icon: Video, color: 'text-secondary' },
  { id: 'contacts' as AppType, name: 'Contacts', icon: Users, color: 'text-accent' },
  { id: 'health' as AppType, name: 'Health', icon: Heart, color: 'text-sos' },
  { id: 'location' as AppType, name: 'Location', icon: MapPin, color: 'text-safe' },
  { id: 'emergency' as AppType, name: 'Call', icon: Phone, color: 'text-sos' },
  { id: 'notes' as AppType, name: 'Notes', icon: FileText, color: 'text-warning' },
  { id: 'ai' as AppType, name: 'Nova AI', icon: Bot, color: 'text-calm' },
  { id: 'settings' as AppType, name: 'Settings', icon: Settings, color: 'text-muted-foreground' },
];

export function WatchContainer() {
  const { user } = useAuth();
  const [currentApp, setCurrentApp] = useState<AppType>('home');
  const [sosActive, setSosActive] = useState(false);
  const [sosTriggerMethod, setSosTriggerMethod] = useState<'button' | 'voice' | 'gesture'>('button');
  const [showAppGrid, setShowAppGrid] = useState(false);

  const handleKeywordDetected = useCallback((keyword: string) => {
    toast.warning(`Voice trigger detected: "${keyword}"`, { duration: 2000 });
    setSosTriggerMethod('voice');
    setSosActive(true);
  }, []);

  const handleCancelDetected = useCallback(() => {
    setSosActive(false);
    toast.success('Alert cancelled by voice');
  }, []);

  const { isListening, startListening, stopListening, isSupported } = useVoiceActivation({
    keywords: ['help', 'stop'],
    onKeywordDetected: handleKeywordDetected,
    onCancelDetected: handleCancelDetected,
    enabled: true
  });

  const handleSwipe = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (direction === 'up') {
      setShowAppGrid(true);
    } else if (direction === 'down') {
      setShowAppGrid(false);
      setCurrentApp('home');
    }
  };

  const renderApp = () => {
    switch (currentApp) {
      case 'checkin': return <CheckInApp />;
      case 'evidence': return <EvidenceApp />;
      case 'contacts': return <ContactsApp />;
      case 'health': return <HealthApp />;
      case 'location': return <LocationApp />;
      case 'emergency': return <EmergencyCallApp />;
      case 'notes': return <WatchNotesApp />;
      case 'ai': return <WatchAIApp />;
      case 'settings': return <SettingsWatchApp />;
      default: return null;
    }
  };

  return (
    <div className="relative w-[320px] h-[320px] watch-bezel watch-face mx-auto">
      {/* Inner watch face */}
      <div className="absolute inset-2 rounded-full overflow-hidden bg-background">
        {currentApp === 'home' ? (
          showAppGrid ? (
            <div className="h-full flex flex-col p-4">
              <button
                onClick={() => setShowAppGrid(false)}
                className="text-xs text-muted-foreground mb-3 flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Watch Face
              </button>
              <div className="grid grid-cols-3 gap-3 flex-1 content-start">
                {apps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setCurrentApp(app.id);
                      setShowAppGrid(false);
                    }}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn("w-10 h-10 rounded-full glass flex items-center justify-center", app.color)}>
                      <app.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <WatchFace
              onSwipe={handleSwipe}
              isListening={isListening}
              sosActive={sosActive}
            />
          )
        ) : (
          <div className="h-full flex flex-col">
            <button
              onClick={() => setCurrentApp('home')}
              className="absolute top-3 left-3 z-10 text-xs text-muted-foreground flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            {renderApp()}
          </div>
        )}
      </div>

      {/* SOS Button - only on home */}
      {currentApp === 'home' && !showAppGrid && (
        <SOSButton
          isActive={sosActive}
          onActivate={() => {
            setSosTriggerMethod('button');
            setSosActive(true);
          }}
          onCancel={() => setSosActive(false)}
          triggerMethod={sosTriggerMethod}
        />
      )}

      {/* Voice activation toggle */}
      {isSupported && currentApp === 'home' && !showAppGrid && (
        <button
          onClick={isListening ? stopListening : startListening}
          className={cn(
            "absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
            isListening ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <Shield className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
