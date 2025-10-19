import { Box, InlineStack, ProgressBar, Text } from "@shopify/polaris";

const numberFormatter = new Intl.NumberFormat();

const formatNumber = (value) => numberFormatter.format(value);

export default function StockLevelBar({ onHand = 0, reorderPoint = 0, max = 0 }) {
  // Clamp everything up front so a weird payload never wrecks the chart.
  const safeOnHand = Math.max(Number(onHand) || 0, 0);
  const safeReorder = Math.max(Number(reorderPoint) || 0, 0);
  const safeMax = Math.max(Number(max) || 0, 0);

  // Max is required, but I still guard so we never divide by zero.
  const scaleMax = Math.max(safeMax, 1);

  // Translate the raw counts into percentages for the bar/markers.
  const onHandPercent = Math.min((safeOnHand / scaleMax) * 100, 100);
  const reorderPercent =
    safeReorder > 0 ? Math.min((safeReorder / scaleMax) * 100, 100) : null;

  // Low stock lights the bar red, over max shows the warning below.
  const isLowStock = safeReorder > 0 && safeOnHand < safeReorder;
  const isOverCapacity = safeOnHand > safeMax;

  // These formatted strings get reused in a few spots.
  const formatted = {
    onHand: formatNumber(safeOnHand),
    reorder: formatNumber(safeReorder),
    scaleMax: formatNumber(scaleMax),
    maxLabel: formatNumber(safeMax),
    overBy: formatNumber(Math.max(safeOnHand - safeMax, 0)),
  };

  // Screen reader text spells out the same story the visuals tell.
  const ariaLabelParts = [
    `On hand ${formatted.onHand} of max ${formatted.scaleMax}.`,
  ];
  if (safeReorder > 0) {
    ariaLabelParts.push(`Reorder at ${formatted.reorder}.`);
  }
  if (isOverCapacity) {
    ariaLabelParts.push(`Over capacity by ${formatted.overBy}.`);
  }
  const ariaLabel = ariaLabelParts.join(" ");

  const leftHeader =
    safeReorder > 0 ? `Reorder at ${formatted.reorder}` : `Max ${formatted.maxLabel}`;
  const rightHeader = `On hand ${formatted.onHand}`;

  const reorderMarkerStyle =
    reorderPercent === null
      ? undefined
      : {
          position: "absolute",
          left: `${reorderPercent}%`,
          top: 0,
          bottom: 0,
          width: "2px",
          backgroundColor:
            "var(--p-color-border-subdued, rgba(0, 0, 0, 0.5))",
          transform: "translateX(-0.5px)",
          pointerEvents: "none",
        };

  const onHandMarkerStyle = {
    position: "absolute",
    left: `${onHandPercent}%`,
    transform: "translateX(-50%)",
    top: "-1.5rem",
  };

  return (
    <Box width="100%">
      {/* Headline numbers keep the row scannable without opening the detail view */}
      <InlineStack
        align="space-between"
        blockAlign="center"
        marginBlockEnd="100"
      >
        <Text tone="subdued" variant="bodySm" as="span">
          {leftHeader}
        </Text>
        <Text variant="bodySm" as="span">
          {rightHeader}
        </Text>
      </InlineStack>

      <Box position="relative" paddingInlineStart="150" paddingInlineEnd="150">
        <ProgressBar
          progress={onHandPercent}
          size="large"
          tone={isLowStock ? "critical" : "success"}
          label={ariaLabel}
          labelHidden
        />
        {reorderMarkerStyle ? (
          <Box as="span" aria-hidden="true" style={reorderMarkerStyle} />
        ) : null}
      </Box>

      <Box
        marginBlockStart="100"
        position="relative"
        paddingInlineStart="150"
        paddingInlineEnd="150"
      >
        <InlineStack align="space-between" blockAlign="center">
          <Text tone="subdued" variant="bodyXs" as="span">
            0
          </Text>
          <Text tone="subdued" variant="bodyXs" as="span">
            {formatted.scaleMax}
          </Text>
        </InlineStack>
   
      </Box>

      {isOverCapacity ? (
        <Text tone="critical" variant="bodyXs" as="p">
          Over max by {formatted.overBy}
        </Text>
      ) : null}
    </Box>
  );
}
