import { useCallback, useMemo } from "react";
import {
  Banner,
  Box,
  Layout,
  Page,
} from "@shopify/polaris";

import { useProductManager } from "../hooks/useProductManager.js";
import ProductModal from "./ProductModal.jsx";
import ProductSummary from "./ProductSummary.jsx";
import ProductTable from "./ProductTable.jsx";
import { getCsrfToken } from "../utils/products.js";

// This is the main component for the product dashboard.
// It handles the state of the products and the modal.
export default function ProductDashboard({ initialProducts, auth }) {
  const {
    products,
    sortedProducts,
    lowStockCount,
    status,
    setStatus,
    modalOpen,
    modalMode,
    formValues,
    handleFormChange,
    saving,
    deletingId,
    editingProduct,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
    handleBulkDelete,
    closeModal,
  } = useProductManager(initialProducts);

  const { signedIn, loginPath, logoutPath } = auth ?? {}; // this is the auth object that is passed from the backend

  const handleLogin = useCallback(() => { // this is the function that is called when the user clicks the sign in button
    if (!loginPath) {
      return;
    }

    window.location.href = loginPath;
  }, [loginPath]);

  const handleLogout = useCallback(() => {
    if (!logoutPath) {
      return;
    } // this is the function that is called when the user clicks the sign out button

    const form = document.createElement("form");
    form.method = "POST";
    form.action = logoutPath;

    const methodInput = document.createElement("input");
    methodInput.type = "hidden";
    methodInput.name = "_method";
    methodInput.value = "delete";
    form.appendChild(methodInput);

    const csrfInput = document.createElement("input"); // this is the csrf token that is needed to prevent cross site request forgery
    csrfInput.type = "hidden";
    csrfInput.name = "authenticity_token";
    csrfInput.value = getCsrfToken();
    form.appendChild(csrfInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }, [logoutPath]);

  const secondaryActions = useMemo(() => { // this is the function that is called when the user clicks the sign out button
    if (signedIn) {
      return [
        {
          content: "Sign out",
          onAction: handleLogout,
        },
      ];
    }

    if (loginPath) {
      return [
        {
          content: "Sign in",
          onAction: handleLogin,
        },
      ];
    }

    return [];
  }, [signedIn, loginPath, handleLogin, handleLogout]);

  return (
    <>
      <ProductModal
        open={modalOpen}
        mode={modalMode}
        formValues={formValues}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        saving={saving}
        onClose={closeModal}
        onDelete={handleDelete}
        editingProduct={editingProduct}
        deletingId={deletingId}
      />
      <Page
        title="Inventory dashboard"
        primaryAction={{
          content: "New product",
          onAction: handleOpenCreate,
        }}
        secondaryActions={secondaryActions}
      >
        <Layout>
          <Layout.Section>
            {status ? (
              <Box paddingBlockEnd="200" marginBlockEnd="300">
                <Banner tone={status.tone} onDismiss={() => setStatus(null)}>
                  {status.message}
                </Banner>
              </Box>
            ) : null}
            <ProductSummary
              totalCount={products.length}
              lowStockCount={lowStockCount}
            />
          </Layout.Section>
          <Layout.Section>
            <ProductTable
              products={sortedProducts}
              deletingId={deletingId}
              onEdit={handleOpenEdit}
              onBulkDelete={handleBulkDelete}
            />
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}
