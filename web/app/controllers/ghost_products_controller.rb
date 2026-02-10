# frozen_string_literal: true

class GhostProductsController < AuthenticatedController
  def index
    result = ProductsWithoutImages.call(session: current_shopify_session, id_token: shopify_id_token)
    render(json: result)
  rescue StandardError => e
    logger.error("Failed to retrieve products without images: #{e.message}")
    render(json: { products: [], error: e.message }, status: e.try(:code) || :internal_server_error)
  end
end
