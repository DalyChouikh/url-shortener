package routes

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/DalyChouikh/url-shortener/config"
	"github.com/DalyChouikh/url-shortener/frontend"
	"github.com/DalyChouikh/url-shortener/handlers"
	"github.com/DalyChouikh/url-shortener/middleware"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
	"io/fs"
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
	router.Use(sessions.Sessions("mysession", store))

	subFS, err := fs.Sub(frontend.FS(), "dist")
	if err != nil {
		return nil, err
	}

	spaHandler, err := handlers.NewSPAHandler(subFS)
	if err != nil {
		return nil, err
	}

	// API routes
	api := router.Group("/api/v1")
	api.Use(middleware.AuthRequired())
	api.Use(rateLimitMiddleware())
	{
		api.POST("/shorten", urlHandler.HandleShortenURL)
		api.GET("/urls", urlHandler.HandleGetUserURLs)
	}

	// Auth routes
	auth := router.Group("/auth")
	{
		auth.GET("/login", authHandler.HandleLogin)
		auth.GET("/callback", authHandler.HandleCallback)
		auth.GET("/logout", authHandler.HandleLogout)
		auth.GET("/profile", middleware.AuthRequired(), authHandler.HandleGetProfile)
	}

	// Redirect route
	router.GET("/r/:short_code", urlHandler.HandleRedirect)

	// Health check
	router.GET("/ping", urlHandler.HandleGetPing)

	// Serve SPA for all other routes
	router.NoRoute(spaHandler.ServeFiles)

	return router, nil
}
