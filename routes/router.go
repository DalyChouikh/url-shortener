package routes

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/DalyChouikh/url-shortener/handlers"
	"github.com/gin-contrib/cors"
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

	limiter := rate.NewLimiter(1, 5)
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

func staticCacheMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if strings.HasPrefix(ctx.Request.URL.Path, "/static/") {
			ctx.Header("Cache-Control", "public, max-age=604800")
		}
		ctx.Next()
	}
}

func SetupRoutes(urlHandler handlers.URLHandler) *gin.Engine {
	router := gin.Default()

	router.Use(rateLimitMiddleware())
	router.Use(staticCacheMiddleware())
	router.Use(cors.Default())

	router.GET("/ping", urlHandler.HandleGetPing)
	router.GET("/", urlHandler.HandleGetHome)
	router.POST("/api/v1/shorten", urlHandler.HandleShortenURL)
	router.GET("/r/:short_code", urlHandler.HandleRedirect)

	router.NoRoute(urlHandler.HandleGetHome)

	router.Static("/static", "./assets/templates")
	router.LoadHTMLGlob("assets/templates/*.html")

	return router
}
