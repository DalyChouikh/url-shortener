package models

import (
	"gorm.io/gorm"
)

type URL struct {
	gorm.Model
	LongURL     string `gorm:"not null"`
	ShortCode   string `gorm:"uniqueIndex;not null"`
	Clicks      int64  `gorm:"default:0"`
	UserID      uint   `gorm:"not null;constraint:OnDelete:CASCADE"`
	User        User   `gorm:"foreignKey:UserID"`
	QRCode      string `gorm:"type:text"`
	Format      string `gorm:"not null;default:png"`
	Color       string `gorm:"not null;default:#000000"`
	Transparent bool   `gorm:"not null;default:false"`
	Size        int    `gorm:"not null;default:150"`
}

func (URL) TableName() string {
	return "url"
}

type URLRepository struct {
	db *gorm.DB
}

func NewURLRepository(db *gorm.DB) *URLRepository {
	return &URLRepository{db: db}
}

func (r *URLRepository) Save(url *URL) error {
	return r.db.Create(url).Error
}

func (r *URLRepository) GetByShortCode(shortCode string) (*URL, error) {
	var url URL
	err := r.db.Where("short_code = ?", shortCode).First(&url).Error
	if err != nil {
		return nil, err
	}
	r.db.Model(&url).UpdateColumn("clicks", gorm.Expr("clicks + ?", 1))
	return &url, nil
}

func (r *URLRepository) GetUserURLs(userID uint) ([]URL, error) {
	var urls []URL
	err := r.db.Where("user_id = ?", userID).Find(&urls).Error
	return urls, err
}

func (r *URLRepository) DeleteURL(urlID int, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", urlID, userID).Delete(&URL{}).Error
}

func (r *URLRepository) UpdateURL(urlID int, userID uint, newURL string) error {
	return r.db.Model(&URL{}).Where("id = ? AND user_id = ?", urlID, userID).Update("long_url", newURL).Error
}

func (r *URLRepository) GetByID(urlID int, userId uint) (*URL, error) {
	var url URL
	err := r.db.Where("id = ? AND user_id = ?", urlID, userId).First(&url).Error
	return &url, err
}

func (r *URLRepository) FindExistingURL(userID uint, longURL string, format string, color string, transparent bool, size int) (*URL, error) {
	var url URL
	err := r.db.Where("user_id = ? AND long_url = ? AND format = ? AND color = ? AND transparent = ? AND size = ?",
		userID, longURL, format, color, transparent, size).First(&url).Error
	return &url, err
}

func (r *URLRepository) GetPaginatedUserURLs(userID uint, page, pageSize int) ([]URL, int64, error) {
	var urls []URL
	var total int64

	offset := (page - 1) * pageSize

	// Get total count first
	if err := r.db.Model(&URL{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated URLs
	if err := r.db.Where("user_id = ?", userID).Offset(offset).Limit(pageSize).Find(&urls).Error; err != nil {
		return nil, 0, err
	}

	return urls, total, nil
}

// GetPaginatedUserURLsForAdmin fetches URLs for a specific user (for admin/leader use)
func (r *URLRepository) GetPaginatedUserURLsForAdmin(userID uint, page, pageSize int) ([]map[string]interface{}, int64, error) {
	var urls []URL
	var total int64
	var results []map[string]interface{} = []map[string]interface{}{} // Initialize as empty array, not nil

	offset := (page - 1) * pageSize

	// Get total count
	if err := r.db.Model(&URL{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return results, 0, err // Return empty array instead of nil
	}

	// If there are no URLs, return early with empty array
	if total == 0 {
		return results, 0, nil
	}

	// Get paginated URLs
	if err := r.db.Where("user_id = ?", userID).Offset(offset).Limit(pageSize).Find(&urls).Error; err != nil {
		return results, 0, err // Return empty array instead of nil
	}

	// Format the result
	for _, url := range urls {
		results = append(results, map[string]interface{}{
			"ID":        url.ID,
			"CreatedAt": url.CreatedAt,
			"LongURL":   url.LongURL,
			"ShortCode": url.ShortCode,
			"Clicks":    url.Clicks,
		})
	}

	return results, total, nil
}
