import { z } from 'zod';

// Union type for page types
export type PageType = 'home' | 'catalog' | 'product' | 'contact';

// Zod schema for ComponentDefinition
export const ComponentDefinitionSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  variant: z.string().min(1),
  props: z.record(z.string(), z.unknown()),
});

// Component definition in layout array
export interface ComponentDefinition {
  id: string; // UUID v4
  type: string; // e.g., "hero", "text-section", "featured-products"
  variant: string; // e.g., "with-image", "grid-3", "2-column"
  props: Record<string, unknown>; // Component-specific props object
}

// Zod schema for PageData
export const PageDataSchema = z.object({
  type: z.enum(['home', 'catalog', 'product', 'contact']),
  layout: z.array(ComponentDefinitionSchema),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

// Response from GET /api/pages/{type}
// Also response from PUT and POST operations
export interface PageData {
  type: PageType;
  layout: ComponentDefinition[];
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

// Zod schema for PagesResponse
export const PagesResponseSchema = z.object({
  pages: z.array(PageDataSchema),
});

// Response from GET /api/pages
export interface PagesResponse {
  pages: PageData[];
}

// Request body for PUT /api/pages/{type}
export interface UpdatePageLayoutRequest {
  layout: ComponentDefinition[];
}
