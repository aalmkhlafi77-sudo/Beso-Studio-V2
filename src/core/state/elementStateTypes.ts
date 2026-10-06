/**
 * Beso Studio V2 — Independent Element State Contract
 * Strictly implements Section 9.1 of the Architectural Reference and Requirement 4 & 5.
 *
 * Mandatory guarantees:
 * - Every visible text is an independent EditableText object.
 * - Changing one text field never modifies another.
 * - Width and Height are completely independent.
 * - Icon has its own visibility, source, value, color, size, rotation, and position.
 * - Surface colors and sizes are declared tokens with zero hidden CSS values.
 */

export type ColorValue = string;

export type TextAlignment = 'start' | 'center' | 'end';

export interface EditableText {
  value: string;
  visible: boolean;
  color: ColorValue;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  align: TextAlignment;
}

export type ContentFieldKey =
  | 'title'
  | 'description'
  | 'number'
  | 'percentage'
  | 'analysis'
  | 'actionLabel'
  | 'badge';

export interface IndependentContent {
  title: EditableText;
  description: EditableText;
  number: EditableText;
  percentage: EditableText;
  analysis: EditableText;
  actionLabel: EditableText;
  badge: EditableText;
}

export type IconSourceType = 'none' | 'emoji' | 'svg' | 'icon-library' | 'image';
export type IconPositionType = 'start' | 'center' | 'end' | 'custom';

export interface EditableIcon {
  visible: boolean;
  source: IconSourceType;
  value: string;
  color: ColorValue;
  size: number;
  rotate: number;
  position: IconPositionType;
}

export type WidthUnitType = 'px' | '%' | 'vw' | 'auto';
export type HeightUnitType = 'px' | '%' | 'vh' | 'auto';

export interface IndependentDimensions {
  width: number | 'auto';
  height: number | 'auto';
  minWidth: number;
  maxWidth: number | 'none';
  minHeight: number;
  maxHeight: number | 'none';
  widthUnit: WidthUnitType;
  heightUnit: HeightUnitType;
  lockAspectRatio: boolean;
}

export type CardMaterialType =
  | 'solid'
  | 'gradient'
  | 'glass'
  | 'metal'
  | 'ivory'
  | 'neon'
  | 'dark'
  | 'image'
  | 'pattern';

export type GradientDirectionType =
  | '135deg'
  | '90deg'
  | '180deg'
  | '45deg'
  | '225deg'
  | '0deg';

export type PatternPresetType = 'dots' | 'grid' | 'diagonal' | 'waves';

export interface DeclaredSurfaceTokens {
  materialType: CardMaterialType;
  primaryColor: ColorValue;
  secondaryColor: ColorValue;
  gradientDirection: GradientDirectionType;
  opacity: number;
  glassBlur: number;
  glowIntensity: number;
  glowColor: ColorValue;
  shadowIntensity: number;
  shadowColor: ColorValue;
  patternType: PatternPresetType;
  imageSourceUrl: string;
  backgroundColor: ColorValue;
  borderColor: ColorValue;
  accentColor: ColorValue;
  badgeBackgroundColor: ColorValue;
  actionBackgroundColor: ColorValue;
  actionTextColor: ColorValue;
  iconContainerBackground: ColorValue;
  borderRadius: number;
  borderWidth: number;
  paddingX: number;
  paddingY: number;
  gap: number;
}

export interface IndependentElementState {
  content: IndependentContent;
  icon: EditableIcon;
  dimensions: IndependentDimensions;
  surface: DeclaredSurfaceTokens;
}

/**
 * Deep clone helper for immutable state updates so no shared object references leak.
 */
export function cloneElementState(state: IndependentElementState): IndependentElementState {
  return {
    content: {
      title: { ...state.content.title },
      description: { ...state.content.description },
      number: { ...state.content.number },
      percentage: { ...state.content.percentage },
      analysis: { ...state.content.analysis },
      actionLabel: { ...state.content.actionLabel },
      badge: { ...state.content.badge },
    },
    icon: { ...state.icon },
    dimensions: { ...state.dimensions },
    surface: { ...state.surface },
  };
}
