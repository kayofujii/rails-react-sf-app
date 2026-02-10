import { useState } from "react";
import { Layout, Page } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { GhostProductsCard } from "../components";

export default function HomePage() {
  const { t } = useTranslation();
  const shopify = useAppBridge();
  const queryClient = useQueryClient();
  const [isPopulating, setIsPopulating] = useState(false);
  const productsCount = 5;

  const setPopulating = (flag) => {
    shopify.loading(flag);
    setIsPopulating(flag);
  };

  const handlePopulate = async () => {
    setPopulating(true);
    const response = await fetch("/api/products", { method: "POST" });

    if (response.ok) {
      shopify.toast.show(
        t("ProductsCard.productsCreatedToast", { count: productsCount }),
      );
      queryClient.invalidateQueries(["ghostProducts"]);
    } else {
      shopify.toast.show(t("ProductsCard.errorCreatingProductsToast"), {
        isError: true,
      });
    }

    setPopulating(false);
  };

  return (
    <Page
      title={t("HomePage.title")}
      secondaryActions={[
        {
          content: t("ProductsCard.addProductsButton", {
            count: productsCount,
          }),
          onAction: handlePopulate,
          loading: isPopulating,
          accessibilityLabel: t(
            "ProductsCard.addProductsButtonAccessibilityLabel",
          ),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <GhostProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
