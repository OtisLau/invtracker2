class Store < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :products, dependent: :destroy

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true
end
