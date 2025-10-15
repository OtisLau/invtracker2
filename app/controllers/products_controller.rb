class ProductsController < ApplicationController
  protect_from_forgery with: :exception

  def index
    @products = Product.all
  end

  def create
    Product.create!(name: params[:name], stock: params[:stock])
    head :ok
  end
end
