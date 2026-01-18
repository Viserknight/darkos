import { useState, useEffect, useRef } from 'react';
import { Video, Mic, Camera, FileText, Trash2, Play, Square, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Evidence {
  id: string;
  recording_type: string;
  transcription: string | null;
  created_at: string;
  file_url: string | null;
}

export function EvidenceApp() {
  const { user } = useAuth();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | 'text' | null>(null);
  const [textNote, setTextNote] = useState('');
  const [loading, setLoading] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (user) {
      fetchEvidence();
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
        
        // Stop all tracks
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
      // Get current location
      let location: { lat: number; lng: number } | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {
        // Location not available
      }

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(fileName, blob);

      let fileUrl = null;
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('evidence')
          .getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      // Save record
      const { data, error } = await supabase
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
      } catch {
        // Location not available
      }

      const { data, error } = await supabase
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
      console.error('Failed to save note:', error);
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

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Video className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Evidence Vault</h2>
      </div>

      {/* Recording controls */}
      <div className="glass rounded-xl p-4 mb-4">
        <p className="text-sm text-muted-foreground mb-3">
          Record evidence securely with location and timestamp
        </p>
        
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="w-full bg-sos hover:bg-sos/90 text-white rounded-lg px-4 py-3 text-sm font-medium flex items-center justify-center gap-2"
          >
            <Square className="w-4 h-4" />
            <span className="animate-pulse">Stop Recording</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => startRecording('audio')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" />
              Audio
            </button>
            <button
              onClick={() => startRecording('video')}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              Video
            </button>
          </div>
        )}

        {/* Text note input */}
        <div className="mt-3 flex gap-2">
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

      {/* Evidence list */}
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
              className="glass rounded-xl p-3 flex items-center gap-3"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                item.recording_type === 'video' ? "bg-secondary/20 text-secondary" :
                item.recording_type === 'audio' ? "bg-primary/20 text-primary" :
                "bg-accent/20 text-accent"
              )}>
                {getIcon(item.recording_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize">
                  {item.recording_type} {item.recording_type === 'text' ? 'Note' : 'Recording'}
                </p>
                {item.transcription && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.transcription}
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
    </div>
  );
}
