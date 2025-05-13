export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
};

export type ChatHistory = Message[];

/**
 * Send a message to the chat API and process the streamed response
 * @param message The user's message to send
 * @param history The chat history
 * @param onChunk Callback function called for each chunk of the response
 * @returns A promise that resolves when the response is complete
 */
export const sendChatMessage = async (
  message: string,
  history: Message[],
  onChunk: (chunk: string) => void
): Promise<string> => {
  try {
    // Convert our Message type to OpenAI's format
    const formattedHistory = history
      .filter((msg) => msg.role !== 'system')
      .map(({ role, content }) => ({ role, content }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: formattedHistory,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send message: ${errorText}`);
    }

    // Process the stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      onChunk(chunk);
    }

    return result;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Generate a unique message ID
 * @returns A unique string ID
 */
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Add a message to the chat history
 * @param history The current chat history
 * @param role The role of the message sender
 * @param content The content of the message
 * @returns The updated chat history
 */
export const addMessage = (
  history: ChatHistory,
  role: 'user' | 'assistant' | 'system',
  content: string
): ChatHistory => {
  return [
    ...history,
    {
      id: generateMessageId(),
      role,
      content,
      timestamp: Date.now(),
    },
  ];
}; 