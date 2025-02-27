
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ChatThread } from "@/types";

interface ChatHeaderProps {
  currentThread: ChatThread | null;
  onNewChat: () => void;
  isMobile: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentThread,
  onNewChat,
  isMobile,
}) => {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex-1">
        <h2 className="font-medium">
          {currentThread ? currentThread.title : "New Conversation"}
        </h2>
      </div>
      <Button
        onClick={onNewChat}
        variant="outline"
        size={isMobile ? "icon" : "default"}
        className="transition-all"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        {!isMobile && "New Chat"}
      </Button>
    </div>
  );
};

export default ChatHeader;
