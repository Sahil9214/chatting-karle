export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  messageType: "text" | "image" | "file";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatEvents {
  messageReceived: (message: Message) => void;
  messageRead: (data: { messageId: string; conversationId: string }) => void;
  userStatusChanged: (data: {
    userId: string;
    isOnline: boolean;
    lastSeen: Date;
  }) => void;
  typing: (data: { userId: string; conversationId: string }) => void;
  stopTyping: (data: { userId: string; conversationId: string }) => void;
}
