
import React from "react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";
import FilePreview from "@/components/chat/FilePreview";
import { useAuth } from "@/context/AuthContext";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const isUserMessage = message.sender === "user";
  
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(message.timestamp));

  return (
    <div 
      className={cn(
        "flex w-full animate-slide-in",
        isUserMessage ? "justify-end" : "justify-start"
      )}
    >
      <div className="flex max-w-[80%] md:max-w-[70%]">
        {!isUserMessage && (
          <div className="mr-3 mt-1 flex-shrink-0">
            <UserAvatar 
              user={null} 
              fallback="AI" 
              size="sm" 
            />
          </div>
        )}
        
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              {isUserMessage ? "You" : "Assistant"}
            </span>
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
          </div>
          
          <div
            className={cn(
              "mt-1 rounded-xl px-4 py-3 shadow-subtle",
              isUserMessage 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {message.content}
          </div>
          
          {message.files && message.files.length > 0 && (
            <div className="mt-2 flex flex-wrap">
              {message.files.map((file) => (
                <FilePreview
                  key={file.id}
                  file={file}
                  isAttached
                />
              ))}
            </div>
          )}
        </div>
        
        {isUserMessage && (
          <div className="ml-3 mt-1 flex-shrink-0">
            <UserAvatar user={user} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
