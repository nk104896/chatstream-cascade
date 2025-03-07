
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
  // For now, just returning the content
  return {
    content,
    files
  };
};
