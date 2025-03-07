
import { useState, useCallback } from "react";
import { ChatThread, FileAttachment } from "@/types";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { getThreadTitle } from "@/utils/chat-utils";

interface UseMessagingProps {
  provider: string;
  model: string;
  currentThread: ChatThread | null;
  setCurrentThread: (thread: ChatThread) => void;
  createNewThread: () => Promise<ChatThread | null>;
  fetchThreads: () => Promise<void>;
}

export function useMessaging({
  provider,
  model,
  currentThread,
  setCurrentThread,
  createNewThread,
  fetchThreads
}: UseMessagingProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const api = useApi();
  const { toast } = useToast();

  const sendMessage = async (content: string, files: File[] = []) => {
    let threadToUse = currentThread;
    
    // Create a thread if none exists
    if (!threadToUse) {
      const newThread = await createNewThread();
      if (!newThread) return; // Exit if thread creation failed
      threadToUse = newThread;
    }
    
    setIsProcessing(true);
    
    try {
      // Process files if any
      let fileAttachments: FileAttachment[] = [];
      if (files.length > 0) {
        fileAttachments = await api.uploadFiles(files);
      }
      
      // Send user message
      const userMessage = await api.post(`/threads/${threadToUse.id}/messages`, {
        content,
        sender: "user",
        files: fileAttachments
      });
      
      // Update current thread with user message
      const updatedThread = {
        ...threadToUse,
        messages: [...threadToUse.messages, userMessage],
        updatedAt: new Date()
      };
      
      setCurrentThread(updatedThread);
      
      // Process message with AI - now including provider and model
      const aiResponse = await api.post("/process-message", {
        content,
        thread_id: threadToUse.id,
        provider,
        model
      });
      
      // Update thread with AI response
      const finalUpdatedThread = await api.get(`/threads/${threadToUse.id}`);
      setCurrentThread(finalUpdatedThread);
      
      // Update title if this is the first message
      if (finalUpdatedThread.messages.length <= 2) {
        await api.put(`/threads/${threadToUse.id}`, {
          title: getThreadTitle(content)
        });
      }
      
      // Refresh threads list
      fetchThreads();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again later",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    sendMessage
  };
}
