package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	filename := chi.URLParam(r, "filename")
	if filename == "" {
		log.Printf("Delete: filename parameter is missing")
		http.Error(w, "filename is required", http.StatusBadRequest)
		return
	}

	if err := h.core.DeleteFile(filename); err != nil {
		http.Error(w, "failed delete file", http.StatusInternalServerError)
		return
	}

	fileNames, err := h.core.ListFiles()
	if err != nil {
		http.Error(w, "failed list files", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(fileNames); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}
