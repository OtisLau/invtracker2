import { useEffect, useMemo, useState } from "react";

import {
  castProductAttributes,
  getCsrfToken,
} from "../utils/products.js";

// central brain for the dashboard 
export function useProductManager(initialProducts) {
  // stash products locally and clean them up right away
  const [products, setProducts] = useState(
    initialProducts.map(castProductAttributes),
  );
  // status drives the banner message
  const [status, setStatus] = useState(null);
  // modal bits live here so i can open/close from anywhere
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [formValues, setFormValues] = useState({
    name: "",
    sku: "",
    reorder_point: "0",
    on_hand: "0",
    max: "0",
  });
  // tracking saving/deleting/editing lets me lock the ui when it matters
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // csrf token once no need to recalc every render
  const csrfToken = useMemo(() => getCsrfToken(), []);

  useEffect(() => {
    if (!status) return;

    // auto clear banner after 
    const timeoutId = setTimeout(() => setStatus(null), 3000);
    return () => clearTimeout(timeoutId);
  }, [status]);

  // keep low stock count ready so summary renders instantly
  const lowStockCount = useMemo(
    () =>
      products.filter(
        (product) => product.on_hand <= product.reorder_point,
      ).length,
    [products],
  );

  // sort products by name because i like predictable ordering
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
    setEditingProduct(null);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    resetForm();
    setEditingProduct(null);
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
    setEditingProduct(product);
    setModalOpen(true);
  };

  // replace existing product or add new one
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

  // handles both create and update since payload is the same
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
          modalMode === "create"
            ? "Product created successfully."
            : "Product updated.",
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

  // single delete from the modal, uses confirm so i don't fat finger it
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
      closeModal();
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

  // bulk delete runs from the table and gives me a boolean to reset selection
  const handleBulkDelete = async ({ selectedIds, allSelected }) => {
    const selectedCount = allSelected
      ? sortedProducts.length
      : selectedIds.length;

    if (selectedCount === 0) return false;

    const confirmDelete = window.confirm(
      selectedCount === 1
        ? "Delete the selected product?"
        : `Delete ${selectedCount} products? This cannot be undone.`,
    );

    if (!confirmDelete) return false;

    setStatus(null);
    setDeletingId("bulk");

    try {
      const idsToDelete = allSelected
        ? sortedProducts.map((product) => String(product.id))
        : selectedIds;

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

      setStatus({ tone: "success", message: "Selected products deleted." });
      return true;
    } catch (error) {
      console.error("Bulk delete failed:", error);
      setStatus({
        tone: "critical",
        message: error.message || "Unable to delete the selected products.",
      });
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // expose everything the dashboard/components need to stay synced
  return {
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
  };
}
