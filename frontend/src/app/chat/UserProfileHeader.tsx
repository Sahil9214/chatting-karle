import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { api } from "@/service/api";
import { useRouter } from "next/navigation";

interface UserProfileHeaderProps {
  currentUser: {
    _id: string;
    username: string;
    avatar?: string;
    email: string;
  } | null;
}

export default function UserProfileHeader({
  currentUser,
}: UserProfileHeaderProps) {
  const router = useRouter();

  if (!currentUser) return null;

  const handleLogout = async () => {
    try {
      await api.logout();

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.push("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth");
    }
  };

  return (
    <div className="p-4 border-b bg-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
          <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{currentUser.username}</h3>
          <p className="text-sm text-muted-foreground">{currentUser.email}</p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
