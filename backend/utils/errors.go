package utils

import (
	"errors"
	"pluralink/backend/config"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound      = errors.New("user not found")
	ErrUnauthorized      = errors.New("unauthorized")
	ErrForbidden         = errors.New("forbidden")
	ErrBookingNotFound   = errors.New("booking not found")
	ErrProviderNotFound  = errors.New("service provider not found")
	ErrClientNotFound    = errors.New("client not found")
	ErrServiceNotFound   = errors.New("service not found")
	ErrInvalidTimeSlot   = errors.New("invalid time slot")
	ErrTimeSlotBooked    = errors.New("time slot already booked")
	ErrInvalidDate       = errors.New("invalid date")
)

func GetJWTSecret() string {
	return config.AppConfig.JWTSecret
}

