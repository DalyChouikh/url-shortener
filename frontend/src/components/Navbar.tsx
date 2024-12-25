import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "../../public/gdg-logo.png";
import { FaGoogle } from "react-icons/fa";
import { LogOut, Link as LinkIcon, Settings, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleSettingsClick = () => {
    navigate("/settings", { state: { from: location.pathname } });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 mx-auto">
        <div className="flex-1 flex items-center gap-6 md:gap-8">
          <Link to="/" className="flex items-center gap-4">
            <img src={logo} alt="GDG Logo" className="h-8 w-auto" />
            <span className="hidden font-semibold sm:inline-block">
              Google Developer Groups - ISSATSo
            </span>
          </Link>

          {/* Add navigation buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              className="gap-2"
              disabled={location.pathname === "/"}
              onClick={() => navigate("/")}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              className="gap-2"
              disabled={location.pathname === "/about"}
              onClick={() => navigate("/about")}
            >
              About
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                className="gap-2"
                disabled={location.pathname === "/shorten"}
                onClick={() => navigate("/shorten")}
              >
                <LinkIcon className="h-4 w-4" />
                Shorten URL
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="hidden md:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    disabled={location.pathname === "/profile"}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSettingsClick}
                    disabled={location.pathname === "/settings"}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" className="gap-2" onClick={handleLogin}>
              <FaGoogle className="h-4 w-4" />
              Login with Google
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
