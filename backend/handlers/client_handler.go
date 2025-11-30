package handlers

import (
	"net/http"

	"pluralink/backend/models"
	"pluralink/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ClientHandler struct {
	DB *gorm.DB
}

func NewClientHandler(db *gorm.DB) *ClientHandler {
	return &ClientHandler{DB: db}
}

func (h *ClientHandler) CreateClient(c *gin.Context) {
	userID, _ := c.Get("user_id")

	// Check if client already exists
	var existing models.Client
	if err := h.DB.Where("user_id = ?", userID).First(&existing).Error; err == nil {
		utils.BadRequestResponse(c, "Client profile already exists")
		return
	}

	var req struct {
		Address   string  `json:"address"`
		City      string  `json:"city"`
		State     string  `json:"state"`
		ZipCode   string  `json:"zip_code"`
		Country   string  `json:"country"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	client := models.Client{
		UserID:    userID.(uint),
		Address:   req.Address,
		City:      req.City,
		State:     req.State,
		ZipCode:   req.ZipCode,
		Country:   req.Country,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
	}

	if err := h.DB.Create(&client).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create client")
		return
	}

	h.DB.Preload("User").First(&client, client.ID)

	utils.SuccessResponse(c, http.StatusCreated, "Client profile created successfully", client)
}

func (h *ClientHandler) UpdateClient(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var client models.Client
	if err := h.DB.Where("user_id = ?", userID).First(&client).Error; err != nil {
		utils.NotFoundResponse(c, "Client not found")
		return
	}

	var req struct {
		Address   string  `json:"address"`
		City      string  `json:"city"`
		State     string  `json:"state"`
		ZipCode   string  `json:"zip_code"`
		Country   string  `json:"country"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	if req.Address != "" {
		client.Address = req.Address
	}
	if req.City != "" {
		client.City = req.City
	}
	if req.State != "" {
		client.State = req.State
	}
	if req.ZipCode != "" {
		client.ZipCode = req.ZipCode
	}
	if req.Country != "" {
		client.Country = req.Country
	}
	if req.Latitude != 0 {
		client.Latitude = req.Latitude
	}
	if req.Longitude != 0 {
		client.Longitude = req.Longitude
	}

	if err := h.DB.Save(&client).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to update client")
		return
	}

	h.DB.Preload("User").First(&client, client.ID)

	utils.SuccessResponse(c, http.StatusOK, "Client profile updated successfully", client)
}

