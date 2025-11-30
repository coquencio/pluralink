package handlers

import (
	"net/http"
	"strconv"

	"pluralink/backend/models"
	"pluralink/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProviderHandler struct {
	DB *gorm.DB
}

func NewProviderHandler(db *gorm.DB) *ProviderHandler {
	return &ProviderHandler{DB: db}
}

func (h *ProviderHandler) GetProviders(c *gin.Context) {
	var providers []models.ServiceProvider
	query := h.DB.Preload("User").Preload("Categories").Preload("Services")

	// Filter by category
	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Joins("JOIN provider_categories ON provider_categories.service_provider_id = service_providers.id").
			Where("provider_categories.category_id = ?", categoryID)
	}

	// Location-based filtering (latitude/longitude)
	if lat := c.Query("latitude"); lat != "" && c.Query("longitude") != "" {
		// Simple distance calculation (for production, use PostGIS or similar)
		// This is a placeholder - implement proper geospatial query
	}

	// Search by name
	if search := c.Query("search"); search != "" {
		query = query.Where("business_name ILIKE ?", "%"+search+"%")
	}

	if err := query.Find(&providers).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch providers")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Providers retrieved successfully", providers)
}

func (h *ProviderHandler) GetProvider(c *gin.Context) {
	id := c.Param("id")

	var provider models.ServiceProvider
	if err := h.DB.Preload("User").
		Preload("Categories").
		Preload("Services").
		Preload("Reviews", func(db *gorm.DB) *gorm.DB {
			return db.Preload("Booking").Order("created_at DESC")
		}).
		First(&provider, id).Error; err != nil {
		utils.NotFoundResponse(c, "Provider not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Provider retrieved successfully", provider)
}

func (h *ProviderHandler) CreateProvider(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		BusinessName string  `json:"business_name" binding:"required"`
		Description  string  `json:"description"`
		Address      string  `json:"address"`
		City         string  `json:"city"`
		State        string  `json:"state"`
		ZipCode      string  `json:"zip_code"`
		Country      string  `json:"country"`
		Latitude     float64 `json:"latitude"`
		Longitude    float64 `json:"longitude"`
		Phone        string  `json:"phone"`
		Website      string  `json:"website"`
		CategoryIDs  []uint  `json:"category_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	// Check if provider already exists
	var existing models.ServiceProvider
	if err := h.DB.Where("user_id = ?", userID).First(&existing).Error; err == nil {
		utils.BadRequestResponse(c, "Provider profile already exists")
		return
	}

	provider := models.ServiceProvider{
		UserID:       userID.(uint),
		BusinessName: req.BusinessName,
		Description:  req.Description,
		Address:      req.Address,
		City:         req.City,
		State:        req.State,
		ZipCode:      req.ZipCode,
		Country:      req.Country,
		Latitude:     req.Latitude,
		Longitude:    req.Longitude,
		Phone:        req.Phone,
		Website:      req.Website,
	}

	if err := h.DB.Create(&provider).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create provider")
		return
	}

	// Associate categories
	if len(req.CategoryIDs) > 0 {
		var categories []models.Category
		h.DB.Where("id IN ?", req.CategoryIDs).Find(&categories)
		h.DB.Model(&provider).Association("Categories").Append(categories)
	}

	h.DB.Preload("User").Preload("Categories").First(&provider, provider.ID)

	utils.SuccessResponse(c, http.StatusCreated, "Provider created successfully", provider)
}

func (h *ProviderHandler) UpdateProvider(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var provider models.ServiceProvider
	if err := h.DB.Where("user_id = ?", userID).First(&provider).Error; err != nil {
		utils.NotFoundResponse(c, "Provider not found")
		return
	}

	var req struct {
		BusinessName string   `json:"business_name"`
		Description  string   `json:"description"`
		Address      string   `json:"address"`
		City         string   `json:"city"`
		State        string   `json:"state"`
		ZipCode      string   `json:"zip_code"`
		Country      string   `json:"country"`
		Latitude     float64  `json:"latitude"`
		Longitude    float64  `json:"longitude"`
		Phone        string   `json:"phone"`
		Website      string   `json:"website"`
		CategoryIDs  []uint   `json:"category_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	if req.BusinessName != "" {
		provider.BusinessName = req.BusinessName
	}
	if req.Description != "" {
		provider.Description = req.Description
	}
	if req.Address != "" {
		provider.Address = req.Address
	}
	if req.City != "" {
		provider.City = req.City
	}
	if req.State != "" {
		provider.State = req.State
	}
	if req.ZipCode != "" {
		provider.ZipCode = req.ZipCode
	}
	if req.Country != "" {
		provider.Country = req.Country
	}
	if req.Latitude != 0 {
		provider.Latitude = req.Latitude
	}
	if req.Longitude != 0 {
		provider.Longitude = req.Longitude
	}
	if req.Phone != "" {
		provider.Phone = req.Phone
	}
	if req.Website != "" {
		provider.Website = req.Website
	}

	if err := h.DB.Save(&provider).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update provider")
		return
	}

	// Update categories
	if req.CategoryIDs != nil {
		var categories []models.Category
		h.DB.Where("id IN ?", req.CategoryIDs).Find(&categories)
		h.DB.Model(&provider).Association("Categories").Replace(categories)
	}

	h.DB.Preload("User").Preload("Categories").First(&provider, provider.ID)

	utils.SuccessResponse(c, http.StatusOK, "Provider updated successfully", provider)
}

func (h *ProviderHandler) GetProviderReviews(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid provider ID")
		return
	}

	var reviews []models.Review
	if err := h.DB.Where("reviewee_id = ? AND reviewee_type = ?", id, models.RevieweeTypeProvider).
		Preload("Booking").
		Preload("Booking.Client").
		Preload("Booking.Client.User").
		Order("created_at DESC").
		Find(&reviews).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch reviews")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Reviews retrieved successfully", reviews)
}

