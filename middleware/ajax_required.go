package middleware

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func AjaxRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        if c.GetHeader("X-Requested-With") != "XMLHttpRequest" {
            c.AbortWithStatus(http.StatusNotFound)
            return
        }
        c.Next()
    }
}
