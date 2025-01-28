"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageInput from "./Messageinput";
import { Socket, io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  status: "sent" | "delivered" | "read";
}

interface User {
  _id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  email: string;
}

interface ChatAreaProps {
  selectedUser: User | null;
  currentUser: User | null;
}

export default function ChatArea({ selectedUser, currentUser }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Memoize message handler
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      const exists = prev.some(m => m._id === message._id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  // Socket initialization
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser?._id) {
      router.push("/auth");
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      setError(null);
    });

    newSocket.on("messageReceived", handleNewMessage);

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError("Connection error. Trying to reconnect...");
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("messageReceived", handleNewMessage);
      newSocket.disconnect();
    };
  }, [currentUser?._id, router, handleNewMessage]);

  // Fetch messages when user is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id || !currentUser?._id) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/conversations/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.success) {
          setMessages(data.data);
        } else {
          setError(data.message || "Failed to load messages");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser?._id, currentUser?._id]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messages.length) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!socket || !selectedUser || !content.trim()) return;

    try {
      // Create a temporary message
      const tempMessage: Message = {
        _id: Date.now().toString(), // temporary ID
        content: content.trim(),
        sender: {
          _id: currentUser!._id,
          username: currentUser!.username,
          avatar: currentUser?.avatar
        },
        receiver: {
          _id: selectedUser._id,
          username: selectedUser.username,
          avatar: selectedUser.avatar
        },
        createdAt: new Date().toISOString(),
        status: "sent"
      };

      // Add message to local state immediately
      setMessages(prev => [...prev, tempMessage]);

      // Emit the message
      socket.emit("sendMessage", {
        receiverId: selectedUser._id,
        content: content.trim(),
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  // Add loading and error states
  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar>
          <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
          <AvatarFallback>
            {selectedUser.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{selectedUser.username}</h3>
          <p className="text-sm text-muted-foreground">
            {selectedUser.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex justify-center text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender._id === currentUser?._id
                  ? "justify-end"
                  : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[70%] break-words rounded-lg p-3 ${message.sender._id === currentUser?._id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                    }`}
                >
                  <p>{message.content}</p>
                  <span className="text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!selectedUser}
        />
      </div>
    </div>
  );
}
