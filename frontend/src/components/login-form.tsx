"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthFormWrapper from "./auth-form-wrapper";
import { api } from "@/service/api";
import { useRouter } from "next/navigation";
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.login({ email, password });
      console.log("*** response ***", response);
      // Updated to match the nested response structure
      if (response.success && response.data.token) {
        localStorage.setItem("token", response.data.token);
        // You might also want to store user data
        localStorage.setItem("user", JSON.stringify(response.data.user));
        router.push("/chat");
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Add error handling UI here
    }
  };

  return (
    <AuthFormWrapper
      title="Login"
      description="Welcome back! Please enter your details."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
