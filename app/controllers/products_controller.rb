class ProductsController < ApplicationController
  protect_from_forgery with: :exception

  def index
    @products = Product.order(:name)

    respond_to do |format|
      format.html
      format.json { render json: @products }
    end
  end

  def create
    product = Product.new(product_params)

    if product.save
      respond_to do |format|
        format.html { redirect_to products_path, notice: "Product created." }
        format.json { render json: product, status: :created }
      end
    else
      respond_to do |format|
        format.html do
          redirect_to products_path, alert: product.errors.full_messages.to_sentence
        end
        format.json { render json: { errors: product.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def update
    product = Product.find(params[:id])

    if product.update(product_params)
      render json: product
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    product = Product.find(params[:id])
    product.destroy!
    head :no_content
  end

  private

  def product_params
    params.require(:product).permit(:name, :sku, :reorder_point, :on_hand, :max)
  end
end
