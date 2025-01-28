import LoginForm from "@/components/login-form";
import SignupForm from "@/components/signup-form";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto flex gap-8">
        <LoginForm />
        <SignupForm />
      </div>
    </div>
  );
}
