package core

import (
	"errors"
	"filer/config"
	"filer/storage"
	"fmt"
	"io"
	"path/filepath"
	"strings"
)

type FileServerCore struct {
	storage *storage.Storage
	cfg     *config.Config
}

func NewFileServerCore(storage *storage.Storage, cfg *config.Config) *FileServerCore {
	return &FileServerCore{
		storage: storage,
		cfg:     cfg,
	}
}

func (f *FileServerCore) SaveFile(src io.Reader, name string) error {
	newname := ""

	for _, s := range name {
		if s != '@' {
			newname = fmt.Sprintf("%s%s", newname, string(s))
		}
	}

	path := filepath.Join(f.cfg.FileDir, newname)

	return f.storage.SaveFile(src, path)
}

func (f *FileServerCore) ListFiles() ([]string, error) {
	return f.storage.ListFiles(f.cfg.FileDir)
}

func (f *FileServerCore) DeleteFile(name string) error {
	cleanFilename := filepath.Base(name)
	if cleanFilename == "." || cleanFilename == ".." || strings.Contains(name, "..") {
		return errors.New("invalid file name")
	}

	path := filepath.Join(f.cfg.FileDir, name)

	return f.storage.DeleteFile(path)
}

func (f *FileServerCore) GetFile(dest io.Writer, name string) error {
	cleanFilename := filepath.Base(name)
	if cleanFilename == "." || cleanFilename == ".." {
		return errors.New("invalid filepath")
	}

	filePath := filepath.Join(f.cfg.FileDir, cleanFilename)

	return f.GetFile(dest, filePath)
}
