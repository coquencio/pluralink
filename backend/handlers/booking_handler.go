package handlers

import (
	"net/http"
	"strconv"
	"time"

	"pluralink/backend/models"
	"pluralink/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BookingHandler struct {
	DB *gorm.DB
}

func NewBookingHandler(db *gorm.DB) *BookingHandler {
	return &BookingHandler{DB: db}
}

type CreateBookingRequest struct {
	ProviderID uint      `json:"provider_id" binding:"required"`
	ServiceID  uint      `json:"service_id" binding:"required"`
	Date       time.Time `json:"date" binding:"required"`
	StartTime  string    `json:"start_time" binding:"required"`
	Notes      string    `json:"notes"`
}

func (h *BookingHandler) CreateBooking(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	// Only clients can create bookings
	if userRole != models.RoleClient {
		utils.ErrorResponse(c, http.StatusForbidden, "Only clients can create bookings")
		return
	}

	var req CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	// Get client
	var client models.Client
	if err := h.DB.Where("user_id = ?", userID).First(&client).Error; err != nil {
		utils.NotFoundResponse(c, "Client profile not found")
		return
	}

	// Verify provider exists
	var provider models.ServiceProvider
	if err := h.DB.First(&provider, req.ProviderID).Error; err != nil {
		utils.NotFoundResponse(c, "Provider not found")
		return
	}

	// Verify service exists and belongs to provider
	var service models.Service
	if err := h.DB.Where("id = ? AND provider_id = ?", req.ServiceID, req.ProviderID).First(&service).Error; err != nil {
		utils.NotFoundResponse(c, "Service not found")
		return
	}

	// Calculate end time based on service duration
	startTime, err := time.Parse("15:04", req.StartTime)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid time format. Use HH:MM")
		return
	}
	endTime := startTime.Add(time.Duration(service.Duration) * time.Minute)
	endTimeStr := endTime.Format("15:04")

	// Check if time slot is available
	if !h.isTimeSlotAvailable(req.ProviderID, req.Date, req.StartTime, endTimeStr) {
		utils.BadRequestResponse(c, "Time slot is not available")
		return
	}

	// Check for conflicting bookings
	var conflictingBooking models.Booking
	if err := h.DB.Where("provider_id = ? AND date = ? AND status NOT IN ? AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))",
		req.ProviderID, req.Date, []models.BookingStatus{models.StatusCancelled}, req.StartTime, req.StartTime, endTimeStr, endTimeStr).
		First(&conflictingBooking).Error; err == nil {
		utils.BadRequestResponse(c, "Time slot is already booked")
		return
	}

	booking := models.Booking{
		ClientID:   client.ID,
		ProviderID: req.ProviderID,
		ServiceID:  req.ServiceID,
		Date:       req.Date,
		StartTime:  req.StartTime,
		EndTime:    endTimeStr,
		Status:     models.StatusPending,
		Notes:      req.Notes,
	}

	if err := h.DB.Create(&booking).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create booking")
		return
	}

	h.DB.Preload("Client").Preload("Client.User").
		Preload("Provider").Preload("Provider.User").
		Preload("Service").First(&booking, booking.ID)

	utils.SuccessResponse(c, http.StatusCreated, "Booking created successfully", booking)
}

func (h *BookingHandler) GetBookings(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	var bookings []models.Booking
	query := h.DB.Preload("Client").Preload("Client.User").
		Preload("Provider").Preload("Provider.User").
		Preload("Service")

	if userRole == models.RoleProvider {
		var provider models.ServiceProvider
		if err := h.DB.Where("user_id = ?", userID).First(&provider).Error; err != nil {
			utils.NotFoundResponse(c, "Provider profile not found")
			return
		}
		query = query.Where("provider_id = ?", provider.ID)
	} else {
		var client models.Client
		if err := h.DB.Where("user_id = ?", userID).First(&client).Error; err != nil {
			utils.NotFoundResponse(c, "Client profile not found")
			return
		}
		query = query.Where("client_id = ?", client.ID)
	}

	// Filter by status
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("date DESC, start_time DESC").Find(&bookings).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch bookings")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Bookings retrieved successfully", bookings)
}

