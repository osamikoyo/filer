package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

const MaxSize = 10 << 20

func (h *Handler) Upload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "upload method must be post", http.StatusMethodNotAllowed)

		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, MaxSize)
	if err := r.ParseMultipartForm(MaxSize); err != nil {
		http.Error(w, "failed parse form", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "failed get file from form", http.StatusBadRequest)
		return
	}
	defer file.Close()

	path := filepath.Join(h.cfg.FileDir, handler.Filename)
	dst, err := os.Create(path)
	if err != nil {
		http.Error(w, "failed open file", http.StatusBadRequest)
		return
	}

	_, err = io.Copy(dst, file)
	if err != nil {
		http.Error(w, "fialed copy from form file", http.StatusBadRequest)
		return
	}

	fmt.Fprintf(w, "file %s was uploaded successfully", handler.Filename)
}
