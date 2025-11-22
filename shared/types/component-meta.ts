/**
 * Shared type definitions for component metadata
 * Used by the Theme Builder to configure component properties
 */

/**
 * Field types supported by the Theme Builder
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'url'
  | 'color'
  | 'select'
  | 'repeater';

/**
 * Option for select fields
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Visibility condition for conditional fields
 */
export interface VisibilityCondition {
  [fieldName: string]: string | string[];
}

/**
 * Base field configuration
 */
interface BaseField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  visibleWhen?: VisibilityCondition;
}

/**
 * Text field configuration
 */
export interface TextField extends BaseField {
  type: 'text';
  maxLength?: number;
  default?: string;
}

/**
 * Textarea field configuration
 */
export interface TextareaField extends BaseField {
  type: 'textarea';
  maxLength?: number;
  default?: string;
}

/**
 * Number field configuration
 */
export interface NumberField extends BaseField {
  type: 'number';
  min?: number;
  max?: number;
  default?: number;
}

/**
 * URL field configuration
 */
export interface UrlField extends BaseField {
  type: 'url';
  default?: string;
}

/**
 * Color field configuration
 */
export interface ColorField extends BaseField {
  type: 'color';
  default?: string;
}

/**
 * Select field configuration
 */
export interface SelectField extends BaseField {
  type: 'select';
  options: SelectOption[];
  default?: string;
}

/**
 * Repeater field configuration (array of sub-fields)
 */
export interface RepeaterField extends BaseField {
  type: 'repeater';
  minItems?: number;
  maxItems?: number;
  fields: EditableField[];
}

/**
 * Union type for all field configurations
 */
export type EditableField =
  | TextField
  | TextareaField
  | NumberField
  | UrlField
  | ColorField
  | SelectField
  | RepeaterField;

/**
 * Variant definition for a component
 */
export interface ComponentVariant {
  value: string;
  label: string;
  description: string;
}

/**
 * Component metadata structure
 */
export interface ComponentMeta<TDefaultConfig = unknown> {
  /** Display name shown in the Theme Builder */
  displayName: string;
  /** Brief description of the component's purpose */
  description: string;
  /** Fields that can be edited in the Theme Builder */
  editableFields: EditableField[];
  /** Available visual variants for the component */
  variants: ComponentVariant[];
  /** Default variant when component is added */
  defaultVariant: string;
  /** Optional default configuration for new instances */
  defaultConfig?: TDefaultConfig;
}
