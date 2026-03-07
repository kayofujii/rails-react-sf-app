# frozen_string_literal: true

class ProductCreator < ApplicationService
  include ShopifyApp::AdminAPI::WithTokenRefetch

  CREATE_PRODUCT_MUTATION = <<~QUERY
    mutation productCreate($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  QUERY

  BULK_CREATE_VARIANTS_MUTATION = <<~QUERY
    mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: REMOVE_STANDALONE_VARIANT) {
        productVariants {
          id
          title
          sku
        }
        userErrors {
          field
          message
        }
      }
    }
  QUERY

  attr_reader :count

  def initialize(count:, session:, id_token:)
    super
    @count = count
    @session = session
    @id_token = id_token
  end

  def call
    count.times do
      title = random_title
      product = create_product(title: title)
      create_variants(product_id: product['id'])

      Rails.logger.info("Created Product | Title: '#{product['title']}' | Id: '#{product['id']}'")
    end
  end

  private

  def create_product(title:)
    response = with_token_refetch(@session, @id_token) do
      client = ShopifyAPI::Clients::Graphql::Admin.new(session: @session)
      client.query(
        query: CREATE_PRODUCT_MUTATION,
        variables: {
          product: {
            title: title,
            productOptions: [{ name: 'Bag Size', values: SIZES.map { |size| { name: size } } }]
          }
        }
      )
    end

    raise StandardError, response.body['errors'].to_s if response.body['errors']

    payload = response.body.dig('data', 'productCreate') || {}
    raise_user_errors!(payload, 'productCreate')

    product = payload['product'] || {}
    raise StandardError, 'productCreate did not return a product id' if product['id'].blank?

    product
  end

  def create_variants(product_id:)
    response = with_token_refetch(@session, @id_token) do
      client = ShopifyAPI::Clients::Graphql::Admin.new(session: @session)
      client.query(
        query: BULK_CREATE_VARIANTS_MUTATION,
        variables: {
          productId: product_id,
          variants: build_variants
        }
      )
    end

    raise StandardError, response.body['errors'].to_s if response.body['errors']

    payload = response.body.dig('data', 'productVariantsBulkCreate') || {}
    raise_user_errors!(payload, 'productVariantsBulkCreate')
  end

  def raise_user_errors!(payload, operation)
    user_errors = payload['userErrors'] || []
    return if user_errors.empty?

    message = user_errors.map { |error| "#{Array(error['field']).join('.')}: #{error['message']}" }.join(', ')
    raise StandardError, "#{operation} failed: #{message}"
  end

  def random_title
    "#{ADJECTIVES.sample} #{NOUNS.sample}"
  end

  def build_variants
    SIZES.map do |size|
      {
        optionValues: [{ optionName: 'Bag Size', name: size }],
        inventoryItem: {
          sku: "SKU-#{SecureRandom.hex(4)}"
        }
      }
    end
  end

  ADJECTIVES = %w[cozy bold smooth velvety rich creamy dark bright mellow nutty].freeze
  NOUNS = %w[espresso latte cappuccino macchiato mocha americano coldbrew roast].freeze
  SIZES = ['250g', '1kg', '2kg','5lb (Bulk)'].freeze
end
