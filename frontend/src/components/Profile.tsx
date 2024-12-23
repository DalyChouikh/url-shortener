import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { FaCopy } from "react-icons/fa";
import { Bounce, toast } from "react-toastify";

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
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
    if (!confirm("Are you sure you want to delete this URL?")) {
      return;
    }

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
        toast.success("URL deleted successfully", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      } else {
        throw new Error("Failed to delete URL");
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast.error("Failed to delete URL", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

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
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={user.picture}
            alt={user.name}
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              Member since: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Your Shortened URLs</h3>
        {loading ? (
          <p>Loading URLs...</p>
        ) : urls.length === 0 ? (
          <p className="text-gray-600">No URLs generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {urls.map((url) => (
                  <tr key={url.ID}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(url.CreatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        <a
                          href={url.LongURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {url.LongURL}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`/r/${url.ShortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {`${window.location.origin}/r/${url.ShortCode}`}
                        </a>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/r/${url.ShortCode}`
                            )
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {url.Clicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {url.QRCode && (
                        <div className="flex flex-col items-center space-y-2">
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
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDelete(url.ID)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
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
