package models

import (
	"time"

	"gorm.io/gorm"
)

type ServiceProvider struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	BusinessName string   `gorm:"not null" json:"business_name"`
	Description string    `json:"description"`
	Address     string    `json:"address"`
	City        string    `json:"city"`
	State       string    `json:"state"`
	ZipCode     string    `json:"zip_code"`
	Country     string    `json:"country"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	Phone       string    `json:"phone"`
	Website     string    `json:"website"`
	IsVerified  bool      `gorm:"default:false" json:"is_verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User         User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Services     []Service    `gorm:"foreignKey:ProviderID" json:"services,omitempty"`
	Availabilities []Availability `gorm:"foreignKey:ProviderID" json:"availabilities,omitempty"`
	Bookings     []Booking    `gorm:"foreignKey:ProviderID" json:"bookings,omitempty"`
	Reviews      []Review     `gorm:"foreignKey:RevieweeID;where:reviewee_type='provider'" json:"reviews,omitempty"`
	Categories   []Category   `gorm:"many2many:provider_categories;" json:"categories,omitempty"`
}

