
import React from "react";
import { ChatThread, ChatHistoryByDate } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  threadsByDate: ChatHistoryByDate;
  currentThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  threadsByDate,
  currentThreadId,
  onSelectThread,
  onDeleteThread,
}) => {
  const sortedDates = Object.keys(threadsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (sortedDates.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" />
        <h3 className="font-medium">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a new chat to begin a conversation
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      {sortedDates.map((date) => (
        <div key={date} className="mb-6">
          <h3 className="mb-2 px-2 text-sm font-medium text-muted-foreground">
            {date}
          </h3>
          <div className="space-y-1">
            {threadsByDate[date].map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isActive={thread.id === currentThreadId}
                onSelect={() => onSelectThread(thread.id)}
                onDelete={() => onDeleteThread(thread.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};

interface ThreadItemProps {
  thread: ChatThread;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const ThreadItem: React.FC<ThreadItemProps> = ({
  thread,
  isActive,
  onSelect,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(thread.updatedAt));

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center justify-between rounded-md px-2 py-2 transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-muted/50 cursor-pointer"
      )}
    >
      <div className="flex-1 truncate">
        <p className="truncate text-sm font-medium">{thread.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {time}
        </p>
      </div>
      <button
        onClick={handleDelete}
        className={cn(
          "ml-2 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive",
          (isActive || "group-hover:opacity-100")
        )}
        aria-label="Delete conversation"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ChatHistory;
