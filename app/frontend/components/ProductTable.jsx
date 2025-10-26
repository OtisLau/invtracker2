import {
  Badge,
  Box,
  Button,
  Card,
  IndexTable,
  Text,
  useIndexResourceState,
} from "@shopify/polaris";

import StockLevelBar from "./StockLevelBar.jsx";

// keeping resourceName local so it's easy to tweak if copy changes
const resourceName = {
  singular: "product",
  plural: "products",
};

// table owns selection, bulk actions, and edit buttons so the parent stays calm
export default function ProductTable({
  products,
  deletingId,
  onEdit,
  onBulkDelete,
}) {
  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
  } = useIndexResourceState(products, {
    // force ids into strings so the index table doesn't get confused
    resourceIDResolver: (product) => String(product.id),
  });

  const selectedCount =
    allResourcesSelected && products.length > 0
      ? products.length
      : selectedResources.length;

  const isBulkDeleting = deletingId === "bulk";
  const bulkDeleteDisabled = selectedCount === 0 || isBulkDeleting;

  // let the parent do the deleting, i just trigger it and clear selection
  const handleBulkDeleteClick = async () => {
    if (bulkDeleteDisabled) return;

    const success = await onBulkDelete({
      selectedIds: selectedResources,
      allSelected: allResourcesSelected,
    });

    if (success) {
      handleSelectionChange("all", false);
    }
  };

  return (
    <Card>
      {products.length === 0 ? (
        <Box padding="400">
          <Text tone="subdued" alignment="center">
            No products yet. Click “New product” to add one.
          </Text>
        </Box>
      ) : (
        <IndexTable
          resourceName={resourceName}
          itemCount={products.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          selectedItems={selectedResources}
          allResourcesSelected={allResourcesSelected}
          onSelectionChange={handleSelectionChange}
          bulkActions={[
            {
              // delete selected stays locked until something is actually chosen
              content: "Delete selected",
              tone: "critical",
              onAction: handleBulkDeleteClick,
              disabled: bulkDeleteDisabled,
              loading: isBulkDeleting,
            },
          ]}
          headings={[
            { title: "Name" },
            { title: "SKU" },
            { title: "On hand" },
            { title: "Reorder point" },
            { title: "Stock level" },
            { title: "Actions" },
          ]}
        >
          {products.map((product, index) => {
            const isLowStock = product.on_hand <= product.reorder_point;
            const cellPadding = "300";
            return (
              <IndexTable.Row
                id={String(product.id)}
                key={product.id}
                position={index}
                selected={selectedResources.includes(String(product.id))}
              >
                <IndexTable.Cell>
                  <Box paddingBlock={cellPadding}>
                    <Text variant="bodyMd" as="span">
                      {product.name}
                    </Text>
                  </Box>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Box paddingBlock={cellPadding}>{product.sku}</Box>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Box paddingBlock={cellPadding}>
                    <Badge tone={isLowStock ? "critical" : "success"}>
                      {product.on_hand}
                    </Badge>
                  </Box>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Box paddingBlock={cellPadding}>{product.reorder_point}</Box>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Box paddingBlock={cellPadding}>
                    <StockLevelBar
                      onHand={product.on_hand}
                      reorderPoint={product.reorder_point}
                      max={product.max}
                    />
                  </Box>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Box paddingBlock={cellPadding}>
                    <Button
                      size="slim"
                      onClick={(event) => {
                        event.stopPropagation();
                        // clearing selection so edit flow doesn't leave lingering checks
                        onEdit(product);
                        handleSelectionChange(String(product.id), false);
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </IndexTable.Cell>
              </IndexTable.Row>
            );
          })}
        </IndexTable>
      )}
    </Card>
  );
}
