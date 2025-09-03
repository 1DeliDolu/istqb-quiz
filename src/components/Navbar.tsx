import { NavigationMenuDemo } from "./NavigationMenuDemo";
import { useState, useEffect } from "react";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ id: number, username: string } | null>(null);

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center">
                    <NavigationMenuDemo />
                </div>

                {/* Login/Register Section */}
                <div className="flex items-center space-x-4">
                    {isLoggedIn && user ? (
                        <div className="flex items-center space-x-3">
                            <a
                                href="/user/stats"
                                className="px-3 py-1.5 text-sm bg-amber-100 text-black rounded hover:bg-amber-200 border border-amber-300 transition-colors"
                            >
                                📊 İstatistiklerim
                            </a>
                            <span className="text-sm text-gray-700">
                                Hoş geldin, <span className="font-semibold">{user.username}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 text-sm bg-red text-black rounded hover:bg-red transition-colors"
                            >
                                Çıkış
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <a
                                href="/login"
                                className="px-4 py-2 text-sm text-black hover:text-black border border-amber-300 rounded hover:bg-amber-100 transition-colors"
                            >
                                Giriş
                            </a>
                            <a
                                href="/register"
                                className="px-4 py-2 text-sm bg-amber-100 text-black rounded hover:bg-amber-200 border border-amber-300 transition-colors"
                            >
                                Kayıt Ol
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
