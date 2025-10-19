class AddMaxToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :max, :integer, default: 0, null: false
  end
end
