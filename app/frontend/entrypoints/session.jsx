import { createRoot } from "react-dom/client";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

import SignInPage from "../components/SignInPage.jsx";

const container = document.getElementById("session-root");

if (container) {
  const {
    loginPath,
    registrationPath,
    alert,
    notice,
    emailValue,
  } = container.dataset;

  createRoot(container).render(
    <AppProvider i18n={{}}>
      <SignInPage
        loginPath={loginPath}
        registrationPath={registrationPath}
        alert={alert}
        notice={notice}
        initialEmail={emailValue}
      />
    </AppProvider>
  );
}
