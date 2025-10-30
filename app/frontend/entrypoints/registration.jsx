import { createRoot } from "react-dom/client";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

import SignUpPage from "../components/SignUpPage.jsx";

const container = document.getElementById("registration-root");

if (container) {
  const {
    registrationPath,
    sessionPath,
    stores: storesJson,
    errors: errorsJson,
    alert,
    notice,
    nameValue,
    emailValue,
    storeValue,
  } = container.dataset;

  const stores = storesJson ? JSON.parse(storesJson) : [];
  const errors = errorsJson ? JSON.parse(errorsJson) : null;

  createRoot(container).render(
    <AppProvider i18n={{}}>
      <SignUpPage
        registrationPath={registrationPath}
        sessionPath={sessionPath}
        stores={stores}
        errors={errors}
        alert={alert}
        notice={notice}
        initialName={nameValue}
        initialEmail={emailValue}
        initialStoreId={storeValue}
      />
    </AppProvider>
  );
}
