package middleware

import (
	"strings"

	"pluralink/backend/models"
	"pluralink/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type Claims struct {
	UserID uint           `json:"user_id"`
	Email  string         `json:"email"`
	Role   models.UserRole `json:"role"`
	jwt.RegisteredClaims
}

func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.UnauthorizedResponse(c, "Authorization header required")
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.UnauthorizedResponse(c, "Invalid authorization header format")
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(utils.GetJWTSecret()), nil
		})

		if err != nil || !token.Valid {
			utils.UnauthorizedResponse(c, "Invalid or expired token")
			c.Abort()
			return
		}

		// Verify user still exists and is active
		var user models.User
		if err := db.First(&user, claims.UserID).Error; err != nil {
			utils.UnauthorizedResponse(c, "User not found")
			c.Abort()
			return
		}

		if !user.IsActive {
			utils.UnauthorizedResponse(c, "User account is inactive")
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Set("user", user)

		c.Next()
	}
}

func RequireRole(role models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			utils.UnauthorizedResponse(c, "User role not found")
			c.Abort()
			return
		}

		if userRole.(models.UserRole) != role {
			utils.ErrorResponse(c, 403, "Forbidden: insufficient permissions")
			c.Abort()
			return
		}

		c.Next()
	}
}

