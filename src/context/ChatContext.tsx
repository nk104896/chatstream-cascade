
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { ChatThread, ChatHistoryByDate } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useThreadManagement } from "@/hooks/use-thread-management";
import { useMessaging } from "@/hooks/use-messaging";

interface ChatContextType {
  threads: ChatThread[];
  threadsByDate: ChatHistoryByDate;
  currentThread: ChatThread | null;
  isProcessing: boolean;
  isLoading: boolean;
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
  const didInitialFetchRef = useRef(false);
  
  const {
    threads,
    threadsByDate,
    currentThread,
    isLoading,
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
    // Only fetch threads if authenticated and haven't fetched yet
    if (isAuthenticated && !didInitialFetchRef.current) {
      fetchThreads();
      didInitialFetchRef.current = true;
    } else if (!isAuthenticated) {
      // Reset the fetch flag when logging out
      didInitialFetchRef.current = false;
    }
  }, [isAuthenticated, fetchThreads]);

  return (
    <ChatContext.Provider
      value={{
        threads,
        threadsByDate,
        currentThread: currentThreadState,
        isProcessing,
        isLoading,
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
