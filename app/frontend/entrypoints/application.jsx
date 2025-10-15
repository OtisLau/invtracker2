import React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider, Page, Card } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

function loadProducts() {
  try {
    const el = document.getElementById("bootstrap-products");
    return el ? JSON.parse(el.textContent) : [];
  } catch (e) {
    console.error("Failed to parse bootstrap products JSON:", e);
    return [];
  }
}

function App({ products }) {
  return (
    <AppProvider i18n={{}}>
      <Page title="InvTracker (MySQL)">
        <Card>
          <div style={{ padding: 12 }}>
            It works. Products count: <strong>{products.length}</strong>
          </div>
        </Card>
      </Page>
    </AppProvider>
  );
}

const container = document.getElementById("root");
console.log("Mount container:", container);

if (container) {
  const products = loadProducts();
  console.log("Bootstrapped products:", products);
  createRoot(container).render(<App products={products} />);
} else {
  console.error("No #root element found");
}
