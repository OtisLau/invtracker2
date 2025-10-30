class RegistrationsController < ApplicationController
  skip_before_action :require_login, only: %i[ new create ]

  def new
    redirect_to products_path and return if user_signed_in?

    @stores = Store.order(:name)
    @user = User.new
  end

# this is the function that is called when the user submits the registration form
  def create
    @user = User.new(user_params)
    @user.email = @user.email.to_s.downcase
    @user.role = default_role
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
 # this is the function that is called when the user submits the registration form
  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end
# this is the function that is called when the user selects a store
  def assign_store(user)
    store_id = params.dig(:user, :store_id)
    return if store_id.blank?

    store = Store.find_by(id: store_id)
    return user.store = store if store

    user.errors.add(:store, "must exist")
  end
# this is the function that is called when the user is created
  def default_role
    User.roles.fetch(:employee)
  end
end
