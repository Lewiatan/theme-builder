/**
 * DynamicComponentRenderer
 * Renders components dynamically based on layout configuration from API
 */

import { Fragment } from 'react';
import type { PageLayoutData, ThemeSettings, ComponentConfig } from '~/types/shop';
import { componentRegistry, schemaRegistry, isValidComponentType } from '../../component-registry.config';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';

interface DynamicComponentRendererProps {
  layout: PageLayoutData;
  themeSettings: ThemeSettings;
  runtimeProps?: Record<string, any>;
}

/**
 * Provides default runtime data for container components that fetch data
 * These components need data arrays and callbacks that aren't stored in the database
 */
function getDefaultRuntimeProps(type: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    CategoryPills: {
      categories: [],
      selectedCategoryId: null,
      onCategorySelect: () => {},
      isLoading: false,
      error: null,
    },
    ProductListGrid: {
      products: [],
      isLoading: false,
      error: null,
      onRetry: () => {},
    },
  };

  return defaults[type] || { isLoading: false, error: null };
}

/**
 * Validates component props against its Zod schema
 * @param type - Component type identifier
 * @param props - Props to validate (without isLoading and error)
 * @returns Validation result with success flag and validated data or error
 */
function validateComponentProps(type: string, props: Record<string, any>) {
  const schema = schemaRegistry[type];

  if (!schema) {
    return {
      success: false,
      error: new Error(`No schema found for component type: ${type}`),
    };
  }

  // Get default runtime props for this component type
  const defaultRuntimeProps = getDefaultRuntimeProps(type);

  // Merge props: defaults < stored props < runtime overrides
  const propsWithRuntimeFields = {
    ...defaultRuntimeProps,
    ...props,
  };

  try {
    const validatedData = schema.parse(propsWithRuntimeFields);
    return { success: true, data: validatedData };
  } catch (error) {
    console.error(`Validation failed for ${type}:`, error);
    return { success: false, error: error as Error };
  }
}

/**
 * Renders a single component from the registry
 * @param config - Component configuration from layout
 * @param index - Component index for key prop
 * @param runtimeProps - Runtime props to merge with component's props
 * @returns React element or error placeholder
 */
function renderComponent(config: ComponentConfig, index: number, runtimeProps?: Record<string, any>) {
  const { id, type, props } = config;

  // Merge runtime props with component's props
  const mergedProps = { ...props, ...runtimeProps };

  // Check if component type exists in registry
  if (!isValidComponentType(type)) {
    console.warn(`Unknown component type: ${type}`);
    return (
      <Alert key={id || `unknown-${index}`} variant="destructive" className="my-4">
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
          Component type "{type}" is not registered. Please check your page configuration.
        </AlertDescription>
      </Alert>
    );
  }

  // Validate component props
  const validation = validateComponentProps(type, mergedProps);

  if (!validation.success) {
    console.error(`Component validation failed for ${type}:`, validation.error);
    return (
      <Alert key={id || `error-${index}`} variant="destructive" className="my-4">
        <AlertTitle>Invalid Component Configuration</AlertTitle>
        <AlertDescription>
          The {type} component has invalid configuration.
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-2 text-xs overflow-auto">
              {validation.error?.message}
            </pre>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Get component from registry
  const Component = componentRegistry[type];

  // Render component with validated props
  return <Component key={id || `component-${index}`} {...validation.data} />;
}

/**
 * DynamicComponentRenderer Component
 * Iterates through layout configuration and renders each component
 */
export default function DynamicComponentRenderer({
  layout,
  themeSettings,
  runtimeProps,
}: DynamicComponentRendererProps) {
  // Validate layout structure
  if (!layout.layout?.components || !Array.isArray(layout.layout.components)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>No Content Configured</AlertTitle>
          <AlertDescription>
            This page doesn't have any components configured yet. Please add components in the Theme Builder.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { components } = layout.layout;

  // Handle empty layout
  if (components.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Alert className="max-w-md">
          <AlertTitle>Empty Page</AlertTitle>
          <AlertDescription>
            This page is empty. Add components in the Theme Builder to get started.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render all components
  return (
    <Fragment>
      {components.map((component, index) => renderComponent(component, index, runtimeProps))}
    </Fragment>
  );
}
