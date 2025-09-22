package handler

import (
	"filer/config"
	"filer/core"
	"filer/templates"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	cfg  *config.Config
	core *core.FileServerCore
}

func NewHandler(core *core.FileServerCore, cfg *config.Config) *Handler {
	return &Handler{
		cfg:  cfg,
		core: core,
	}
}

func (h *Handler) RegisterRoutes(r *chi.Mux) {
	r.Get("/ping", h.PingHandler)
	r.Get("/list", h.ListFiles)
	r.Post("/upload", h.Upload)
	r.Get("/download/{filename}", h.Download)
	r.Get("/delete/{filename}", h.Delete)
	r.Get("/", h.Index)
}

func (h *Handler) Index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	templates.Main().Render(r.Context(), w)
}
