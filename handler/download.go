package handler

import (
	"fmt"
	"log"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi/v5"
)

func (h *Handler) Download(w http.ResponseWriter, r *http.Request) {
	filename := chi.URLParam(r, "filename")
	if filename == "" {
		log.Printf("Download: filename parameter is missing")
		http.Error(w, "filename is required", http.StatusBadRequest)
		return
	}

	// Clean the filename to prevent path traversal attacks
	cleanFilename := filepath.Base(filename)
	if cleanFilename == "." || cleanFilename == ".." {
		log.Printf("Download: invalid filename: %s", filename)
		http.Error(w, "invalid filename", http.StatusBadRequest)
		return
	}

	filePath := filepath.Join(h.cfg.FileDir, cleanFilename)
	
	// Check if file exists and get file info
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			log.Printf("Download: file not found: %s", cleanFilename)
			http.Error(w, "file not found", http.StatusNotFound)
		} else {
			log.Printf("Download: error accessing file %s: %v", cleanFilename, err)
			http.Error(w, "error accessing file", http.StatusInternalServerError)
		}
		return
	}

	// Ensure it's a file, not a directory
	if fileInfo.IsDir() {
		log.Printf("Download: attempted to download directory: %s", cleanFilename)
		http.Error(w, "cannot download directories", http.StatusBadRequest)
		return
	}

	// Determine MIME type based on file extension
	mimeType := mime.TypeByExtension(filepath.Ext(cleanFilename))
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	// Set appropriate headers
	w.Header().Set("Content-Type", mimeType)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", fileInfo.Size()))
	
	// Properly encode filename for Content-Disposition header
	// This handles filenames with special characters and non-ASCII characters
	encodedFilename := url.QueryEscape(cleanFilename)
	if strings.Contains(cleanFilename, " ") || strings.ContainsAny(cleanFilename, "áéíóúñü") {
		w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"; filename*=UTF-8''%s`, cleanFilename, encodedFilename))
	} else {
		w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, cleanFilename))
	}

	// Enable browser caching for static files
	w.Header().Set("Cache-Control", "public, max-age=31536000") // 1 year

	log.Printf("Download: serving file %s (%d bytes, %s)", cleanFilename, fileInfo.Size(), mimeType)
	
	// Serve the file
	http.ServeFile(w, r, filePath)
}
