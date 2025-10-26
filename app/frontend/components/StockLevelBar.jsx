import { Box, InlineStack, ProgressBar, Text } from "@shopify/polaris";

const numberFormatter = new Intl.NumberFormat();

const formatNumber = (value) => numberFormatter.format(value);

export default function StockLevelBar({ onHand = 0, reorderPoint = 0, max = 0 }) {
  // Clamp everything up front so an odd payload never wrecks the chart.
  const safeOnHand = Math.max(Number(onHand) || 0, 0);
  const safeReorder = Math.max(Number(reorderPoint) || 0, 0);
  const safeMax = Math.max(Number(max) || 0, 0);

  // Max is required, but still guard so we never divide by zero.
  const scaleMax = Math.max(safeMax, 1);

  // Translate raw counts into percentages for the bar and markers.
  const onHandPercent = Math.min((safeOnHand / scaleMax) * 100, 100);
  const hasReorderPoint = safeReorder > 0;
  const reorderPercent = hasReorderPoint
    ? Math.min((safeReorder / scaleMax) * 100, 100)
    : null;

  // Low stock lights the bar red, over max shows the warning below.
  const isLowStock = hasReorderPoint && safeOnHand <= safeReorder;
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
  if (hasReorderPoint) {
    ariaLabelParts.push(`Reorder at ${formatted.reorder}.`);
  }
  if (isOverCapacity) {
    ariaLabelParts.push(`Over capacity by ${formatted.overBy}.`);
  }
  const ariaLabel = ariaLabelParts.join(" ");

  const reorderMarkerStyle =
    reorderPercent === null
      ? undefined
      : {
          position: "absolute",
          left: `${reorderPercent}%`,
          top: 0,
          bottom: 0,
          width: "1.5px",
          backgroundColor:
            "var(--p-color-border-subdued, rgba(0, 0, 0, 0.5))",
          transform: "translateX(-0.5px)",
          pointerEvents: "none",
        };

  // Keep the label readable when the progress nears either edge.
  const horizontalTransform =
    onHandPercent <= 5
      ? "translate(0, -50%)"
      : onHandPercent >= 95
      ? "translate(-100%, -50%)"
      : "translate(-50%, -50%)";

  const onHandLabelStyle = {
    position: "absolute",
    left: `${onHandPercent}%`,
    top: "50%",
    transform: horizontalTransform,
    paddingInline: "8px",
    paddingBlock: "2px",
    backgroundColor: "var(--p-color-bg-surface, #fff)",
    borderRadius: "999px",
    border:
      "1px solid var(--p-color-border-subdued, rgba(0, 0, 0, 0.2))",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    zIndex: 1,
  };

  return (
    <Box width="100%">
      <Box position="relative" paddingInlineStart="150" paddingInlineEnd="150">
        <ProgressBar
          progress={onHandPercent}
          size="medium"
          tone={isLowStock ? "critical" : "success"}
          label={ariaLabel}
          labelHidden
        />
        {reorderMarkerStyle ? (
          <Box as="span" aria-hidden="true" style={reorderMarkerStyle} />
        ) : null}
        <Box as="span" aria-hidden="true" style={onHandLabelStyle}>
          <Text variant="bodyXs" fontWeight="semibold" as="span">
            {formatted.onHand}
          </Text>
        </Box>
      </Box>

      <Box
        paddingBlockStart="100"
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
