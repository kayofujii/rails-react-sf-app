import {
  IndexTable,
  LegacyCard,
  Text,
  Badge,
  Button,
  Link,
  EmptyState,
  SkeletonBodyText,
} from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

export function GhostProductsCard() {
  const { t } = useTranslation();

  // Fetching data from your Rails/Node API
  const { data, isLoading } = useQuery({
    queryKey: ["ghostProducts"],
    queryFn: async () => {
      const response = await fetch("/api/ghost_products/");
      if (!response.ok) throw new Error("Failed to fetch products");
      return await response.json();
    },
    refetchOnWindowFocus: false,
  });

  const products = data?.products || [];
  const shopDomain = data?.shop_domain || "";

  const resourceName = { singular: "product", plural: "products" };

  const rowMarkup = products.map((item, index) => {
    const productId = item.id.split("/").pop();
    const adminUrl = `https://admin.shopify.com/store/${shopDomain}/products/${productId}`;
    const liveUrl = `https://${shopDomain}/products/${item.handle}`;

    return (
      <IndexTable.Row id={item.id} key={item.id} position={index}>
        <IndexTable.Cell>
          <Link removeUnderline url={adminUrl} key={`admin-link-${item.id}`}>
            {item.sku || (
              <Text tone="subdued">{t("GhostProductsCard.noSku")}</Text>
            )}
          </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {item.title}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Link
            url={liveUrl}
            external
            onClick={(event) => event.stopPropagation()}
          >
            {liveUrl}
          </Link>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  // Loading State
  if (isLoading) {
    return (
      <LegacyCard sectioned>
        <SkeletonBodyText lines={5} />
      </LegacyCard>
    );
  }

  return (
    <LegacyCard>
      <IndexTable
        resourceName={resourceName}
        itemCount={products.length}
        headings={[
          { title: t("GhostProductsCard.sku") },
          { title: t("GhostProductsCard.product") },
          { title: t("GhostProductsCard.liveUrl") },
        ]}
        selectable={false}
      >
        {products.length === 0 ? (
          <IndexTable.Row>
            <IndexTable.Cell colSpan={4}>
              <EmptyState
                heading={t("GhostProductsCard.emptyHeading")}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>{t("GhostProductsCard.emptyDescription")}</p>
              </EmptyState>
            </IndexTable.Cell>
          </IndexTable.Row>
        ) : (
          rowMarkup
        )}
      </IndexTable>
    </LegacyCard>
  );
}
