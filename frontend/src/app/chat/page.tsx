"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import ChatArea from "./Chatarea";
import UserProfileHeader from "./UserProfileHeader";

interface User {
  _id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  email: string;
}

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userStr || !token) {
      router.push("/auth");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/auth");
    }
  }, [router]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-80">
        <UserProfileHeader currentUser={currentUser} />
        <Sidebar onSelectUser={handleSelectUser} currentUser={currentUser} />
      </div>
      <ChatArea selectedUser={selectedUser} currentUser={currentUser} />
    </div>
  );
}
