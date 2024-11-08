package utils

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"image/png"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/qr"
)

func GenerateShortCode() string {
	bytes := make([]byte, 6)
	if _, err := rand.Read(bytes); err != nil {
		log.Fatal(err)
	}
	return base64.URLEncoding.EncodeToString(bytes)
}

func GenerateQRCodeImage(shortUrl string) (string, error) {

	qrCode, err := qr.Encode(shortUrl, qr.M, qr.Auto)
	if err != nil {
		return "", err
	}

	qrCode, err = barcode.Scale(qrCode, 150, 150) // Adjust size as needed
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := png.Encode(&buf, qrCode); err != nil {
		return "", err
	}

	base64Image := base64.StdEncoding.EncodeToString(buf.Bytes())
	return base64Image, nil
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

func GetBaseURL() string {
	if os.Getenv("ENV") == "development" {
		return "http://localhost:8080"
	} else {
		return "https://gdgc-issatso.tech"
	}
}

func KeepAlive() {
	for {
		time.Sleep(time.Minute * 5)
		if _, err := http.Get(GetBaseURL() + "/ping"); err != nil {
			log.Fatal(err)
		}
	}
}
