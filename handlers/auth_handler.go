package handlers

import (
	"net/http"
	"strconv"

	"github.com/DalyChouikh/url-shortener/models"
	"github.com/DalyChouikh/url-shortener/services"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	AuthService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		AuthService: authService,
	}
}

func (h *AuthHandler) HandleLogin(c *gin.Context) {
	// Redirect to Google's OAuth 2.0 consent screen
	url := h.AuthService.GetAuthURL()
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *AuthHandler) HandleCallback(c *gin.Context) {
	// Check for error parameter first
	if errorMsg := c.Query("error"); errorMsg != "" {
		c.Redirect(http.StatusTemporaryRedirect, "/error?error=authentication_failed")
		return
	}

	code := c.Query("code")
	if code == "" {
		c.Redirect(http.StatusTemporaryRedirect, "/error?error=authentication_failed")
		return
	}

	user, err := h.AuthService.HandleCallback(code)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "/error?error=authentication_failed")
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

	user, err := h.AuthService.GetUserByID(userID.(uint))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          user.ID,
		"name":        user.Name,
		"email":       user.Email,
		"picture":     user.Picture,
		"createdAt":   user.CreatedAt,
		"lastLoginAt": user.LastLoginAt,
		"role":        user.Role,
	})
}

// HandleGetAllUsers handles fetching users with pagination
func (h *AuthHandler) HandleGetAllUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	search := c.Query("search")
	roleFilter := c.Query("role")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	users, total, err := h.AuthService.GetPaginatedUsers(page, pageSize, search, roleFilter)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch users",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"pagination": gin.H{
			"currentPage": page,
			"pageSize":    pageSize,
			"totalItems":  total,
			"totalPages":  (total + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// HandleGetLeaderUsers handles fetching users for leaders (excluding super admins) with pagination
func (h *AuthHandler) HandleGetLeaderUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	search := c.Query("search")
	roleFilter := c.Query("role")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	users, total, err := h.AuthService.GetPaginatedUsers(page, pageSize, search, roleFilter)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch users",
		})
		return
	}

	// Filter out SUPER_ADMIN users to ensure leaders can't see them
	filteredUsers := []models.User{}
	for _, user := range users {
		if user.Role != models.RoleSuperAdmin {
			filteredUsers = append(filteredUsers, user)
		}
	}

	// We need to adjust the total if we filtered out any users
	filteredTotal := total
	if len(filteredUsers) < len(users) {
		// This is an approximation since we don't know the exact count without a separate query
		filteredTotal = total - int64((len(users) - len(filteredUsers)))
		if filteredTotal < 0 {
			filteredTotal = 0
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"users": filteredUsers,
		"pagination": gin.H{
			"currentPage": page,
			"pageSize":    pageSize,
			"totalItems":  filteredTotal,
			"totalPages":  (filteredTotal + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// Add handler for updating user role (admin only)
func (h *AuthHandler) HandleUpdateUserRole(c *gin.Context) {
	var req struct {
		Role string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "invalid user ID",
		})
		return
	}

	// Convert role string to Role type
	role := models.Role(req.Role)

	// Validate role
	validRoles := []models.Role{
		models.RoleSuperAdmin,
		models.RoleGDGCLead,
		models.RoleCoreTeam,
		models.RoleCommunity,
	}

	isValidRole := false
	for _, validRole := range validRoles {
		if role == validRole {
			isValidRole = true
			break
		}
	}

	if !isValidRole {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "invalid role",
		})
		return
	}

	if err := h.AuthService.UpdateUserRole(uint(userID), role); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update user role",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User role updated successfully",
	})
}

func (h *AuthHandler) HandleDeleteUser(c *gin.Context) {
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
	userIDParam := c.Param("id")

	if userIDParam == "" {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "missing user ID",
		})
		return
	}

	userIDParamInt, err := strconv.Atoi(userIDParam)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "invalid user ID",
		})
		return
	}

	if userID.(uint) != uint(userIDParamInt) {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error": "forbidden",
		})
		return
	}

	err = h.AuthService.DeleteUser(userID.(uint))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"error": "failed to delete user",
		})
		return
	}

	session.Clear()
	session.Options(sessions.Options{
		Path:     "/",
		MaxAge:   -1,
		Secure:   false,
		HttpOnly: true,
	})
	session.Save()

	c.SetCookie("mysession", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})

}

// HandleUpdateLeaderRole handles role updates from leaders with restricted permissions
func (h *AuthHandler) HandleUpdateLeaderRole(c *gin.Context) {
	var req struct {
		Role string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "invalid user ID",
		})
		return
	}

	// Get the target user
	targetUser, err := h.AuthService.GetUserByID(uint(userID))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"error": "failed to find user",
		})
		return
	}

	// Get the current user
	session := sessions.Default(c)
	currentUserID := session.Get("user_id")
	if currentUserID == nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	// Prevent leaders from modifying super admin or other leader roles
	if targetUser.Role == models.RoleSuperAdmin || targetUser.Role == models.RoleGDGCLead {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error": "cannot modify leader or admin roles",
		})
		return
	}

	// Convert role string to Role type
	role := models.Role(req.Role)

	// Leaders can only assign CORE_TEAM or COMMUNITY roles
	validRoles := []models.Role{
		models.RoleCoreTeam,
		models.RoleCommunity,
	}

	isValidRole := false
	for _, validRole := range validRoles {
		if role == validRole {
			isValidRole = true
			break
		}
	}

	if !isValidRole {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "invalid role for leader to assign",
		})
		return
	}

	if err := h.AuthService.UpdateUserRole(uint(userID), role); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update user role",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User role updated successfully",
	})
}

// HandleGetUserDetail handles fetching a single user's details by ID
func (h *AuthHandler) HandleGetUserDetail(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "invalid user ID",
		})
		return
	}

	user, err := h.AuthService.GetUserByID(uint(userID))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{
			"error": "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, user)
}

// HandleGetUserURLs handles fetching URLs for a specific user (admin/leader only)
func (h *AuthHandler) HandleGetUserURLs(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "invalid user ID",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	urls, total, err := h.AuthService.GetUserURLsForAdmin(uint(userID), page, pageSize, search)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch user URLs",
		})
		return
	}

	// Ensure urls is never null
	if urls == nil {
		urls = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, gin.H{
		"urls": urls,
		"pagination": gin.H{
			"currentPage": page,
			"pageSize":    pageSize,
			"totalItems":  total,
			"totalPages":  (total + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}
