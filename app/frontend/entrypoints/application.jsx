import { createRoot } from "react-dom/client";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

import ProductDashboard from "../components/ProductDashboard.jsx";
import { loadProducts } from "../utils/products.js";

function App({ products, auth }) {
  return (
    <AppProvider i18n={{}}>
      <ProductDashboard initialProducts={products} auth={auth} />
    </AppProvider>
  );
}

const container = document.getElementById("root");

// if the container is found, load the products and render the app
if (container) {
  const products = loadProducts();
  const { userSignedIn, loginPath, logoutPath } = container.dataset;
  const auth = {
    signedIn: userSignedIn === "true",
    loginPath,
    logoutPath,
  };
  createRoot(container).render(<App products={products} auth={auth} />);
} else {
  console.error("No #root element found");
}
