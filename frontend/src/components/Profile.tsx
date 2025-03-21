/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { LinkIcon } from "lucide-react";

// Helper function to format role name (remove underscores and capitalize)
const formatRoleName = (role: string) => {
  return role.replace(/_/g, " ");
};

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-500";
      case "GDGC_LEAD":
        return "bg-blue-500";
      case "CORE_TEAM":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Full administrative access to the platform";
      case "GDGC_LEAD":
        return "Leadership access with ability to manage core team members";
      case "CORE_TEAM":
        return "Access to URL shortener and other core team features";
      default:
        return "Basic community member access";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Use UTC methods to avoid timezone issues
      return new Date(date.getTime()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC", // Force UTC timezone
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* User Profile Card */}
      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="absolute -bottom-12 left-6">
            <img
              src={user?.picture}
              alt={user?.name}
              className="h-24 w-24 rounded-full border-4 border-background"
            />
          </div>
        </div>
        <div className="p-6 pt-16">
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="mt-2">
            <Badge className={getRoleBadgeColor(user.role)}>
              {formatRoleName(user.role)}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Role Description */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Role Description</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {getRoleDescription(user.role)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Member Since</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Last Login</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(user.lastLoginAt)}
              </p>
            </div>
          </div>

          {user.role === "COMMUNITY" ? (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800">
                Restricted Access
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                As a community member, you currently don't have access to the
                URL shortener feature. Contact a GDG Lead if you need this
                feature for club activities.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">
                URL Shortener Access
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                You have access to the URL shortener tool. You can create and
                manage your shortened URLs from the URL management page.
              </p>
              <Button asChild variant="outline" className="mt-2 bg-white">
                <Link to="/urls" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Manage My URLs
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="outline">
            <Link to="/settings">Account Settings</Link>
          </Button>
          <Button variant="destructive" onClick={logout}>
            Log Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
