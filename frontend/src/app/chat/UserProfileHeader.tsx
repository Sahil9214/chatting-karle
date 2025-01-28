import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  if (!currentUser) return null;

  return (
    <div className="p-4 border-b bg-white flex items-center gap-3">
      <Avatar>
        <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
        <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-medium">{currentUser.username}</h3>
        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
      </div>
    </div>
  );
}
