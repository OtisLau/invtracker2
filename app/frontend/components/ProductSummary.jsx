import {
  Box,
  Card,
  InlineStack,
  Text,
} from "@shopify/polaris";

// little stats card so i can eyeball totals without digging
export default function ProductSummary({ totalCount, lowStockCount }) {
  return (
    <Card>
      <Box padding="400" background="bg-surface-subdued">
        {/* two quick numbers next to each other keeps it easy to scan */}
        <InlineStack gap="400">
          <Box>
            <Text variant="headingLg" as="p">
              {totalCount}
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
  );
}