func (h *BookingHandler) GetBooking(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	var booking models.Booking
	if err := h.DB.Preload("Client").Preload("Client.User").
		Preload("Provider").Preload("Provider.User").
		Preload("Service").
		Preload("Review").
		First(&booking, id).Error; err != nil {
		utils.NotFoundResponse(c, "Booking not found")
		return
	}

	// Verify user has access to this booking
	if userRole == models.RoleProvider {
		var provider models.ServiceProvider
		h.DB.Where("user_id = ?", userID).First(&provider)
		if booking.ProviderID != provider.ID {
			utils.ErrorResponse(c, http.StatusForbidden, "Access denied")
			return
		}
	} else {
		var client models.Client
		h.DB.Where("user_id = ?", userID).First(&client)
		if booking.ClientID != client.ID {
			utils.ErrorResponse(c, http.StatusForbidden, "Access denied")
			return
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "Booking retrieved successfully", booking)
}

func (h *BookingHandler) CancelBooking(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	var booking models.Booking
	if err := h.DB.First(&booking, id).Error; err != nil {
		utils.NotFoundResponse(c, "Booking not found")
		return
	}

	// Verify user has access
	if userRole == models.RoleProvider {
		var provider models.ServiceProvider
		h.DB.Where("user_id = ?", userID).First(&provider)
		if booking.ProviderID != provider.ID {
			utils.ErrorResponse(c, http.StatusForbidden, "Access denied")
			return
		}
	} else {
		var client models.Client
		h.DB.Where("user_id = ?", userID).First(&client)
		if booking.ClientID != client.ID {
			utils.ErrorResponse(c, http.StatusForbidden, "Access denied")
			return
		}
	}

	if booking.Status == models.StatusCancelled {
		utils.BadRequestResponse(c, "Booking is already cancelled")
		return
	}

	if booking.Status == models.StatusCompleted {
		utils.BadRequestResponse(c, "Cannot cancel completed booking")
		return
	}

	booking.Status = models.StatusCancelled
	if err := h.DB.Save(&booking).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to cancel booking")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Booking cancelled successfully", booking)
}

func (h *BookingHandler) RescheduleBooking(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	var booking models.Booking
	if err := h.DB.Preload("Service").First(&booking, id).Error; err != nil {
		utils.NotFoundResponse(c, "Booking not found")
		return
	}

	// Verify user has access
	if userRole == models.RoleProvider {
		var provider models.ServiceProvider
		h.DB.Where("user_id = ?", userID).First(&provider)
		if booking.ProviderID != provider.ID {
			utils.ErrorResponse(c, http.StatusForbidden, "Access denied")
			return
		}
	} else {
		var client models.Client
		h.DB.Where("user_id = ?", userID).First(&client)
		if booking.ClientID != client.ID {
			utils.ErrorResponse(c, http.StatusForbidden, "Access denied")
			return
		}
	}

	var req struct {
		Date      time.Time `json:"date" binding:"required"`
		StartTime string    `json:"start_time" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	// Calculate end time
	startTime, err := time.Parse("15:04", req.StartTime)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid time format. Use HH:MM")
		return
	}
	endTime := startTime.Add(time.Duration(booking.Service.Duration) * time.Minute)
	endTimeStr := endTime.Format("15:04")

	// Check if new time slot is available
	if !h.isTimeSlotAvailable(booking.ProviderID, req.Date, req.StartTime, endTimeStr) {
		utils.BadRequestResponse(c, "Time slot is not available")
		return
	}

	// Check for conflicting bookings (excluding current booking)
	var conflictingBooking models.Booking
	if err := h.DB.Where("provider_id = ? AND date = ? AND id != ? AND status NOT IN ? AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))",
		booking.ProviderID, req.Date, booking.ID, []models.BookingStatus{models.StatusCancelled}, req.StartTime, req.StartTime, endTimeStr, endTimeStr).
		First(&conflictingBooking).Error; err == nil {
		utils.BadRequestResponse(c, "Time slot is already booked")
		return
	}

	booking.Date = req.Date
	booking.StartTime = req.StartTime
	booking.EndTime = endTimeStr
	booking.Status = models.StatusRescheduled

	if err := h.DB.Save(&booking).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to reschedule booking")
		return
	}

	h.DB.Preload("Client").Preload("Client.User").
		Preload("Provider").Preload("Provider.User").
		Preload("Service").First(&booking, booking.ID)

	utils.SuccessResponse(c, http.StatusOK, "Booking rescheduled successfully", booking)
}

func (h *BookingHandler) isTimeSlotAvailable(providerID uint, date time.Time, startTime, endTime string) bool {
	dayOfWeek := int(date.Weekday())

	var availability models.Availability
	if err := h.DB.Where("provider_id = ? AND day_of_week = ? AND is_available = ?", providerID, dayOfWeek, true).First(&availability).Error; err != nil {
		return false
	}

	// Simple time check - in production, implement more sophisticated logic
	return true
}

