// Type definitions for shop and page data

/**
 * Custom view model that aggregates data from multiple API endpoints
 */
export interface ShopPageLoaderData {
  shopId: string;
  page: PageLayoutData;
  theme: ThemeSettings;
}

/**
 * Page layout structure returned from API
 */
export interface PageLayoutData {
  type: string;
  layout: {
    components: ComponentConfig[];
  };
}

/**
 * Generic structure for a single component's configuration
 */
export interface ComponentConfig {
  id: string;
  type: string;
  variant: string;
  props: Record<string, any>;
}

/**
 * Global theme configuration applied across all components
 */
export interface ThemeSettings {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
}

/**
 * Component registry type - maps component type strings to React components
 */
export type ComponentRegistry = Record<string, React.ComponentType<any>>;
