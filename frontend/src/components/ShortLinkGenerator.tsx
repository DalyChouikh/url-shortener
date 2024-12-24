import { useState } from "react";
import { showToast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Copy, Download } from "lucide-react";

export default function ShortLinkGenerator() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");

  const generateShortLink = async () => {
    // Reset previous states
    setShortUrl("");
    setQrCode("");
    setError("");

    try {
      const response = await fetch("/api/v1/shorten", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ long_url: longUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortUrl(data.short_url);
        setQrCode(data.qrcode);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const copyLink = () => {
    navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        showToast("Link copied successfully", "success");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrCode}`;
    link.download = "qr_code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Generate Short Link</CardTitle>
        <p className="text-center text-muted-foreground">
          Enter a long URL to make a shorter one
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Enter your long URL"
          />
        </div>

        <Button className="w-full" onClick={generateShortLink}>
          Generate
        </Button>

        {error && (
          <p className="text-destructive text-center" id="errorMessage">
            {error}
          </p>
        )}

        {shortUrl && (
          <div className="mt-4">
            <div className="flex items-center justify-between rounded-md border p-2">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {shortUrl}
              </a>
              <Button variant="ghost" size="sm" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {qrCode && (
          <div className="mt-4 text-center space-y-4">
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code"
              className="mx-auto w-40 h-40"
            />
            <Button
              variant="outline"
              onClick={downloadQRCode}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
