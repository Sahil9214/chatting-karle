"use client"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/service/api";


export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await api.logout();

            if (response.success) {
                alert("Logged out successfully");
                router.push("/login");
            } else {
                throw new Error(response.message || "Logout failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert(error instanceof Error ? error.message : "Failed to logout");
        }
    };

    return (
        <Button
            onClick={handleLogout}
            variant="destructive"
        >
            Logout
        </Button>
    );
}
