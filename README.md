# TalkTutor – Speak. Listen. Learn.

TalkTutor is an interactive, voice-powered web app built with Next.js 15 that helps users learn English by talking with a smart AI chatbot. Whether you're a beginner or brushing up on fluency, TalkTutor makes learning natural and fun — just like having a real conversation.

## 🚀 Features

- **🎤 Speak to Learn** - Say anything — the app uses OpenAI Whisper to understand your spoken English.
- **🤖 Smart Chatbot Replies** - Get personalized, helpful responses powered by ChatGPT.
- **🔊 Natural Voice Feedback** - Hear responses in a smooth, human-like voice with Text-to-Speech (TTS).
- **📝 Real-Time Transcripts** - See what you said and what the AI replied, improving reading and listening skills.
- **🌐 Lightweight and Fast** - Built with Next.js 15 App Router, optimized for performance and scalability.

## 🎯 Who It's For

- English language learners at any level
- Students practicing for speaking exams
- Travelers or professionals improving spoken fluency
- Anyone who wants to talk to a bot — and actually be understood!

## 🛠️ Tech Stack

- Next.js 15
- OpenAI Whisper (Speech-to-Text)
- OpenAI TTS (Text-to-Speech)
- ChatGPT for natural language response
- Edge functions + streaming for fast response

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- OpenAI API key

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/talk-talk.git
   cd talk-talk
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Usage

1. Allow microphone access when prompted
2. Click the microphone button to start speaking
3. Speak clearly in English
4. Click the stop button when finished
5. Wait for TalkTutor to process and respond
6. Continue the conversation to practice!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
