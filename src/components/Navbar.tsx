import { NavigationMenuDemo } from "./NavigationMenuDemo";

export default function Navbar() {
    return (
        <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-4 flex justify-center">
                <NavigationMenuDemo />
            </div>
        </nav>
    );
}
