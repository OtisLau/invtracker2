Rails.application.routes.draw do
  root "products#index"

  # products routes (only index and create for now)
  resources :products, only: [:index, :create]
end
