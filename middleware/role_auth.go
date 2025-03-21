package middleware

import (
	"net/http"

	"github.com/DalyChouikh/url-shortener/models"
	"github.com/DalyChouikh/url-shortener/services"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// RoleRequired creates middleware that checks if user has one of the required roles
func RoleRequired(authService *services.AuthService, roles ...models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		userID := session.Get("user_id")

		if userID == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		user, err := authService.GetUserByID(userID.(uint))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
			return
		}

		// Check if user has one of the required roles
		hasRole := false
		for _, role := range roles {
			if user.Role == role {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}

		// Store user in context
		c.Set("user", user)
		c.Next()
	}
}

// AdminOnly middleware allows only SUPER_ADMIN access
func AdminOnly(authService *services.AuthService) gin.HandlerFunc {
	return RoleRequired(authService, models.RoleSuperAdmin)
}

// AdminOrLeadOnly middleware allows SUPER_ADMIN or GDGC_LEAD access
func AdminOrLeadOnly(authService *services.AuthService) gin.HandlerFunc {
	return RoleRequired(authService, models.RoleSuperAdmin, models.RoleGDGCLead)
}

// CoreTeamOrAbove middleware allows core team members and above to access URL shortener
func CoreTeamOrAbove(authService *services.AuthService) gin.HandlerFunc {
	return RoleRequired(authService, models.RoleSuperAdmin, models.RoleGDGCLead, models.RoleCoreTeam)
}
