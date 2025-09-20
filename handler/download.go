package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

func (h *Handler) Download(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "download method must be get", http.StatusMethodNotAllowed)
		return
	}

	filename := filepath.Base(r.URL.Path)
	filePath := filepath.Join(h.cfg.FileDir, filename)
	if _, err := os.Stat(filename); err != nil {
		http.Error(w, "file is not exist", http.StatusBadRequest)
		return
	}

	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, "failed open file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	w.Header().Set("Content-Type", "application/octet-stream")

	if _, err = io.Copy(w, file); err != nil {
		http.Error(w, "failed copy from file", http.StatusInternalServerError)

		return
	}
}
