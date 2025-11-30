package database

import (
	"fmt"
	"log"

	"pluralink/backend/config"
	"pluralink/backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		config.AppConfig.DBHost,
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBName,
		config.AppConfig.DBPort,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")
}

func Migrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.ServiceProvider{},
		&models.Client{},
		&models.Category{},
		&models.Service{},
		&models.Availability{},
		&models.Booking{},
		&models.Review{},
	)

	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migration completed")
}

func SeedCategories() {
	categories := []models.Category{
		{Name: "Tattoo", Description: "Tattoo services"},
		{Name: "Haircut", Description: "Haircut and styling services"},
		{Name: "Nails", Description: "Nail care and manicure services"},
		{Name: "Salon", Description: "General salon services"},
		{Name: "Pet Grooming", Description: "Pet grooming services"},
		{Name: "Massage", Description: "Massage therapy services"},
		{Name: "Facial", Description: "Facial treatment services"},
		{Name: "Barber", Description: "Barbershop services"},
	}

	for _, category := range categories {
		var existing models.Category
		result := DB.Where("name = ?", category.Name).First(&existing)
		if result.Error == gorm.ErrRecordNotFound {
			DB.Create(&category)
		}
	}

	log.Println("Categories seeded successfully")
}

