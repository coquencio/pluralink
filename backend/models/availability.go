package models

import (
	"time"

	"gorm.io/gorm"
)

type DayOfWeek int

const (
	Sunday DayOfWeek = iota
	Monday
	Tuesday
	Wednesday
	Thursday
	Friday
	Saturday
)

type Availability struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ProviderID  uint      `gorm:"not null;index" json:"provider_id"`
	DayOfWeek   DayOfWeek `gorm:"not null" json:"day_of_week"` // 0=Sunday, 1=Monday, etc.
	StartTime   string    `gorm:"not null" json:"start_time"`   // Format: "HH:MM"
	EndTime     string    `gorm:"not null" json:"end_time"`     // Format: "HH:MM"
	IsAvailable bool      `gorm:"default:true" json:"is_available"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Provider ServiceProvider `gorm:"foreignKey:ProviderID" json:"provider,omitempty"`
}

