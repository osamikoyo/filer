package main

import (
	"context"
	"filer/config"
	"filer/logger"
	"filer/server"
	"os"
	"os/signal"

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

	server := server.NewServer(cfg, logger)

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
