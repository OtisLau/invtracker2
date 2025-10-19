class Product < ApplicationRecord
  validates :name, presence: true
  validates :sku, presence: true, uniqueness: true
  validates :reorder_point, numericality: { greater_than_or_equal_to: 0 }
  validates :on_hand, numericality: { greater_than_or_equal_to: 0 }
  validates :max, numericality: { greater_than_or_equal_to: 0 }

  # this is good to make sure there is no sort of race conditions. like if 2 people
  # try to adjust the on_hand at the same time.
  def adjust_on_hand!(delta)
    with_lock do
      update!(on_hand: on_hand + delta)
    end
  end
end
