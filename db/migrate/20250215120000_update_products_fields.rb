class UpdateProductsFields < ActiveRecord::Migration[8.0]
  def up
    add_column :products, :sku, :string
    add_column :products, :reorder_point, :integer, default: 0, null: false
    add_column :products, :on_hand, :integer, default: 0, null: false

    execute <<~SQL.squish
      UPDATE products
      SET on_hand = COALESCE(stock, 0)
    SQL

    remove_column :products, :stock

    add_index :products, :sku, unique: true
  end

  def down
    remove_index :products, :sku

    add_column :products, :stock, :integer

    execute <<~SQL.squish
      UPDATE products
      SET stock = on_hand
    SQL

    remove_column :products, :on_hand
    remove_column :products, :reorder_point
    remove_column :products, :sku
  end
end
