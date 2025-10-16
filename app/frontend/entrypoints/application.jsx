import { createRoot } from "react-dom/client";
import { AppProvider, Page, Box, Text, Card } from "@shopify/polaris";
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
      <Page title="Product List">
        <Card title="Products">
          <Text as="p">
            total products: <strong>{products.length}</strong>
          </Text>
        </Card>
      </Page>
    </AppProvider>
  );
}

// Initialize the app
const container = document.getElementById("root");
console.log("Mount container:", container);

if (container) {
  const products = loadProducts();
  console.log("Bootstrapped products:", products);
  createRoot(container).render(<App products={products} />);
} else {
  console.error("No #root element found");
}

// Export for HMR
export default App;
