import { useState, useEffect, useRef } from 'react';
import { Video, Mic, Camera, FileText, Trash2, Square, Eye, EyeOff, Scan, Car, MapPin, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStealthRecording } from '@/hooks/useStealthRecording';
import { useFaceRecognition, AnalysisType } from '@/hooks/useFaceRecognition';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Evidence {
  id: string;
  recording_type: string;
  transcription: string | null;
  created_at: string;
  file_url: string | null;
}

type TabType = 'record' | 'scan' | 'vault';

export function EvidenceApp() {
  const { user } = useAuth();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | null>(null);
  const [textNote, setTextNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('record');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Stealth recording
  const { 
    isRecording: isStealthRecording, 
    formattedDuration,
    startStealthRecording, 
    stopStealthRecording 
  } = useStealthRecording();

  // Face recognition
  const {
    isCapturing,
    isAnalyzing,
    lastAnalysis,
    videoRef,
    startCamera,
    stopCamera,
    captureAndAnalyze
  } = useFaceRecognition();

  useEffect(() => {
    if (user) {
      fetchEvidence();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEvidence = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('evidence_recordings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setEvidence(data);
    }
    setLoading(false);
  };

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      const constraints = type === 'video' 
        ? { video: true, audio: true }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const mediaRecorder = new MediaRecorder(stream);
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { 
          type: type === 'video' ? 'video/webm' : 'audio/webm' 
        });
        
        await saveRecording(blob, type);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingType(type);
      toast.success(`${type === 'video' ? 'Video' : 'Audio'} recording started`);
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Could not access camera/microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingType(null);
    }
  };

  const saveRecording = async (blob: Blob, type: 'audio' | 'video') => {
    if (!user) return;

    try {
      let location: { lat: number; lng: number } | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {}

      const fileName = `${user.id}/${Date.now()}.webm`;
      const { data: uploadData } = await supabase.storage
        .from('evidence')
        .upload(fileName, blob);

      let fileUrl = null;
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('evidence')
          .getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      const { data } = await supabase
        .from('evidence_recordings')
        .insert({
          user_id: user.id,
          recording_type: type,
          file_url: fileUrl,
          location_lat: location?.lat,
          location_lng: location?.lng
        })
        .select()
        .single();

      if (data) {
        setEvidence(prev => [data, ...prev]);
        toast.success('Recording saved securely');
      }
    } catch (error) {
      console.error('Failed to save recording:', error);
      toast.error('Failed to save recording');
    }
  };

  const saveTextNote = async () => {
    if (!user || !textNote.trim()) return;

    try {
      let location: { lat: number; lng: number } | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {}

      const { data } = await supabase
        .from('evidence_recordings')
        .insert({
          user_id: user.id,
          recording_type: 'text',
          transcription: textNote,
          location_lat: location?.lat,
          location_lng: location?.lng
        })
        .select()
        .single();

      if (data) {
        setEvidence(prev => [data, ...prev]);
        setTextNote('');
        toast.success('Note saved securely');
      }
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const deleteEvidence = async (id: string) => {
    const { error } = await supabase
      .from('evidence_recordings')
      .delete()
      .eq('id', id);

    if (!error) {
      setEvidence(prev => prev.filter(e => e.id !== id));
      toast.success('Evidence deleted');
    }
  };

  const handleStealthRecord = async (type: 'audio' | 'video') => {
    if (isStealthRecording) {
      stopStealthRecording();
      fetchEvidence();
    } else {
      await startStealthRecording({ type, autoStopAfterMinutes: 30 });
    }
  };

  const handleScan = async (type: AnalysisType) => {
    if (!isCapturing) {
      await startCamera('environment');
    } else {
      await captureAndAnalyze(type);
      fetchEvidence();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'photo': return <Camera className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const isStealth = (item: Evidence) => item.transcription?.startsWith('[STEALTH]');

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Video className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Evidence Vault</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(['record', 'scan', 'vault'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab !== 'scan' && isCapturing) stopCamera();
            }}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize",
              activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Record Tab */}
      {activeTab === 'record' && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {/* Normal Recording */}
          <div className="glass rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-2">Standard Recording</p>
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-full bg-sos hover:bg-sos/90 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4" />
                <span className="animate-pulse">Stop Recording</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => startRecording('audio')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Audio
                </button>
                <button
                  onClick={() => startRecording('video')}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Video
                </button>
              </div>
            )}
          </div>

          {/* Stealth Recording */}
          <div className="glass rounded-xl p-3 border border-warning/30">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="w-4 h-4 text-warning" />
              <p className="text-xs font-medium text-warning">Stealth Mode</p>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Records without visible indicators
            </p>
            {isStealthRecording ? (
              <button
                onClick={() => handleStealthRecord('audio')}
                className="w-full bg-warning/20 hover:bg-warning/30 text-warning rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop ({formattedDuration})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStealthRecord('audio')}
                  className="bg-warning/20 hover:bg-warning/30 text-warning rounded-lg px-3 py-2 text-xs font-medium flex items-center justify-center gap-1"
                >
                  <EyeOff className="w-3 h-3" />
                  Audio
                </button>
                <button
                  onClick={() => handleStealthRecord('video')}
                  className="bg-warning/20 hover:bg-warning/30 text-warning rounded-lg px-3 py-2 text-xs font-medium flex items-center justify-center gap-1"
                >
                  <EyeOff className="w-3 h-3" />
                  Video
                </button>
              </div>
            )}
          </div>

          {/* Quick Note */}
          <div className="glass rounded-xl p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={textNote}
                onChange={(e) => setTextNote(e.target.value)}
                placeholder="Quick note..."
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={saveTextNote}
                disabled={!textNote.trim()}
                className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-foreground rounded-lg px-3 py-2"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan Tab - Face Recognition & Safety Analysis */}
      {activeTab === 'scan' && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {/* Camera Preview */}
          <div className="glass rounded-xl p-2 relative aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover rounded-lg bg-muted",
                !isCapturing && "hidden"
              )}
            />
            {!isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <Camera className="w-8 h-8" />
              </div>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Scan className="w-8 h-8 text-primary animate-pulse mx-auto mb-2" />
                  <p className="text-xs">Analyzing...</p>
                </div>
              </div>
            )}
          </div>

          {/* Scan Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleScan('face_recognition')}
              disabled={isAnalyzing}
              className="bg-primary/20 hover:bg-primary/30 text-primary rounded-lg px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {isCapturing ? 'Scan Face' : 'Start Camera'}
            </button>
            <button
              onClick={() => handleScan('environment_scan')}
              disabled={isAnalyzing || !isCapturing}
              className="bg-safe/20 hover:bg-safe/30 text-safe rounded-lg px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" />
              Scan Area
            </button>
            <button
              onClick={() => handleScan('license_plate')}
              disabled={isAnalyzing || !isCapturing}
              className="bg-secondary/20 hover:bg-secondary/30 text-secondary rounded-lg px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Car className="w-4 h-4" />
              Scan Plate
            </button>
            <button
              onClick={stopCamera}
              disabled={!isCapturing}
              className="bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </div>

          {/* Last Analysis Result */}
          {lastAnalysis && (
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <p className="text-xs font-medium">Last Analysis</p>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-4">
                {lastAnalysis.analysis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Vault Tab - Evidence List */}
      {activeTab === 'vault' && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : evidence.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No evidence recorded</p>
            </div>
          ) : (
            evidence.map(item => (
              <div
                key={item.id}
                className={cn(
                  "glass rounded-xl p-3 flex items-center gap-3",
                  isStealth(item) && "border border-warning/30"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  item.recording_type === 'video' ? "bg-secondary/20 text-secondary" :
                  item.recording_type === 'audio' ? "bg-primary/20 text-primary" :
                  item.recording_type === 'photo' ? "bg-safe/20 text-safe" :
                  "bg-accent/20 text-accent"
                )}>
                  {isStealth(item) ? <EyeOff className="w-4 h-4" /> : getIcon(item.recording_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize flex items-center gap-1">
                    {isStealth(item) && <span className="text-warning text-xs">[S]</span>}
                    {item.recording_type} {item.recording_type === 'text' ? 'Note' : 'Recording'}
                  </p>
                  {item.transcription && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.transcription.replace('[STEALTH] ', '').replace(/\[.*?\] /, '')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.created_at)}
                  </p>
                </div>

                <button
                  onClick={() => deleteEvidence(item.id)}
                  className="text-muted-foreground hover:text-sos p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
