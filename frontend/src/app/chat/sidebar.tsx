"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { api } from "@/service/api";

interface User {
  _id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface SidebarProps {
  onSelectUser: (user: User) => void;
  currentUser: User | null;
}

export default function Sidebar({ onSelectUser, currentUser }: SidebarProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.getAllUsers();
        if (response.success) {
          setUsers(response.data);
        } else {
          setError("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users
    .filter((user) => user._id !== currentUser?._id)
    .filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="w-80 border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {error ? (
        <div className="p-4 text-red-500">{error}</div>
      ) : (
        <ScrollArea className="flex-1">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="p-4 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectUser(user)}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{user.username}</p>
                  <span
                    className={`text-sm ${
                      user.isOnline ? "text-green-500" : "text-gray-500"
                    }`}
                  >
                    {user.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
