# frozen_string_literal: true

class ProductsWithoutImages < ApplicationService
  include ShopifyApp::AdminAPI::WithTokenRefetch

  GET_PRODUCTS_QUERY = <<~QUERY
    query getProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  id
                }
              }
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
    products_without_images = []
    after = nil

    loop do
      response = with_token_refetch(@session, @id_token) do
        client = ShopifyAPI::Clients::Graphql::Admin.new(session: @session)
        client.query(query: GET_PRODUCTS_QUERY, variables: { first: 250, after: after })
      end

      raise StandardError, response.body["errors"].to_s if response.body["errors"]

      products = response.body.dig("data", "products") || {}
      edges = products["edges"] || []

      edges.each do |edge|
        node = edge["node"] || {}
        has_image = node.dig("images", "edges").present?
        next if has_image

        products_without_images << {
          id: node["id"],
          title: node["title"],
          handle: node["handle"]
        }
      end

      page_info = products["pageInfo"] || {}
      break unless page_info["hasNextPage"]

      after = page_info["endCursor"]
    end

    # Extract shop domain from session (remove .myshopify.com if present)
    shop_domain = @session.shop&.gsub(".myshopify.com", "")
    {
      products: products_without_images,
      shop_domain: shop_domain
    }
  end
end
