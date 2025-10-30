class ProductsController < ApplicationController


  # core functionality crud 

  protect_from_forgery with: :exception 

  before_action :set_product, only: %i[ update destroy ] 

  def index 
    @products = current_user.store.products.order(:name) 
    respond_to do |format|
      format.html 
      format.json { render json: @products } 
    end
  end

  def create
    product = current_user.store.products.new(product_params)

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
    return render json: @product if @product.update(product_params)

    render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    @product.destroy!
    head :no_content
  end

  private

  def set_product
    @product = current_user.store.products.find(params[:id])
  end

  def product_params
    params.require(:product).permit(:name, :sku, :reorder_point, :on_hand, :max)
  end
end
