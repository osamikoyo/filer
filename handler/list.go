package handler

import (
	"encoding/json"
	"net/http"
)

func (h *Handler) ListFiles(w http.ResponseWriter, r *http.Request) {
	fileNames, err := h.core.ListFiles()
	if err != nil {
		http.Error(w, "failed get filenames", http.StatusInternalServerError)
	}
	w.Header().Set("Content-Type", "application/json")
	if err = json.NewEncoder(w).Encode(fileNames); err != nil {
		http.Error(w, "failed to encode json: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
