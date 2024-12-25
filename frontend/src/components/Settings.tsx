import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Link2, UserCog, AlertTriangle } from "lucide-react";
import { showToast } from "@/utils/toast";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [defaultUrlExpiry, setDefaultUrlExpiry] = useState("never");
  const [urlAnalytics, setUrlAnalytics] = useState(true);

  const handleSaveSettings = async () => {
    // TODO: Implement settings save functionality
    showToast("Settings saved successfully", "success");
  };

  const handleDisconnect = async () => {
    await logout();
  };

  const handleCancel = () => {
    const from = location.state?.from || "/";
    navigate(from);
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and URL settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <CardTitle>URL Settings</CardTitle>
          </div>
          <CardDescription>
            Configure how your shortened URLs behave
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="defaultExpiry" className="flex-1">
              Default URL Expiration
              <p className="text-sm text-muted-foreground">
                Set when your shortened URLs should expire
              </p>
            </Label>
            <Select
              value={defaultUrlExpiry}
              onValueChange={setDefaultUrlExpiry}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="analytics">URL Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Track clicks and visitor information
              </p>
            </div>
            <Switch
              id="analytics"
              checked={urlAnalytics}
              onCheckedChange={setUrlAnalytics}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your shortened URLs and account activity
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium">Connected Account</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="text-destructive hover:text-destructive"
            >
              Disconnect
            </Button>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h3 className="font-medium text-destructive">Danger Zone</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSaveSettings}>Save Changes</Button>
      </div>
    </div>
  );
}
