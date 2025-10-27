Rails.application.routes.draw do
  root "products#index"

  resource :session, only: %i[new create destroy]
  resources :registrations, only: %i[new create]

  resources :products, only: [ :index, :create, :update, :destroy ]
end
