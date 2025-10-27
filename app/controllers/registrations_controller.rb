class RegistrationsController < ApplicationController
  skip_before_action :require_login, only: %i[new create]

  def new
    redirect_to products_path and return if user_signed_in?

    @stores = Store.order(:name)
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    @user.email = @user.email.to_s.downcase

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
    params.require(:user).permit(:name, :email, :password, :password_confirmation, :role, :store_id)
  end
end
