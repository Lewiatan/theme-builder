import { lazy } from 'react';
import type { ComponentRegistry, ComponentCategory } from '../types/workspace';

// Import metadata from shared components
import { meta as headingMeta } from '@shared/components/Heading/meta';
import { meta as textSectionMeta } from '@shared/components/TextSection/meta';
import { meta as headerNavigationMeta } from '@shared/components/HeaderNavigation/meta';
import { meta as categoryPillsMeta } from '@shared/components/CategoryPills/meta';
import { meta as productListGridMeta } from '@shared/components/ProductListGrid/meta';

// Lazy load shared components
const Heading = lazy(() => import('@shared/components/Heading'));
const TextSection = lazy(() => import('@shared/components/TextSection'));
const HeaderNavigation = lazy(() => import('@shared/components/HeaderNavigation'));
const CategoryPills = lazy(() => import('@shared/components/CategoryPills'));
const ProductListGrid = lazy(() => import('@shared/components/ProductListGrid'));

/**
 * Component Registry
 *
 * Maps component type identifiers to their metadata and React components.
 * This registry is used throughout the workspace to:
 * - Render components in the library sidebar
 * - Display components on the canvas
 * - Apply default settings when adding new components
 */
export const componentRegistry: ComponentRegistry = {
  'Heading': {
    meta: {
      id: 'Heading',
      name: headingMeta.displayName,
      description: headingMeta.description,
      icon: 'Heading',
      category: 'Content' as ComponentCategory,
      variants: headingMeta.variants.map((v) => ({
        id: v.value,
        name: v.label,
        description: v.description,
      })),
      propsSchema: null as any, // Will be set when component validates its own props
    },
    Component: Heading,
    category: 'Content' as ComponentCategory,
    defaultProps: headingMeta.defaultConfig || {
      text: 'Heading Text',
      level: 'h2',
      variant: 'text-only',
    },
  },
  'TextSection': {
    meta: {
      id: 'TextSection',
      name: textSectionMeta.displayName,
      description: textSectionMeta.description,
      icon: 'FileText',
      category: 'Content' as ComponentCategory,
      variants: textSectionMeta.variants.map((v) => ({
        id: v.value,
        name: v.label,
        description: v.description,
      })),
      propsSchema: null as any,
    },
    Component: TextSection,
    category: 'Content' as ComponentCategory,
    defaultProps: textSectionMeta.defaultConfig || {
      content: 'Text content',
      variant: '1-column',
    },
  },
  'HeaderNavigation': {
    meta: {
      id: 'HeaderNavigation',
      name: headerNavigationMeta.displayName,
      description: headerNavigationMeta.description,
      icon: 'Menu',
      category: 'Navigation' as ComponentCategory,
      variants: headerNavigationMeta.variants.map((v) => ({
        id: v.value,
        name: v.label,
        description: v.description,
      })),
      propsSchema: null as any,
    },
    Component: HeaderNavigation,
    category: 'Navigation' as ComponentCategory,
    defaultProps: headerNavigationMeta.defaultConfig || {
      variant: 'default',
    },
  },
  'CategoryPills': {
    meta: {
      id: 'CategoryPills',
      name: categoryPillsMeta.displayName,
      description: categoryPillsMeta.description,
      icon: 'Tags',
      category: 'Navigation' as ComponentCategory,
      variants: categoryPillsMeta.variants.map((v) => ({
        id: v.value,
        name: v.label,
        description: v.description,
      })),
      propsSchema: null as any,
    },
    Component: CategoryPills,
    category: 'Navigation' as ComponentCategory,
    defaultProps: {
      ...(categoryPillsMeta.defaultConfig || {}),
      categories: [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Clothing' },
        { id: 3, name: 'Home & Garden' },
        { id: 4, name: 'Sports' },
      ],
      selectedCategoryId: null,
      onCategorySelect: () => {}, // No-op function for editor
      isLoading: false,
      error: null,
    },
  },
  'ProductListGrid': {
    meta: {
      id: 'ProductListGrid',
      name: productListGridMeta.displayName,
      description: productListGridMeta.description,
      icon: 'LayoutGrid',
      category: 'Products' as ComponentCategory,
      variants: productListGridMeta.variants.map((v) => ({
        id: v.value,
        name: v.label,
        description: v.description,
      })),
      propsSchema: null as any,
    },
    Component: ProductListGrid,
    category: 'Products' as ComponentCategory,
    defaultProps: {
      ...(productListGridMeta.defaultConfig || {}),
      products: [
        {
          id: 1,
          categoryId: 1,
          name: 'Sample Product 1',
          description: 'This is a sample product description',
          price: 2999, // $29.99
          salePrice: null,
          imageThumbnail: 'https://via.placeholder.com/150',
          imageMedium: 'https://via.placeholder.com/300',
          imageLarge: 'https://via.placeholder.com/600',
        },
        {
          id: 2,
          categoryId: 1,
          name: 'Sample Product 2',
          description: 'Another sample product',
          price: 4999, // $49.99
          salePrice: 3999, // $39.99
          imageThumbnail: 'https://via.placeholder.com/150',
          imageMedium: 'https://via.placeholder.com/300',
          imageLarge: 'https://via.placeholder.com/600',
        },
        {
          id: 3,
          categoryId: 2,
          name: 'Sample Product 3',
          description: 'Yet another sample product',
          price: 1999, // $19.99
          salePrice: null,
          imageThumbnail: 'https://via.placeholder.com/150',
          imageMedium: 'https://via.placeholder.com/300',
          imageLarge: 'https://via.placeholder.com/600',
        },
      ],
      isLoading: false,
      error: null,
    },
  },
};

/**
 * Component categories for organizing the library sidebar
 */
export const componentCategories: ComponentCategory[] = [
  'Content',
  'Navigation',
  'Products',
  'Forms',
  'Media',
];

/**
 * Get component entry by type
 */
export function getComponentByType(type: string) {
  return componentRegistry[type];
}

/**
 * Get all components in a specific category
 */
export function getComponentsByCategory(category: ComponentCategory) {
  return Object.entries(componentRegistry)
    .filter(([, entry]) => entry.category === category)
    .map(([type, entry]) => ({ type, ...entry }));
}

/**
 * Check if component type exists in registry
 */
export function isValidComponentType(type: string): boolean {
  return type in componentRegistry;
}
