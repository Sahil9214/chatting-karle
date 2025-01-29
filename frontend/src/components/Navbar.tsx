import Link from "next/link";
import LogoutButton from "./ui/LogoutButton";

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between p-4 bg-background border-b">
            <div className="flex items-center gap-4">
                <Link href="/"> Home </Link>
                <Link href="/profile"> Profile </Link>
            </div>
            <LogoutButton />
        </nav>
    );
} 