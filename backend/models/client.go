package models

import (
	"time"

	"gorm.io/gorm"
)

type Client struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	Address   string    `json:"address"`
	City      string    `json:"city"`
	State     string    `json:"state"`
	ZipCode   string    `json:"zip_code"`
	Country   string    `json:"country"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User     User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Bookings []Booking `gorm:"foreignKey:ClientID" json:"bookings,omitempty"`
	Reviews  []Review  `gorm:"foreignKey:ReviewerID;where:reviewer_type='client'" json:"reviews,omitempty"`
}

