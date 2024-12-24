import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Copy, Trash2, Edit2, ArrowUpDown } from "lucide-react";
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

interface URL {
  ID: number;
  CreatedAt: string;
  LongURL: string;
  ShortCode: string;
  Clicks: number;
  QRCode: string;
}

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Link copied successfully", "success");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadQRCode = (qrCode: string, shortCode: string) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrCode}`;
    link.download = `qr-${shortCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <img
              src={user.picture}
              alt={user.name}
              className="h-20 w-20 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Shortened URLs</h3>
          {loading ? (
            <p>Loading URLs...</p>
          ) : urls.length === 0 ? (
            <p className="text-gray-600">No URLs generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="w-[120px] cursor-pointer"
                      onClick={() => handleSort("CreatedAt")}
                    >
                      <div className="flex items-center">
                        Created At
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[300px]">Original URL</TableHead>
                    <TableHead className="w-[300px]">Short URL</TableHead>
                    <TableHead
                      className="w-[80px] text-center cursor-pointer"
                      onClick={() => handleSort("Clicks")}
                    >
                      <div className="flex items-center justify-center">
                        Clicks
                        <ArrowUpDown className="ml-1 h-4 w-4" />
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
                      <TableCell className="w-[120px]">
                        {new Date(url.CreatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="w-[300px]">
                        <div className="max-w-[280px] truncate">
                          <a
                            href={url.LongURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {url.LongURL}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="w-[300px]">
                        <div className="flex items-center gap-2">
                          <span className="max-w-[240px] truncate">
                            <a
                              href={`/r/${url.ShortCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {`${window.location.origin}/r/${url.ShortCode}`}
                            </a>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                `${window.location.origin}/r/${url.ShortCode}`
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="w-[80px] text-center">
                        {url.Clicks}
                      </TableCell>
                      <TableCell className="w-[150px]">
                        <div className="flex flex-col items-center space-y-2">
                          {url.QRCode && (
                            <>
                              <img
                                src={`data:image/png;base64,${url.QRCode}`}
                                alt="QR Code"
                                className="w-20 h-20 cursor-pointer"
                                onClick={() => setSelectedQR(url.QRCode)}
                              />
                              <button
                                onClick={() =>
                                  downloadQRCode(url.QRCode, url.ShortCode)
                                }
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[100px] text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(url)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
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
          )}
        </div>
      </div>

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

      {selectedQR && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setSelectedQR(null)}
        >
          <div
            className="bg-white p-4 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`data:image/png;base64,${selectedQR}`}
              alt="QR Code Large"
              className="w-64 h-64"
            />
          </div>
        </div>
      )}
    </div>
  );
}
