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
		c.Redirect(http.StatusTemporaryRedirect, "/")
		return
	}

	user, err := h.authService.HandleCallback(code)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/")
		return
	}

	session := sessions.Default(c)
	session.Clear() // Clear any existing session data
	session.Set("user_id", user.ID)
	session.Set("user_email", user.Email)
	session.Set("user_name", user.Name)

	if err := session.Save(); err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/")
		return
	}

	c.Redirect(http.StatusTemporaryRedirect, "/profile")
}

func (h *AuthHandler) HandleLogout(c *gin.Context) {
	session := sessions.Default(c)
	session.Clear()
	session.Save()
	c.Redirect(http.StatusTemporaryRedirect, "/")
}

func (h *AuthHandler) HandleGetProfile(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.Redirect(http.StatusTemporaryRedirect, "/")
		return
	}

	user, err := h.authService.GetUserByID(userID.(uint))
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/")
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
