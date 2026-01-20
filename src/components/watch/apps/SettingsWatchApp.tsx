import { useState, useEffect } from 'react';
import { Settings, User, Bell, Mic, Shield, LogOut, Volume2, EyeOff, Moon, Sun, Smartphone, Calculator, Clock, Palette, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDiscreetMode, DisguiseType } from '@/hooks/useDiscreetMode';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Preferences {
  voice_activation_enabled: boolean;
  sos_voice_keywords: string[];
  auto_record_on_stress: boolean;
  checkin_frequency_hours: number;
}

type SettingsSection = 'main' | 'voice' | 'discreet' | 'safety' | 'about';

export function SettingsWatchApp() {
  const { user, signOut } = useAuth();
  const { 
    isDiscreetMode, 
    disguiseType,
    secretCode, 
    enableDiscreetMode, 
    disableDiscreetMode,
    setSecretCode 
  } = useDiscreetMode();
  
  const [preferences, setPreferences] = useState<Preferences>({
    voice_activation_enabled: true,
    sos_voice_keywords: ['help', 'stop'],
    auto_record_on_stress: false,
    checkin_frequency_hours: 24
  });
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');
  const [currentSection, setCurrentSection] = useState<SettingsSection>('main');
  const [newSecretCode, setNewSecretCode] = useState('');
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setLoading(false);
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
        voice_activation_enabled: data.voice_activation_enabled ?? true,
        sos_voice_keywords: data.sos_voice_keywords || ['help', 'stop'],
        auto_record_on_stress: data.auto_record_on_stress ?? false,
        checkin_frequency_hours: data.checkin_frequency_hours ?? 24
      });
    }
    setLoading(false);
  };

  const updatePreference = async (key: keyof Preferences, value: any) => {
    if (!user) {
      toast.error('Sign in to save settings');
      return;
    }

    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    // Try to upsert (insert or update)
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ 
        user_id: user.id,
        [key]: value,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id' 
      });

    if (error) {
      console.error('Failed to save:', error);
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

  const handleEnableDiscreet = (type: DisguiseType) => {
    enableDiscreetMode(type);
    toast.success(`Discreet mode enabled (${type})`);
  };

  const handleUpdateSecretCode = () => {
    if (newSecretCode.length >= 4) {
      setSecretCode(newSecretCode);
      toast.success('Secret code updated');
      setNewSecretCode('');
    } else {
      toast.error('Code must be at least 4 characters');
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'voice':
        return (
          <div className="space-y-3">
            {/* Voice Activation */}
            <div className="glass rounded-xl p-4">
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
            <div className="glass rounded-xl p-4">
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
          </div>
        );

      case 'discreet':
        return (
          <div className="space-y-3">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <EyeOff className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Discreet Mode</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Disguise this app while keeping safety features active. Enter your secret code to reveal the real app.
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleEnableDiscreet('calculator')}
                  className="w-full flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <Calculator className="w-5 h-5 text-calm" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Calculator Mode</p>
                    <p className="text-xs text-muted-foreground">Looks like a normal calculator</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleEnableDiscreet('clock')}
                  className="w-full flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  <Clock className="w-5 h-5 text-secondary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Clock Mode</p>
                    <p className="text-xs text-muted-foreground">Simple clock display</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Secret Code */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Secret Unlock Code</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Current: {secretCode.split('').map(() => '•').join('')}
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={newSecretCode}
                  onChange={(e) => setNewSecretCode(e.target.value)}
                  placeholder="New code (4+ chars)"
                  className="flex-1 bg-muted rounded-lg px-3 py-1.5 text-sm"
                />
                <button
                  onClick={handleUpdateSecretCode}
                  className="bg-warning/20 hover:bg-warning/30 text-warning px-3 py-1.5 rounded-lg text-sm"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        );

      case 'safety':
        return (
          <div className="space-y-3">
            {/* Auto Recording */}
            <div className="glass rounded-xl p-4">
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
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Check-in Interval</span>
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

            {/* Haptic Feedback */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Haptic Feedback</span>
                </div>
                <button
                  onClick={() => setHapticEnabled(!hapticEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors",
                    hapticEnabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full bg-white transition-transform",
                    hapticEnabled ? "translate-x-6" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors",
                    notificationsEnabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full bg-white transition-transform",
                    notificationsEnabled ? "translate-x-6" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-3">
            <div className="glass rounded-xl p-4 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-1">SafeGuard OS</h3>
              <p className="text-xs text-muted-foreground mb-3">Version 1.0.0</p>
              <p className="text-xs text-muted-foreground">
                A safety-focused smartwatch OS designed to protect and empower.
              </p>
            </div>

            <div className="glass rounded-xl p-4">
              <h4 className="text-sm font-medium mb-2">Features</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Voice-activated SOS</li>
                <li>• Panic gesture detection</li>
                <li>• Health monitoring</li>
                <li>• Location tracking & sharing</li>
                <li>• Evidence recording</li>
                <li>• Auto check-in alerts</li>
                <li>• Discreet mode</li>
                <li>• Emergency contacts</li>
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            {/* Profile Card */}
            {user ? (
              <div className="glass rounded-xl p-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Signed in</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-xl p-3 mb-3 text-center">
                <p className="text-sm text-muted-foreground">Sign in for full features</p>
              </div>
            )}

            {/* Settings Menu */}
            <button
              onClick={() => setCurrentSection('voice')}
              className="w-full glass rounded-xl p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <Mic className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Voice Settings</span>
            </button>

            <button
              onClick={() => setCurrentSection('discreet')}
              className="w-full glass rounded-xl p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <EyeOff className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium">Discreet Mode</span>
            </button>

            <button
              onClick={() => setCurrentSection('safety')}
              className="w-full glass rounded-xl p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <Shield className="w-5 h-5 text-safe" />
              <span className="text-sm font-medium">Safety Settings</span>
            </button>

            <button
              onClick={() => setCurrentSection('about')}
              className="w-full glass rounded-xl p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <Info className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">About</span>
            </button>

            {/* Sign Out */}
            {user && (
              <button
                onClick={handleSignOut}
                className="w-full glass rounded-xl p-3 flex items-center gap-3 text-sos hover:bg-sos/10 transition-colors mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        {currentSection !== 'main' ? (
          <button
            onClick={() => setCurrentSection('main')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ←
          </button>
        ) : (
          <Settings className="w-5 h-5 text-primary" />
        )}
        <h2 className="text-lg font-semibold">
          {currentSection === 'main' ? 'Settings' : 
           currentSection === 'voice' ? 'Voice' :
           currentSection === 'discreet' ? 'Discreet' :
           currentSection === 'safety' ? 'Safety' : 'About'}
        </h2>
      </div>

      {renderSection()}
    </div>
  );
}
