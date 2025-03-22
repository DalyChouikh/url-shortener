package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/DalyChouikh/url-shortener/utils"
	"github.com/gin-gonic/gin"
)

type ContactHandler struct {
	emailConfig *utils.EmailConfig
	toEmails    []string
}

type ContactRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Message string `json:"message" binding:"required"`
}

func NewContactHandler(emailConfig *utils.EmailConfig, toEmails []string) *ContactHandler {
	return &ContactHandler{
		emailConfig: emailConfig,
		toEmails:    toEmails,
	}
}

func (h *ContactHandler) HandleContactSubmit(c *gin.Context) {
	var req ContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Validate that we have required email configuration
	if h.emailConfig.SMTPServer == "" || h.emailConfig.SMTPPort == "" ||
		h.emailConfig.SMTPUsername == "" || h.emailConfig.SMTPPassword == "" ||
		h.emailConfig.FromEmail == "" || len(h.toEmails) == 0 {
		log.Printf("Error: Missing email configuration")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}

	// Create email body with enhanced HTML formatting
	currentTime := time.Now().Format("Monday, January 2, 2006 at 15:04 MST")
	emailBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Contact Form Submission</title>
			<style>
				body {
					font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
					line-height: 1.6;
					color: #333;
					max-width: 600px;
					margin: 0 auto;
					padding: 20px;
				}
				.header {
					background: linear-gradient(90deg, #4285F4, #4568DC);
					color: white;
					padding: 20px;
					text-align: center;
					border-radius: 5px 5px 0 0;
				}
				.content {
					padding: 20px;
					background-color: #ffffff;
					border: 1px solid #e1e1e1;
					border-top: none;
					border-radius: 0 0 5px 5px;
				}
				.footer {
					margin-top: 20px;
					font-size: 12px;
					text-align: center;
					color: #666;
				}
				.info-block {
					margin-bottom: 15px;
				}
				.info-label {
					font-weight: bold;
					color: #4285F4;
				}
				.message-block {
					background-color: #f9f9f9;
					padding: 15px;
					border-left: 4px solid #4285F4;
					margin: 20px 0;
					border-radius: 0 5px 5px 0;
				}
				.logo {
					max-width: 150px;
					height: auto;
				}
				.timestamp {
					font-size: 12px;
					color: #666;
					margin-top: 20px;
					border-top: 1px solid #eee;
					padding-top: 10px;
				}
			</style>
		</head>
		<body>
			<div class="header">
				<h1>Contact Form Submission</h1>
				<p>Google Developer Groups on Campus ISSATSo</p>
			</div>
			<div class="content">
				<p>A new message has been submitted through the contact form.</p>
				
				<div class="info-block">
					<div class="info-label">From:</div>
					<div>%s</div>
				</div>
				
				<div class="info-block">
					<div class="info-label">Email:</div>
					<div><a href="mailto:%s">%s</a></div>
				</div>
				
				<div class="info-block">
					<div class="info-label">Message:</div>
					<div class="message-block">%s</div>
				</div>
				
				<div class="timestamp">
					This message was submitted on %s
				</div>
			</div>
			<div class="footer">
				<p>This is an automated email from the GDG ISSATSo platform.</p>
				<p>&copy; %d Google Developer Groups on Campus ISSATSo. All rights reserved.</p>
			</div>
		</body>
		</html>
	`, req.Name, req.Email, req.Email, req.Message, currentTime, time.Now().Year())

	// Send email
	err := utils.SendEmail(
		h.emailConfig,
		h.toEmails,
		"Contact Form Submission from "+req.Name,
		emailBody,
	)

	if err != nil {
		log.Printf("Error sending email: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contact form submitted successfully"})
}
