package server

import (
	"context"
	"filer/config"
	"filer/handler"
	"filer/logger"
	"net/http"

	"go.uber.org/zap"
)

type Server struct {
	httpserver *http.Server
	logger     *logger.Logger
}

func NewServer(cfg *config.Config, logger *logger.Logger) *Server {
	handler := handler.NewHandler(cfg)

	mux := http.NewServeMux()
	server := &http.Server{
		Handler: mux,
		Addr:    cfg.Addr,
	}

	handler.RegisterRoutes(mux)

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
