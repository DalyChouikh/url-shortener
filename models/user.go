package models

import (
	"time"

	"gorm.io/gorm"
)

// Role type for user roles
type Role string

const (
	RoleSuperAdmin Role = "SUPER_ADMIN"
	RoleGDGCLead   Role = "GDGC_LEAD"
	RoleCoreTeam   Role = "CORE_TEAM"
	RoleCommunity  Role = "COMMUNITY"
)

type User struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	GoogleID    string         `gorm:"unique" json:"googleId"`
	Email       string         `gorm:"unique" json:"email"`
	Name        string         `json:"name"`
	Picture     string         `json:"picture"`
	LastLoginAt time.Time      `json:"lastLoginAt"`
	Role        Role           `gorm:"default:COMMUNITY" json:"role"`
	URLs        []URL          `gorm:"foreignKey:UserID" json:"-"`
}

func (User) TableName() string {
	return "users"
}

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	// Automigrate the User model
	db.AutoMigrate(&User{})
	return &UserRepository{
		db: db,
	}
}

// FindOrCreateUser finds a user by Google ID or creates a new one
func (r *UserRepository) FindOrCreateUser(user *User) error {
	// Check if the user exists by Google ID
	var existingUser User
	result := r.db.Where("google_id = ?", user.GoogleID).First(&existingUser)

	if result.Error != nil {
		// User doesn't exist, create new user with default role
		user.Role = RoleCommunity
		return r.db.Create(user).Error
	}

	// User exists, update fields and preserve role
	existingUser.Email = user.Email
	existingUser.Name = user.Name
	existingUser.Picture = user.Picture
	existingUser.LastLoginAt = user.LastLoginAt

	*user = existingUser
	return r.db.Save(&existingUser).Error
}

// Additional repository methods...

// FindByGoogleID finds a user by Google ID
func (r *UserRepository) FindByGoogleID(googleID string) (*User, error) {
	var user User
	if err := r.db.Where("google_id = ?", googleID).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByID finds a user by ID
func (r *UserRepository) FindByID(id uint) (*User, error) {
	var user User
	result := r.db.First(&user, id)
	return &user, result.Error
}

// UpdateLastLogin updates the last login time for a user
func (r *UserRepository) UpdateLastLogin(id uint) error {
	return r.db.Model(&User{}).Where("id = ?", id).Update("last_login_at", time.Now()).Error
}

// DeleteUser deletes a user by ID
func (r *UserRepository) DeleteUser(id uint) error {
	return r.db.Delete(&User{}, id).Error
}

// GetAllUsers retrieves all users
func (r *UserRepository) GetAllUsers() ([]User, error) {
	var users []User
	result := r.db.Find(&users)
	return users, result.Error
}

// UpdateUserRole updates a user's role
func (r *UserRepository) UpdateUserRole(id uint, role Role) error {
	return r.db.Model(&User{}).Where("id = ?", id).Update("role", role).Error
}

// GetPaginatedUsers retrieves users with pagination
func (r *UserRepository) GetPaginatedUsers(page, pageSize int) ([]User, int64, error) {
	var users []User
	var total int64

	offset := (page - 1) * pageSize

	// Get total count first
	if err := r.db.Model(&User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated users
	if err := r.db.Offset(offset).Limit(pageSize).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}
