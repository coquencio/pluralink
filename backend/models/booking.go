package models

import (
	"time"

	"gorm.io/gorm"
)

type BookingStatus string

const (
	StatusPending    BookingStatus = "pending"
	StatusConfirmed  BookingStatus = "confirmed"
	StatusCompleted  BookingStatus = "completed"
	StatusCancelled  BookingStatus = "cancelled"
	StatusRescheduled BookingStatus = "rescheduled"
)

type Booking struct {
	ID          uint          `gorm:"primaryKey" json:"id"`
	ClientID    uint          `gorm:"not null;index" json:"client_id"`
	ProviderID  uint          `gorm:"not null;index" json:"provider_id"`
	ServiceID   uint          `gorm:"not null;index" json:"service_id"`
	Date        time.Time     `gorm:"not null" json:"date"`
	StartTime   string        `gorm:"not null" json:"start_time"` // Format: "HH:MM"
	EndTime     string        `gorm:"not null" json:"end_time"`   // Format: "HH:MM"
	Status      BookingStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	Notes       string        `json:"notes"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Client  Client         `gorm:"foreignKey:ClientID" json:"client,omitempty"`
	Provider ServiceProvider `gorm:"foreignKey:ProviderID" json:"provider,omitempty"`
	Service Service        `gorm:"foreignKey:ServiceID" json:"service,omitempty"`
	Review  *Review        `gorm:"foreignKey:BookingID" json:"review,omitempty"`
}

