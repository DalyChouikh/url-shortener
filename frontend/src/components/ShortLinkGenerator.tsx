import { useState } from "react";
import { showToast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Copy, Download, Loader2 } from "lucide-react";

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function ShortLinkGenerator() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateShortLink = async () => {
    if (!longUrl) {
      showToast("Please enter a URL", "error");
      return;
    }

    if (!isValidUrl(longUrl)) {
      showToast("Please enter a valid URL", "error");
      return;
    }

    setIsLoading(true);
    setShortUrl("");
    setQrCode("");

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
        showToast("Short link generated successfully!", "success");
      } else {
        showToast("Failed to generate short link", "error");
      }
    } catch (err) {
      showToast("Failed to generate short link", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      showToast("Link copied to clipboard!", "success");
    } catch (err) {
      showToast("Failed to copy link", "error");
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) {
      showToast("No QR code available", "error");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${qrCode}`;
      link.download = `qr-${shortUrl.split("/r/")[1]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("QR code downloaded successfully!", "success");
    } catch (err) {
      showToast("Failed to download QR code", "error");
    }
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
            disabled={isLoading}
          />
        </div>

        <Button
          className="w-full"
          onClick={generateShortLink}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </Button>

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
              <Button
                variant="ghost"
                size="sm"
                onClick={copyLink}
                disabled={isLoading}
              >
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
              disabled={isLoading}
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
