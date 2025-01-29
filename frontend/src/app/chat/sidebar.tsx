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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.getAllUsers();
        if (response.success) {
          // Filter out current user from the list
          const filteredUsers = response.data.filter(
            (user: User) => user._id !== currentUser?._id
          );
          setUsers(filteredUsers);
        } else {
          setError("Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser?._id]);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="p-4 text-red-500">{error}</div>
      ) : (
        <ScrollArea className="flex-1">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-gray-500">No users found</div>
          ) : (
            filteredUsers.map((user) => (
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
                      className={`text-sm ${user.isOnline ? "text-green-500" : "text-gray-500"
                        }`}
                    >
                      {user.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      )}
    </div>
  );
}
