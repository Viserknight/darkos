import { useState, useEffect } from 'react';
import { Phone, AlertTriangle, MessageSquare, Shield, Heart, Users, Siren } from 'lucide-react';
import { useEmergencyCall } from '@/hooks/useEmergencyCall';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function EmergencyCallApp() {
  const {
    emergencyContacts,
    emergencyServices,
    isLoading,
    fetchEmergencyContacts,
    makeCall,
    call911,
    sendEmergencySMSToAll
  } = useEmergencyCall();
  
  const { currentLocation, getCurrentLocation } = useLocationTracking();
  const [activeTab, setActiveTab] = useState<'contacts' | 'services'>('contacts');

  useEffect(() => {
    fetchEmergencyContacts();
    getCurrentLocation();
  }, []);

  const handleEmergencySMS = async () => {
    const message = "🚨 EMERGENCY: I need help! This is an automated emergency message.";
    const location = currentLocation 
      ? { lat: currentLocation.coords.latitude, lng: currentLocation.coords.longitude }
      : undefined;
    
    await sendEmergencySMSToAll(message, location);
  };

  const getRelationshipIcon = (relationship: string | null) => {
    switch (relationship?.toLowerCase()) {
      case 'family':
      case 'parent':
      case 'sibling':
        return Heart;
      case 'friend':
        return Users;
      default:
        return Shield;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'police':
        return Siren;
      case 'ambulance':
        return Heart;
      case 'crisis':
        return Shield;
      default:
        return Phone;
    }
  };

  return (
    <div className="h-full flex flex-col p-4 pt-8">
      <div className="flex items-center gap-2 mb-4">
        <Phone className="w-5 h-5 text-sos" />
        <h2 className="text-lg font-semibold">Emergency Call</h2>
      </div>

      {/* Quick 911 Button */}
      <button
        onClick={call911}
        className="w-full py-4 mb-4 bg-gradient-to-r from-sos to-sos/80 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-sos/30 active:scale-95 transition-transform"
      >
        <AlertTriangle className="w-6 h-6 text-white" />
        <span className="text-lg font-bold text-white">Call 911</span>
      </button>

      {/* Emergency SMS Button */}
      <button
        onClick={handleEmergencySMS}
        className="w-full py-3 mb-4 bg-warning/20 border border-warning/30 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <MessageSquare className="w-4 h-4 text-warning" />
        <span className="text-sm font-medium text-warning">Send Emergency SMS</span>
      </button>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setActiveTab('contacts')}
          className={cn(
            "flex-1 py-2 text-xs font-medium rounded-lg transition-colors",
            activeTab === 'contacts'
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground"
          )}
        >
          My Contacts
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={cn(
            "flex-1 py-2 text-xs font-medium rounded-lg transition-colors",
            activeTab === 'services'
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground"
          )}
        >
          Services
        </button>
      </div>

      <ScrollArea className="flex-1">
        {activeTab === 'contacts' ? (
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                Loading contacts...
              </div>
            ) : emergencyContacts.length === 0 ? (
              <div className="text-center py-4">
                <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No emergency contacts</p>
                <p className="text-xs text-muted-foreground/70">Add contacts in Contacts app</p>
              </div>
            ) : (
              emergencyContacts.map((contact) => {
                const Icon = getRelationshipIcon(contact.relationship);
                return (
                  <button
                    key={contact.id}
                    onClick={() => makeCall(contact.phone_number, contact.name)}
                    className="w-full flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors active:scale-98"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      contact.is_primary ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{contact.name}</span>
                        {contact.is_primary && (
                          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{contact.phone_number}</span>
                    </div>
                    <Phone className="w-5 h-5 text-safe" />
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {emergencyServices.map((service, index) => {
              const Icon = getServiceIcon(service.type);
              return (
                <button
                  key={index}
                  onClick={() => makeCall(service.number, service.name)}
                  className="w-full flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors active:scale-98"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    service.type === 'police' ? "bg-sos/20 text-sos" :
                    service.type === 'crisis' ? "bg-calm/20 text-calm" :
                    "bg-warning/20 text-warning"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium">{service.name}</span>
                    <div className="text-xs text-muted-foreground">{service.number}</div>
                  </div>
                  <Phone className="w-5 h-5 text-safe" />
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
