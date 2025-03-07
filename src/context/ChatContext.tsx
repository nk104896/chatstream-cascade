import React, { createContext, useContext, useState, useEffect } from "react";
import { ChatThread, ChatHistoryByDate } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useThreadManagement } from "@/hooks/use-thread-management";
import { useMessaging } from "@/hooks/use-messaging";

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
  const [provider, setProvider] = useState<string>("openai");
  const [model, setModel] = useState<string>("gpt-4o");
  const { isAuthenticated } = useAuth();
  
  const {
    threads,
    threadsByDate,
    currentThread,
    setCurrentThread: selectThread,
    createNewThread,
    deleteThread,
    fetchThreads
  } = useThreadManagement();

  const {
    isProcessing,
    sendMessage
  } = useMessaging({
    provider,
    model,
    currentThread,
    setCurrentThread: (thread: ChatThread) => {
      if (thread) {
        setCurrentThreadState(thread);
      }
    },
    createNewThread,
    fetchThreads
  });

  const [currentThreadState, setCurrentThreadState] = useState<ChatThread | null>(null);

  useEffect(() => {
    setCurrentThreadState(currentThread);
  }, [currentThread]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchThreads();
    } else {
      // Clear threads when not authenticated
      // No need to call hook methods as they already handle the state
    }
  }, [isAuthenticated, fetchThreads]);

  return (
    <ChatContext.Provider
      value={{
        threads,
        threadsByDate,
        currentThread: currentThreadState,
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
