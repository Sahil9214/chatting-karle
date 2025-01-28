import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthFormWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function AuthFormWrapper({
  children,
  title,
  description,
}: AuthFormWrapperProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
