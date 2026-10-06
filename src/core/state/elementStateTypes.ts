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
  imported?: ImportedComponentData;
  button?: ButtonElementData;
  carousel?: CarouselElementData;
  hero?: HeroElementData;
  socialDock?: SocialDockElementData;
  brandIdentity?: BrandIdentityElementData;
  authForm?: AuthFormElementData;
}

/**
 * Task 1 — Button Element State
 */
export type ButtonVariantMode = 'primary' | 'text' | 'icon-only';
export type ButtonSurfaceType = 'solid' | 'gradient' | 'glass' | 'neon';
export type ButtonIconPlacement = 'start' | 'end' | 'top';

export interface ButtonInteractiveStateStyle {
  backgroundColor: ColorValue;
  secondaryColor: ColorValue;
  textColor: ColorValue;
  borderColor: ColorValue;
  glowColor: ColorValue;
  glowIntensity: number;
  scale: number;
  translateY: number;
}

export interface ButtonElementData {
  variantMode: ButtonVariantMode;
  surfaceType: ButtonSurfaceType;
  iconPlacement: ButtonIconPlacement;
  gradientDirection: GradientDirectionType;
  glassBlur: number;
  borderRadius: number;
  borderWidth: number;
  paddingX: number;
  paddingY: number;
  gap: number;
  disabled: boolean;
  disabledOpacity: number;
  defaultStyle: ButtonInteractiveStateStyle;
  hoverStyle: ButtonInteractiveStateStyle;
  activeStyle: ButtonInteractiveStateStyle;
}

/**
 * Task 2 — Carousel Element State
 */
export type CarouselLayoutMode = 'single' | 'two-columns' | 'cards-3d';

export interface CarouselSlideItem {
  id: string;
  imageUrl: string;
  imageAlt: string;
  title: EditableText;
  description: EditableText;
  number: EditableText;
  percentage: EditableText;
  analysis: EditableText;
  actionLabel: EditableText;
  badge: EditableText;
  actionBackgroundColor: ColorValue;
  actionTextColor: ColorValue;
}

export interface CarouselElementData {
  slides: CarouselSlideItem[];
  activeSlideIndex: number;
  layoutMode: CarouselLayoutMode;
  showArrows: boolean;
  showDots: boolean;
  autoPlay: boolean;
  intervalMs: number;
  direction: 'rtl' | 'ltr';
  pauseOnHover: boolean;
  arrowColor: ColorValue;
  arrowBackgroundColor: ColorValue;
  dotColor: ColorValue;
  activeDotColor: ColorValue;
}

/**
 * Task 3 — Hero Element State
 */
export type HeroVariantType =
  | 'single-image'
  | 'split'
  | 'background-image'
  | 'gradient'
  | 'glass'
  | 'neon';

export type HeroObjectFitType = 'cover' | 'contain' | 'fill';
export type HeroAspectRatioType = '16/9' | '4/3' | '21/9' | '1/1' | 'auto';

export interface HeroActionButtonConfig {
  visible: boolean;
  label: EditableText;
  backgroundColor: ColorValue;
  textColor: ColorValue;
  borderColor: ColorValue;
  borderRadius: number;
}

export interface HeroElementData {
  variant: HeroVariantType;
  imageUrl: string;
  imageAlt: string;
  objectFit: HeroObjectFitType;
  aspectRatio: HeroAspectRatioType;
  overlayEnabled: boolean;
  overlayColor: ColorValue;
  overlayOpacity: number;
  opacity: number;
  glassBlur: number;
  glowColor: ColorValue;
  glowIntensity: number;
  primaryAction: HeroActionButtonConfig;
  secondaryAction: HeroActionButtonConfig;
}

/**
 * Task 4 — Social Dock Element State
 */
export type SocialDockOrientation = 'horizontal' | 'vertical';
export type SocialDockPosition = 'inline' | 'bottom-center' | 'start-side' | 'end-side';

export interface SocialDockLinkItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: ColorValue;
  backgroundColor: ColorValue;
  size: number;
  order: number;
  visible: boolean;
  ariaLabel: string;
  openInNewTab: boolean;
}

export interface SocialDockElementData {
  items: SocialDockLinkItem[];
  orientation: SocialDockOrientation;
  dockPosition: SocialDockPosition;
  openAllInNewTab?: boolean;
}

/**
 * Task 5 — Brand Identity Element State
 */
export type BrandIdentityMaterialType = 'glass' | 'metal' | 'ivory' | 'dark' | 'gradient';

export interface BrandIdentityElementData {
  logoText: string;
  showLogoText: boolean;
  logoImageUrl: string;
  logoImageAlt: string;
  showLogoImage: boolean;
  symbolIcon: string;
  showSymbol: boolean;
  symbolColor: ColorValue;
  symbolBackgroundColor: ColorValue;
  primaryBrandColor: ColorValue;
  primaryColorLabel: string;
  secondaryBrandColor: ColorValue;
  secondaryColorLabel: string;
  accentBrandColor: ColorValue;
  accentColorLabel: string;
  showPalette: boolean;
  brandFontFamily: string;
  logoFontSize: number;
  logoFontWeight: number;
  material: BrandIdentityMaterialType;
  glowColor: ColorValue;
  glowIntensity: number;
}

