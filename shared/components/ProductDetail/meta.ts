/**
 * Component metadata for ProductDetail
 *
 * Used by the component registry to understand component capabilities
 * and configuration options.
 */
export const ProductDetailMeta = {
  name: 'ProductDetail',
  description: 'Displays comprehensive product information including image, title, pricing, category, and description',
  category: 'product',
  version: '1.0.0',

  /**
   * Props that can be configured through the Theme Builder
   * Runtime props (product, shopId) are injected by DynamicComponentRenderer
   */
  configurableProps: [],

  /**
   * Runtime props injected by the page loader
   */
  runtimeProps: ['product', 'shopId'],

  /**
   * Component variants (none for MVP)
   */
  variants: [],
};
