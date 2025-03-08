import { useState, useCallback, useRef } from "react";
import { ChatThread, ChatHistoryByDate } from "@/types";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

export function useThreadManagement() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [threadsByDate, setThreadsByDate] = useState<ChatHistoryByDate>({});
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const api = useApi();
  const { toast } = useToast();

  const fetchThreads = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current || isLoading) return;
    
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [api, toast, isLoading]);

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
      return newThread;
    } catch (error) {
      console.error("Error creating thread:", error);
      toast({
        variant: "destructive",
        title: "Failed to create new conversation",
        description: "Please try again later",
      });
      return null;
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

  return {
    threads,
    threadsByDate,
    currentThread,
    isLoading,
    setCurrentThread: selectThread,
    createNewThread,
    deleteThread,
    fetchThreads
  };
}
