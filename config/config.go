package config

type Config struct {
	FileDir string
	Addr    string
}

func NewConfig() *Config {
	return &Config{
		FileDir: "files",
		Addr:    "localhost:8080",
	}
}
