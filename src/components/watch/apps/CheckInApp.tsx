import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Plus, Trash2, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

  const scheduleCheckIn = async () => {
    if (!user) {
      toast.error('Please sign in to schedule check-ins');
      return;
    }

    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + newCheckInHours);

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
      setCheckIns(prev => [...prev, data]);
      toast.success(`Check-in scheduled for ${scheduledTime.toLocaleTimeString()}`);
    } else if (error) {
      toast.error('Failed to schedule check-in');
    }
  };

  const confirmCheckIn = async (id: string) => {
    const { error } = await supabase
      .from('safe_checkins')
      .update({ status: 'confirmed' })
      .eq('id', id);

    if (!error) {
      setCheckIns(prev => 
        prev.map(c => c.id === id ? { ...c, status: 'confirmed' } : c)
      );
      toast.success('Check-in confirmed! Stay safe.');
    }
  };

  const deleteCheckIn = async (id: string) => {
    const { error } = await supabase
      .from('safe_checkins')
      .delete()
      .eq('id', id);

    if (!error) {
      setCheckIns(prev => prev.filter(c => c.id !== id));
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

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Safe Check-ins</h2>
      </div>

      {/* Schedule new check-in */}
      <div className="glass rounded-xl p-4 mb-4">
        <p className="text-sm text-muted-foreground mb-3">
          Schedule a check-in. If you don't confirm, your contacts will be alerted.
        </p>
        <div className="flex gap-2">
          <select
            value={newCheckInHours}
            onChange={(e) => setNewCheckInHours(Number(e.target.value))}
            className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm"
          >
            <option value={1}>In 1 hour</option>
            <option value={2}>In 2 hours</option>
            <option value={4}>In 4 hours</option>
            <option value={8}>In 8 hours</option>
            <option value={24}>In 24 hours</option>
          </select>
          <button
            onClick={scheduleCheckIn}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Check-in list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        ) : checkIns.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No check-ins scheduled</p>
          </div>
        ) : (
          checkIns.map(checkIn => (
            <div
              key={checkIn.id}
              className={cn(
                "glass rounded-xl p-3 flex items-center gap-3",
                checkIn.status === 'confirmed' && "border-safe/30",
                isOverdue(checkIn.scheduled_time) && checkIn.status === 'pending' && "border-sos/30 bg-sos/5"
              )}
            >
              {checkIn.status === 'confirmed' ? (
                <CheckCircle2 className="w-5 h-5 text-safe flex-shrink-0" />
              ) : isOverdue(checkIn.scheduled_time) ? (
                <AlertCircle className="w-5 h-5 text-sos flex-shrink-0 animate-pulse" />
              ) : (
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {formatTime(checkIn.scheduled_time)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {checkIn.status}
                </p>
              </div>

              {checkIn.status === 'pending' && (
                <button
                  onClick={() => confirmCheckIn(checkIn.id)}
                  className="bg-safe hover:bg-safe/90 text-white rounded-lg px-3 py-1 text-xs font-medium"
                >
                  I'm Safe
                </button>
              )}
              
              <button
                onClick={() => deleteCheckIn(checkIn.id)}
                className="text-muted-foreground hover:text-sos p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
