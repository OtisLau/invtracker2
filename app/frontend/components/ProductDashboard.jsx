import {
  Badge,
  Banner,
  Box,
  Button,
  Card,
  FormLayout,
  IndexTable,
  InlineStack,
  Layout,
  Modal,
  Page,
  Text,
  TextField,
  useIndexResourceState,
} from "@shopify/polaris";
import { useEffect, useMemo, useState } from "react";

import {
  castProductAttributes,
  getCsrfToken,
} from "../utils/products.js";

export default function ProductDashboard({ initialProducts }) {
  const [products, setProducts] = useState(
    initialProducts.map(castProductAttributes),
  );
  const [status, setStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [formValues, setFormValues] = useState({
    name: "",
    sku: "",
    reorder_point: "0",
    on_hand: "0",
    max: "0",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const csrfToken = useMemo(() => getCsrfToken(), []);

  useEffect(() => {
    if (!status) return;

    const timeoutId = setTimeout(() => setStatus(null), 3000);
    return () => clearTimeout(timeoutId);
  }, [status]);

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const lowStockCount = useMemo(
    () => products.filter((product) => product.on_hand <= product.reorder_point).length,
    [products],
  );

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [products],
  );

  const resetForm = () => {
    setFormValues({
      name: "",
      sku: "",
      reorder_point: "0",
      on_hand: "0",
      max: "0",
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
    setSaving(false);
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setModalMode("edit");
    setFormValues({
      name: product.name || "",
      sku: product.sku || "",
      reorder_point: String(product.reorder_point ?? 0),
      on_hand: String(product.on_hand ?? 0),
      max: String(product.max ?? 0),
      id: product.id,
    });
    setModalOpen(true);
  };

  const upsertProduct = (nextProduct) => {
    const casted = castProductAttributes(nextProduct);
    setProducts((prev) => {
      const exists = prev.some((product) => product.id === casted.id);
      if (exists) {
        return prev.map((product) =>
          product.id === casted.id ? casted : product,
        );
      }
      return [...prev, casted];
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setStatus(null);

    const payload = {
      name: formValues.name.trim(),
      sku: formValues.sku.trim(),
      reorder_point: Number(formValues.reorder_point) || 0,
      on_hand: Number(formValues.on_hand) || 0,
      max: Number(formValues.max) || 0,
    };

    if (!payload.name || !payload.sku) {
      setStatus({
        tone: "critical",
        message: "Name and SKU are required.",
      });
      setSaving(false);
      return;
    }

    try {
      const url =
        modalMode === "create"
          ? "/products"
          : `/products/${encodeURIComponent(formValues.id)}`;
      const method = modalMode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ product: payload }),
      });

      const data = response.status === 204 ? null : await response.json();

      if (!response.ok) {
        const errors = data?.errors?.join(", ") || "Something went wrong";
        setStatus({ tone: "critical", message: errors });
        setSaving(false);
        return;
      }

      if (data) {
        upsertProduct(data);
      }

      setStatus({
        tone: "success",
        message:
          modalMode === "create" ? "Product created successfully." : "Product updated.",
      });
      closeModal();
    } catch (error) {
      console.error("Failed to save product:", error);
      setStatus({
        tone: "critical",
        message: "Unable to save the product. Please try again.",
      });
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmDelete = window.confirm(
      `Delete ${product.name}? This cannot be undone.`,
    );

    if (!confirmDelete) return;

    setDeletingId(product.id);
    setStatus(null);

    try {
      const response = await fetch(`/products/${product.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        const errors = data?.errors?.join(", ") || "Failed to delete product.";
        setStatus({ tone: "critical", message: errors });
        setDeletingId(null);
        return;
      }

      setProducts((prev) =>
        prev.filter((existing) => existing.id !== product.id),
      );
      setStatus({ tone: "success", message: "Product deleted." });
    } catch (error) {
      console.error("Failed to delete product:", error);
      setStatus({
        tone: "critical",
        message: "Unable to delete the product right now.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const modalTitle = modalMode === "create" ? "Create product" : "Edit product";

  const modalContent = (
    <Modal
      open={modalOpen}
      onClose={closeModal}
      title={modalTitle}
      primaryAction={{
        content: modalMode === "create" ? "Create" : "Save",
        onAction: handleSubmit,
        loading: saving,
        disabled: saving,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: closeModal,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <TextField
            label="Name"
            value={formValues.name}
            onChange={(value) =>
              setFormValues((prev) => ({ ...prev, name: value }))
            }
            autoComplete="off"
            requiredIndicator
          />
          <TextField
            label="SKU"
            value={formValues.sku}
            onChange={(value) =>
              setFormValues((prev) => ({ ...prev, sku: value }))
            }
            autoComplete="off"
            requiredIndicator
          />
          <FormLayout.Group condensed>
            <TextField
              label="Reorder point"
              type="number"
              value={formValues.reorder_point}
              onChange={(value) =>
                setFormValues((prev) => ({ ...prev, reorder_point: value }))
              }
              autoComplete="off"
              min={0}
            />
            <TextField
              label="On hand"
              type="number"
              value={formValues.on_hand}
              onChange={(value) =>
                setFormValues((prev) => ({ ...prev, on_hand: value }))
              }
              autoComplete="off"
              min={0}
            />
            <TextField
              label="Max"
              type="number"
              value={formValues.max}
              onChange={(value) =>
                setFormValues((prev) => ({ ...prev, max: value }))
              }
              autoComplete="off"
              min={0}
            />
          </FormLayout.Group>
        </FormLayout>
      </Modal.Section>
    </Modal>
  );

  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
  } = useIndexResourceState(sortedProducts, {
    resourceIDResolver: (product) => String(product.id),
  });

  const selectedCount =
    allResourcesSelected && sortedProducts.length > 0
      ? sortedProducts.length
      : selectedResources.length;

  const isBulkDeleting = deletingId === "bulk";
  const bulkDeleteDisabled = selectedCount === 0 || isBulkDeleting;

  const handleBulkDelete = async () => {
    if (bulkDeleteDisabled) return;

    const confirmDelete = window.confirm(
      selectedCount === 1
        ? "Delete the selected product?"
        : `Delete ${selectedCount} products? This cannot be undone.`,
    );

    if (!confirmDelete) return;

    setStatus(null);
    setDeletingId("bulk");

    try {
      const idsToDelete = allResourcesSelected
        ? sortedProducts.map((product) => String(product.id))
        : selectedResources;

      const deleteRequests = idsToDelete.map((productId) =>
        fetch(`/products/${productId}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "X-CSRF-Token": csrfToken,
          },
        }),
      );

      const responses = await Promise.all(deleteRequests);

      const errorResponse = responses.find((response) => !response.ok);
      if (errorResponse) {
        const data = await errorResponse.json();
        throw new Error(
          data?.errors?.join(", ") || "Failed to delete selected products.",
        );
      }

      setProducts((prev) =>
        prev.filter(
          (product) => !idsToDelete.includes(String(product.id)),
        ),
      );

      handleSelectionChange("all", false);
      setStatus({ tone: "success", message: "Selected products deleted." });
    } catch (error) {
      console.error("Bulk delete failed:", error);
      setStatus({
        tone: "critical",
        message: error.message || "Unable to delete the selected products.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {modalContent}
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
            <Card>
              <Box padding="400" background="bg-surface-subdued">
                <InlineStack gap="400">
                  <Box>
                    <Text variant="headingLg" as="p">
                      {products.length}
                    </Text>
                    <Text tone="subdued" as="p">
                      Total products
                    </Text>
                  </Box>
                  <Box>
                    <Text variant="headingLg" as="p">
                      {lowStockCount}
                    </Text>
                    <Text tone="subdued" as="p">
                      Low stock
                    </Text>
                  </Box>
                </InlineStack>
              </Box>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              {sortedProducts.length === 0 ? (
                <Box padding="400">
                  <Text tone="subdued" alignment="center">
                    No products yet. Click “New product” to add one.
                  </Text>
                </Box>
              ) : (
                <IndexTable
                  resourceName={resourceName}
                  itemCount={sortedProducts.length}
                  selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                  }
                  selectedItems={selectedResources}
                  allResourcesSelected={allResourcesSelected}
                  onSelectionChange={handleSelectionChange}
                  bulkActions={[
                    {
                      content: "Delete selected",
                      tone: "critical",
                      onAction: handleBulkDelete,
                      disabled: bulkDeleteDisabled,
                      loading: isBulkDeleting,
                    },
                  ]}
                  headings={[
                    { title: "Name" },
                    { title: "SKU" },
                    { title: "On hand" },
                    { title: "Reorder point" },
                    { title: "Actions" },
                  ]}
                >
                  {sortedProducts.map((product, index) => {
                    const isLowStock =
                      product.on_hand <= product.reorder_point;
                    return (
                      <IndexTable.Row
                        id={String(product.id)}
                        key={product.id}
                        position={index}
                        selected={selectedResources.includes(
                          String(product.id),
                        )}
                      >
                        <IndexTable.Cell>
                          <Text variant="bodyMd" as="span">
                            {product.name}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>{product.sku}</IndexTable.Cell>
                        <IndexTable.Cell>
                          <Badge tone={isLowStock ? "critical" : "success"}>
                            {product.on_hand}
                          </Badge>
                        </IndexTable.Cell>
                        <IndexTable.Cell>{product.reorder_point}</IndexTable.Cell>
                        <IndexTable.Cell>
                          <InlineStack gap="200">
                            <Button
                              size="slim"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenEdit(product);
                                handleSelectionChange(String(product.id), false);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="slim"
                              tone="critical"
                              onClick={async (event) => {
                                event.stopPropagation();
                                await handleDelete(product);
                              }}
                              loading={deletingId === product.id}
                              disabled={deletingId === product.id}
                            >
                              Delete
                            </Button>
                          </InlineStack>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    );
                  })}
                </IndexTable>
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}
