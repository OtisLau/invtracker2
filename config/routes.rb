Rails.application.routes.draw do
  root "products#index" # this is the root route

  resource :session, only: %i[ new create destroy ] # session resource
  
  resources :registrations, only: %i[ new create ] # registration resource

  resources :products, only: [ :index, :create, :update, :destroy ] # products resource
end
