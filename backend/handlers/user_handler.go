package handlers

import (
	"net/http"

	"pluralink/backend/models"
	"pluralink/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{DB: db}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := h.DB.Preload("ServiceProvider").Preload("Client").First(&user, userID).Error; err != nil {
		utils.NotFoundResponse(c, "User not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Profile retrieved successfully", user)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		utils.NotFoundResponse(c, "User not found")
		return
	}

	var updateData struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Phone     string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	if updateData.FirstName != "" {
		user.FirstName = updateData.FirstName
	}
	if updateData.LastName != "" {
		user.LastName = updateData.LastName
	}
	if updateData.Phone != "" {
		user.Phone = updateData.Phone
	}

	if err := h.DB.Save(&user).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update profile")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Profile updated successfully", user)
}

