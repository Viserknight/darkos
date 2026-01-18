import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceActivationOptions {
  keywords: string[];
  onKeywordDetected: (keyword: string) => void;
  onCancelDetected: () => void;
  enabled: boolean;
}

export function useVoiceActivation({
  keywords,
  onKeywordDetected,
  onCancelDetected,
  enabled
}: VoiceActivationOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sosActivatedRef = useRef(false);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI && enabled) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = (finalTranscript + interimTranscript).toLowerCase();
        setTranscript(fullTranscript);

        // Check for cancel command first (requires fingerprint simulation - we'll use "cancel safe")
        if (sosActivatedRef.current && fullTranscript.includes('cancel')) {
          sosActivatedRef.current = false;
          onCancelDetected();
          return;
        }

        // Check for SOS keywords
        for (const keyword of keywords) {
          if (fullTranscript.includes(keyword.toLowerCase())) {
            sosActivatedRef.current = true;
            onKeywordDetected(keyword);
            break;
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Restart if still enabled
        if (enabled && isListening) {
          try {
            recognition.start();
          } catch (e) {
            // Already started
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [enabled, keywords, onKeywordDetected, onCancelDetected]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    sosActivated: sosActivatedRef.current
  };
}
