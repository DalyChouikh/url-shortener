package services

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"image/png"
	"log"
	"net/url"
	"strings"

	"github.com/DalyChouikh/url-shortener/models"
	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/qr"
)

type URLService struct {
	repo    *models.URLRepository
	baseURL string
}

func NewURLService(repo *models.URLRepository, baseURL string) *URLService {
	return &URLService{repo: repo, baseURL: baseURL}
}

func (s *URLService) CreateShortURL(ctx context.Context, longURL string, userID uint) (*models.URL, string, error) {
	if valid, err := s.isValidURL(longURL); !valid {
		return nil, "", fmt.Errorf("Invalid URL: %w", err)
	}

	shortCode, err := s.generateShortCode()
	if err != nil {
		return nil, "", fmt.Errorf("Failed to generate short code: %w", err)
	}

	url := &models.URL{
		LongURL:   longURL,
		ShortCode: shortCode,
		UserID:    userID,
	}

	if err := s.repo.Save(url); err != nil {
		return nil, "", err
	}

	shortURL := fmt.Sprintf("%s/r/%s", s.baseURL, shortCode)
	qrCode, err := s.generateQRCode(shortURL)
	if err != nil {
		log.Printf("Error generating QR Code: %v", err)
		return url, "", err
	}
	return url, qrCode, nil
}

func (s *URLService) GetLongURL(ctx context.Context, shortCode string) (string, error) {
	url, err := s.repo.GetByShortCode(shortCode)
	if err != nil {
		return "", err
	}

	return url.LongURL, nil
}

func (s *URLService) GetUserURLs(userID uint) ([]models.URL, error) {
	return s.repo.GetUserURLs(userID)
}

func (s *URLService) BaseURL() string {
	return s.baseURL
}

func (s *URLService) isValidURL(longURL string) (bool, error) {
	parsedURL, err := url.ParseRequestURI(longURL)
	if err != nil {
		return false, err
	}
	if parsedURL.Scheme == "" || parsedURL.Host == "" || !strings.HasPrefix(parsedURL.Scheme, "http") {
		return false, errors.New("Invalid URL Scheme or Host")
	}
	return true, nil
}

func (s *URLService) generateShortCode() (string, error) {
	bytes := make([]byte, 6)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("Failed to generate random bytes: %w", err)
	}
	return base64.URLEncoding.EncodeToString(bytes)[:6], nil
}

func (s *URLService) generateQRCode(shortURL string) (string, error) {
	qrCode, err := qr.Encode(shortURL, qr.M, qr.Auto)
	if err != nil {
		return "", fmt.Errorf("Failed to encode QR Code: %w", err)
	}
	qrCode, err = barcode.Scale(qrCode, 150, 150)
	if err != nil {
		return "", fmt.Errorf("Failed to scale QR Code: %w", err)
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, qrCode); err != nil {
		return "", fmt.Errorf("Failed to encode QR Code as PNG Image: %w", err)
	}

	return base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}
