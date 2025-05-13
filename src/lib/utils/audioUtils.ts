/**
 * Start recording audio from the microphone
 * @returns A promise that resolves to a MediaRecorder instance
 */
export const startRecording = async (): Promise<{
  mediaRecorder: MediaRecorder;
  audioChunks: Blob[];
}> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];

    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });

    mediaRecorder.start();
    return { mediaRecorder, audioChunks };
  } catch (error) {
    console.error('Error starting recording:', error);
    throw new Error('Failed to start recording');
  }
};

/**
 * Stop recording and get the recorded audio blob
 * @param mediaRecorder The MediaRecorder instance to stop
 * @param audioChunks Array of recorded audio chunks
 * @returns A promise that resolves to the recorded audio blob
 */
export const stopRecording = (
  mediaRecorder: MediaRecorder,
  audioChunks: Blob[]
): Promise<Blob> => {
  return new Promise((resolve) => {
    mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      // Stop all tracks of the stream
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      resolve(audioBlob);
    });

    mediaRecorder.stop();
  });
};

/**
 * Send audio to the server for transcription
 * @param audioBlob The audio blob to transcribe
 * @returns A promise that resolves to the transcribed text
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch('/api/speech-to-text', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to transcribe audio');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

/**
 * Convert text to speech and play the audio
 * @param text The text to convert to speech
 * @returns A promise that resolves when the audio starts playing
 */
export const speakText = async (text: string): Promise<HTMLAudioElement> => {
  try {
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize speech');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.play();
    
    // Clean up the URL object when the audio is done playing
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl);
    });

    return audio;
  } catch (error) {
    console.error('Error speaking text:', error);
    throw error;
  }
}; 