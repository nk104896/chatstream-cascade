
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type FileAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
};

export type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  files?: FileAttachment[];
};

export type ChatThread = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

export type ChatHistoryByDate = {
  [date: string]: ChatThread[];
};
