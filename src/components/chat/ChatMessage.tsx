
import React from "react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";
import FilePreview from "@/components/chat/FilePreview";
import CodeBlock from "@/components/ui/CodeBlock";
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

  // Format message content with proper styling for AI responses
  const formatMessageContent = (content: string) => {
    if (isUserMessage) return <p>{content}</p>;

    // Extract code blocks first
    const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)\n```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Find all code blocks
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push({ type: 'text', content: textBefore });
      }

      // Add the code block
      const language = match[1] || 'javascript';
      const code = match[2];
      parts.push({ type: 'code', language, content: code });

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last code block
    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.substring(lastIndex) });
    }

    // If no code blocks were found, just return the formatted text
    if (parts.length === 0) {
      return formatTextContent(content);
    }

    // Render all parts
    return (
      <div className="ai-message-content prose-sm max-w-none dark:prose-invert">
        {parts.map((part, index) => {
          if (part.type === 'code') {
            return (
              <CodeBlock
                key={index}
                code={part.content}
                language={part.language || 'javascript'}
                showLineNumbers={true}
              />
            );
          } else {
            return <div key={index}>{formatTextContent(part.content)}</div>;
          }
        })}
      </div>
    );
  };

  // Helper function to format regular text content
  const formatTextContent = (text: string) => {
    let formattedContent = text;

    // Replace inline code with properly formatted versions
    formattedContent = formattedContent.replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-muted/70 px-1 py-0.5 text-sm font-mono">$1</code>'
    );

    // Replace headers
    formattedContent = formattedContent.replace(
      /^### (.*$)/gm,
      '<h3 class="font-bold text-lg mt-4 mb-2">$1</h3>'
    );
    formattedContent = formattedContent.replace(
      /^## (.*$)/gm,
      '<h2 class="font-bold text-xl mt-5 mb-3">$1</h2>'
    );
    formattedContent = formattedContent.replace(
      /^# (.*$)/gm,
      '<h1 class="font-bold text-2xl mt-6 mb-4">$1</h1>'
    );

    // Replace bullet lists
    formattedContent = formattedContent.replace(
      /^\s*-\s(.*)$/gm,
      '<li class="ml-4 pl-2 py-1 flex items-start"><span class="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span><span>$1</span></li>'
    );

    // Replace numbered lists
    formattedContent = formattedContent.replace(
      /^\s*(\d+)\.\s(.*)$/gm,
      '<li class="ml-4 pl-2 py-1 flex items-start"><span class="mr-2 mt-0.5 flex-shrink-0 font-bold">$1.</span><span>$2</span></li>'
    );

    // Replace bold text
    formattedContent = formattedContent.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold">$1</strong>'
    );

    // Replace italic text
    formattedContent = formattedContent.replace(
      /\*(.*?)\*/g,
      '<em class="italic">$1</em>'
    );

    // Add line breaks
    formattedContent = formattedContent.replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

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
            {formatMessageContent(message.content)}
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
