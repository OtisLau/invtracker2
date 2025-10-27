require "test_helper"

class ProductsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:default_admin)
    post session_url, params: { email: @user.email, password: "Password123!" }
  end

  test "should get index" do
    get products_url
    assert_response :success
  end

  test "should get create" do
    post products_url, params: { product: { name: "Widget", sku: "WIDGET-1", reorder_point: 1, on_hand: 2, max: 5 } }
    assert_response :redirect
    assert_redirected_to products_url
  end
end
