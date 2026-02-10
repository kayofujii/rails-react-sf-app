# Shopify App details

A Shopify app built with Ruby on Rails and React that helps merchants spot “ghost products” (products without images) and quickly seed their store with sample coffee products.

## What this app does

- Lists products that have no images and links directly to the admin and storefront pages.
- Creates 5 sample coffee products with size variants and randomized titles.

## Key flows

- `GET /api/ghost_products`
  - Uses the Admin GraphQL API to fetch products and filters for those without images.
  - Returns product title, handle, SKU, and shop domain for link building.
- `POST /api/products`
  - Uses the Admin REST API to create 5 coffee-themed products.
  - Each product gets size variants and a randomized title like “bold espresso”.

Relevant code:

- `web/app/services/products_without_images.rb`
- `web/app/services/product_creator.rb`
- `web/frontend/components/GhostProductsCard.jsx`
- `web/frontend/pages/index.jsx`

## Tech stack

- Rails backend (`web/`)
- React frontend with Vite (`web/frontend/`)
- Shopify App Bridge + Polaris UI
- Shopify Admin REST and GraphQL APIs

## Getting started

### Requirements

1. A Shopify Partner account and a development or Plus sandbox store.
2. Ruby and Bundler.
3. Node.js.

### Setup

1. Install Ruby dependencies:

   ```shell
   cd web
   bundle install
   bin/rails app:template LOCATION=./template.rb
   cd ..
   ```

2. Start local development:

   ```shell
   shopify app dev
   ```

Open the URL printed by the CLI, install the app, and use the main page to create sample products or view ghost products.

## Deployment

This app uses ActiveRecord for Shopify session storage. Configure your database and environment variables per Shopify’s deployment docs.

Required environment variables:

- `RAILS_MASTER_KEY`
- `RAILS_ENV=production`
- `RAILS_SERVE_STATIC_FILES=1`
- `RAILS_LOG_TO_STDOUT=1`

## Developer resources

- Shopify apps overview: https://shopify.dev/docs/apps/getting-started
- Shopify CLI: https://shopify.dev/docs/apps/tools/cli
- Shopify API Ruby: https://github.com/Shopify/shopify-api-ruby
