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

// This is the main component for the product dashboard.
// It handles the state of the products and the modal.
export default function ProductDashboard({ initialProducts }) {
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
