package routes

import (
	"database/sql"
	"net/http"
	"sync"
	"time"

	"github.com/DalyChouikh/url-shortener/api"
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

func SetupRoutes(db *sql.DB) *gin.Engine {
	urlHandler := api.NewUrlHandler(db)

	router := gin.Default()

	router.Use(rateLimitMiddleware())

	router.GET("/", urlHandler.HandleGetHome)
	router.POST("/api/v1/shorten", urlHandler.HandlePostUrl)
	router.GET("/r/:short_code", urlHandler.HandleGetUrl)

	router.NoRoute(urlHandler.HandleGetHome)

	router.Static("/static", "./assets/templates")
	router.LoadHTMLGlob("assets/templates/*.html")

	return router

}
