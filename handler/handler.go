package handler

import (
	"filer/config"
	"net/http"
)

type Handler struct {
	cfg *config.Config
}

func NewHandler(cfg *config.Config) *Handler {
	return &Handler{
		cfg: cfg,
	}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/upload", h.Upload)
	mux.HandleFunc("/download/", h.Download)
	mux.HandleFunc("/ping", h.PingHandler)
}
