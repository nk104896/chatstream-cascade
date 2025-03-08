
import React, { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/chat/ChatMessage";
import MessageInput from "@/components/chat/MessageInput";
import ModelSelector from "@/components/chat/ModelSelector";
import WelcomeMessage from "@/components/chat/WelcomeMessage";
import { useChat } from "@/context/ChatContext";
import { ArrowDown, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const ChatWindow: React.FC = () => {
  const { 
    currentThread, 
    sendMessage, 
    isProcessing,
    isLoading,
    provider, 
    model, 
    setProvider, 
    setModel,
    createNewThread
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isMobile = useIsMobile();
  
  const handleSendMessage = (content: string, files: File[]) => {
    sendMessage(content, files);
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [currentThread?.messages]);

  // Add scroll listener
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    
    const handleScroll = () => {
      if (scrollArea) {
        const { scrollTop, scrollHeight, clientHeight } = scrollArea;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
      }
    };
    
    scrollArea?.addEventListener("scroll", handleScroll);
    return () => scrollArea?.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  if (!currentThread) {
    return (
      <div className="flex h-full flex-col">
        <div className="p-4 border-b">
          <ModelSelector 
            onProviderChange={setProvider}
            onModelChange={setModel}
            defaultProvider={provider}
            defaultModel={model}
          />
        </div>
        <WelcomeMessage 
          onNewChat={createNewThread}
          platformName="Seamless Chat"
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="p-4 border-b">
        <ModelSelector 
          onProviderChange={setProvider}
          onModelChange={setModel}
          defaultProvider={provider}
          defaultModel={model}
        />
      </div>
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-4"
      >
        {currentThread.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="max-w-md space-y-4">
              <h3 className="text-xl font-medium">Start a new conversation</h3>
              <p className="text-muted-foreground">
                Send a message to begin chatting with the assistant.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {currentThread.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-opacity hover:bg-primary/90"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
      
      <div className={`p-4 ${isMobile ? 'pb-6' : ''}`}>
        <MessageInput 
          onSendMessage={handleSendMessage} 
          isDisabled={isProcessing}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
