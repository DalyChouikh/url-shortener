package models

import (
	"gorm.io/gorm"
)

type URL struct {
	gorm.Model
	LongURL   string `gorm:"not null"`
	ShortCode string `gorm:"uniqueIndex;not null"`
	Clicks    int64  `gorm:"default:0"`
	UserID    uint   `gorm:"not null;constraint:OnDelete:CASCADE"`
	User      User   `gorm:"foreignKey:UserID"`
	QRCode    string `gorm:"type:text"`
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
