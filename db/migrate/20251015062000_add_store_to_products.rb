class AddStoreToProducts < ActiveRecord::Migration[8.0]
  class MigrationStore < ActiveRecord::Base
    self.table_name = "stores"
  end

  class MigrationProduct < ActiveRecord::Base
    self.table_name = "products"
  end

  def up
    add_reference :products, :store, foreign_key: true

    MigrationStore.reset_column_information
    MigrationProduct.reset_column_information

    default_store = MigrationStore.find_or_create_by!(slug: "default") do |store|
      store.name = "Default Store"
    end

    MigrationProduct.where(store_id: nil).update_all(store_id: default_store.id)

    change_column_null :products, :store_id, false

    remove_index :products, :sku if index_exists?(:products, :sku)
    add_index :products, [:store_id, :sku], unique: true
  end

  def down
    remove_index :products, [:store_id, :sku] if index_exists?(:products, [:store_id, :sku])
    add_index :products, :sku, unique: true unless index_exists?(:products, :sku)
    remove_reference :products, :store, foreign_key: true
  end
end
