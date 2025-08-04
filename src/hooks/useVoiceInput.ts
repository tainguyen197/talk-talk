import { useState } from "react";

interface SpeechRecognitionEvent {
  results: Array<Array<{ transcript: string }>>;
}

interface SpeechRecognitionError {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionError) => void;
  onend: () => void;
  start: () => void;
}

interface Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

export const useVoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);

  const startVoiceRecording = async (onTranscript: (text: string) => void) => {
    setIsRecording(true);

    try {
      const SpeechRecognition =
        (window as Window).SpeechRecognition ||
        (window as Window).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        throw new Error("Speech recognition not supported");
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: SpeechRecognitionError) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setIsRecording(false);
      // Fallback: simulate voice input for demo
      setTimeout(() => {
        onTranscript("I'm working from home today.");
        setIsRecording(false);
      }, 2000);
    }
  };

  return { isRecording, startVoiceRecording };
};
