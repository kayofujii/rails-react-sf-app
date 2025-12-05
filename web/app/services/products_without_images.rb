# frozen_string_literal: true

class ProductsWithoutImages < ApplicationService
    include ShopifyApp::AdminAPI::WithTokenRefetch
  
    GET_PRODUCTS_WITHOUT_IMAGES_QUERY = <<~QUERY
      query getProductsWithoutImages($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                id
              }
            }
          }
        }
      }
    QUERY
  
    def initialize(session:, id_token:)
      super
      @session = session
      @id_token = id_token
    end
  
    def call
      response = with_token_refetch(@session, @id_token) do
        client = ShopifyAPI::Clients::Graphql::Admin.new(session: @session)
        client.query(query: GET_PRODUCTS_WITHOUT_IMAGES_QUERY, variables: { first: 250 })
      end
  
      raise StandardError, response.body["errors"].to_s if response.body["errors"]
  
      products = response.body.dig("data", "products", "edges")&.map do |edge|
        node = edge["node"]
        {
          id: node["id"],
          title: node["title"],
          handle: node["handle"],
          has_image: node["featuredImage"].present?
        }
      end || []
  
      # Filter products without images
      products_without_images = products.select { |p| !p[:has_image] }
  
      # Extract shop domain from session (remove .myshopify.com if present)
      shop_domain = @session.shop&.gsub('.myshopify.com', '')
      { 
        products: products_without_images,
        shop_domain: shop_domain
      }
    end
  end