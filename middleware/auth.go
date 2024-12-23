package middleware

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		userID := session.Get("user_id")

		// Add debug headers
		c.Header("X-Debug-Session-Present", fmt.Sprintf("%v", userID != nil))

		if userID == nil {
			c.Header("X-Debug-Auth", "No user ID in session")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}
