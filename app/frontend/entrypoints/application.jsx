import { createRoot } from "react-dom/client";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

import ProductDashboard from "../components/ProductDashboard.jsx";
import { loadProducts } from "../utils/products.js";

function App({ products }) {
  return (
    <AppProvider i18n={{}}>
      <ProductDashboard initialProducts={products} />
    </AppProvider>
  );
}

const container = document.getElementById("root");

if (container) {
  const products = loadProducts();
  createRoot(container).render(<App products={products} />);
} else {
  console.error("No #root element found");
}
