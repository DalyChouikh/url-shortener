package handlers

import (
	"net/http"

	"github.com/DalyChouikh/url-shortener/services"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) HandleLogin(c *gin.Context) {
	// Redirect to Google's OAuth 2.0 consent screen
	url := h.authService.GetAuthURL()
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *AuthHandler) HandleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No code provided"})
		return
	}

	user, err := h.authService.HandleCallback(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Authentication failed"})
		return
	}

	session := sessions.Default(c)
	session.Clear()
	session.Set("user_id", user.ID)
	session.Set("user_email", user.Email)
	session.Set("user_name", user.Name)

	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}

	// Add debug logging
	c.Header("X-Debug-Session", "Session saved")
	
	// Redirect to the frontend callback route
	c.Redirect(http.StatusTemporaryRedirect, "/callback")
}

func (h *AuthHandler) HandleLogout(c *gin.Context) {
	session := sessions.Default(c)
	
	session.Clear()
	
	session.Options(sessions.Options{
		Path:     "/",
		MaxAge:   -1,
		Secure:   false,
		HttpOnly: true,
	})
	
	session.Save()
	
	c.SetCookie("mysession", "", -1, "/", "", false, true)
	
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (h *AuthHandler) HandleGetProfile(c *gin.Context) {
	c.Header("Content-Type", "application/json")

	session := sessions.Default(c)
	userID := session.Get("user_id")
	
	// Add debug logging
	if userID == nil {
		c.Header("X-Debug-Auth", "No user ID in session")
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	user, err := h.authService.GetUserByID(userID.(uint))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":        user.ID,
		"name":      user.Name,
		"email":     user.Email,
		"picture":   user.Picture,
		"createdAt": user.CreatedAt,
		"lastLogin": user.LastLoginAt,
	})
}
