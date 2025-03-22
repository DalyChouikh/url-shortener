package services

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"log"
	"net/url"
	"strings"

	"github.com/DalyChouikh/url-shortener/models"
	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/qr"
)

type QRCodeOptions struct {
	Format      string
	Color       string
	Transparent bool
	Size        int
}

type URLService struct {
	repo    *models.URLRepository
	baseURL string
}

func NewURLService(repo *models.URLRepository, baseURL string) *URLService {
	return &URLService{repo: repo, baseURL: baseURL}
}

func (s *URLService) CreateShortURL(ctx context.Context, longURL string, userID uint, options *QRCodeOptions) (*models.URL, string, error) {
	if valid, err := s.isValidURL(longURL); !valid {
		return nil, "", fmt.Errorf("invalid URL: %w", err)
	}

	if options == nil {
		options = &QRCodeOptions{
			Format: "png",
			Color:  "#000000",
			Size:   150,
		}
	}

	existingURL, err := s.repo.FindExistingURL(userID, longURL, options.Format, options.Color, options.Transparent, options.Size)
	if err == nil {
		return existingURL, existingURL.QRCode, nil
	}

	shortCode, err := s.generateShortCode()
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate short code: %w", err)
	}

	shortURL := fmt.Sprintf("%s/r/%s", s.baseURL, shortCode)
	qrCode, err := s.generateQRCode(shortURL, options)
	if err != nil {
		log.Printf("Error generating QR Code: %v", err)
		return nil, "", err
	}

	url := &models.URL{
		LongURL:     longURL,
		ShortCode:   shortCode,
		UserID:      userID,
		QRCode:      qrCode,
		Format:      options.Format,
		Color:       options.Color,
		Transparent: options.Transparent,
		Size:        options.Size,
	}

	if err := s.repo.Save(url); err != nil {
		return nil, "", err
	}

	return url, qrCode, nil
}

func (s *URLService) GetLongURL(shortCode string) (string, error) {
	url, err := s.repo.GetByShortCode(shortCode)
	if err != nil {
		return "", err
	}

	return url.LongURL, nil
}

func (s *URLService) GetUserURLs(userID uint) ([]models.URL, error) {
	return s.repo.GetUserURLs(userID)
}

func (s *URLService) GetPaginatedUserURLs(userID uint, page, pageSize int, search string) ([]models.URL, int64, error) {
	return s.repo.GetPaginatedUserURLs(userID, page, pageSize, search)
}

func (s *URLService) UpdateURL(urlID int, userId uint, newURL string) error {
	if valid, err := s.isValidURL(newURL); !valid {
		return fmt.Errorf("invalid URL: %w", err)
	}

	return s.repo.UpdateURL(urlID, userId, newURL)
}

func (s *URLService) DeleteURL(urlID int, userID uint) error {
	return s.repo.DeleteURL(urlID, userID)
}

func (s *URLService) GetURLById(urlId int, userId uint) (*models.URL, error) {
	return s.repo.GetByID(urlId, userId)
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
		return false, errors.New("invalid URL Scheme or Host")
	}
	return true, nil
}

func (s *URLService) generateShortCode() (string, error) {
	bytes := make([]byte, 6)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %w", err)
	}
	return base64.URLEncoding.EncodeToString(bytes)[:6], nil
}

func (s *URLService) generateQRCode(shortURL string, options *QRCodeOptions) (string, error) {
	// Generate QR code
	qrCode, err := qr.Encode(shortURL, qr.M, qr.Auto)
	if err != nil {
		return "", fmt.Errorf("failed to encode QR Code: %w", err)
	}

	size := 150
	if options.Size > 0 {
		size = options.Size
	}

	qrCode, err = barcode.Scale(qrCode, size, size)
	if err != nil {
		return "", fmt.Errorf("failed to scale QR Code: %w", err)
	}

	hexColor := options.Color
	if hexColor == "" {
		hexColor = "#000000"
	}

	if options.Format == "svg" {
		return s.generateSVGQRCode(qrCode, hexColor, options.Transparent)
	}

	return s.generatePNGQRCode(qrCode, hexColor, options.Transparent)
}

func (s *URLService) generatePNGQRCode(qrCode barcode.Barcode, hexColor string, transparent bool) (string, error) {
	// Parse the hex color
	r, g, b, err := hexColorToRGBA(hexColor)
	if err != nil {
		// Fall back to black if color parsing fails
		r, g, b = 0, 0, 0
	}

	// Create a colored version of the QR code
	bounds := qrCode.Bounds()
	qrImage := image.NewRGBA(bounds)
	qrColor := color.RGBA{R: r, G: g, B: b, A: 255}

	// Set background color based on transparency preference
	if transparent {
		for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
			for x := bounds.Min.X; x < bounds.Max.X; x++ {
				qrImage.SetRGBA(x, y, color.RGBA{0, 0, 0, 0})
			}
		}
	} else {
		// Fill with white background
		draw.Draw(qrImage, bounds, image.White, image.Point{}, draw.Over)
	}

	// Draw QR code with specified color
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			// If the pixel is black in the original QR code, color it with the specified color
			pixelColor := qrCode.At(x, y)
			r, g, b, _ := pixelColor.RGBA()
			if r == 0 && g == 0 && b == 0 { // If pixel is black
				qrImage.Set(x, y, qrColor)
			}
		}
	}

	var buf bytes.Buffer
	if err := png.Encode(&buf, qrImage); err != nil {
		return "", fmt.Errorf("failed to encode QR Code as PNG Image: %w", err)
	}

	return base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}

func (s *URLService) generateSVGQRCode(qrCode barcode.Barcode, hexColor string, transparent bool) (string, error) {
	// Get QR code dimensions
	bounds := qrCode.Bounds()
	width := bounds.Max.X
	height := bounds.Max.Y

	var svgBuilder strings.Builder
	svgBuilder.WriteString(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>`)
	svgBuilder.WriteString(fmt.Sprintf(`<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">`, width, height, width, height))

	// Add white background if not transparent
	if !transparent {
		svgBuilder.WriteString(fmt.Sprintf(`<rect width="%d" height="%d" fill="white"/>`, width, height))
	}

	// Gather all "on" pixels for the path
	var pixels []string
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			// Get the color of the pixel
			r, g, b, _ := qrCode.At(x, y).RGBA()

			// If pixel is dark (part of QR code)
			if r == 0 && g == 0 && b == 0 {
				pixels = append(pixels, fmt.Sprintf("M%d,%d h1v1h-1z", x, y))
			}
		}
	}

	// Add the path with all pixels
	if len(pixels) > 0 {
		svgBuilder.WriteString(fmt.Sprintf(`<path d="%s" fill="%s"/>`, strings.Join(pixels, " "), hexColor))
	}

	svgBuilder.WriteString(`</svg>`)

	return base64.StdEncoding.EncodeToString([]byte(svgBuilder.String())), nil
}

// Helper function to convert hex color string to RGB values
func hexColorToRGBA(hexColor string) (r, g, b uint8, err error) {
	hexColor = strings.TrimPrefix(hexColor, "#")

	if len(hexColor) != 6 {
		return 0, 0, 0, fmt.Errorf("invalid hex color format")
	}

	var rgb uint32
	_, err = fmt.Sscanf(hexColor, "%06x", &rgb)
	if err != nil {
		return 0, 0, 0, err
	}

	return uint8(rgb >> 16), uint8((rgb >> 8) & 0xFF), uint8(rgb & 0xFF), nil
}
