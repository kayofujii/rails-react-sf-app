import { EmptyState, Text } from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

export function GhostProductsCard() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["ghostProducts"],
    queryFn: async () => {
      const response = await fetch("/api/ghost_products/");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return await response.json();
    },
    refetchOnWindowFocus: false,
  });

  const products = data?.products || [];
  const shopDomain = data?.shop_domain || "";

  const rows = products.map((item, index) => {
    const productId = item.id.split("/").pop();
    const productUrl = shopDomain
      ? `https://admin.shopify.com/store/${shopDomain}/products/${productId}`
      : "#";

    return (
      <s-table-row id={productId} key={productId}>
        <s-table-cell>
          <s-text>{item.sku || t("GhostProductsCard.noSku")}</s-text>
        </s-table-cell>
        <s-table-cell>
          <s-text>{item.title}</s-text>
        </s-table-cell>
        <s-table-cell>
          <a
            href={`https://${shopDomain}/products/${item.handle}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            https://{shopDomain}/products/{item.handle}
          </a>
        </s-table-cell>
        <s-table-cell>
          <s-button variant="auto" icon="edit" href={productUrl} target="_top">
            Edit
          </s-button>
        </s-table-cell>
      </s-table-row>
    );
  });

  return (
    <s-section heading={t("GhostProductsCard.title")}>
      <s-table>
        <s-table-header-row>
          <s-table-header>{t("GhostProductsCard.sku")}</s-table-header>
          <s-table-header>{t("GhostProductsCard.product")}</s-table-header>
          <s-table-header>{t("GhostProductsCard.liveUrl")}</s-table-header>
          <s-table-header>{t("GhostProductsCard.action")}</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {products.length === 0 && !isLoading ? (
            <s-table-row>
              <s-table-cell colspan="3" align="center">
                <EmptyState
                  heading={t("GhostProductsCard.emptyHeading")}
                  description={t("GhostProductsCard.emptyDescription")}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                />
              </s-table-cell>
            </s-table-row>
          ) : (
            rows
          )}
        </s-table-body>
      </s-table>
    </s-section>
  );
}
