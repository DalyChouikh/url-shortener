async function generateShortLink() {
  // Get the value of the input field
  const longUrl = document.getElementById("urlInput").value;
  const errorMessage = document.getElementById("errorMessage");
  const generatedLink = document.getElementById("generatedLink");
  const linkContainer = document.getElementById("linkContainer");
  const copyButton = document.getElementById("copyButton");

  // Clear any previous messages or link
  errorMessage.style.display = "none";
  generatedLink.style.display = "none";

  // Send a POST request to the backend
  try {
    const response = await fetch("/api/v1/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ long_url: longUrl }),
    });

    // Parse the response
    const data = await response.json();

    if (response.ok) {
      // Display the shortened link
      generatedLink.href = data.short_url;
      generatedLink.textContent = data.short_url;
      generatedLink.style.display = "flex";
      linkContainer.style.visibility = "visible";
      copyButton.style.visibility = "visible";
    } else {
      // Display the error message
      errorMessage.textContent = data.error || "An error occurred";
      errorMessage.style.display = "block";
    }
  } catch (error) {
    errorMessage.textContent = "Network error. Please try again.";
    errorMessage.style.display = "block";
  }
}

function copyLink() {
  const generatedLink = document.getElementById("generatedLink");

  // Copy the URL from the generatedLink's href attribute
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
