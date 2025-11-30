package handlers

import (
	"net/http"
	"time"

	"pluralink/backend/config"
	"pluralink/backend/middleware"
	"pluralink/backend/models"
	"pluralink/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB         *gorm.DB
	OAuthConfig *oauth2.Config
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	oauthConfig := &oauth2.Config{
		ClientID:     config.AppConfig.OAuthClientID,
		ClientSecret: config.AppConfig.OAuthSecret,
		RedirectURL:  config.AppConfig.OAuthRedirect,
		Scopes:       []string{"openid", "profile", "email"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://accounts.google.com/o/oauth2/auth",
			TokenURL: "https://oauth2.googleapis.com/token",
		},
	}

	return &AuthHandler{
		DB:          db,
		OAuthConfig: oauthConfig,
	}
}

type RegisterRequest struct {
	Email     string          `json:"email" binding:"required,email"`
	Password  string          `json:"password" binding:"required,min=6"`
	FirstName string          `json:"first_name" binding:"required"`
	LastName  string          `json:"last_name" binding:"required"`
	Phone     string          `json:"phone"`
	Role      models.UserRole `json:"role" binding:"required,oneof=provider client"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := h.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		utils.BadRequestResponse(c, "Email already registered")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to hash password")
		return
	}

	// Create user
	user := models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Phone:        req.Phone,
		Role:         req.Role,
		IsActive:     true,
	}

	if err := h.DB.Create(&user).Error; err != nil {
		utils.InternalServerErrorResponse(c, "Failed to create user")
		return
	}

	// Create role-specific profile
	if req.Role == models.RoleProvider {
		provider := models.ServiceProvider{
			UserID:       user.ID,
			BusinessName: req.FirstName + " " + req.LastName,
		}
		h.DB.Create(&provider)
	} else {
		client := models.Client{
			UserID: user.ID,
		}
		h.DB.Create(&client)
	}

	// Generate JWT token
	token := h.generateToken(user)

	utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", gin.H{
		"token": token,
		"user":  user,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	var user models.User
	if err := h.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		utils.UnauthorizedResponse(c, "Invalid credentials")
		return
	}

	if !user.IsActive {
		utils.UnauthorizedResponse(c, "Account is inactive")
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		utils.UnauthorizedResponse(c, "Invalid credentials")
		return
	}

	// Generate JWT token
	token := h.generateToken(user)

	utils.SuccessResponse(c, http.StatusOK, "Login successful", gin.H{
		"token": token,
		"user":  user,
	})
}

func (h *AuthHandler) OAuthLogin(c *gin.Context) {
	url := h.OAuthConfig.AuthCodeURL("state", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *AuthHandler) OAuthCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		utils.BadRequestResponse(c, "Authorization code not provided")
		return
	}

	token, err := h.OAuthConfig.Exchange(c.Request.Context(), code)
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to exchange token")
		return
	}

	// In a real implementation, you would fetch user info from OAuth provider
	// For now, this is a placeholder
	utils.SuccessResponse(c, http.StatusOK, "OAuth login successful", gin.H{
		"access_token": token.AccessToken,
	})
}

func (h *AuthHandler) generateToken(user models.User) string {
	claims := middleware.Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(utils.GetJWTSecret()))
	return tokenString
}

