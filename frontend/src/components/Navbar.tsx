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
import {
  LogOut,
  Link as LinkIcon,
  Info,
  Settings,
  User,
  Menu,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const handleLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleSettingsClick = () => {
    navigate("/settings", { state: { from: location.pathname } });
  };

  const NavLink = ({ to, children, className }: { to: string, children: React.ReactNode, className?: string }) => {
    const isActive = location.pathname === to;
    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "gap-2",
          isActive && "bg-primary/10 hover:bg-primary/15",
          className
        )}
        onClick={() => navigate(to)}
      >
        {children}
      </Button>
    );
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NavLink to="/shorten" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                <span className="inline">Shorten URL</span>
              </NavLink>

              {/* User Dropdown */}
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
                  {/* Mobile Navigation Items */}
                  <div className="md:hidden">
                    <DropdownMenuItem
                      onClick={() => navigate("/")}
                      className={cn(
                        location.pathname === "/" && "bg-primary/10"
                      )}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/about")}
                      className={cn(
                        location.pathname === "/about" && "bg-primary/10"
                      )}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      About
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>

                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className={cn(
                      location.pathname === "/profile" && "bg-primary/10"
                    )}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSettingsClick}
                    className={cn(
                      location.pathname === "/settings" && "bg-primary/10"
                    )}
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
            <>
              {/* Login Button */}
              <Button variant="default" className="gap-2" onClick={handleLogin}>
                <FaGoogle className="h-4 w-4" />
                <span className="hidden sm:inline">Login with Google</span>
                <span className="sm:hidden">Login</span>
              </Button>

              {/* Mobile Menu for Non-logged Users */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate("/")}
                      className={cn(
                        location.pathname === "/" && "bg-primary/10"
                      )}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/about")}
                      className={cn(
                        location.pathname === "/about" && "bg-primary/10"
                      )}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      About
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
