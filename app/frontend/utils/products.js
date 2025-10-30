export function loadProducts() {
  try {
    const el = document.getElementById("bootstrap-products");
    return el ? JSON.parse(el.textContent) : [];
  } catch (error) {
    console.error("Failed to parse bootstrap products JSON:", error);
    return [];
  }
}

export function getCsrfToken() { // this is the csrf token that we need to stop cross site request forgery
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute("content") : "";
}

export function castProductAttributes(product) {
  return {
    ...product,
    on_hand: Number(product.on_hand ?? 0),
    reorder_point: Number(product.reorder_point ?? 0),
    max: Number(product.max ?? 0),
  };
}
