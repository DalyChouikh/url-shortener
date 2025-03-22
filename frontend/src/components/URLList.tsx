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
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/utils/toast";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useDebounce } from "use-debounce";

interface URL {
  ID: number;
  CreatedAt: string;
  LongURL: string;
  ShortCode: string;
  Clicks: number;
  QRCode: string;
  Format: string;
  Color: string;
  Size: number;
}

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
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
  onCopy: (url: string, id: number) => void;
  onEdit: (url: URL) => void;
  onDelete: (id: number) => void;
  onQRClick: (qr: string, format: string) => void;
  onQRDownload: (qr: string, code: string, format: string, id: number) => void;
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

      {/* Stats and QR section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Clicks:</p>
          <Badge variant="outline" className="bg-blue-50 text-blue-800">
            {url.Clicks}
          </Badge>
        </div>
        {url.QRCode && (
          <div className="flex items-center gap-2">
            <img
              src={`data:image/${
                url.Format === "svg" ? "svg+xml" : "png"
              };base64,${url.QRCode}`}
              alt="QR Code"
              className="w-12 h-12 cursor-pointer object-contain rounded-md"
              onClick={() => onQRClick(url.QRCode, url.Format)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                onQRDownload(url.QRCode, url.ShortCode, url.Format, url.ID)
              }
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

export default function URLList() {
  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [selectedQRFormat, setSelectedQRFormat] = useState<string>("png");
  const [urlToDelete, setUrlToDelete] = useState<number | null>(null);
  const [urlToEdit, setUrlToEdit] = useState<URL | null>(null);
  const [newLongUrl, setNewLongUrl] = useState("");
  const [sortColumn, setSortColumn] = useState<"CreatedAt" | "Clicks">(
    "CreatedAt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [copyingId, setCopyingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const fetchUrls = async (page = 1, pageSize = 10, search = searchTerm) => {
    setLoading(true);
    try {
      // Build query parameters including search
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) {
        queryParams.append("search", search);
      }

      const response = await fetch(`/api/v1/urls?${queryParams.toString()}`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch URLs");
      }

      const data = await response.json();
      setUrls(data.urls);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch URLs:", error);
      showToast("Failed to load URLs", "error");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when search term changes
  useEffect(() => {
    fetchUrls(1, pagination.pageSize, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchUrls();
  }, []);

  const copyToClipboard = async (text: string, urlId: number) => {
    try {
      setCopyingId(urlId);
      await navigator.clipboard.writeText(text);
      showToast("Link copied successfully", "success");
      setTimeout(() => setCopyingId(null), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopyingId(null);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const downloadQRCode = (
    qrCode: string,
    shortCode: string,
    format: string,
    urlId: number
  ) => {
    try {
      setDownloadingId(urlId);
      const link = document.createElement("a");
      link.href = `data:image/${
        format === "svg" ? "svg+xml" : "png"
      };base64,${qrCode}`;
      link.download = `qr-${shortCode}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("QR code downloaded successfully", "success");
      setTimeout(() => setDownloadingId(null), 1000);
    } catch (err) {
      console.error("Failed to download:", err);
      setDownloadingId(null);
      showToast("Failed to download QR code", "error");
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

      if (!response.ok) {
        throw new Error("Failed to delete URL");
      }

      setUrls(urls.filter((url) => url.ID !== urlId));
      showToast("URL deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting URL:", error);
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
      console.error("Error updating URL:", error);
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

  const handlePageChange = (page: number) => {
    fetchUrls(page, pagination.pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    // Reset to first page when changing page size
    fetchUrls(1, size);
  };

  // Remove client-side filtering since it's now done server-side
  // const filteredUrls = sortedUrls.filter((url) => {...});

  // We still need sorting functionality since that's done client-side
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

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Shortened URLs</CardTitle>
              <CardDescription>
                Manage and track all your shortened URLs
              </CardDescription>
            </div>
            <Button asChild>
              <a href="/shorten" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New
              </a>
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
                <Button asChild className="mt-2">
                  <a href="/shorten">Create your first short URL</a>
                </Button>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

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
                      <TableHead className="w-[120px] text-center">
                        QR Code
                      </TableHead>
                      <TableHead className="w-[100px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUrls.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center h-24 text-muted-foreground"
                        >
                          No URLs found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedUrls.map((url) => (
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
                            {url.QRCode && (
                              <div className="flex flex-col items-center gap-2">
                                <img
                                  src={`data:image/${
                                    url.Format === "svg" ? "svg+xml" : "png"
                                  };base64,${url.QRCode}`}
                                  alt="QR Code"
                                  className="w-12 h-12 cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => {
                                    setSelectedQR(url.QRCode);
                                    setSelectedQRFormat(url.Format);
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    downloadQRCode(
                                      url.QRCode,
                                      url.ShortCode,
                                      url.Format,
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
                              </div>
                            )}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 px-2">
                {sortedUrls.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No URLs found matching your search
                  </div>
                ) : (
                  sortedUrls.map((url) => (
                    <URLCard
                      key={url.ID}
                      url={url}
                      onCopy={(text, id) => copyToClipboard(text, id)}
                      onEdit={handleEdit}
                      onDelete={(id) => setUrlToDelete(id)}
                      onQRClick={(qr, format) => {
                        setSelectedQR(qr);
                        setSelectedQRFormat(format);
                      }}
                      onQRDownload={(qr, code, format, id) =>
                        downloadQRCode(qr, code, format, id)
                      }
                      copyingId={copyingId}
                      downloadingId={downloadingId}
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
                predefinedSizes={[10, 50, 100]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
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

      {/* Edit URL Dialog */}
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

      {/* QR Code Modal */}
      {selectedQR && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={() => setSelectedQR(null)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div
              className="bg-card p-6 rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`data:image/${
                  selectedQRFormat === "svg" ? "svg+xml" : "png"
                };base64,${selectedQR}`}
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
