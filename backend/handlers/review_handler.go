package handlers

import (
	"net/http"
	"strconv"

	"pluralink/backend/models"
	"pluralink/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ReviewHandler struct {
	DB *gorm.DB
}

func NewReviewHandler(db *gorm.DB) *ReviewHandler {
	return &ReviewHandler{DB: db}
}

type CreateReviewRequest struct {
	BookingID    uint   `json:"booking_id" binding:"required"`
	RevieweeID   uint   `json:"reviewee_id" binding:"required"`
	RevieweeType string `json:"reviewee_type" binding:"required,oneof=provider client"`
	Rating       int    `json:"rating" binding:"required,min=1,max=5"`
	Comment      string `json:"comment"`
}

func (h *ReviewHandler) CreateReview(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	// Verify booking exists and belongs to user
	var booking models.Booking
	if err := h.DB.First(&booking, req.BookingID).Error; err != nil {
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

	// Check if review already exists for this booking
	var existingReview models.Review
	if err := h.DB.Where("booking_id = ? AND reviewer_id = ?", req.BookingID, userID).First(&existingReview).Error; err == nil {
		utils.BadRequestResponse(c, "Review already exists for this booking")
		return
	}

	// Determine reviewer type
	reviewerType := models.ReviewerTypeClient
	if userRole == models.RoleProvider {
		reviewerType = models.ReviewerTypeProvider
	}

	review := models.Review{
		BookingID:    req.BookingID,
		ReviewerID:   userID.(uint),
		ReviewerType: reviewerType,
		RevieweeID:   req.RevieweeID,
		RevieweeType: models.RevieweeType(req.RevieweeType),
		Rating:       req.Rating,
		Comment:      req.Comment,
	}

	if err := h.DB.Create(&review).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create review")
		return
	}

	h.DB.Preload("Booking").First(&review, review.ID)

	utils.SuccessResponse(c, http.StatusCreated, "Review created successfully", review)
}

func (h *ReviewHandler) GetProviderReviews(c *gin.Context) {
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

func (h *ReviewHandler) GetClientReviews(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequestResponse(c, "Invalid client ID")
		return
	}

	var reviews []models.Review
	if err := h.DB.Where("reviewee_id = ? AND reviewee_type = ?", id, models.RevieweeTypeClient).
		Preload("Booking").
		Preload("Booking.Provider").
		Preload("Booking.Provider.User").
		Order("created_at DESC").
		Find(&reviews).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch reviews")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Reviews retrieved successfully", reviews)
}

