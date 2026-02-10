# frozen_string_literal: true

class ProductCreator < ApplicationService
  include ShopifyApp::AdminAPI::WithTokenRefetch

  attr_reader :count

  def initialize(count:, session:, id_token:)
    super
    @count = count
    @session = session
    @id_token = id_token
  end

  def call
    count.times do
      response = with_token_refetch(@session, @id_token) do
        client = ShopifyAPI::Clients::Rest::Admin.new(session: @session)
        client.post(
          path: 'products.json',
          body: {
            product: {
              title: random_title,
              options: [{ name: 'Size', values: SIZES }],
              variants: build_variants
            }
          }
        )
      end

      raise StandardError, response.body['errors'].to_s if response.body['errors']

      created_product = response.body['product']
      Rails.logger.info("Created Product | Title: '#{created_product['title']}' | Id: '#{created_product['id']}'")
    end
  end

  private

  def random_title
    "#{ADJECTIVES.sample} #{NOUNS.sample}"
  end

  def build_variants
    SIZES.map do |size|
      {
        sku: "SKU-#{SecureRandom.hex(4)}",
        option1: size
      }
    end
  end

  ADJECTIVES = %w[cozy bold smooth velvety rich creamy dark bright mellow nutty].freeze
  NOUNS = %w[espresso latte cappuccino macchiato mocha americano coldbrew roast].freeze
  SIZES = ['12oz', '2.5lb', '5lb (SAVE 5%)'].freeze
end
