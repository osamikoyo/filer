package server

import (
	"context"
	"filer/config"
	"filer/core"
	"filer/handler"
	"filer/logger"
	"filer/storage"
	"net/http"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type Server struct {
	httpserver *http.Server
	logger     *logger.Logger
}

func NewServer(cfg *config.Config, logger *logger.Logger, r *chi.Mux) *Server {
	storage := storage.NewStorage(logger)

	core := core.NewFileServerCore(storage, cfg)
	handler := handler.NewHandler(core, cfg)

	server := &http.Server{
		Handler: r,
		Addr:    cfg.Addr,
	}

	handler.RegisterRoutes(r)

	return &Server{
		httpserver: server,
		logger:     logger,
	}
}

func (s *Server) Run(ctx context.Context) error {
	s.logger.Info("starting server on",
		zap.String("addr", s.httpserver.Addr))

	if err := s.httpserver.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		s.logger.Fatal("failed start server",
			zap.Error(err))
		return err
	}

	return nil
}

func (s *Server) Stop(ctx context.Context) error {
	s.logger.Info("stopping http server")

	if err := s.httpserver.Close(); err != nil {
		s.logger.Error("failed close http server",
			zap.Error(err))

		return err
	}

	return nil
}
