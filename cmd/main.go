package main

import (
	"context"
	"filer/config"
	"filer/logger"
	"filer/server"
	"net/http"
	"os"
	"os/signal"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
)

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	cfg := config.NewConfig()

	logCfg := logger.Config{
		AppName:   "filer",
		AddCaller: false,
		LogFile:   "file.log",
		LogLevel:  "debug",
	}

	logger.Init(logCfg)

	logger := logger.Get()
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Handle("/static/*", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	server := server.NewServer(cfg, logger, r)

	go func() {
		<-ctx.Done()
		if err := server.Stop(ctx); err != nil {
			logger.Error("failed stop server")
			return
		}
	}()

	if err := server.Run(ctx); err != nil {
		logger.Fatal("failed run server", zap.Error(err))
		return
	}
}
