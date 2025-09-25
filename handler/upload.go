package handler

import (
	"fmt"
	"net/http"
)

const MaxSize = 10 << 20

func (h *Handler) Upload(w http.ResponseWriter, r *http.Request) {
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

	if err = h.core.SaveFile(file, handler.Filename); err != nil {
		http.Error(w, "failed save file", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "file %s was uploaded successfully", handler.Filename)
}
