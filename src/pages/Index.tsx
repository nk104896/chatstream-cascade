
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, X } from "lucide-react";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatHistory from "@/components/chat/ChatHistory";
import ChatHeader from "@/components/chat/ChatHeader";
import UserAvatar from "@/components/ui/UserAvatar";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";

// Main content with providers
const Index = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </AuthProvider>
  );
};

// Chat application component
const ChatApp: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    currentThread, 
    threadsByDate, 
    createNewThread, 
    setCurrentThread, 
    deleteThread 
  } = useChat();

  // Close sidebar on mobile when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewChat = () => {
    createNewThread();
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThread(threadId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute left-4 top-4 z-50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={`
          flex h-full flex-col border-r bg-sidebar transition-all duration-300 ease-in-out
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-40 w-[80%] max-w-md transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'w-[300px] min-w-[300px]'
          }
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold">Chat</h1>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* New chat button */}
        <div className="p-4">
          <Button 
            onClick={handleNewChat}
            className="w-full justify-start"
          >
            <span className="mr-2">+</span> New Chat
          </Button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-hidden p-4">
          <ChatHistory 
            threadsByDate={threadsByDate}
            currentThreadId={currentThread?.id ?? null}
            onSelectThread={handleSelectThread}
            onDeleteThread={deleteThread}
          />
        </div>
        
        {/* User section */}
        <div className="border-t p-4">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserAvatar user={user} size="sm" />
                <span className="ml-2 text-sm font-medium">
                  {user?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-xs"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setAuthModalOpen(true)}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat header */}
        <ChatHeader 
          currentThread={currentThread}
          onNewChat={handleNewChat}
          isMobile={isMobile}
        />
        
        {/* Chat window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow />
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Auth modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
