import { Card, ResourceList, ResourceItem, Text, Stack, EmptyState } from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

export function ProductsWithoutImagesCard() {
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["productsWithoutImages"],
    queryFn: async () => {
      const response = await fetch("/api/products/without_images");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return await response.json();
    },
    refetchOnWindowFocus: false,
  });

  const products = data?.products || [];
  const shopDomain = data?.shop_domain || "";
  return (
    <Card>
      <ResourceList
        resourceName={{ singular: "product", plural: "products" }}
        items={products}
        loading={isLoading}
        emptyState={
          <EmptyState
            heading={t("ProductsWithoutImagesCard.emptyHeading")}
            description={t("ProductsWithoutImagesCard.emptyDescription")}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
          </EmptyState>
        }
        renderItem={(item) => {
        console.log(item);
          const { id, title, handle } = item;
          const productId = id.split("/").pop();
          const productUrl = shopDomain 
          ? `https://admin.shopify.com/store/${shopDomain}/products/${productId}`
          : `#`;
          return (
            <ResourceItem
              id={productId}
              url={productUrl}
              accessibilityLabel={`View ${title}`}
            >
              <Stack>
                <Stack.Item fill>
                  <Text variant="bodyMd" fontWeight="bold" as="h3">
                    {title}
                  </Text>
                  <div className="p-1">
                    <Text variant="bodySm" tone="subdued" as="span">
                      {handle}
                    </Text>
                  </div>
                </Stack.Item>
              </Stack>
            </ResourceItem>
          );
        }}
      />
      {products.length > 0 && (
        <div className="p-4"
        style={{ borderTop: "1px solid #e1e3e5" }}
        >
            <Text variant="bodySm" tone="subdued" as="p">
                {t("ProductsWithoutImagesCard.count", { count: products.length })}
            </Text>
        </div>
      )}
    </Card>
  );
}