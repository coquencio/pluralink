package models

import (
	"time"

	"gorm.io/gorm"
)

type ReviewerType string

const (
	ReviewerTypeClient   ReviewerType = "client"
	ReviewerTypeProvider ReviewerType = "provider"
)

type RevieweeType string

const (
	RevieweeTypeProvider RevieweeType = "provider"
	RevieweeTypeClient   RevieweeType = "client"
)

type Review struct {
	ID           uint         `gorm:"primaryKey" json:"id"`
	BookingID    uint         `gorm:"not null;index" json:"booking_id"`
	ReviewerID   uint         `gorm:"not null;index" json:"reviewer_id"`
	ReviewerType ReviewerType `gorm:"type:varchar(20);not null" json:"reviewer_type"`
	RevieweeID   uint         `gorm:"not null;index" json:"reviewee_id"`
	RevieweeType RevieweeType `gorm:"type:varchar(20);not null" json:"reviewee_type"`
	Rating       int          `gorm:"not null;check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment      string       `json:"comment"`
	CreatedAt    time.Time    `json:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Booking Booking `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
}

