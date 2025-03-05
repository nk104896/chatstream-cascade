
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ChatThread, Message, FileAttachment, ChatHistoryByDate } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";

interface ChatContextType {
  threads: ChatThread[];
  threadsByDate: ChatHistoryByDate;
  currentThread: ChatThread | null;
  isProcessing: boolean;
  provider: string;
  model: string;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  createNewThread: () => void;
  setCurrentThread: (threadId: string) => void;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  deleteThread: (threadId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [threadsByDate, setThreadsByDate] = useState<ChatHistoryByDate>({});
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [provider, setProvider] = useState<string>("openai");
  const [model, setModel] = useState<string>("gpt-4o");
  const { toast } = useToast();
  const api = useApi();
  const { isAuthenticated } = useAuth();

  // Load threads when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchThreads();
    } else {
      // Clear threads when not authenticated
      setThreads([]);
      setThreadsByDate({});
      setCurrentThread(null);
    }
  }, [isAuthenticated]);

  // Fetch threads from API
  const fetchThreads = useCallback(async () => {
    try {
      // Get threads
      const threadsData = await api.get("/threads");
      setThreads(threadsData);
      
      // Get history by date
      const historyData = await api.get("/history");
      setThreadsByDate(historyData);
    } catch (error) {
      console.error("Error fetching threads:", error);
      toast({
        variant: "destructive",
        title: "Failed to load conversations",
        description: "Please try again later",
      });
    }
  }, [api, toast]);

  const createNewThread = useCallback(async () => {
    try {
      const newThread = await api.post("/threads", {
        title: "New Conversation"
      });
      
      setThreads(prevThreads => [newThread, ...prevThreads]);
      
      // Update threadsByDate
      const dateStr = new Date(newThread.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      setThreadsByDate(prev => {
        const updated = { ...prev };
        if (!updated[dateStr]) {
          updated[dateStr] = [];
        }
        updated[dateStr] = [newThread, ...updated[dateStr]];
        return updated;
      });
      
      setCurrentThread(newThread);
    } catch (error) {
      console.error("Error creating thread:", error);
      toast({
        variant: "destructive",
        title: "Failed to create new conversation",
        description: "Please try again later",
      });
    }
  }, [api, toast]);

  const selectThread = useCallback(async (threadId: string) => {
    try {
      const thread = await api.get(`/threads/${threadId}`);
      setCurrentThread(thread);
    } catch (error) {
      console.error("Error selecting thread:", error);
      toast({
        variant: "destructive",
        title: "Failed to load conversation",
        description: "Please try again later",
      });
    }
  }, [api, toast]);

  const sendMessage = async (content: string, files: File[] = []) => {
    // Create a thread if none exists
    if (!currentThread) {
      await createNewThread();
    }
    
    setIsProcessing(true);
    
    try {
      // Process files if any
      let fileAttachments: FileAttachment[] = [];
      if (files.length > 0) {
        fileAttachments = await api.uploadFiles(files);
      }
      
      // Send user message
      const userMessage = await api.post(`/threads/${currentThread!.id}/messages`, {
        content,
        sender: "user",
        files: fileAttachments
      });
      
      // Update current thread with user message
      setCurrentThread(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, userMessage],
          updatedAt: new Date()
        };
      });
      
      // Process message with AI - now including provider and model
      const aiResponse = await api.post("/process-message", {
        content,
        thread_id: currentThread!.id,
        provider,
        model
      });
      
      // Update thread with AI response
      const updatedThread = await api.get(`/threads/${currentThread!.id}`);
      setCurrentThread(updatedThread);
      
      // Update title if this is the first message
      if (updatedThread.messages.length <= 2) {
        const titleUpdated = await api.put(`/threads/${currentThread!.id}`, {
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
  
  // Helper to generate a thread title from the first message
  const getThreadTitle = (message: string): string => {
    // Limit to 30 characters
    const maxLength = 30;
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength - 3) + "...";
  };

  const deleteThread = async (threadId: string) => {
    try {
      await api.delete(`/threads/${threadId}`);
      
      // Update threads state
      setThreads(prevThreads => prevThreads.filter(t => t.id !== threadId));
      
      // Update threadsByDate
      setThreadsByDate(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(date => {
          updated[date] = updated[date].filter(t => t.id !== threadId);
          if (updated[date].length === 0) {
            delete updated[date];
          }
        });
        return updated;
      });
      
      // Clear current thread if it was deleted
      if (currentThread?.id === threadId) {
        setCurrentThread(null);
      }
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete conversation",
        description: "Please try again later",
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        threads,
        threadsByDate,
        currentThread,
        isProcessing,
        provider,
        model,
        setProvider,
        setModel,
        createNewThread,
        setCurrentThread: selectThread,
        sendMessage,
        deleteThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
