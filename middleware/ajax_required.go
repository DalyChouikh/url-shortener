package middleware

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func AjaxRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetHeader("X-Requested-With") != "XMLHttpRequest" {
			c.AbortWithStatusJSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "Page not found",
			})
			return
		}
		c.Next()
	}
}
