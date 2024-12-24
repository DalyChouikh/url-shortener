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
    // Get the previous path from location state, or default to home
    const from = location.state?.from || "/";
    navigate(from);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">URL Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="defaultExpiry">Default URL Expiration</Label>
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
            <div className="space-y-0.5">
              <Label htmlFor="analytics">URL Analytics</Label>
              <div className="text-sm text-muted-foreground">
                Track clicks and visitor information
              </div>
            </div>
            <Switch
              id="analytics"
              checked={urlAnalytics}
              onCheckedChange={setUrlAnalytics}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive updates about your shortened URLs
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Account</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Connected Account</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button 
              variant="outline" 
              className="text-destructive"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSaveSettings}>Save Changes</Button>
      </div>
    </div>
  );
}