/**
 * Task 6 — Auth Form Element State
 */
export type AuthFormMode = 'login' | 'register' | 'recover';
export type AuthFormMaterialType = 'glass' | 'metal' | 'neon';

export interface AuthFormFieldItem {
  id: string;
  fieldName: string;
  fieldType: 'email' | 'password' | 'text';
  label: string;
  placeholder: string;
  helperText: string;
  showHelper: boolean;
  errorMessage: string;
  showError: boolean;
  icon: string;
  showIcon: boolean;
  iconColor: ColorValue;
  visibleInModes: AuthFormMode[];
}

export interface AuthFormElementData {
  mode: AuthFormMode;
  material: AuthFormMaterialType;
  fields: AuthFormFieldItem[];
  showPasswordToggle: boolean;
  passwordRevealed: boolean;
  submitLabel: EditableText;
  submitBackgroundColor: ColorValue;
  submitTextColor: ColorValue;
  submitBorderRadius: number;
  secondaryLinkText: EditableText;
  secondaryLinkHref: string;
  glowColor: ColorValue;
  glowIntensity: number;
  glassBlur: number;
}

export interface ImportedSourceCode {
  html: string;
  css: string;
}

export type ImportedMappingTargetKey =
  | 'root'
  | 'title'
  | 'description'
  | 'action'
  | 'image'
  | 'icon';

export interface ImportedSelectorMapping {
  root: string;
  title: string;
  description: string;
  action: string;
  image: string;
  icon: string;
}

export interface ImportedMappedTargetOverrides {
  titleColor: string;
  titleFontSize: number | null;
  titleFontWeight: number | null;
  descriptionColor: string;
  descriptionFontSize: number | null;
  descriptionLineHeight: number | null;
  actionBackgroundColor: string;
  actionTextColor: string;
  actionBorderRadius: number | null;
  actionPaddingX: number | null;
  actionPaddingY: number | null;
  imageBorderRadius: number | null;
  imageMaxHeight: number | null;
  iconColor: string;
  iconSize: number | null;
}

export interface ImportedComponentOverrides {
  width: number | 'auto';
  widthUnit: WidthUnitType;
  height: number | 'auto';
  heightUnit: HeightUnitType;
  paddingX: number | null;
  paddingY: number | null;
  margin: number | null;
  gap: number | null;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number | null;
  fontWeight: number | null;
  lineHeight: number | null;
  textAlign: TextAlignment | '';
  borderWidth: number | null;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none' | '';
  borderColor: string;
  boxShadow: string;
  borderRadius: number | null;
  mapped: ImportedMappedTargetOverrides;
}

export interface ImportedComponentData {
  source: ImportedSourceCode;
  initialSource: ImportedSourceCode;
  overrides: ImportedComponentOverrides;
  mapping: ImportedSelectorMapping;
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
    ...(state.imported
      ? {
          imported: {
            source: { ...state.imported.source },
            initialSource: { ...state.imported.initialSource },
            overrides: {
              ...state.imported.overrides,
              mapped: { ...state.imported.overrides.mapped },
            },
            mapping: { ...state.imported.mapping },
          },
        }
      : {}),
    ...(state.button
      ? {
          button: {
            ...state.button,
            defaultStyle: { ...state.button.defaultStyle },
            hoverStyle: { ...state.button.hoverStyle },
            activeStyle: { ...state.button.activeStyle },
          },
        }
      : {}),
    ...(state.carousel
      ? {
          carousel: {
            ...state.carousel,
            slides: state.carousel.slides.map((s) => ({
              ...s,
              title: { ...s.title },
              description: { ...s.description },
              number: { ...s.number },
              percentage: { ...s.percentage },
              analysis: { ...s.analysis },
              actionLabel: { ...s.actionLabel },
              badge: { ...s.badge },
            })),
          },
        }
      : {}),
    ...(state.hero
      ? {
          hero: {
            ...state.hero,
            primaryAction: {
              ...state.hero.primaryAction,
              label: { ...state.hero.primaryAction.label },
            },
            secondaryAction: {
              ...state.hero.secondaryAction,
              label: { ...state.hero.secondaryAction.label },
            },
          },
        }
      : {}),
    ...(state.socialDock
      ? {
          socialDock: {
            ...state.socialDock,
            items: state.socialDock.items.map((item) => ({ ...item })),
          },
        }
      : {}),
    ...(state.brandIdentity
      ? {
          brandIdentity: {
            ...state.brandIdentity,
          },
        }
      : {}),
    ...(state.authForm
      ? {
          authForm: {
            ...state.authForm,
            fields: state.authForm.fields.map((f) => ({
              ...f,
              visibleInModes: [...f.visibleInModes],
            })),
            submitLabel: { ...state.authForm.submitLabel },
            secondaryLinkText: { ...state.authForm.secondaryLinkText },
          },
        }
      : {}),
  };
}
