import { useState } from "react";

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
        alert("Copied to clipboard!");
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
    <div className="w-full max-w-md bg-white p-6 rounded-lg border-2 border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-4">
        Generate Short Link
      </h2>
      <p className="text-center text-gray-600 mb-4 font-semibold">
        Enter a long URL to make a shorter one
      </p>

      <div className="mb-4">
        <input
          type="url"
          id="urlInput"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="Enter your long URL"
          className="w-full p-2 border-2 border-gray-200 rounded"
        />
      </div>

      <button
        onClick={generateShortLink}
        className="w-full bg-blue-600 text-white py-2 font-medium rounded hover:bg-blue-700 transition-colors"
      >
        Generate
      </button>

      {error && (
        <p className="text-red-500 mt-4 text-center" id="errorMessage">
          {error}
        </p>
      )}

      {shortUrl && (
        <div className="mt-4">
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold truncate"
            >
              {shortUrl}
            </a>
            <button
              onClick={copyLink}
              className="ml-2 text-gray-600 hover:text-blue-600"
            >
              📋
            </button>
          </div>
        </div>
      )}

      {qrCode && (
        <div className="mt-4 text-center">
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code"
            className="mx-auto mb-4 w-40 h-40"
          />
          <button
            onClick={downloadQRCode}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Download QR Code as PNG
          </button>
        </div>
      )}
    </div>
  );
}
