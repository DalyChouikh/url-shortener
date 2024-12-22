package handlers

import (
	"io"
	"io/fs"
	"mime"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

type SPAHandler struct {
	embedFS fs.FS
	index   []byte
}

func NewSPAHandler(embedFS fs.FS) (*SPAHandler, error) {
	// Read the index.html file
	index, err := fs.ReadFile(embedFS, "index.html")
	if err != nil {
		return nil, err
	}

	return &SPAHandler{
		embedFS: embedFS,
		index:   index,
	}, nil
}

func (h *SPAHandler) ServeFiles(c *gin.Context) {
	urlPath := strings.TrimPrefix(c.Request.URL.Path, "/")
	
	// If path is empty or doesn't have an extension, serve index.html
	if urlPath == "" || !strings.Contains(urlPath, ".") {
		c.Header("Content-Type", "text/html")
		c.Data(http.StatusOK, "text/html", h.index)
		return
	}

	// Try to serve the static file
	file, err := h.embedFS.Open(urlPath)
	if err != nil {
		c.Header("Content-Type", "text/html")
		c.Data(http.StatusOK, "text/html", h.index)
		return
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		c.Header("Content-Type", "text/html")
		c.Data(http.StatusOK, "text/html", h.index)
		return
	}

	// Set correct MIME type based on file extension
	ext := filepath.Ext(urlPath)
	mimeType := mime.TypeByExtension(ext)
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}
	
	c.Header("Content-Type", mimeType)
	http.ServeContent(c.Writer, c.Request, stat.Name(), stat.ModTime(), file.(io.ReadSeeker))
}
