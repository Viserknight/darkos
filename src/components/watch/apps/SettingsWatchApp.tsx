import { useState, useEffect } from 'react';
import { Settings, User, Bell, Mic, Shield, LogOut, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Preferences {
  voice_activation_enabled: boolean;
  sos_voice_keywords: string[];
  auto_record_on_stress: boolean;
  checkin_frequency_hours: number;
}

export function SettingsWatchApp() {
  const { user, signOut } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>({
    voice_activation_enabled: true,
    sos_voice_keywords: ['help', 'stop'],
    auto_record_on_stress: false,
    checkin_frequency_hours: 24
  });
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPreferences({
        voice_activation_enabled: data.voice_activation_enabled,
        sos_voice_keywords: data.sos_voice_keywords || ['help', 'stop'],
        auto_record_on_stress: data.auto_record_on_stress,
        checkin_frequency_hours: data.checkin_frequency_hours
      });
    }
    setLoading(false);
  };

  const updatePreference = async (key: keyof Preferences, value: any) => {
    if (!user) return;

    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    const { error } = await supabase
      .from('user_preferences')
      .update({ [key]: value })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to save setting');
    } else {
      toast.success('Setting saved');
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    
    const updated = [...preferences.sos_voice_keywords, newKeyword.toLowerCase().trim()];
    await updatePreference('sos_voice_keywords', updated);
    setNewKeyword('');
  };

  const removeKeyword = async (keyword: string) => {
    const updated = preferences.sos_voice_keywords.filter(k => k !== keyword);
    await updatePreference('sos_voice_keywords', updated);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Settings className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Sign in to access settings</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      {/* Profile */}
      <div className="glass rounded-xl p-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground">Signed in</p>
          </div>
        </div>
      </div>

      {/* Voice Activation */}
      <div className="glass rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Voice Activation</span>
          </div>
          <button
            onClick={() => updatePreference('voice_activation_enabled', !preferences.voice_activation_enabled)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors",
              preferences.voice_activation_enabled ? "bg-primary" : "bg-muted"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full bg-white transition-transform",
              preferences.voice_activation_enabled ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Say trigger words to activate SOS
        </p>
      </div>

      {/* SOS Keywords */}
      <div className="glass rounded-xl p-4 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">SOS Trigger Words</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {preferences.sos_voice_keywords.map(keyword => (
            <span
              key={keyword}
              onClick={() => removeKeyword(keyword)}
              className="bg-sos/20 text-sos px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-sos/30"
            >
              "{keyword}" ×
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add word..."
            className="flex-1 bg-muted rounded-lg px-3 py-1.5 text-sm"
          />
          <button
            onClick={addKeyword}
            className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-lg text-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Auto Recording */}
      <div className="glass rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <div>
              <span className="text-sm font-medium">Auto-Record on Stress</span>
              <p className="text-xs text-muted-foreground">
                Start recording when high stress detected
              </p>
            </div>
          </div>
          <button
            onClick={() => updatePreference('auto_record_on_stress', !preferences.auto_record_on_stress)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors",
              preferences.auto_record_on_stress ? "bg-primary" : "bg-muted"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full bg-white transition-transform",
              preferences.auto_record_on_stress ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
        </div>
      </div>

      {/* Check-in Frequency */}
      <div className="glass rounded-xl p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Default Check-in Interval</span>
        </div>
        <select
          value={preferences.checkin_frequency_hours}
          onChange={(e) => updatePreference('checkin_frequency_hours', Number(e.target.value))}
          className="w-full bg-muted rounded-lg px-3 py-2 text-sm"
        >
          <option value={1}>Every hour</option>
          <option value={2}>Every 2 hours</option>
          <option value={4}>Every 4 hours</option>
          <option value={8}>Every 8 hours</option>
          <option value={24}>Once a day</option>
        </select>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="glass rounded-xl p-4 flex items-center gap-3 text-sos hover:bg-sos/10 transition-colors mt-auto"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  );
}
