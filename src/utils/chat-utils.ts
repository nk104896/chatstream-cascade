
import { FileAttachment } from "@/types";

// Helper to generate a thread title from the first message
export const getThreadTitle = (message: string): string => {
  // Limit to 30 characters
  const maxLength = 30;
  if (message.length <= maxLength) {
    return message;
  }
  return message.substring(0, maxLength - 3) + "...";
};

// Utility to prepare messages for AI processing
export const prepareMessagesForAI = (content: string, files: FileAttachment[] = []) => {
  // Here you can add logic to format messages for different AI providers
  return {
    content,
    files
  };
};

// Get mime type for file handling
export const getFileType = (file: File | FileAttachment): string => {
  // Check if it's a browser File object
  if ('type' in file && typeof file.type === 'string') {
    return file.type;
  }
  
  // For FileAttachment objects or if type is empty, infer type from extension
  const fileName = 'name' in file ? file.name : '';
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch(extension) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
    case 'doc':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
};

// Format content for AI based on provider
export const formatMessagesForProvider = (
  messages: Array<{role: string, content: string}>, 
  provider: string
) => {
  switch (provider.toLowerCase()) {
    case 'openai':
      // OpenAI format is already our default
      return messages;
    case 'gemini':
      // Convert to Gemini format
      return messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
      }));
    case 'mistral':
    case 'anthropic':
    default:
      // Return default format
      return messages;
  }
};

// Helper to limit context length
export const limitContextLength = (
  messages: Array<{role: string, content: string}>,
  maxTokens: number = 8000
): Array<{role: string, content: string}> => {
  // Simple estimation: 1 token ≈ 4 characters
  let totalEstimatedTokens = 0;
  const result = [];
  
  // Always include system message if present
  const systemMessages = messages.filter(msg => msg.role === 'system');
  const nonSystemMessages = messages.filter(msg => msg.role !== 'system').reverse();
  
  // Add system messages first
  for (const msg of systemMessages) {
    const estimatedTokens = Math.ceil(msg.content.length / 4);
    totalEstimatedTokens += estimatedTokens;
    result.push(msg);
  }
  
  // Add recent messages until we hit the token limit
  for (const msg of nonSystemMessages) {
    const estimatedTokens = Math.ceil(msg.content.length / 4);
    if (totalEstimatedTokens + estimatedTokens <= maxTokens) {
      result.push(msg);
      totalEstimatedTokens += estimatedTokens;
    } else {
      // If a message is too large, truncate it
      if (result.length === 0) {
        const truncatedContent = msg.content.substring(0, (maxTokens - totalEstimatedTokens) * 4);
        result.push({...msg, content: truncatedContent});
      }
      break;
    }
  }
  
  // Return messages in correct chronological order
  return result.sort((a, b) => {
    // Keep system messages at the beginning
    if (a.role === 'system') return -1;
    if (b.role === 'system') return 1;
    return 0;
  });
};

// Format thread messages for AI consumption with provider-specific formatting
export const prepareThreadHistoryForAI = (
  thread: {messages: Array<{sender: string, content: string, timestamp: Date}>},
  userMessage: string,
  provider: string,
  maxTokens: number = 8000
) => {
  // Convert thread messages to the format expected by AI providers
  const messages = thread.messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
  
  // Add the current user message
  messages.push({
    role: 'user',
    content: userMessage
  });
  
  // Limit context length
  const limitedMessages = limitContextLength(messages, maxTokens);
  
  // Format for the specific provider
  return formatMessagesForProvider(limitedMessages, provider);
};
