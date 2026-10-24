export type ProductVisibilityFields = {
  stock: number | string | null
  is_active?: boolean | null
  is_available?: boolean | null
}

/** Keep public catalogue visibility consistent across search and WebStore routes. */
export function isProductPubliclyAvailable(product: ProductVisibilityFields): boolean {
  const stock = Number(product.stock)
  return product.is_active !== false
    && product.is_available !== false
    && Number.isFinite(stock)
    && stock > 0
}
