import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CheckIn {
  id: string;
  scheduled_time: string;
  status: string;
  notes: string | null;
}

interface AutoCheckInOptions {
  checkIntervalMs?: number; // How often to check for missed check-ins
  reminderMinutesBefore?: number; // Minutes before scheduled time to remind
  gracePeriodMinutes?: number; // Minutes after scheduled time before alerting contacts
  onMissedCheckIn?: (checkIn: CheckIn) => void;
  onReminderDue?: (checkIn: CheckIn) => void;
}

export function useAutoCheckIn(options: AutoCheckInOptions = {}) {
  const {
    checkIntervalMs = 30000, // Check every 30 seconds
    reminderMinutesBefore = 5,
    gracePeriodMinutes = 10,
    onMissedCheckIn,
    onReminderDue
  } = options;

  const { user } = useAuth();
  const [pendingCheckIns, setPendingCheckIns] = useState<CheckIn[]>([]);
  const [missedCheckIns, setMissedCheckIns] = useState<CheckIn[]>([]);
  const [nextCheckIn, setNextCheckIn] = useState<CheckIn | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<number | null>(null);
  const [alertsSent, setAlertsSent] = useState<Set<string>>(new Set());
  const remindersSentRef = useRef<Set<string>>(new Set());

  // Fetch pending check-ins
  const fetchCheckIns = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('safe_checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('scheduled_time', { ascending: true });

    if (data) {
      setPendingCheckIns(data);
      if (data.length > 0) {
        setNextCheckIn(data[0]);
      } else {
        setNextCheckIn(null);
      }
    }
  }, [user]);

  // Check for missed check-ins and send reminders
  const processCheckIns = useCallback(async () => {
    if (!user || pendingCheckIns.length === 0) return;

    const now = new Date();
    const missed: CheckIn[] = [];

    for (const checkIn of pendingCheckIns) {
      const scheduledTime = new Date(checkIn.scheduled_time);
      const timeDiff = scheduledTime.getTime() - now.getTime();
      const minutesUntil = timeDiff / (1000 * 60);

      // Check if reminder is due (X minutes before)
      if (minutesUntil <= reminderMinutesBefore && minutesUntil > 0) {
        if (!remindersSentRef.current.has(checkIn.id)) {
          remindersSentRef.current.add(checkIn.id);
          toast.warning(`⏰ Check-in due in ${Math.ceil(minutesUntil)} minutes`, {
            description: 'Confirm you\'re safe or your contacts will be alerted.',
            duration: 10000
          });
          onReminderDue?.(checkIn);
          
          // Request notification permission and show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Check-in Reminder', {
              body: `Your check-in is due in ${Math.ceil(minutesUntil)} minutes. Confirm you're safe.`,
              icon: '/favicon.ico',
              tag: `checkin-reminder-${checkIn.id}`,
              requireInteraction: true
            });
          }
        }
      }

      // Check if check-in is missed (past grace period)
      if (minutesUntil < -gracePeriodMinutes && !alertsSent.has(checkIn.id)) {
        missed.push(checkIn);
        setAlertsSent(prev => new Set([...prev, checkIn.id]));

        // Update status to missed
        await supabase
          .from('safe_checkins')
          .update({ status: 'missed' })
          .eq('id', checkIn.id);

        // Alert emergency contacts (simulated)
        toast.error('🚨 Missed Check-in Alert!', {
          description: 'Emergency contacts are being notified.',
          duration: 15000
        });

        // Notify emergency contacts
        const { data: contacts } = await supabase
          .from('emergency_contacts')
          .select('name, phone_number')
          .eq('user_id', user.id);

        if (contacts && contacts.length > 0) {
          toast.info(`Alerting ${contacts.length} emergency contact(s)`, {
            description: contacts.map(c => c.name).join(', ')
          });
        }

        onMissedCheckIn?.(checkIn);
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 Missed Check-in!', {
            body: 'You missed a scheduled check-in. Your emergency contacts are being notified.',
            icon: '/favicon.ico',
            tag: `checkin-missed-${checkIn.id}`,
            requireInteraction: true
          });
        }
      }
    }

    if (missed.length > 0) {
      setMissedCheckIns(prev => [...prev, ...missed]);
      fetchCheckIns(); // Refresh list
    }
  }, [user, pendingCheckIns, reminderMinutesBefore, gracePeriodMinutes, alertsSent, onMissedCheckIn, onReminderDue, fetchCheckIns]);

  // Update time until next check-in
  useEffect(() => {
    if (!nextCheckIn) {
      setTimeUntilNext(null);
      return;
    }

    const updateTime = () => {
      const now = new Date();
      const scheduled = new Date(nextCheckIn.scheduled_time);
      const diff = scheduled.getTime() - now.getTime();
      setTimeUntilNext(Math.max(0, diff));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [nextCheckIn]);

  // Initial fetch
  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  // Periodic check for missed check-ins
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      processCheckIns();
    }, checkIntervalMs);

    // Initial process
    processCheckIns();

    return () => clearInterval(interval);
  }, [user, checkIntervalMs, processCheckIns]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Quick check-in (schedule for X hours from now)
  const scheduleQuickCheckIn = useCallback(async (hoursFromNow: number) => {
    if (!user) {
      toast.error('Please sign in to schedule check-ins');
      return null;
    }

    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + hoursFromNow);

    const { data, error } = await supabase
      .from('safe_checkins')
      .insert({
        user_id: user.id,
        scheduled_time: scheduledTime.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (data) {
      toast.success(`Check-in scheduled for ${scheduledTime.toLocaleTimeString()}`);
      fetchCheckIns();
      return data;
    } else {
      toast.error('Failed to schedule check-in');
      return null;
    }
  }, [user, fetchCheckIns]);

  // Confirm a check-in
  const confirmCheckIn = useCallback(async (checkInId: string) => {
    const { error } = await supabase
      .from('safe_checkins')
      .update({ status: 'confirmed' })
      .eq('id', checkInId);

    if (!error) {
      toast.success('✅ Check-in confirmed! Stay safe.');
      fetchCheckIns();
      return true;
    }
    return false;
  }, [fetchCheckIns]);

  // Format time remaining
  const formatTimeRemaining = useCallback((ms: number) => {
    if (ms <= 0) return 'Now';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, []);

  return {
    pendingCheckIns,
    missedCheckIns,
    nextCheckIn,
    timeUntilNext,
    timeUntilNextFormatted: timeUntilNext !== null ? formatTimeRemaining(timeUntilNext) : null,
    scheduleQuickCheckIn,
    confirmCheckIn,
    refreshCheckIns: fetchCheckIns
  };
}
