class CreateStores < ActiveRecord::Migration[8.0]
  def change
    create_table :stores do |t|
      t.string :name, null: false
      t.string :slug, null: false

      t.timestamps
    end

    add_index :stores, :slug, unique: true
  end
end
