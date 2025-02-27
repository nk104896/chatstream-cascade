
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ChatThread, Message, FileAttachment, ChatHistoryByDate } from "@/types";
import { mockChatThreads, generateMockThreadsByDate } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

interface ChatContextType {
  threads: ChatThread[];
  threadsByDate: ChatHistoryByDate;
  currentThread: ChatThread | null;
  isProcessing: boolean;
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
  const { toast } = useToast();

  // Initialize with mock data
  useEffect(() => {
    setThreads(mockChatThreads);
    setThreadsByDate(generateMockThreadsByDate());
    setCurrentThread(null);
  }, []);

  // Helper to update threadsByDate
  const updateThreadsByDate = useCallback((updatedThreads: ChatThread[]) => {
    const newThreadsByDate: ChatHistoryByDate = {};
    
    updatedThreads.forEach(thread => {
      const dateStr = thread.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!newThreadsByDate[dateStr]) {
        newThreadsByDate[dateStr] = [];
      }
      
      newThreadsByDate[dateStr].push(thread);
    });
    
    setThreadsByDate(newThreadsByDate);
  }, []);

  const createNewThread = useCallback(() => {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setThreads(prevThreads => {
      const updatedThreads = [newThread, ...prevThreads];
      updateThreadsByDate(updatedThreads);
      return updatedThreads;
    });

    setCurrentThread(newThread);
  }, [updateThreadsByDate]);

  const selectThread = useCallback((threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setCurrentThread(thread);
    }
  }, [threads]);

  const processUserMessage = async (content: string, files: FileAttachment[] = []) => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would send the message to your backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new message from the assistant
      const assistantResponse: Message = {
        id: `msg-${Date.now()}-assistant`,
        content: generateMockResponse(content),
        sender: "assistant",
        timestamp: new Date(),
        files: [],
      };
      
      return assistantResponse;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Message processing failed",
        description: "Unable to process your message. Please try again.",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper to generate a mock response
  const generateMockResponse = (userMessage: string): string => {
    if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
      return "Hello! How can I assist you today?";
    } else if (userMessage.toLowerCase().includes("help")) {
      return "I'm here to help! What do you need assistance with?";
    } else if (userMessage.toLowerCase().includes("thanks") || userMessage.toLowerCase().includes("thank you")) {
      return "You're welcome! Is there anything else you'd like to know?";
    } else if (userMessage.toLowerCase().includes("feature")) {
      return "This chat application supports text messaging, file attachments, and conversation history. Is there a specific feature you're interested in?";
    } else {
      return "I understand your message. How can I help you further with that?";
    }
  };

  const sendMessage = async (content: string, files: File[] = []) => {
    if (!currentThread) {
      createNewThread();
    }
    
    try {
      // Process files
      const fileAttachments: FileAttachment[] = await Promise.all(
        files.map(async (file) => {
          // In a real app, you would upload these files to your backend/storage
          const fileId = `file-${Date.now()}-${file.name}`;
          const fileUrl = URL.createObjectURL(file);
          
          // Create preview for images
          let preview = undefined;
          if (file.type.startsWith('image/')) {
            preview = fileUrl;
          }
          
          return {
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            url: fileUrl,
            preview
          };
        })
      );
      
      // Create user message
      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        content,
        sender: "user",
        timestamp: new Date(),
        files: fileAttachments,
      };
      
      // Add user message to current thread
      const updatedThread = {
        ...currentThread!,
        messages: [...currentThread!.messages, userMessage],
        updatedAt: new Date(),
      };
      
      // Generate assistant response
      const assistantMessage = await processUserMessage(content, fileAttachments);
      
      // Add assistant message to thread
      const finalThread = {
        ...updatedThread,
        messages: [...updatedThread.messages, assistantMessage],
        title: updatedThread.messages.length === 0 ? getThreadTitle(content) : updatedThread.title,
        updatedAt: new Date(),
      };
      
      // Update threads
      setThreads(prevThreads => {
        const updatedThreads = prevThreads.map(t => 
          t.id === finalThread.id ? finalThread : t
        );
        updateThreadsByDate(updatedThreads);
        return updatedThreads;
      });
      
      // Update current thread
      setCurrentThread(finalThread);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again later",
      });
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

  const deleteThread = (threadId: string) => {
    setThreads(prevThreads => {
      const updatedThreads = prevThreads.filter(t => t.id !== threadId);
      updateThreadsByDate(updatedThreads);
      return updatedThreads;
    });
    
    if (currentThread?.id === threadId) {
      setCurrentThread(null);
    }
    
    toast({
      title: "Conversation deleted",
      description: "The conversation has been successfully deleted",
    });
  };

  return (
    <ChatContext.Provider
      value={{
        threads,
        threadsByDate,
        currentThread,
        isProcessing,
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
