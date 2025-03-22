package routes

import (
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"io/fs"
	"os"

	"github.com/DalyChouikh/url-shortener/config"
	"github.com/DalyChouikh/url-shortener/frontend"
	"github.com/DalyChouikh/url-shortener/handlers"
	"github.com/DalyChouikh/url-shortener/middleware"
	"github.com/DalyChouikh/url-shortener/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

var limiters = make(map[string]*rate.Limiter)
var mu sync.Mutex

func getLimiter(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	if limiter, ok := limiters[ip]; ok {
		return limiter
	}

	limiter := rate.NewLimiter(rate.Every(2*time.Second), 30)
	limiters[ip] = limiter

	go func() {
		time.Sleep(time.Minute * 5)
		mu.Lock()
		delete(limiters, ip)
		mu.Unlock()
	}()

	return limiter
}

func rateLimitMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		path := ctx.Request.URL.Path
		referer := ctx.Request.Referer()

		// Skip rate limiting for: static assets, auth routes, redirects, and Google avatar images
		if strings.HasPrefix(path, "/auth/") ||
			path == "/ping" ||
			strings.HasPrefix(path, "/r/") ||
			strings.Contains(referer, "googleusercontent.com") ||
			strings.Contains(path, "googleusercontent.com") {
			ctx.Next()
			return
		}

		limiter := getLimiter(ctx.ClientIP())
		if !limiter.Allow() {
			ctx.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests",
			})
			return
		}
		ctx.Next()
	}
}

func SetupRoutes(urlHandler handlers.URLHandler, authHandler handlers.AuthHandler, cfg *config.Config) (*gin.Engine, error) {
	router := gin.Default()

	store := cookie.NewStore([]byte(cfg.Session.Secret))
	store.Options(sessions.Options{
		Path:     "/",
		MaxAge:   3600,
		HttpOnly: true,
		Secure:   cfg.UseHTTPS,
		SameSite: http.SameSiteLaxMode,
	})

	router.Use(sessions.Sessions("mysession", store))

	router.Use(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/auth/") {
			c.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
			c.Header("Pragma", "no-cache")
			c.Header("Expires", "0")
		}
		c.Next()
	})

	router.Use(func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Next()
	})

	subFS, err := fs.Sub(frontend.FS(), "dist")
	if err != nil {
		return nil, err
	}

	spaHandler, err := handlers.NewSPAHandler(subFS)
	if err != nil {
		return nil, err
	}

	// Create email config from environment
	emailConfig := utils.NewEmailConfigFromEnv()

	// Validate and log email configuration
	if emailConfig.SMTPServer == "" || emailConfig.SMTPPort == "" ||
		emailConfig.SMTPUsername == "" || emailConfig.SMTPPassword == "" ||
		emailConfig.FromEmail == "" {
		log.Println("Warning: Email configuration is incomplete. Contact form will not work properly.")
	} else {
		log.Printf("Email configuration loaded successfully: Server: %s, Port: %s",
			emailConfig.SMTPServer, emailConfig.SMTPPort)
	}

	// Get recipient email(s)
	recipientEmail := os.Getenv("CONTACT_EMAIL")
	if recipientEmail == "" {
		log.Println("Warning: CONTACT_EMAIL not set. Contact form will not work properly.")
		recipientEmail = emailConfig.FromEmail // Fallback to from email
	}

	// Add recipient emails
	recipientEmails := []string{recipientEmail}

	// Initialize contact handler
	contactHandler := handlers.NewContactHandler(emailConfig, recipientEmails)

	// Public API routes that don't require authentication
	publicApi := router.Group("/api/v1/public")
	publicApi.Use(middleware.AjaxRequired(), rateLimitMiddleware())
	{
		publicApi.POST("/contact", contactHandler.HandleContactSubmit)
	}

	// API routes
	api := router.Group("/api/v1")
	api.Use(middleware.AuthRequired())
	api.Use(middleware.AjaxRequired())
	api.Use(rateLimitMiddleware())
	{
		// URL shortener routes - restricted to core team members and above
		urlGroup := api.Group("")
		urlGroup.Use(middleware.CoreTeamOrAbove(authHandler.AuthService))
		{
			urlGroup.POST("/shorten", urlHandler.HandleShortenURL)
			urlGroup.GET("/urls", urlHandler.HandleGetUserURLs)
			urlGroup.DELETE("/urls/:id", urlHandler.HandleDeleteURL)
			urlGroup.PATCH("/urls/:id", urlHandler.HandleUpdateURL)
			urlGroup.GET("/urls/:id", urlHandler.HandleGetURLById)
		}

		// User management routes - admin only
		adminGroup := api.Group("/admin")
		adminGroup.Use(middleware.AdminOnly(authHandler.AuthService))
		{
			adminGroup.GET("/users", authHandler.HandleGetAllUsers)
			adminGroup.PATCH("/users/:id/role", authHandler.HandleUpdateUserRole)
			adminGroup.GET("/users/:id", authHandler.HandleGetUserDetail)
			adminGroup.GET("/users/:id/urls", authHandler.HandleGetUserURLs)
		}

		// User management routes - admin or lead only
		leaderGroup := api.Group("/leader")
		leaderGroup.Use(middleware.AdminOrLeadOnly(authHandler.AuthService))
		{
			// Leaders can manage core team members but not other leaders
			leaderGroup.GET("/users", authHandler.HandleGetLeaderUsers)
			leaderGroup.PATCH("/users/:id/role", authHandler.HandleUpdateLeaderRole)
			leaderGroup.GET("/users/:id", authHandler.HandleGetUserDetail)
			leaderGroup.GET("/users/:id/urls", authHandler.HandleGetUserURLs)
		}

		// User account management - any authenticated user
		api.DELETE("/users/:id", authHandler.HandleDeleteUser)
	}

	// Auth routes
	auth := router.Group("/auth")
	{
		auth.GET("/login", authHandler.HandleLogin)
		auth.GET("/callback", func(c *gin.Context) {
			c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
			authHandler.HandleCallback(c)
		})
		auth.POST("/logout", middleware.AjaxRequired(), authHandler.HandleLogout)
		auth.GET("/profile", middleware.AuthRequired(), middleware.AjaxRequired(), func(c *gin.Context) {
			c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
			authHandler.HandleGetProfile(c)
		})
	}

	// Redirect route
	router.GET("/r/:short_code", urlHandler.HandleRedirect)

	// Health check
	router.GET("/ping", urlHandler.HandleGetPing)

	// Serve SPA for all other routes
	router.NoRoute(spaHandler.ServeFiles)

	return router, nil
}
