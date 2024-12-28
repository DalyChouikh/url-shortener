import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  Copy,
  Trash2,
  Edit2,
  ArrowUpDown,
  LinkIcon,
  Download,
  Loader2,
  Check,
} from "lucide-react";
import { showToast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface URL {
  ID: number;
  CreatedAt: string;
  LongURL: string;
  ShortCode: string;
  Clicks: number;
  QRCode: string;
}

const URLCard = ({
  url,
  onCopy,
  onEdit,
  onDelete,
  onQRClick,
  onQRDownload,
  copyingId,
  downloadingId,
}: {
  url: URL;
  onCopy: (url: string) => void;
  onEdit: (url: URL) => void;
  onDelete: (id: number) => void;
  onQRClick: (qr: string) => void;
  onQRDownload: (qr: string, code: string) => void;
  copyingId: number | null;
  downloadingId: number | null;
}) => (
  <Card className="mb-4">
    <CardContent className="pt-6 space-y-4">
      {/* Header with date and actions */}
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            {new Date(url.CreatedAt).toLocaleDateString()}
          </p>
          <div className="truncate max-w-full">
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
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(url)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(url.ID)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Short URL section */}
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
          onClick={() => onCopy(`${window.location.origin}/r/${url.ShortCode}`)}
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

      {/* Stats and QR section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Clicks:</p>
          <span className="text-sm">{url.Clicks}</span>
        </div>
        {url.QRCode && (
          <div className="flex items-center gap-2">
            <img
              src={`data:image/png;base64,${url.QRCode}`}
              alt="QR Code"
              className="w-12 h-12 cursor-pointer object-contain rounded-md"
              onClick={() => onQRClick(url.QRCode)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onQRDownload(url.QRCode, url.ShortCode)}
              disabled={downloadingId === url.ID}
            >
              {downloadingId === url.ID ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function Profile() {
  const { user } = useAuth();
  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [urlToDelete, setUrlToDelete] = useState<number | null>(null);
  const [urlToEdit, setUrlToEdit] = useState<URL | null>(null);
  const [newLongUrl, setNewLongUrl] = useState("");
  const [sortColumn, setSortColumn] = useState<"CreatedAt" | "Clicks">(
    "CreatedAt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [copyingId, setCopyingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const copyToClipboard = async (text: string, urlId: number) => {
    try {
      setCopyingId(urlId);
      await navigator.clipboard.writeText(text);
      showToast("Link copied successfully", "success");
      setTimeout(() => setCopyingId(null), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopyingId(null);
    }
  };

  const downloadQRCode = (qrCode: string, shortCode: string, urlId: number) => {
    try {
      setDownloadingId(urlId);
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${qrCode}`;
      link.download = `qr-${shortCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("QR code downloaded successfully", "success");
      setTimeout(() => setDownloadingId(null), 1000);
    } catch (err) {
      console.error("Failed to download:", err);
      setDownloadingId(null);
    }
  };

  const handleDelete = async (urlId: number) => {
    try {
      const response = await fetch(`/api/v1/urls/${urlId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (response.ok) {
        setUrls(urls.filter((url) => url.ID !== urlId));
        showToast("URL deleted successfully", "success");
      } else {
        throw new Error("Failed to delete URL");
      }
    } catch (error) {
      showToast("Failed to delete URL", "error");
    }
    setUrlToDelete(null);
  };

  const handleEdit = async (url: URL) => {
    setUrlToEdit(url);
    setNewLongUrl(url.LongURL);
  };

  const handleUpdate = async () => {
    if (!urlToEdit) return;

    try {
      const response = await fetch(`/api/v1/urls/${urlToEdit.ID}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ long_url: newLongUrl }),
      });

      if (response.ok) {
        setUrls(
          urls.map((url) =>
            url.ID === urlToEdit.ID ? { ...url, LongURL: newLongUrl } : url
          )
        );
        showToast("URL updated successfully", "success");
        setUrlToEdit(null);
      } else {
        throw new Error("Failed to update URL");
      }
    } catch (error) {
      showToast("Failed to update URL", "error");
    }
  };

  const handleSort = (column: "CreatedAt" | "Clicks") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const sortedUrls = [...urls].sort((a, b) => {
    if (sortColumn === "CreatedAt") {
      return sortDirection === "asc"
        ? new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime()
        : new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
    } else {
      return sortDirection === "asc"
        ? a.Clicks - b.Clicks
        : b.Clicks - a.Clicks;
    }
  });

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await fetch("/api/v1/urls", {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        const data = await response.json();
        setUrls(data.urls);
      } catch (error) {
        console.error("Failed to fetch URLs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUrls();
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

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
        </div>
      </Card>

      {/* URLs Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Shortened URLs</CardTitle>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/shorten")}
              className="gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              Create New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : urls.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <LinkIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No URLs generated yet</p>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/shorten")}
                  className="mt-2"
                >
                  Create your first short URL
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="w-[120px] cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort("CreatedAt")}
                      >
                        <div className="flex items-center gap-1">
                          Created At
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="w-[300px]">Original URL</TableHead>
                      <TableHead className="w-[300px]">Short URL</TableHead>
                      <TableHead
                        className="w-[80px] text-center cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort("Clicks")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Clicks
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="w-[150px] text-center">
                        QR Code
                      </TableHead>
                      <TableHead className="w-[100px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUrls.map((url) => (
                      <TableRow key={url.ID}>
                        <TableCell className="w-[120px] text-muted-foreground">
                          {new Date(url.CreatedAt).toLocaleDateString()}
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
                        <TableCell className="text-center font-medium">
                          {url.Clicks}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-2">
                            {url.QRCode && (
                              <>
                                <img
                                  src={`data:image/png;base64,${url.QRCode}`}
                                  alt="QR Code"
                                  className="w-16 h-16 cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => setSelectedQR(url.QRCode)}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    downloadQRCode(
                                      url.QRCode,
                                      url.ShortCode,
                                      url.ID
                                    )
                                  }
                                  className="h-8"
                                  disabled={downloadingId === url.ID}
                                >
                                  {downloadingId === url.ID ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(url)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setUrlToDelete(url.ID)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 px-2">
                {sortedUrls.map((url) => (
                  <URLCard
                    key={url.ID}
                    url={url}
                    onCopy={(text) => copyToClipboard(text, url.ID)}
                    onEdit={handleEdit}
                    onDelete={(id) => setUrlToDelete(id)}
                    onQRClick={(qr) => setSelectedQR(qr)}
                    onQRDownload={(qr, code) =>
                      downloadQRCode(qr, code, url.ID)
                    }
                    copyingId={copyingId}
                    downloadingId={downloadingId}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!urlToDelete}
        onOpenChange={() => setUrlToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              shortened URL and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => urlToDelete && handleDelete(urlToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!urlToEdit} onOpenChange={() => setUrlToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit URL</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newLongUrl}
              onChange={(e) => setNewLongUrl(e.target.value)}
              placeholder="Enter new URL"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUrlToEdit(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced QR Code Modal */}
      {selectedQR && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setSelectedQR(null)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div
              className="bg-card p-6 rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`data:image/png;base64,${selectedQR}`}
                alt="QR Code Large"
                className="w-64 h-64"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
