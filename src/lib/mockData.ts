
import { ChatThread, User } from "@/types";

export const mockUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

export const mockChatThreads: ChatThread[] = [
  {
    id: "thread-1",
    title: "Understanding AI capabilities",
    messages: [
      {
        id: "msg-1",
        content: "What can you help me with?",
        sender: "user",
        timestamp: new Date(2023, 7, 15, 14, 30),
        files: [],
      },
      {
        id: "msg-2",
        content: "I can assist with a wide range of tasks including answering questions, drafting content, generating creative ideas, explaining complex topics, helping with code, and much more. Feel free to ask me anything!",
        sender: "assistant",
        timestamp: new Date(2023, 7, 15, 14, 31),
        files: [],
      },
    ],
    createdAt: new Date(2023, 7, 15, 14, 30),
    updatedAt: new Date(2023, 7, 15, 14, 31),
  },
  {
    id: "thread-2",
    title: "Web development help",
    messages: [
      {
        id: "msg-3",
        content: "Can you help me understand how React hooks work?",
        sender: "user",
        timestamp: new Date(2023, 7, 16, 9, 15),
        files: [],
      },
      {
        id: "msg-4",
        content: "React hooks are functions that let you use state and other React features in functional components. The most common hooks are useState for managing state, useEffect for side effects, useContext for context API, and useRef for references. Would you like me to explain any specific hook in more detail?",
        sender: "assistant",
        timestamp: new Date(2023, 7, 16, 9, 16),
        files: [],
      },
    ],
    createdAt: new Date(2023, 7, 16, 9, 15),
    updatedAt: new Date(2023, 7, 16, 9, 16),
  },
  {
    id: "thread-3",
    title: "Image editing question",
    messages: [
      {
        id: "msg-5",
        content: "What's the best software for photo editing?",
        sender: "user",
        timestamp: new Date(2023, 7, 17, 16, 0),
        files: [
          {
            id: "file-1",
            name: "sample_image.jpg",
            type: "image/jpeg",
            size: 245000,
            url: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
            preview: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
          },
        ],
      },
      {
        id: "msg-6",
        content: "For professional photo editing, Adobe Photoshop is the industry standard with comprehensive tools for manipulating images. Adobe Lightroom is excellent for photographers who need to manage and edit large collections of photos. For free alternatives, GIMP provides powerful features similar to Photoshop, while Darktable is a good open-source alternative to Lightroom. Your choice depends on your specific needs, budget, and level of expertise.",
        sender: "assistant",
        timestamp: new Date(2023, 7, 17, 16, 2),
        files: [],
      },
    ],
    createdAt: new Date(2023, 7, 17, 16, 0),
    updatedAt: new Date(2023, 7, 17, 16, 2),
  },
];

export const generateMockThreadsByDate = () => {
  const threadsByDate: { [date: string]: ChatThread[] } = {};
  
  mockChatThreads.forEach(thread => {
    const dateStr = thread.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!threadsByDate[dateStr]) {
      threadsByDate[dateStr] = [];
    }
    
    threadsByDate[dateStr].push(thread);
  });
  
  return threadsByDate;
};
