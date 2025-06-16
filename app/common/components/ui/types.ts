import React from 'react';
import type { ReactNode, HTMLAttributes, ElementType } from 'react';

// =============================================================================
// BREAKPOINT & RESPONSIVE TYPES
// =============================================================================

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

export interface BreakpointConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// =============================================================================
// SPACING & SIZING TYPES (Updated to match implementations)
// =============================================================================

export type SpacingScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GapScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PaddingScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type MarginScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type MaxWidthScale =
  | 'none'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | 'full';
export type MinHeightScale =
  | 'none'
  | 'screen'
  | 'full'
  | 'quarter'
  | 'half'
  | '96'
  | '80'
  | '64'
  | '48'
  | '32'
  | '24'
  | '16';

// =============================================================================
// WCAG 2.1 ACCESSIBILITY TYPES
// =============================================================================

export interface AriaAttributes {
  // Widget Attributes
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
  'aria-checked'?: boolean | 'mixed';
  'aria-disabled'?: boolean;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-hidden'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-level'?: number;
  'aria-multiline'?: boolean;
  'aria-multiselectable'?: boolean;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-pressed'?: boolean | 'mixed';
  'aria-readonly'?: boolean;
  'aria-required'?: boolean;
  'aria-selected'?: boolean;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;

  // Live Region Attributes
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';

  // Drag-and-Drop Attributes
  'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
  'aria-grabbed'?: boolean;

  // Relationship Attributes
  'aria-activedescendant'?: string;
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colspan'?: number;
  'aria-controls'?: string;
  'aria-describedby'?: string;
  'aria-details'?: string;
  'aria-errormessage'?: string;
  'aria-flowto'?: string;
  'aria-owns'?: string;
  'aria-posinset'?: number;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowspan'?: number;
  'aria-setsize'?: number;
}

export interface AccessibilityProps extends AriaAttributes {
  role?: string;
  tabIndex?: number;
  id?: string;
}

// =============================================================================
// LAYOUT & FLEXBOX TYPES (Updated to match implementations)
// =============================================================================

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';
export type JustifyContent =
  | 'start'
  | 'end'
  | 'center'
  | 'between'
  | 'around'
  | 'evenly';
export type FlexWrap = 'wrap' | 'wrap-reverse' | 'nowrap';
export type FlexGrow = 0 | 1;
export type FlexShrink = 0 | 1;
export type FlexBasis = 'auto' | 'full' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4';

// =============================================================================
// STYLING TYPES (Updated to match implementations)
// =============================================================================

export type BackgroundScale =
  | 'none'
  | 'white'
  | 'gray'
  | 'primary'
  | 'secondary'
  | 'gray-50'
  | 'gray-100'
  | 'gray-200'
  | 'blue-50'
  | 'blue-100';
export type RoundedScale = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ShadowScale = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BorderScale = 'none' | 'thin' | 'sm' | 'md' | 'lg' | 'xl';

// =============================================================================
// BASE COMPONENT INTERFACES
// =============================================================================

export interface BaseResponsiveProps {
  children?: ReactNode;
  className?: string;
  as?: ElementType;
  role?: string;
  tabIndex?: number;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

// =============================================================================
// RESPONSIVE CONTAINER TYPES (Updated to match actual implementation)
// =============================================================================

export interface ResponsiveContainerProps extends BaseResponsiveProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: PaddingScale;
  center?: boolean;
}

// =============================================================================
// RESPONSIVE GRID TYPES (Updated to match actual implementation)
// =============================================================================

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridRows = 1 | 2 | 3 | 4 | 5 | 6;
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
export type RowSpan = 1 | 2 | 3 | 4 | 5 | 6 | 'full';

export interface ResponsiveGridBreakpoint {
  cols?: GridCols;
  gap?: GapScale;
  minItemWidth?: string;
}

export interface ResponsiveGridProps extends BaseResponsiveProps {
  cols?: GridCols | ResponsiveValue<GridCols>;
  rows?: ResponsiveValue<GridRows>;
  gap?: GapScale | ResponsiveValue<GapScale>;
  colSpan?: ResponsiveValue<ColSpan>;
  rowSpan?: ResponsiveValue<RowSpan>;
  autoFit?: boolean;
  autoFill?: boolean;
  minItemWidth?: string;
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  sm?: ResponsiveGridBreakpoint;
  md?: ResponsiveGridBreakpoint;
  lg?: ResponsiveGridBreakpoint;
  xl?: ResponsiveGridBreakpoint;
  '2xl'?: ResponsiveGridBreakpoint;
}

// =============================================================================
// RESPONSIVE STACK TYPES (Updated to match actual implementation)
// =============================================================================

export interface ResponsiveStackProps extends BaseResponsiveProps {
  direction?: ResponsiveValue<FlexDirection>;
  gap?: ResponsiveValue<GapScale>;
  align?: ResponsiveValue<AlignItems>;
  justify?: ResponsiveValue<JustifyContent>;
  wrap?: ResponsiveValue<FlexWrap>;
}

