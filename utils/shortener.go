package utils

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"log"
	"net/url"
)

func GenerateShortCode() string {
	bytes := make([]byte, 6)
	if _, err := rand.Read(bytes); err != nil {
		log.Fatal(err)
	}
	return base64.URLEncoding.EncodeToString(bytes)
}

func IsValidUrl(u string) (bool, error) {
	parsedUrl, err := url.ParseRequestURI(u)
	if err != nil {
		return false, err
	}

	if parsedUrl.Scheme == "" || parsedUrl.Host == "" {
		return false, errors.New("Invalid URL scheme or host")
	}

	return true, nil
}