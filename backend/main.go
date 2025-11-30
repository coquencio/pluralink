package main

import (
	"log"

	"pluralink/backend/config"
	"pluralink/backend/database"
	"pluralink/backend/routes"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Connect to database
	database.Connect()

	// Run migrations
	database.Migrate()

	// Seed initial data
	database.SeedCategories()

	// Setup routes
	r := routes.SetupRoutes()

	// Start server
	port := ":" + config.AppConfig.ServerPort
	log.Printf("Server starting on port %s", port)
	if err := r.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

