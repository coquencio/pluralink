package routes

import (
	"pluralink/backend/database"
	"pluralink/backend/handlers"
	"pluralink/backend/middleware"
	"pluralink/backend/models"

	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	// Middleware
	r.Use(middleware.CORSMiddleware())

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(database.DB)
	userHandler := handlers.NewUserHandler(database.DB)
	providerHandler := handlers.NewProviderHandler(database.DB)
	clientHandler := handlers.NewClientHandler(database.DB)
	bookingHandler := handlers.NewBookingHandler(database.DB)
	availabilityHandler := handlers.NewAvailabilityHandler(database.DB)
	reviewHandler := handlers.NewReviewHandler(database.DB)
	searchHandler := handlers.NewSearchHandler(database.DB)

	// Public routes
	api := r.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/oauth", authHandler.OAuthLogin)
			auth.GET("/callback", authHandler.OAuthCallback)
		}

		// Search routes (public)
		search := api.Group("/search")
		{
			search.GET("/providers", searchHandler.SearchProviders)
			search.GET("/categories", searchHandler.GetCategories)
		}

		// Provider public routes
		providers := api.Group("/providers")
		{
			providers.GET("", providerHandler.GetProviders)
			providers.GET("/:id", providerHandler.GetProvider)
			providers.GET("/:id/availability", availabilityHandler.GetAvailabilities)
			providers.GET("/:id/reviews", providerHandler.GetProviderReviews)
		}
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(database.DB))
	{
		// User routes
		users := protected.Group("/users")
		{
			users.GET("/profile", userHandler.GetProfile)
			users.PUT("/profile", userHandler.UpdateProfile)
		}

		// Provider routes
		providers := protected.Group("/providers")
		{
			providers.POST("", providerHandler.CreateProvider)
			providers.PUT("", providerHandler.UpdateProvider)
		}

		// Client routes
		clients := protected.Group("/clients")
		{
			clients.POST("", clientHandler.CreateClient)
			clients.PUT("", clientHandler.UpdateClient)
		}

		// Availability routes (provider only)
		availabilities := protected.Group("/availabilities")
		availabilities.Use(middleware.RequireRole(models.RoleProvider))
		{
			availabilities.GET("", availabilityHandler.GetMyAvailabilities)
			availabilities.POST("", availabilityHandler.CreateAvailability)
			availabilities.PUT("/:id", availabilityHandler.UpdateAvailability)
			availabilities.DELETE("/:id", availabilityHandler.DeleteAvailability)
		}

		// Booking routes
		bookings := protected.Group("/bookings")
		{
			bookings.GET("", bookingHandler.GetBookings)
			bookings.GET("/:id", bookingHandler.GetBooking)
			bookings.POST("", bookingHandler.CreateBooking)
			bookings.PUT("/:id/reschedule", bookingHandler.RescheduleBooking)
			bookings.DELETE("/:id", bookingHandler.CancelBooking)
		}

		// Review routes
		reviews := protected.Group("/reviews")
		{
			reviews.POST("", reviewHandler.CreateReview)
			reviews.GET("/provider/:id", reviewHandler.GetProviderReviews)
			reviews.GET("/client/:id", reviewHandler.GetClientReviews)
		}
	}

	return r
}

