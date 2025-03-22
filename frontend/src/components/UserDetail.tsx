/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Copy,
  ArrowLeft,
  Loader2,
  LinkIcon,
  Check,
  Search,
} from "lucide-react";
import { showToast } from "@/utils/toast";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  name: string;
  email: string;
  picture: string;
  createdAt: string;
  lastLoginAt: string;
  role: string;
}

interface URL {
  ID: number;
  CreatedAt: string;
  LongURL: string;
  ShortCode: string;
  Clicks: number;
}

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Helper function to format role name (remove underscores and capitalize)
const formatRoleName = (role: string) => {
  return role.replace(/_/g, " ");
};

// Helper function to safely format date
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Never";

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid"
      : new Date(date.getTime()).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        });
  } catch (e) {
    return "Invalid";
  }
};

const URLCard = ({
  url,
  onCopy,
  copyingId,
}: {
  url: URL;
  onCopy: (url: string, id: number) => void;
  copyingId: number | null;
}) => (
  <Card className="mb-4">
    <CardContent className="pt-6 space-y-4">
      {/* Header with date */}
      <div className="flex justify-between items-start">
        <p className="text-sm text-muted-foreground">
          {formatDate(url.CreatedAt)}
        </p>
        <Badge className="bg-blue-100 text-blue-800">{url.Clicks} clicks</Badge>
      </div>

      {/* Long URL */}
      <div>
        <p className="text-sm text-muted-foreground">Original URL</p>
        <div className="truncate">
          <a
            href={url.LongURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            {url.LongURL}
          </a>
        </div>
      </div>

      {/* Short URL section */}
      <div>
        <p className="text-sm text-muted-foreground">Short URL</p>
        <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
          <div className="min-w-0 flex-1">
            <div className="truncate">
              <a
                href={`/r/${url.ShortCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                {`${window.location.origin}/r/${url.ShortCode}`}
              </a>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              onCopy(`${window.location.origin}/r/${url.ShortCode}`, url.ID)
            }
            className="shrink-0"
            disabled={copyingId === url.ID}
          >
            {copyingId === url.ID ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [copyingId, setCopyingId] = useState<number | null>(null);
  const [urlSearchTerm, setUrlSearchTerm] = useState("");
  const isLeaderView = window.location.pathname.includes("/leader/");

  useEffect(() => {
    fetchUserDetails();
    fetchUserUrls();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const endpoint = isLeaderView
        ? `/api/v1/leader/users/${userId}`
        : `/api/v1/admin/users/${userId}`;

      const response = await fetch(endpoint, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        showToast("Failed to fetch user details", "error");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      showToast("Error loading user details", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserUrls = async (page = 1, pageSize = 10) => {
    setUrlsLoading(true);
    try {
      const endpoint = isLeaderView
        ? `/api/v1/leader/users/${userId}/urls`
        : `/api/v1/admin/users/${userId}/urls`;

      const response = await fetch(
        `${endpoint}?page=${page}&pageSize=${pageSize}`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUrls(data.urls || []);
        setPagination(data.pagination);
      } else {
        showToast("Failed to fetch user URLs", "error");
      }
    } catch (error) {
      console.error("Error fetching user URLs:", error);
      showToast("Error loading user URLs", "error");
      setUrls([]);
    } finally {
      setUrlsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, urlId: number) => {
    try {
      setCopyingId(urlId);
      await navigator.clipboard.writeText(text);
      showToast("Link copied to clipboard", "success");
      setTimeout(() => setCopyingId(null), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopyingId(null);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const handlePageChange = (page: number) => {
    fetchUserUrls(page, pagination.pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    fetchUserUrls(1, size);
  };

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

  // Filter URLs based on search term
  const filteredUrls = urls.filter((url) => {
    if (!urlSearchTerm) return true;

    const searchLower = urlSearchTerm.toLowerCase();
    return (
      url.LongURL.toLowerCase().includes(searchLower) ||
      url.ShortCode.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">User not found</p>
              <Button onClick={() => navigate(-1)} className="mt-4">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="absolute -bottom-12 left-6">
            <img
              src={user.picture}
              alt={user.name}
              className="h-24 w-24 rounded-full border-4 border-background"
            />
          </div>
        </div>
        <CardContent className="pt-16 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {formatRoleName(user.role)}
                </Badge>
              </div>
            </div>
            <div className="text-left sm:text-right text-sm text-muted-foreground mt-2 sm:mt-0">
              <p>Member since: {formatDate(user.createdAt)}</p>
              <p>Last login: {formatDate(user.lastLoginAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="urls" className="w-full">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="urls">URLs</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="urls">
          <Card>
            <CardHeader>
              <CardTitle>Shortened URLs</CardTitle>
              <CardDescription>URLs created by {user.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {urlsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !urls || urls.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <LinkIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No URLs created yet</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by URL or short code..."
                      className="pl-8"
                      value={urlSearchTerm}
                      onChange={(e) => setUrlSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">
                            Created At
                          </TableHead>
                          <TableHead>Original URL</TableHead>
                          <TableHead>Short URL</TableHead>
                          <TableHead className="text-right">Clicks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUrls.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center h-24 text-muted-foreground"
                            >
                              No URLs found matching your search
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUrls.map((url) => (
                            <TableRow key={url.ID}>
                              <TableCell className="font-medium">
                                {formatDate(url.CreatedAt)}
                              </TableCell>
                              <TableCell className="max-w-[300px]">
                                <div className="truncate">
                                  <a
                                    href={url.LongURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {url.LongURL}
                                  </a>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`/r/${url.ShortCode}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate"
                                  >
                                    {`${window.location.origin}/r/${url.ShortCode}`}
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      copyToClipboard(
                                        `${window.location.origin}/r/${url.ShortCode}`,
                                        url.ID
                                      )
                                    }
                                    className="shrink-0"
                                    disabled={copyingId === url.ID}
                                  >
                                    {copyingId === url.ID ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {url.Clicks}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {filteredUrls.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No URLs found matching your search
                      </div>
                    ) : (
                      filteredUrls.map((url) => (
                        <URLCard
                          key={url.ID}
                          url={url}
                          onCopy={copyToClipboard}
                          copyingId={copyingId}
                        />
                      ))
                    )}
                  </div>

                  <PaginationControls
                    currentPage={pagination.currentPage}
                    pageSize={pagination.pageSize}
                    totalItems={pagination.totalItems}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    className="mt-6"
                    predefinedSizes={[10, 25, 50, 100]}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent activity for {user.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Activity tracking coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>Manage settings for {user.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                User settings management coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
