package storage

import (
	"filer/logger"
	"io"
	"os"

	"go.uber.org/zap"
)

type Storage struct {
	logger *logger.Logger
}

func NewStorage(logger *logger.Logger) *Storage {
	return &Storage{
		logger: logger,
	}
}

func (s *Storage) SaveFile(source io.Reader, name string) error {
	dest, err := os.Create(name)
	if err != nil {
		s.logger.Error("failed create file",
			zap.String("name", name),
			zap.Error(err))

		return err
	}
	defer dest.Close()

	if _, err = io.Copy(dest, source); err != nil {
		s.logger.Error("failed copy",
			zap.String("name", name),
			zap.Error(err))

		return err
	}

	return nil
}

func (s *Storage) DeleteFile(name string) error {
	err := os.Remove(name)
	if err != nil {
		s.logger.Error("failed delete file",
			zap.String("name", name),
			zap.Error(err))

		return err
	}

	return nil
}

func (s *Storage) ListFiles(dir string) ([]string, error) {
	files, err := os.ReadDir(dir)
	if err != nil {
		s.logger.Error("failed list files",
			zap.Error(err))

		return nil, err
	}

	names := make([]string, len(files))

	for i, file := range files {
		names[i] = file.Name()
	}

	return names, nil
}

func (s *Storage) GetFile(dest io.Writer, name string) error {
	if _, err := os.Stat(name); os.IsNotExist(err) {
		s.logger.Error("fialed get stat of file",
			zap.String("name", name),
			zap.Error(err))
		return err
	}

	source, err := os.Open(name)
	if err != nil {
		s.logger.Error("failed open file",
			zap.String("name", name),
			zap.Error(err))

		return err
	}

	if _, err = io.Copy(dest, source); err != nil {
		s.logger.Error("failed copy file",
			zap.String("name", name),
			zap.Error(err))

		return err
	}

	return nil
}
