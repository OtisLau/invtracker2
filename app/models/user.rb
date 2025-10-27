class User < ApplicationRecord
  belongs_to :store

  has_secure_password

  enum :role, { admin: 0, employee: 1 }

  before_validation :normalize_email

  validates :email, presence: true, uniqueness: true
  validates :password, length: { minimum: 10 }, allow_nil: true

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
