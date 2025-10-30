class ApplicationController < ActionController::Base
  before_action :require_login

  helper_method :current_user, :user_signed_in?

  allow_browser versions: :modern 

  private

  def current_user
    @current_user = User.find_by(id: session[:user_id]) if session[:user_id]  # if session[:user_id] is present, find the user by id
  end 

  def user_signed_in?
    current_user.present?
  end

  def require_login
    return if user_signed_in?

    redirect_to new_session_path, alert: "sign in to continue."
  end
end
