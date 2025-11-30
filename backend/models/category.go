package models

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex;not null" json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"` // Icon name or URL
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Services  []Service `gorm:"foreignKey:CategoryID" json:"services,omitempty"`
	Providers []ServiceProvider `gorm:"many2many:provider_categories;" json:"providers,omitempty"`
}

