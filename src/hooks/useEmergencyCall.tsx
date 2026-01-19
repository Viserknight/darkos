import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string | null;
  is_primary: boolean | null;
}

interface EmergencyService {
  name: string;
  number: string;
  type: 'police' | 'ambulance' | 'fire' | 'crisis';
}

const EMERGENCY_SERVICES: EmergencyService[] = [
  { name: 'Emergency Services', number: '911', type: 'police' },
  { name: 'Police', number: '911', type: 'police' },
  { name: 'Ambulance', number: '911', type: 'ambulance' },
  { name: 'Fire Department', number: '911', type: 'fire' },
  { name: 'National DV Hotline', number: '1-800-799-7233', type: 'crisis' },
  { name: 'Crisis Text Line', number: '741741', type: 'crisis' },
];

export function useEmergencyCall() {
  const { user } = useAuth();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCalledNumber, setLastCalledNumber] = useState<string | null>(null);

  // Fetch emergency contacts
  const fetchEmergencyContacts = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setEmergencyContacts(data || []);
    } catch (err) {
      console.error('Failed to fetch emergency contacts:', err);
      toast.error('Failed to load emergency contacts');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initiate a phone call
  const makeCall = useCallback((phoneNumber: string, contactName?: string) => {
    // Clean the phone number
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Use tel: protocol to initiate call
    const telLink = `tel:${cleanNumber}`;
    
    // Log the call attempt
    setLastCalledNumber(cleanNumber);
    
    // Open the tel link
    window.location.href = telLink;
    
    toast.success(`Calling ${contactName || cleanNumber}...`);
  }, []);

  // Call primary emergency contact
  const callPrimaryContact = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to access emergency contacts');
      return;
    }

    // Fetch contacts if not loaded
    if (emergencyContacts.length === 0) {
      await fetchEmergencyContacts();
    }

    const primaryContact = emergencyContacts.find(c => c.is_primary);
    
    if (primaryContact) {
      makeCall(primaryContact.phone_number, primaryContact.name);
    } else if (emergencyContacts.length > 0) {
      // Call first contact if no primary
      makeCall(emergencyContacts[0].phone_number, emergencyContacts[0].name);
    } else {
      toast.error('No emergency contacts configured');
    }
  }, [user, emergencyContacts, fetchEmergencyContacts, makeCall]);

  // Call all emergency contacts (sequential)
  const callAllContacts = useCallback(async () => {
    if (emergencyContacts.length === 0) {
      await fetchEmergencyContacts();
    }

    if (emergencyContacts.length === 0) {
      toast.error('No emergency contacts configured');
      return;
    }

    // Start with primary or first contact
    const primary = emergencyContacts.find(c => c.is_primary) || emergencyContacts[0];
    makeCall(primary.phone_number, primary.name);
    
    toast.info(`${emergencyContacts.length} contacts to call`);
  }, [emergencyContacts, fetchEmergencyContacts, makeCall]);

  // Call emergency services
  const callEmergencyServices = useCallback((type: EmergencyService['type'] = 'police') => {
    const service = EMERGENCY_SERVICES.find(s => s.type === type) || EMERGENCY_SERVICES[0];
    makeCall(service.number, service.name);
  }, [makeCall]);

  // Call 911
  const call911 = useCallback(() => {
    makeCall('911', 'Emergency Services');
  }, [makeCall]);

  // Send SMS (opens SMS app)
  const sendSMS = useCallback((phoneNumber: string, message: string) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    
    // Use sms: protocol
    const smsLink = `sms:${cleanNumber}?body=${encodedMessage}`;
    window.location.href = smsLink;
    
    toast.success('Opening SMS...');
  }, []);

  // Send emergency SMS to all contacts
  const sendEmergencySMSToAll = useCallback(async (message: string, location?: { lat: number; lng: number }) => {
    if (emergencyContacts.length === 0) {
      await fetchEmergencyContacts();
    }

    if (emergencyContacts.length === 0) {
      toast.error('No emergency contacts configured');
      return;
    }

    // Build message with location if available
    let fullMessage = message;
    if (location) {
      fullMessage += `\n\nMy location: https://maps.google.com/?q=${location.lat},${location.lng}`;
    }

    // Open SMS to first contact (can't bulk SMS from browser)
    const primary = emergencyContacts.find(c => c.is_primary) || emergencyContacts[0];
    sendSMS(primary.phone_number, fullMessage);
  }, [emergencyContacts, fetchEmergencyContacts, sendSMS]);

  return {
    emergencyContacts,
    emergencyServices: EMERGENCY_SERVICES,
    isLoading,
    lastCalledNumber,
    fetchEmergencyContacts,
    makeCall,
    callPrimaryContact,
    callAllContacts,
    callEmergencyServices,
    call911,
    sendSMS,
    sendEmergencySMSToAll
  };
}
