package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email        string `gorm:"uniqueIndex;not null"`
	GoogleID     string `gorm:"uniqueIndex"`
	Name         string
	Picture      string
	LastLoginAt  time.Time
	URLs         []URL `gorm:"foreignKey:UserID"`
}

func (User) TableName() string {
	return "users"
}

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindOrCreateUser(user *User) error {
	return r.db.Where(User{GoogleID: user.GoogleID}).FirstOrCreate(user).Error
}

func (r *UserRepository) FindByGoogleID(googleID string) (*User, error) {
	var user User
	if err := r.db.Where("google_id = ?", googleID).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(userID uint) (*User, error) {
    var user User
    if err := r.db.First(&user, userID).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *UserRepository) UpdateLastLogin(userID uint) error {
    return r.db.Model(&User{}).Where("id = ?", userID).Update("last_login_at", time.Now()).Error
}
