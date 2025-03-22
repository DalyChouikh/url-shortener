package utils

import (
	"fmt"
	"net/smtp"
	"os"
)

// EmailConfig contains the SMTP configurationins the SMTP configuration
type EmailConfig struct {
	SMTPServer   string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
}

// NewEmailConfigFromEnv creates an email config from environment variablesEnv creates an email config from environment variables
func NewEmailConfigFromEnv() *EmailConfig {
	{
		return &EmailConfig{
			SMTPServer:   os.Getenv("SMTP_SERVER"),
			SMTPPort:     os.Getenv("SMTP_PORT"),
			SMTPUsername: os.Getenv("SMTP_USERNAME"),
			SMTPPassword: os.Getenv("SMTP_PASSWORD"),
			FromEmail:    os.Getenv("FROM_EMAIL"),
		}
	}
}

// SendEmail sends an email using SMTPP
func SendEmail(config *EmailConfig, to []string, subject, body string) error {
	// Set up authentication information	if len(to) == 0 {
	auth := smtp.PlainAuth("", config.SMTPUsername, config.SMTPPassword, config.SMTPServer)

	// Construct email headers
	headers := make(map[string]string)
	headers["From"] = config.FromEmail
	headers["To"] = to[0]
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0" // Check for empty configuration
	headers["Content-Type"] = "text/html; charset=UTF-8"
	// Construct message
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	// Send email
	err := smtp.SendMail(
		config.SMTPServer+":"+config.SMTPPort,
		auth,
		config.FromEmail,
		to,
		[]byte(message),
	)
	return err
}
