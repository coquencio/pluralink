package models

import (
	"time"

	"gorm.io/gorm"
)

type Service struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ProviderID  uint      `gorm:"not null;index" json:"provider_id"`
	CategoryID  uint      `gorm:"not null;index" json:"category_id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Price       float64   `gorm:"not null" json:"price"`
	Duration    int       `gorm:"not null" json:"duration"` // Duration in minutes
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Provider ServiceProvider `gorm:"foreignKey:ProviderID" json:"provider,omitempty"`
	Category Category        `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Bookings []Booking       `gorm:"foreignKey:ServiceID" json:"bookings,omitempty"`
}

