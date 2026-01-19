import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Plus, Trash2, Bell, BellRing, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAutoCheckIn } from '@/hooks/useAutoCheckIn';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CheckIn {
  id: string;
  scheduled_time: string;
  status: string;
  notes: string | null;
}

export function CheckInApp() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCheckInHours, setNewCheckInHours] = useState(1);
  
  const {
    nextCheckIn,
    timeUntilNextFormatted,
    missedCheckIns,
    scheduleQuickCheckIn,
    confirmCheckIn,
    refreshCheckIns
  } = useAutoCheckIn({
    reminderMinutesBefore: 5,
    gracePeriodMinutes: 10,
    onMissedCheckIn: (checkIn) => {
      // Additional handling when check-in is missed
      console.log('Missed check-in:', checkIn);
    },
    onReminderDue: (checkIn) => {
      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  });

  useEffect(() => {
    if (user) {
      fetchCheckIns();
    }
  }, [user]);

  const fetchCheckIns = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('safe_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_time', { ascending: true });

    if (data) {
      setCheckIns(data);
    }
    setLoading(false);
  };

  const handleScheduleCheckIn = async () => {
    const result = await scheduleQuickCheckIn(newCheckInHours);
    if (result) {
      fetchCheckIns();
    }
  };

  const handleConfirmCheckIn = async (id: string) => {
    const success = await confirmCheckIn(id);
    if (success) {
      setCheckIns(prev => 
        prev.map(c => c.id === id ? { ...c, status: 'confirmed' } : c)
      );
    }
  };

  const deleteCheckIn = async (id: string) => {
    const { error } = await supabase
      .from('safe_checkins')
      .delete()
      .eq('id', id);

    if (!error) {
      setCheckIns(prev => prev.filter(c => c.id !== id));
      refreshCheckIns();
      toast.success('Check-in removed');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isOverdue = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  const isDueSoon = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return diff > 0 && diff < 5 * 60 * 1000; // Within 5 minutes
  };

  return (
    <div className="h-full flex flex-col p-4 pt-8">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Safe Check-ins</h2>
      </div>

      {/* Next Check-in Alert */}
      {nextCheckIn && timeUntilNextFormatted && (
        <div className={cn(
          "rounded-xl p-3 mb-3 flex items-center gap-3",
          isDueSoon(nextCheckIn.scheduled_time) 
            ? "bg-warning/20 border border-warning/30 animate-pulse" 
            : "bg-primary/10 border border-primary/20"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isDueSoon(nextCheckIn.scheduled_time) ? "bg-warning/20" : "bg-primary/20"
          )}>
            {isDueSoon(nextCheckIn.scheduled_time) ? (
              <BellRing className="w-5 h-5 text-warning" />
            ) : (
              <Clock className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Next check-in</p>
            <p className="text-xs text-muted-foreground">{timeUntilNextFormatted}</p>
          </div>
          <button
            onClick={() => handleConfirmCheckIn(nextCheckIn.id)}
            className="bg-safe hover:bg-safe/90 text-white rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-1"
          >
            <Shield className="w-3 h-3" />
            I'm Safe
          </button>
        </div>
      )}

      {/* Missed Check-ins Warning */}
      {missedCheckIns.length > 0 && (
        <div className="bg-sos/20 border border-sos/30 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-sos" />
            <span className="text-sm font-medium text-sos">
              {missedCheckIns.length} missed check-in(s)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Emergency contacts have been notified
          </p>
        </div>
      )}

      <ScrollArea className="flex-1">
        {/* Schedule new check-in */}
        <div className="glass rounded-xl p-3 mb-3">
          <p className="text-xs text-muted-foreground mb-2">
            Schedule a check-in. Miss it and your contacts will be alerted.
          </p>
          <div className="flex gap-2">
            <select
              value={newCheckInHours}
              onChange={(e) => setNewCheckInHours(Number(e.target.value))}
              className="flex-1 bg-muted rounded-lg px-2 py-2 text-xs"
            >
              <option value={1}>In 1 hour</option>
              <option value={2}>In 2 hours</option>
              <option value={4}>In 4 hours</option>
              <option value={8}>In 8 hours</option>
              <option value={24}>In 24 hours</option>
            </select>
            <button
              onClick={handleScheduleCheckIn}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
        </div>

        {/* Check-in list */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center text-muted-foreground py-4 text-sm">Loading...</div>
          ) : checkIns.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No check-ins scheduled</p>
            </div>
          ) : (
            checkIns.map(checkIn => (
              <div
                key={checkIn.id}
                className={cn(
                  "glass rounded-xl p-2 flex items-center gap-2",
                  checkIn.status === 'confirmed' && "border-safe/30",
                  checkIn.status === 'missed' && "border-sos/30 bg-sos/5",
                  isOverdue(checkIn.scheduled_time) && checkIn.status === 'pending' && "border-warning/30 bg-warning/5"
                )}
              >
                {checkIn.status === 'confirmed' ? (
                  <CheckCircle2 className="w-4 h-4 text-safe flex-shrink-0" />
                ) : checkIn.status === 'missed' ? (
                  <AlertCircle className="w-4 h-4 text-sos flex-shrink-0" />
                ) : isOverdue(checkIn.scheduled_time) ? (
                  <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 animate-pulse" />
                ) : (
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">
                    {formatTime(checkIn.scheduled_time)}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {checkIn.status}
                  </p>
                </div>

                {checkIn.status === 'pending' && (
                  <button
                    onClick={() => handleConfirmCheckIn(checkIn.id)}
                    className="bg-safe hover:bg-safe/90 text-white rounded-lg px-2 py-1 text-[10px] font-medium"
                  >
                    Safe
                  </button>
                )}
                
                <button
                  onClick={() => deleteCheckIn(checkIn.id)}
                  className="text-muted-foreground hover:text-sos p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
