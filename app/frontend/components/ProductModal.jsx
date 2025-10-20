import {
  Button,
  FormLayout,
  Modal,
  TextField,
} from "@shopify/polaris";

// this is the modal for creating and editing products
export default function ProductModal({
  open,
  mode,
  formValues,
  onFormChange,
  onSubmit,
  saving,
  onClose,
  onDelete,
  editingProduct,
  deletingId,
}) {
  // title swaps depending on if i'm editing or creating
  const modalTitle = mode === "create" ? "Create product" : "Edit product";
  const deleteLoading = Boolean(
    editingProduct && deletingId === editingProduct.id,
  );
  // no rogue deletes if we're missing the product or mid request
  const deleteDisabled = !editingProduct || deleteLoading;

  // keep cancel wired into the modal footer props
  const secondaryActions = [
    {
      content: "Cancel",
      onAction: onClose,
    },
  ];

  // delete button hangs out on the left via the custom footer
  const footer =
    mode === "edit"
      ? (
          <Button
            tone="critical"
            variant="primary"
            onClick={async () => {
              if (!editingProduct) return;
              await onDelete(editingProduct);
            }}
            loading={deleteLoading}
            disabled={deleteDisabled}
          >
            Delete
          </Button>
        )
      : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      primaryAction={{
        content: mode === "create" ? "Create" : "Save",
        onAction: onSubmit,
        loading: saving,
        disabled: saving,
      }}
      secondaryActions={secondaryActions}
      footer={footer}
    >
      <Modal.Section>
        {/* form stays tiny so fields map straight to formValues */}
        <FormLayout>
          <TextField
            label="Name"
            value={formValues.name}
            onChange={(value) => onFormChange("name", value)}
            autoComplete="off"
            requiredIndicator
          />
          <TextField
            label="SKU"
            value={formValues.sku}
            onChange={(value) => onFormChange("sku", value)}
            autoComplete="off"
            requiredIndicator
          />
          <FormLayout.Group condensed>
            <TextField
              label="Reorder point"
              type="number"
              value={formValues.reorder_point}
              onChange={(value) => onFormChange("reorder_point", value)}
              autoComplete="off"
              min={0}
            />
            <TextField
              label="On hand"
              type="number"
              value={formValues.on_hand}
              onChange={(value) => onFormChange("on_hand", value)}
              autoComplete="off"
              min={0}
            />
            <TextField
              label="Max"
              type="number"
              value={formValues.max}
              onChange={(value) => onFormChange("max", value)}
              autoComplete="off"
              min={0}
            />
          </FormLayout.Group>
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}
