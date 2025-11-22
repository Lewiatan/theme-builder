/**
 * Unified Component Registry Configuration
 *
 * Central configuration for all shared components used in the demo shop.
 * This is the single source of truth for component registration.
 *
 * When adding a new component:
 * 1. Import the component and its props schema from @shared/components
 * 2. Add a new entry to componentRegistryConfig with both the component and schema
 * 3. The componentRegistry and schemaRegistry will be automatically derived
 *
 * This ensures component definitions and validations stay in sync.
 */

import { HeaderNavigation, HeaderNavigationPropsSchema } from '@shared/components/HeaderNavigation';
import { Heading, HeadingPropsSchema } from '@shared/components/Heading';
import { TextSection, TextSectionPropsSchema } from '@shared/components/TextSection';
import CategoryPillsContainer from '~/containers/CategoryPillsContainer';
import { CategoryPillsPropsSchema } from '@shared/components/CategoryPills';
import ProductListGridContainer from '~/containers/ProductListGridContainer';
import { ProductListGridPropsSchema } from '@shared/components/ProductListGrid';
import type React from 'react';

/**
 * Component registry entry structure
 */
interface ComponentRegistryEntry {
  component: React.ComponentType<any>;
  schema: any;
}

/**
 * Main component registry configuration
 * Maps component type identifiers to their React component and Zod schema
 */
const componentRegistryConfig: Record<string, ComponentRegistryEntry> = {
  HeaderNavigation: {
    component: HeaderNavigation,
    schema: HeaderNavigationPropsSchema,
  },
  Heading: {
    component: Heading,
    schema: HeadingPropsSchema,
  },
  TextSection: {
    component: TextSection,
    schema: TextSectionPropsSchema,
  },
  CategoryPills: {
    component: CategoryPillsContainer,
    schema: CategoryPillsPropsSchema,
  },
  ProductListGrid: {
    component: ProductListGridContainer,
    schema: ProductListGridPropsSchema,
  },
};

/**
 * Component registry - maps component type strings to React components
 * Automatically derived from componentRegistryConfig
 */
export const componentRegistry: Record<string, React.ComponentType<any>> = Object.fromEntries(
  Object.entries(componentRegistryConfig).map(([key, value]) => [key, value.component])
);

/**
 * Schema registry - maps component type strings to Zod validation schemas
 * Automatically derived from componentRegistryConfig
 */
export const schemaRegistry: Record<string, any> = Object.fromEntries(
  Object.entries(componentRegistryConfig).map(([key, value]) => [key, value.schema])
);

/**
 * Checks if a component type exists in the registry
 * @param type - Component type identifier
 * @returns True if component type is registered
 */
export function isValidComponentType(type: string): boolean {
  return type in componentRegistry;
}

/**
 * Gets a component from the registry by type
 * @param type - Component type identifier
 * @returns React component or undefined if not found
 */
export function getComponent(type: string): React.ComponentType<any> | undefined {
  return componentRegistry[type];
}

/**
 * Type guard to check if a component type has a validation schema
 * @param type - Component type identifier
 * @returns True if schema exists for the component type
 */
export function hasValidationSchema(type: string): boolean {
  return type in schemaRegistry;
}

/**
 * Gets the validation schema for a component type
 * @param type - Component type identifier
 * @returns Zod schema or undefined if not found
 */
export function getValidationSchema(type: string): any {
  return schemaRegistry[type];
}
