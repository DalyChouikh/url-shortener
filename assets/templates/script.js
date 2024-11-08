async function generateShortLink() {
  const longUrl = document.getElementById("urlInput").value;
  const errorMessage = document.getElementById("errorMessage");
  const generatedLink = document.getElementById("generatedLink");
  const linkContainer = document.getElementById("linkContainer");
  const copyButton = document.getElementById("copyButton");

  errorMessage.style.display = "none";
  generatedLink.style.display = "none";

  try {
    const response = await fetch("/api/v1/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ long_url: longUrl }),
    });

    const data = await response.json();

    if (response.ok) {
      generatedLink.href = data.short_url;
      generatedLink.textContent = data.short_url;
      generatedLink.style.display = "flex";
      linkContainer.style.visibility = "visible";
      copyButton.style.visibility = "visible";

      generateCode(data.qrcode);
    } else {
      errorMessage.textContent = data.error || "An error occurred";
      errorMessage.style.display = "block";
    }
  } catch (error) {
    errorMessage.textContent = "Network error. Please try again.";
    errorMessage.style.display = "block";
  }
}

function generateCode(qrcode) {
  const qrCodeContainer = document.getElementById("qrCodeContainer");
  const downloadButton = document.getElementById("downloadButton");
  const qrCodeNode = document.createElement("img");
  qrCodeContainer.innerHTML = "";
  qrCodeNode.src = `data:image/png;base64, ${qrcode}`;
  qrCodeNode.alt = "QR Code";
  qrCodeNode.id = "qrCodeImage";
  qrCodeContainer.appendChild(qrCodeNode);

  downloadButton.style.display = "inline-block";
}

function downloadQRCode() {
  const qrCodeImage = document.getElementById("qrCodeImage");
  const downloadLink = document.createElement("a");
  downloadLink.href = qrCodeImage.src;
  downloadLink.download = "qr_code.png";
  qrCodeImage.appendChild(downloadLink);
  downloadLink.click();
  qrCodeImage.removeChild(downloadLink);
}

function copyLink() {
  const generatedLink = document.getElementById("generatedLink");

  navigator.clipboard
    .writeText(generatedLink.href)
    .then(() => {
      alert("Copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}
window.history.replaceState({}, document.title, "/");
