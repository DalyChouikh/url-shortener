package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/DalyChouikh/url-shortener/models"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type AuthService struct {
	config   *oauth2.Config
	userRepo *models.UserRepository
	urlRepo  *models.URLRepository
}

type GoogleUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

func NewAuthService(clientID, clientSecret, redirectURL string, userRepo *models.UserRepository, urlRepo *models.URLRepository) *AuthService {
	config := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &AuthService{
		config:   config,
		userRepo: userRepo,
		urlRepo:  urlRepo,
	}
}

func (s *AuthService) GetAuthURL() string {
	return s.config.AuthCodeURL("state")
}

func (s *AuthService) HandleCallback(code string) (*models.User, error) {
	token, err := s.config.Exchange(context.TODO(), code)
	if err != nil {
		return nil, fmt.Errorf("code exchange failed: %s", err.Error())
	}

	googleUser, err := s.getUserInfo(token.AccessToken)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		GoogleID:    googleUser.ID,
		Email:       googleUser.Email,
		Name:        googleUser.Name,
		Picture:     googleUser.Picture,
		LastLoginAt: time.Now(),
	}

	if err := s.userRepo.FindOrCreateUser(user); err != nil {
		return nil, err
	}

	// Update last login time
	if err := s.userRepo.UpdateLastLogin(user.ID); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) getUserInfo(accessToken string) (*GoogleUser, error) {
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var googleUser GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		return nil, err
	}

	return &googleUser, nil
}

func (s *AuthService) GetUserByID(userID uint) (*models.User, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user: %w", err)
	}
	return user, nil
}

func (s *AuthService) DeleteUser(userId uint) error {
	return s.userRepo.DeleteUser(userId)
}

func (s *AuthService) GetAllUsers() ([]models.User, error) {
	return s.userRepo.GetAllUsers()
}

func (s *AuthService) UpdateUserRole(userID uint, role models.Role) error {
	return s.userRepo.UpdateUserRole(userID, role)
}

func (s *AuthService) GetPaginatedUsers(page, pageSize int, search, roleFilter string) ([]models.User, int64, error) {
	return s.userRepo.GetPaginatedUsers(page, pageSize, search, roleFilter)
}

// GetUserURLsForAdmin gets URLs created by a specific user (for admin/leader use)
func (s *AuthService) GetUserURLsForAdmin(userID uint, page, pageSize int, search string) ([]map[string]interface{}, int64, error) {
	// Pass to URL repository to get the data
	return s.urlRepo.GetPaginatedUserURLsForAdmin(userID, page, pageSize, search)
}
