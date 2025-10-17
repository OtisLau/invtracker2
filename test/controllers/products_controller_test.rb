require "test_helper"

class ProductsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get products_url
    assert_response :success
  end

  test "should get create" do
    assert_difference("Product.count", 1) do
      post products_url, params: {
        product: {
          name: "Widget",
          sku: "SKU-NEW",
          reorder_point: 2,
          on_hand: 4
        }
      }
    end

    assert_redirected_to products_path
    follow_redirect!
    assert_response :success
  end
end
