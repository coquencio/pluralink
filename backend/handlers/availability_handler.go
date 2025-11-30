package handlers

import (
	"net/http"
	"strconv"

	"pluralink/backend/models"
	"pluralink/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AvailabilityHandler struct {
	DB *gorm.DB
}

func NewAvailabilityHandler(db *gorm.DB) *AvailabilityHandler {
	return &AvailabilityHandler{DB: db}
}

type CreateAvailabilityRequest struct {
	DayOfWeek   models.DayOfWeek `json:"day_of_week" binding:"required"`
	StartTime   string            `json:"start_time" binding:"required"`
	EndTime     string            `json:"end_time" binding:"required"`
	IsAvailable bool              `json:"is_available"`
}

func (h *AvailabilityHandler) CreateAvailability(c *gin.Context) {
	userID, _ := c.Get("user_id")

	// Get provider
	var provider models.ServiceProvider
	if err := h.DB.Where("user_id = ?", userID).First(&provider).Error; err != nil {
		utils.NotFoundResponse(c, "Provider profile not found")
		return
	}

	var req CreateAvailabilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	availability := models.Availability{
		ProviderID:  provider.ID,
		DayOfWeek:   req.DayOfWeek,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		IsAvailable: req.IsAvailable,
	}

	if err := h.DB.Create(&availability).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create availability")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Availability created successfully", availability)
}

func (h *AvailabilityHandler) GetAvailabilities(c *gin.Context) {
	providerID := c.Param("id")

	var availabilities []models.Availability
	if err := h.DB.Where("provider_id = ?", providerID).Find(&availabilities).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch availabilities")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Availabilities retrieved successfully", availabilities)
}

func (h *AvailabilityHandler) GetMyAvailabilities(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var provider models.ServiceProvider
	if err := h.DB.Where("user_id = ?", userID).First(&provider).Error; err != nil {
		utils.NotFoundResponse(c, "Provider profile not found")
		return
	}

	var availabilities []models.Availability
	if err := h.DB.Where("provider_id = ?", provider.ID).Find(&availabilities).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch availabilities")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Availabilities retrieved successfully", availabilities)
}

func (h *AvailabilityHandler) UpdateAvailability(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	var provider models.ServiceProvider
	if err := h.DB.Where("user_id = ?", userID).First(&provider).Error; err != nil {
		utils.NotFoundResponse(c, "Provider profile not found")
		return
	}

	var availability models.Availability
	if err := h.DB.Where("id = ? AND provider_id = ?", id, provider.ID).First(&availability).Error; err != nil {
		utils.NotFoundResponse(c, "Availability not found")
		return
	}

	var req CreateAvailabilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	availability.DayOfWeek = req.DayOfWeek
	availability.StartTime = req.StartTime
	availability.EndTime = req.EndTime
	availability.IsAvailable = req.IsAvailable

	if err := h.DB.Save(&availability).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update availability")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Availability updated successfully", availability)
}

func (h *AvailabilityHandler) DeleteAvailability(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	var provider models.ServiceProvider
	if err := h.DB.Where("user_id = ?", userID).First(&provider).Error; err != nil {
		utils.NotFoundResponse(c, "Provider profile not found")
		return
	}

	if err := h.DB.Where("id = ? AND provider_id = ?", id, provider.ID).Delete(&models.Availability{}).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to delete availability")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Availability deleted successfully", nil)
}

