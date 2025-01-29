"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthFormWrapper from "./auth-form-wrapper";
import { api } from "@/service/api";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let avatarUrl = undefined;
      if (avatar) {
        try {
          const uploadResponse = await api.upload({ file: avatar });
          if (!uploadResponse.success) {
            throw new Error(uploadResponse.message || "Upload failed");
          }
          avatarUrl = uploadResponse.url;
        } catch (err) {
          console.error("Avatar upload failed:", err);
          setError(err instanceof Error ? err.message : "Failed to upload profile picture");
          setLoading(false);
          return;
        }
      }

      const response = await api.register({
        username,
        email,
        password,
        avatar: avatarUrl,
      });

      if (response.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        router.push("/chat");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Only JPEG and PNG files are allowed");
        return;
      }

      setAvatar(file);
      setError(null);
    }
  };

  return (
    <AuthFormWrapper
      title="Sign Up"
      description="Create an account to get started."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Password must be at least 6 characters long
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">Profile Picture (Optional)</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Maximum file size: 5MB. Supported formats: JPG, PNG
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
