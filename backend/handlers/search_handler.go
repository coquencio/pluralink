package handlers

import (
	"net/http"
	"strconv"

	"pluralink/backend/models"
	"pluralink/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SearchHandler struct {
	DB *gorm.DB
}

func NewSearchHandler(db *gorm.DB) *SearchHandler {
	return &SearchHandler{DB: db}
}

func (h *SearchHandler) SearchProviders(c *gin.Context) {
	var providers []models.ServiceProvider
	query := h.DB.Preload("User").Preload("Categories").Preload("Services").Preload("Reviews")

	// Category filter
	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Joins("JOIN provider_categories ON provider_categories.service_provider_id = service_providers.id").
			Where("provider_categories.category_id = ?", categoryID)
	}

	// Location-based search (simple distance calculation)
	if latStr := c.Query("latitude"); latStr != "" {
		if lonStr := c.Query("longitude"); lonStr != "" {
			lat, err1 := strconv.ParseFloat(latStr, 64)
			lon, err2 := strconv.ParseFloat(lonStr, 64)
			if err1 == nil && err2 == nil {
				// Simple bounding box search (for production, use PostGIS for accurate distance)
				// This is a placeholder - implement proper geospatial query
				query = query.Where("latitude IS NOT NULL AND longitude IS NOT NULL")
			}
		}
	}

	// Search by business name
	if search := c.Query("search"); search != "" {
		query = query.Where("business_name ILIKE ?", "%"+search+"%")
	}

	// Minimum rating filter
	if minRating := c.Query("min_rating"); minRating != "" {
		rating, err := strconv.ParseFloat(minRating, 64)
		if err == nil {
			query = query.Joins("LEFT JOIN reviews ON reviews.reviewee_id = service_providers.id AND reviews.reviewee_type = 'provider'").
				Group("service_providers.id").
				Having("AVG(reviews.rating) >= ?", rating)
		}
	}

	if err := query.Find(&providers).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to search providers")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Search completed successfully", providers)
}

func (h *SearchHandler) GetCategories(c *gin.Context) {
	var categories []models.Category
	if err := h.DB.Find(&categories).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch categories")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Categories retrieved successfully", categories)
}

