
import React, { useState, useRef, ChangeEvent } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FilePreview from "@/components/chat/FilePreview";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (message: string, files: File[]) => void;
  isDisabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isDisabled = false,
}) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0 && files.length === 0) return;
    
    onSendMessage(trimmedMessage, files);
    setMessage("");
    setFiles([]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      // Clear input value so the same file can be selected again
      e.target.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative rounded-lg bg-muted/50 p-2 backdrop-blur-sm"
    >
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap">
          {files.map((file, index) => (
            <FilePreview
              key={index}
              file={file}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}
      
      <div className="flex items-end">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          className={cn(
            "h-10 w-10 rounded-full text-muted-foreground transition-colors",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Attach files"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        <Textarea
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isDisabled}
          className="border-0 bg-transparent pl-1 pr-12 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-[200px]"
          style={{ height: "40px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "40px";
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
          }}
        />
        
        <Button
          type="submit"
          size="icon"
          disabled={isDisabled || (message.trim() === "" && files.length === 0)}
          className={cn(
            "h-10 w-10 rounded-full transition-colors",
            "absolute right-2 bottom-2",
            message.trim() === "" && files.length === 0 && "opacity-70"
          )}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
