/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { showToast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Copy,
  Download,
  Loader2,
  Link as LinkIcon,
  QrCode,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrFormat, setQrFormat] = useState("png");
  const [qrColor, setQrColor] = useState("#000000");
  const [transparentBg, setTransparentBg] = useState(false);
  const [qrSize, setQrSize] = useState(150);

  const handleFormatChange = (format: string) => {
    setQrFormat(format);
  };

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
        body: JSON.stringify({
          long_url: longUrl,
          qr_options: {
            format: qrFormat,
            color: qrColor,
            transparent: transparentBg,
            size: qrSize,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortUrl(data.short_url);
        setQrCode(data.qrcode);
        showToast("Short link generated successfully!!", "success");
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
      setIsCopying(true);
      await navigator.clipboard.writeText(shortUrl);
      showToast("Link copied to clipboard!", "success");
      setTimeout(() => setIsCopying(false), 1000);
    } catch (err) {
      showToast("Failed to copy link", "error");
      setIsCopying(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) {
      showToast("No QR code available", "error");
      return;
    }

    try {
      setIsDownloading(true);
      const link = document.createElement("a");
      link.href = `data:image/${
        qrFormat === "svg" ? "svg+xml" : "png"
      };base64,${qrCode}`;
      link.download = `qr-${shortUrl.split("/r/")[1]}.${qrFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("QR code downloaded successfully!", "success");
      setTimeout(() => setIsDownloading(false), 1000);
    } catch (err) {
      showToast("Failed to download QR code", "error");
      setIsDownloading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <LinkIcon className="h-6 w-6 text-primary" />
            URL Shortener
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Create short, memorable links that are easy to share
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              className="md:w-32"
              onClick={generateShortLink}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working...
                </>
              ) : (
                "Shorten"
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qr-format">QR Code Format</Label>
              <Select value={qrFormat} onValueChange={handleFormatChange}>
                <SelectTrigger id="qr-format">
                  <SelectValue placeholder="Select Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG Image</SelectItem>
                  <SelectItem value="svg">SVG Vector</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-color">QR Code Color</Label>
              <div className="flex gap-2">
                <Input
                  id="qr-color"
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-12 h-10 p-0 cursor-pointer"
                />
                <Input
                  type="text"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-size">QR Code Size (px)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="qr-size"
                type="number"
                min="50"
                max="500"
                value={qrSize}
                onChange={(e) => setQrSize(parseInt(e.target.value) || 150)}
                className="flex-1"
              />
              <span className="text-muted-foreground text-sm">
                Square dimensions
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="transparent-bg"
              checked={transparentBg}
              onCheckedChange={(checked) => setTransparentBg(!!checked)}
            />
            <Label htmlFor="transparent-bg">Transparent background</Label>
          </div>

          {shortUrl && (
            <div className="space-y-6 rounded-lg border p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Shortened URL</h3>
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
                  <div className="flex-1 truncate">
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {shortUrl}
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className="shrink-0"
                    disabled={isCopying}
                  >
                    {isCopying ? (
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Copy
                  </Button>
                </div>
              </div>

              {qrCode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code
                  </h3>
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      <img
                        src={`data:image/${
                          qrFormat === "svg" ? "svg+xml" : "png"
                        };base64,${qrCode}`}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={downloadQRCode}
                      className="w-full md:w-auto"
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download QR Code
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
