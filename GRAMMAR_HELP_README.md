# Grammar Help - Minimal Voice Interface

A simple voice-to-text interface for Vietnamese language learners that provides instant translation and grammar explanations.

## Features

✨ **One-Click Voice Input**: Single press-to-talk button interface
🎤 **Voice Recognition**: Converts Vietnamese speech to text using OpenAI Whisper
🔄 **Instant Translation**: Translates Vietnamese to English
📚 **Grammar Explanation**: Provides detailed grammar analysis of the English translation
🌓 **Dark Mode Support**: Automatic dark/light theme support
📱 **Mobile Friendly**: Responsive design that works on all devices

## How to Use

1. **Press the blue "Press to Talk" button** to start recording
2. **Speak in Vietnamese** - the button will turn red and pulse while recording
3. **Click again to stop recording** - the button will show "Processing..."
4. **View your results**:
   - Original Vietnamese text (what you said)
   - English translation
   - Detailed grammar explanation

## Technical Details

### Voice Input

- Uses browser's MediaRecorder API for audio capture
- Supports WebM audio format
- Automatic microphone permission handling

### Speech Recognition

- Powered by OpenAI Whisper model
- Auto-detects Vietnamese and English languages
- High accuracy transcription

### Translation & Grammar

- Uses GPT-4 for translation and grammar analysis
- Structured JSON responses
- Detailed explanations of English grammar rules

### Progress Tracking

- Automatically tracks daily usage
- Maintains learning streaks
- Stores progress in browser localStorage

## Requirements

- Modern web browser with microphone support
- Internet connection
- OpenAI API key (configured in environment variables)

## Navigation

Access the Grammar Help feature at: `/grammar-help`

The interface is part of the larger TalkTalk language learning application with additional features like:

- Speaking quizzes
- Role-play conversations
- Comprehensive progress tracking

## Browser Compatibility

- Chrome/Chromium: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support

Note: First-time users will be prompted to allow microphone access.