// =============================================================================
// RESPONSIVE FLEX TYPES (Updated to match actual implementation)
// =============================================================================

export interface ResponsiveFlexProps extends BaseResponsiveProps {
  direction?: ResponsiveValue<FlexDirection>;
  align?: ResponsiveValue<AlignItems>;
  justify?: ResponsiveValue<JustifyContent>;
  wrap?: ResponsiveValue<FlexWrap>;
  gap?: ResponsiveValue<GapScale>;
  grow?: ResponsiveValue<FlexGrow>;
  shrink?: ResponsiveValue<FlexShrink>;
  basis?: ResponsiveValue<FlexBasis>;
}

// =============================================================================
// RESPONSIVE SECTION TYPES (Updated to match actual implementation)
// =============================================================================

export interface ResponsiveSectionProps extends BaseResponsiveProps {
  padding?: ResponsiveValue<PaddingScale>;
  margin?: ResponsiveValue<MarginScale>;
  background?: ResponsiveValue<BackgroundScale>;
  rounded?: ResponsiveValue<RoundedScale>;
  shadow?: ResponsiveValue<ShadowScale>;
  border?: ResponsiveValue<BorderScale>;
  fullWidth?: boolean;
  centerContent?: boolean;
  minHeight?: ResponsiveValue<MinHeightScale>;
  maxWidth?: ResponsiveValue<MaxWidthScale>;
  sm?: Partial<ResponsiveSectionProps>;
  md?: Partial<ResponsiveSectionProps>;
  lg?: Partial<ResponsiveSectionProps>;
  xl?: Partial<ResponsiveSectionProps>;
  '2xl'?: Partial<ResponsiveSectionProps>;
}

// =============================================================================
// ACCESSIBILITY VALIDATION TYPES
// =============================================================================

export interface AccessibilityValidationResult {
  isValid: boolean;
  errors: AccessibilityError[];
  warnings: AccessibilityWarning[];
  suggestions: AccessibilitySuggestion[];
}

export interface AccessibilityError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  element?: string;
  wcagGuideline?: string;
}

export interface AccessibilityWarning {
  code: string;
  message: string;
  recommendation: string;
  wcagGuideline?: string;
}

export interface AccessibilitySuggestion {
  code: string;
  message: string;
  improvement: string;
  wcagGuideline?: string;
}

// =============================================================================
// ACCESSIBILITY VALIDATION SCHEMAS
// =============================================================================

export const AccessibilityRules = {
  // WCAG 1.1.1 - Non-text Content
  ALT_TEXT_REQUIRED: 'alt-text-required',

  // WCAG 1.3.1 - Info and Relationships
  SEMANTIC_STRUCTURE: 'semantic-structure',
  HEADING_HIERARCHY: 'heading-hierarchy',

  // WCAG 1.4.3 - Contrast (Minimum)
  COLOR_CONTRAST: 'color-contrast',

  // WCAG 2.1.1 - Keyboard
  KEYBOARD_ACCESSIBLE: 'keyboard-accessible',
  FOCUS_VISIBLE: 'focus-visible',

  // WCAG 2.4.1 - Bypass Blocks
  SKIP_LINKS: 'skip-links',

  // WCAG 2.4.3 - Focus Order
  FOCUS_ORDER: 'focus-order',

  // WCAG 2.4.6 - Headings and Labels
  DESCRIPTIVE_LABELS: 'descriptive-labels',

  // WCAG 3.2.2 - On Input
  PREDICTABLE_INPUT: 'predictable-input',

  // WCAG 4.1.2 - Name, Role, Value
  ARIA_LABELS: 'aria-labels',
  ROLE_DEFINITION: 'role-definition',
} as const;

export type AccessibilityRuleCode =
  (typeof AccessibilityRules)[keyof typeof AccessibilityRules];

// =============================================================================
// DEVELOPMENT & DEBUGGING TYPES
// =============================================================================

export interface ComponentDebugInfo {
  componentName: string;
  props: Record<string, any>;
  computedClasses: string[];
  breakpointValues: Record<Breakpoint, any>;
  accessibilityScore: number;
  wcagCompliance: {
    level: 'A' | 'AA' | 'AAA';
    passedRules: AccessibilityRuleCode[];
    failedRules: AccessibilityRuleCode[];
  };
}

export interface ResponsiveDebugConfig {
  enabled: boolean;
  showBreakpoints: boolean;
  showAccessibilityInfo: boolean;
  logToConsole: boolean;
  highlightElements: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Helper type for extracting responsive values
export type ExtractResponsiveValue<T> =
  T extends ResponsiveValue<infer U> ? U : T;

// Helper type for component ref forwarding
export type ComponentRef<T extends ElementType> =
  React.ComponentPropsWithRef<T>['ref'];

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Re-export React types for convenience
  ReactNode,
  HTMLAttributes,
  ElementType,
};
