class RegistrationsController < ApplicationController
  skip_before_action :require_login, only: %i[ new create ]

  def new
    redirect_to products_path and return if user_signed_in?

    @stores = Store.order(:name)
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    @user.email = @user.email.to_s.downcase
    assign_store(@user)

    if @user.save
      session[:user_id] = @user.id
      redirect_to products_path, notice: "Account created."
    else
      @stores = Store.order(:name)
      render :new, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation, :role)
  end

  def assign_store(user)
    store_id = params.dig(:user, :store_id)
    return if store_id.blank?

    store = Store.find_by(id: store_id)
    return user.store = store if store

    user.errors.add(:store, "must exist")
  end
end
