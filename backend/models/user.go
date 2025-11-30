package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleProvider UserRole = "provider"
	RoleClient   UserRole = "client"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	FirstName    string    `json:"first_name"`
	LastName     string    `json:"last_name"`
	Phone        string    `json:"phone"`
	Role         UserRole  `gorm:"type:varchar(20);not null" json:"role"`
	OAuthID      string    `gorm:"index" json:"oauth_id"`
	OAuthProvider string   `json:"oauth_provider"` // google, facebook, etc.
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	ServiceProvider *ServiceProvider `json:"service_provider,omitempty"`
	Client          *Client          `json:"client,omitempty"`
}

