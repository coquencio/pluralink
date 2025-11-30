package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBPort         string
	ServerPort     string
	JWTSecret      string
	OAuthClientID string
	OAuthSecret    string
	OAuthRedirect  string
}

var AppConfig *Config

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	AppConfig = &Config{
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBUser:         getEnv("DB_USER", "postgres"),
		DBPassword:     getEnv("DB_PASSWORD", "postgres"),
		DBName:         getEnv("DB_NAME", "pluralink"),
		DBPort:         getEnv("DB_PORT", "5432"),
		ServerPort:     getEnv("SERVER_PORT", "8080"),
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		OAuthClientID:  getEnv("OAUTH_CLIENT_ID", ""),
		OAuthSecret:    getEnv("OAUTH_SECRET", ""),
		OAuthRedirect:  getEnv("OAUTH_REDIRECT", "http://localhost:8080/api/auth/callback"),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

