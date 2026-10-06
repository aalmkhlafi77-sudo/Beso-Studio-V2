/**
 * Beso Studio V2 — Pure Immutable Studio State Store
 * Strictly satisfies Requirement 4, 5, 7 and Section 8 of the Architectural Reference.
 *
 * Guarantees:
 * - Zero global mutable state (all state transitions are pure functions returning new state).
 * - Zero localStorage dependency in Phase 1.
 * - Complete isolation between instances and between individual fields inside an instance.
 * - Resetting a single field restores ONLY that field from the module's defaultState.
 */

import { AdminConfig, DEFAULT_ADMIN_CONFIG } from '../../admin/configSchema';
import {
  AUTH_FORM_DEFAULT_STATE,
  AUTH_FORM_ELEMENT_ID,
  authFormRegistration,
  ensureAuthFormData,
} from '../../elements/auth-form/authFormModule';
import {
  BRAND_IDENTITY_DEFAULT_STATE,
  BRAND_IDENTITY_ELEMENT_ID,
  brandIdentityRegistration,
  ensureBrandIdentityData,
} from '../../elements/brand-identity/brandIdentityModule';
import {
  BUTTON_DEFAULT_STATE,
  BUTTON_ELEMENT_ID,
  buttonRegistration,
  ensureButtonData,
} from '../../elements/button/buttonModule';
import {
  CARD_DEFAULT_STATE,
  CARD_ELEMENT_ID,
  cardRegistration,
} from '../../elements/card/cardModule';
import {
  CAROUSEL_DEFAULT_STATE,
  CAROUSEL_ELEMENT_ID,
  carouselRegistration,
  ensureCarouselData,
} from '../../elements/carousel/carouselModule';
import {
  CONTRACT_PROBE_DEFAULT_STATE,
  CONTRACT_PROBE_ID,
  contractProbeRegistration,
} from '../../elements/contract-probe/contractProbeModule';
import {
  ensureHeroData,
  HERO_DEFAULT_STATE,
  HERO_ELEMENT_ID,
  heroRegistration,
} from '../../elements/hero/heroModule';
import {
  createDefaultImportedComponentData,
  IMPORTED_COMPONENT_DEFAULT_STATE,
  IMPORTED_COMPONENT_ID,
  importedComponentRegistration,
} from '../../elements/imported-component/importedComponentModule';
import {
  ensureSocialDockData,
  SOCIAL_DOCK_DEFAULT_STATE,
  SOCIAL_DOCK_ELEMENT_ID,
  socialDockRegistration,
} from '../../elements/social-dock/socialDockModule';
import { StudioThemeMode } from '../../shared/theme/themeTokens';
import { ControlSectionId } from '../controls/controlTypes';
import {
  createEmptyRegistry,
  ElementRegistry,
  getElementModule,
  registerElement,
} from '../registry/elementRegistry';
import {
  AuthFormElementData,
  AuthFormFieldItem,
  BrandIdentityElementData,
  ButtonElementData,
  ButtonInteractiveStateStyle,
  CarouselElementData,
  CarouselSlideItem,
  cloneElementState,
  ContentFieldKey,
  DeclaredSurfaceTokens,
  EditableIcon,
  EditableText,
  HeroActionButtonConfig,
  HeroElementData,
  ImportedComponentOverrides,
  ImportedMappedTargetOverrides,
  ImportedSelectorMapping,
  ImportedSourceCode,
  IndependentDimensions,
  IndependentElementState,
  SocialDockElementData,
  SocialDockLinkItem,
} from './elementStateTypes';
import {
  ALL_ACCORDION_GROUP_IDS,
  createInitialInspectorAccordionState,
  createInitialWorkspaceLayoutState,
  FullscreenDrawerTab,
  InspectorAccordionState,
  PreviewMode,
  toggleControlsCollapsed,
  toggleExportCollapsed,
  updateWorkspaceColumnsWidth,
  updateWorkspacePreviewHeight,
  WorkspaceLayoutState,
} from './workspaceLayoutStore';

export interface PreviewState {
  viewportPresetId: string;
  activeOutputTab: 'html' | 'css' | 'bundle' | 'validation';
  showGrid: boolean;
}

export interface ElementInstance<TState = IndependentElementState> {
  id: string;
  label: string;
  elementType: string;
  scopeId: string;
  stateVersion: number;
  state: TState;
  slot?: string;
}

export interface StudioState {
  activeInstanceId: string;
  instances: Record<string, ElementInstance<IndependentElementState>>;
  selectedTemplateId?: string;
  theme: StudioThemeMode;
  preview: PreviewState;
  workspaceLayout: WorkspaceLayoutState;
  inspectorAccordions: InspectorAccordionState;
  admin: AdminConfig;
}

/**
 * Creates the Studio ElementRegistry containing all registered production modules,
 * Imported Component, and Contract Probe.
 */
export function createPhaseOneRegistry(): ElementRegistry {
  let reg = createEmptyRegistry();
  reg = registerElement(reg, buttonRegistration);
  reg = registerElement(reg, cardRegistration);
  reg = registerElement(reg, carouselRegistration);
  reg = registerElement(reg, heroRegistration);
  reg = registerElement(reg, authFormRegistration);
  reg = registerElement(reg, brandIdentityRegistration);
  reg = registerElement(reg, socialDockRegistration);
  reg = registerElement(reg, importedComponentRegistration);
  reg = registerElement(reg, contractProbeRegistration);
  return reg;
}

export function createInitialStudioState(
  registry: ElementRegistry = createPhaseOneRegistry()
): StudioState {
  const buttonMod = getElementModule(registry, BUTTON_ELEMENT_ID);
  const initialButtonState = buttonMod
    ? cloneElementState(buttonMod.defaultState)
    : cloneElementState(BUTTON_DEFAULT_STATE);

  const cardMod = getElementModule(registry, CARD_ELEMENT_ID);
  const initialCardState = cardMod
    ? cloneElementState(cardMod.defaultState)
    : cloneElementState(CARD_DEFAULT_STATE);

  const carouselMod = getElementModule(registry, CAROUSEL_ELEMENT_ID);
  const initialCarouselState = carouselMod
    ? cloneElementState(carouselMod.defaultState)
    : cloneElementState(CAROUSEL_DEFAULT_STATE);

  const heroMod = getElementModule(registry, HERO_ELEMENT_ID);
  const initialHeroState = heroMod
    ? cloneElementState(heroMod.defaultState)
    : cloneElementState(HERO_DEFAULT_STATE);

  const authFormMod = getElementModule(registry, AUTH_FORM_ELEMENT_ID);
  const initialAuthFormState = authFormMod
    ? cloneElementState(authFormMod.defaultState)
    : cloneElementState(AUTH_FORM_DEFAULT_STATE);

  const brandIdentityMod = getElementModule(registry, BRAND_IDENTITY_ELEMENT_ID);
  const initialBrandIdentityState = brandIdentityMod
    ? cloneElementState(brandIdentityMod.defaultState)
    : cloneElementState(BRAND_IDENTITY_DEFAULT_STATE);

  const socialDockMod = getElementModule(registry, SOCIAL_DOCK_ELEMENT_ID);
  const initialSocialDockState = socialDockMod
    ? cloneElementState(socialDockMod.defaultState)
    : cloneElementState(SOCIAL_DOCK_DEFAULT_STATE);

  const importedMod = getElementModule(registry, IMPORTED_COMPONENT_ID);
  const initialImportedState = importedMod
    ? cloneElementState(importedMod.defaultState)
    : cloneElementState(IMPORTED_COMPONENT_DEFAULT_STATE);

  const probeModule = getElementModule(registry, CONTRACT_PROBE_ID);
  const initialProbeState = probeModule
    ? cloneElementState(probeModule.defaultState)
    : cloneElementState(CONTRACT_PROBE_DEFAULT_STATE);

  const buttonInstanceId = 'button-instance-1';
  const cardInstanceId = 'card-instance-1';
  const carouselInstanceId = 'carousel-instance-1';
  const heroInstanceId = 'hero-instance-1';
  const authFormInstanceId = 'auth-form-instance-1';
  const brandIdentityInstanceId = 'brand-identity-instance-1';
  const socialDockInstanceId = 'social-dock-instance-1';
  const importedInstanceId = 'imported-instance-1';
  const primaryProbeInstanceId = 'probe-instance-1';
  const secondaryProbeInstanceId = 'probe-instance-2';

  const secondaryProbeState = cloneElementState(initialProbeState);
  secondaryProbeState.content.title.value = 'نسخة معزولة ثانية (Instance #2)';
  secondaryProbeState.content.number.value = '2,950';
  secondaryProbeState.dimensions.width = 400;
  secondaryProbeState.dimensions.height = 300;

  return {
    activeInstanceId: cardInstanceId,
    instances: {
      [buttonInstanceId]: {
        id: buttonInstanceId,
        label: 'زر تفاعلي #1 (Button)',
        elementType: BUTTON_ELEMENT_ID,
        scopeId: 'beso-button-1',
        stateVersion: 1,
        state: initialButtonState,
      },
      [cardInstanceId]: {
        id: cardInstanceId,
        label: 'البطاقة الإنتاجية #1 (Card)',
        elementType: CARD_ELEMENT_ID,
        scopeId: 'beso-card-1',
        stateVersion: 1,
        state: initialCardState,
      },
      [carouselInstanceId]: {
        id: carouselInstanceId,
        label: 'عارض الشرائح #1 (Carousel)',
        elementType: CAROUSEL_ELEMENT_ID,
        scopeId: 'beso-carousel-1',
        stateVersion: 1,
        state: initialCarouselState,
      },
      [heroInstanceId]: {
        id: heroInstanceId,
        label: 'قسم الواجهة الرئيسي #1 (Hero)',
        elementType: HERO_ELEMENT_ID,
        scopeId: 'beso-hero-1',
        stateVersion: 1,
        state: initialHeroState,
      },
      [authFormInstanceId]: {
        id: authFormInstanceId,
        label: 'نموذج المصادقة #1 (Auth Form)',
        elementType: AUTH_FORM_ELEMENT_ID,
        scopeId: 'beso-auth-form-1',
        stateVersion: 1,
        state: initialAuthFormState,
      },
      [brandIdentityInstanceId]: {
        id: brandIdentityInstanceId,
        label: 'بطاقة الهوية البصرية #1 (Brand Identity)',
        elementType: BRAND_IDENTITY_ELEMENT_ID,
        scopeId: 'beso-brand-1',
        stateVersion: 1,
        state: initialBrandIdentityState,
      },
      [socialDockInstanceId]: {
        id: socialDockInstanceId,
        label: 'شريط التواصل الاجتماعي #1 (Social Dock)',
        elementType: SOCIAL_DOCK_ELEMENT_ID,
        scopeId: 'beso-social-1',
        stateVersion: 1,
        state: initialSocialDockState,
      },
      [importedInstanceId]: {
        id: importedInstanceId,
        label: 'استيراد عنصر خارجي #1 (Imported Component)',
        elementType: IMPORTED_COMPONENT_ID,
        scopeId: 'beso-imported-1',
        stateVersion: 1,
        state: initialImportedState,
      },
      [primaryProbeInstanceId]: {
        id: primaryProbeInstanceId,
        label: 'مسبار العقد #1 (Contract Probe)',
        elementType: CONTRACT_PROBE_ID,
        scopeId: 'beso-probe-1',
        stateVersion: 1,
        state: initialProbeState,
      },
      [secondaryProbeInstanceId]: {
        id: secondaryProbeInstanceId,
        label: 'مسبار العقد #2 (اختبار عزل النسخ)',
        elementType: CONTRACT_PROBE_ID,
        scopeId: 'beso-probe-2',
        stateVersion: 1,
        state: secondaryProbeState,
      },
    },
    theme: 'emerald-luxury',
    preview: {
      viewportPresetId: 'fluid',
      activeOutputTab: 'html',
      showGrid: true,
    },
    workspaceLayout: createInitialWorkspaceLayoutState(),
    inspectorAccordions: createInitialInspectorAccordionState(),
    admin: {
      ...DEFAULT_ADMIN_CONFIG,
      advertising: {
        ...DEFAULT_ADMIN_CONFIG.advertising,
        enabled: false,
        slots: DEFAULT_ADMIN_CONFIG.advertising.slots.map((s) => ({ ...s, enabled: false })),
      },
    },
  };
}

/**
 * Pure update of a single content field (title, description, number, percentage, analysis, actionLabel, badge).
 * Never touches any sibling content field, icon, dimension, or surface property.
 */
export function updateInstanceContentField(
  studioState: StudioState,
  instanceId: string,
  fieldKey: ContentFieldKey,
  patch: Partial<EditableText>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const nextElementState = cloneElementState(currentInstance.state);
  nextElementState.content[fieldKey] = {
    ...nextElementState.content[fieldKey],
    ...patch,
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Resets ONLY the specified content field back to its default state from the element module.
 * All other content fields, dimensions, and icon settings remain completely unchanged.
 */
export function resetInstanceContentField(
  studioState: StudioState,
  registry: ElementRegistry,
  instanceId: string,
  fieldKey: ContentFieldKey
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const module = getElementModule(registry, currentInstance.elementType);
  const defaults = module ? module.defaultState : CONTRACT_PROBE_DEFAULT_STATE;

  const nextElementState = cloneElementState(currentInstance.state);
  nextElementState.content[fieldKey] = {
    ...defaults.content[fieldKey],
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Pure update of icon configuration without modifying content, dimensions, or surface tokens.
 */
export function updateInstanceIcon(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<EditableIcon>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const nextElementState = cloneElementState(currentInstance.state);
  nextElementState.icon = {
    ...nextElementState.icon,
    ...patch,
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Resets ONLY a single icon property or the icon object without affecting any text or dimension.
 */
export function resetInstanceIconField<K extends keyof EditableIcon>(
  studioState: StudioState,
  registry: ElementRegistry,
  instanceId: string,
  propertyKey?: K
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const module = getElementModule(registry, currentInstance.elementType);
  const defaults = module ? module.defaultState : CONTRACT_PROBE_DEFAULT_STATE;

  const nextElementState = cloneElementState(currentInstance.state);
  if (propertyKey) {
    nextElementState.icon = {
      ...nextElementState.icon,
      [propertyKey]: defaults.icon[propertyKey],
    };
  } else {
    nextElementState.icon = { ...defaults.icon };
  }

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Pure update of a single dimension field.
 * Width and Height are 100% independent: changing width NEVER changes height,
 * and changing height NEVER changes width (unless lockAspectRatio is explicitly true).
 */
export function updateInstanceDimensions(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<IndependentDimensions>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const nextElementState = cloneElementState(currentInstance.state);
  const prevDims = nextElementState.dimensions;

  const nextDims: IndependentDimensions = {
    ...prevDims,
    ...patch,
  };

  // Only if user explicitly activated lockAspectRatio and both dimensions are numeric:
  const isLocked = nextDims.lockAspectRatio === true;
  if (
    isLocked &&
    typeof prevDims.width === 'number' &&
    typeof prevDims.height === 'number' &&
    prevDims.width > 0 &&
    prevDims.height > 0
  ) {
    const ratio = prevDims.width / prevDims.height;
    if (patch.width !== undefined && typeof patch.width === 'number' && patch.height === undefined) {
      nextDims.height = Math.round(patch.width / ratio);
    } else if (
      patch.height !== undefined &&
      typeof patch.height === 'number' &&
      patch.width === undefined
    ) {
      nextDims.width = Math.round(patch.height * ratio);
    }
  }

  nextElementState.dimensions = nextDims;

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Resets ONLY a single dimension field (e.g. width or height) without changing the other.
 */
export function resetInstanceDimensionField<K extends keyof IndependentDimensions>(
  studioState: StudioState,
  registry: ElementRegistry,
  instanceId: string,
  dimensionKey: K
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const module = getElementModule(registry, currentInstance.elementType);
  const defaults = module ? module.defaultState : CONTRACT_PROBE_DEFAULT_STATE;

  const nextElementState = cloneElementState(currentInstance.state);
  nextElementState.dimensions = {
    ...nextElementState.dimensions,
    [dimensionKey]: defaults.dimensions[dimensionKey],
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Pure update of declared surface tokens (colors, border radius, spacing).
 */
export function updateInstanceSurface(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<DeclaredSurfaceTokens>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const nextElementState = cloneElementState(currentInstance.state);
  nextElementState.surface = {
    ...nextElementState.surface,
    ...patch,
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Resets a single surface token back to its module default.
 */
export function resetInstanceSurfaceField<K extends keyof DeclaredSurfaceTokens>(
  studioState: StudioState,
  registry: ElementRegistry,
  instanceId: string,
  surfaceKey: K
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const module = getElementModule(registry, currentInstance.elementType);
  const defaults = module ? module.defaultState : CONTRACT_PROBE_DEFAULT_STATE;

  const nextElementState = cloneElementState(currentInstance.state);
  nextElementState.surface = {
    ...nextElementState.surface,
    [surfaceKey]: defaults.surface[surfaceKey],
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Resets all fields of a single instance back to the module defaultState.
 */
export function resetEntireInstanceState(
  studioState: StudioState,
  registry: ElementRegistry,
  instanceId: string
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const module = getElementModule(registry, currentInstance.elementType);
  const defaults = module ? module.defaultState : CONTRACT_PROBE_DEFAULT_STATE;

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: cloneElementState(defaults),
      },
    },
  };
}

export function setStudioThemeMode(
  studioState: StudioState,
  theme: StudioThemeMode
): StudioState {
  return {
    ...studioState,
    theme,
  };
}

export function setActiveInstance(
  studioState: StudioState,
  instanceId: string
): StudioState {
  if (!studioState.instances[instanceId]) {
    return studioState;
  }
  return {
    ...studioState,
    activeInstanceId: instanceId,
  };
}

export function setPreviewState(
  studioState: StudioState,
  patch: Partial<PreviewState>
): StudioState {
  return {
    ...studioState,
    preview: {
      ...studioState.preview,
      ...patch,
    },
  };
}

export function setAdvertisingSlotEnabled(
  studioState: StudioState,
  slotId: string,
  enabled: boolean
): StudioState {
  const nextSlots = studioState.admin.advertising.slots.map((slot) =>
    slot.id === slotId ? { ...slot, enabled } : slot
  );
  const anyEnabled = nextSlots.some((s) => s.enabled);

  return {
    ...studioState,
    admin: {
      ...studioState.admin,
      advertising: {
        ...studioState.admin.advertising,
        enabled: anyEnabled,
        slots: nextSlots,
      },
    },
  };
}

/**
 * Resets an entire major category section ('content' | 'dimensions' | 'icon' | 'appearance')
 * for the specified instance without altering any other section or workspace layout.
 */
export function resetInstanceCategorySection(
  studioState: StudioState,
  registry: ElementRegistry,
  instanceId: string,
  section: ControlSectionId
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const module = getElementModule(registry, currentInstance.elementType);
  const defaults = module ? module.defaultState : CONTRACT_PROBE_DEFAULT_STATE;

  const nextElementState = cloneElementState(currentInstance.state);
  const clonedDefaults = cloneElementState(defaults);

  if (section === 'content') {
    nextElementState.content = clonedDefaults.content;
  } else if (section === 'dimensions') {
    nextElementState.dimensions = clonedDefaults.dimensions;
  } else if (section === 'icon') {
    nextElementState.icon = clonedDefaults.icon;
  } else if (section === 'appearance') {
    nextElementState.surface = clonedDefaults.surface;
  }

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Resets ONLY the fields belonging to a specific Accordion group without altering other groups.
 */
export function resetInstanceAccordionGroup(
  studioState: StudioState,
  registry: ElementRegistry,
  instanceId: string,
  groupId: string
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const module = getElementModule(registry, currentInstance.elementType);
  const defaults = module ? module.defaultState : CONTRACT_PROBE_DEFAULT_STATE;

  const next = cloneElementState(currentInstance.state);
  const def = cloneElementState(defaults);

  switch (groupId) {
    case 'content-basic': {
      const keys: ContentFieldKey[] = ['title', 'description', 'badge', 'actionLabel'];
      for (const k of keys) {
        next.content[k] = {
          ...next.content[k],
          value: def.content[k].value,
          visible: def.content[k].visible,
          color: def.content[k].color,
        };
      }
      break;
    }
    case 'content-metrics': {
      const keys: ContentFieldKey[] = ['number', 'percentage', 'analysis'];
      for (const k of keys) {
        next.content[k] = {
          ...next.content[k],
          value: def.content[k].value,
          visible: def.content[k].visible,
          color: def.content[k].color,
        };
      }
      break;
    }
    case 'content-advanced': {
      const keys: ContentFieldKey[] = [
        'title',
        'description',
        'number',
        'percentage',
        'analysis',
        'actionLabel',
        'badge',
      ];
      for (const k of keys) {
        next.content[k] = {
          ...next.content[k],
          fontFamily: def.content[k].fontFamily,
          fontSize: def.content[k].fontSize,
          fontWeight: def.content[k].fontWeight,
          lineHeight: def.content[k].lineHeight,
          letterSpacing: def.content[k].letterSpacing,
          align: def.content[k].align,
        };
      }
      break;
    }
    case 'dimensions-basic': {
      next.dimensions.width = def.dimensions.width;
      next.dimensions.widthUnit = def.dimensions.widthUnit;
      next.dimensions.height = def.dimensions.height;
      next.dimensions.heightUnit = def.dimensions.heightUnit;
      break;
    }
    case 'dimensions-advanced': {
      next.dimensions.minWidth = def.dimensions.minWidth;
      next.dimensions.maxWidth = def.dimensions.maxWidth;
      next.dimensions.minHeight = def.dimensions.minHeight;
      next.dimensions.maxHeight = def.dimensions.maxHeight;
      next.dimensions.lockAspectRatio = def.dimensions.lockAspectRatio;
      break;
    }
    case 'icon-basic': {
      next.icon.visible = def.icon.visible;
      next.icon.source = def.icon.source;
      next.icon.value = def.icon.value;
      next.icon.color = def.icon.color;
      next.icon.size = def.icon.size;
      break;
    }
    case 'icon-advanced': {
      next.icon.rotate = def.icon.rotate;
      next.icon.position = def.icon.position;
      break;
    }
    case 'appearance-basic': {
      next.surface.materialType = def.surface.materialType;
      next.surface.primaryColor = def.surface.primaryColor;
      next.surface.secondaryColor = def.surface.secondaryColor;
      next.surface.gradientDirection = def.surface.gradientDirection;
      next.surface.opacity = def.surface.opacity;
      next.surface.backgroundColor = def.surface.backgroundColor;
      next.surface.borderColor = def.surface.borderColor;
      next.surface.accentColor = def.surface.accentColor;
      next.surface.actionBackgroundColor = def.surface.actionBackgroundColor;
      next.surface.actionTextColor = def.surface.actionTextColor;
      next.surface.borderRadius = def.surface.borderRadius;
      break;
    }
    case 'appearance-advanced': {
      next.surface.glassBlur = def.surface.glassBlur;
      next.surface.glowIntensity = def.surface.glowIntensity;
      next.surface.glowColor = def.surface.glowColor;
      next.surface.shadowIntensity = def.surface.shadowIntensity;
      next.surface.shadowColor = def.surface.shadowColor;
      next.surface.patternType = def.surface.patternType;
      next.surface.imageSourceUrl = def.surface.imageSourceUrl;
      next.surface.badgeBackgroundColor = def.surface.badgeBackgroundColor;
      next.surface.iconContainerBackground = def.surface.iconContainerBackground;
      next.surface.borderWidth = def.surface.borderWidth;
      next.surface.paddingX = def.surface.paddingX;
      next.surface.paddingY = def.surface.paddingY;
      next.surface.gap = def.surface.gap;
      break;
    }
    default:
      break;
  }

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: next,
      },
    },
  };
}

/**
 * Pure Workspace Layout transitions (never touch instances[id].state)
 */
export function resizeStudioWorkspaceColumns(
  studioState: StudioState,
  nextControlsWidth: number,
  totalWorkspaceWidth?: number
): StudioState {
  return {
    ...studioState,
    workspaceLayout: updateWorkspaceColumnsWidth(
      studioState.workspaceLayout,
      nextControlsWidth,
      totalWorkspaceWidth
    ),
  };
}

export function resizeStudioPreviewHeight(
  studioState: StudioState,
  nextPreviewHeight: number
): StudioState {
  return {
    ...studioState,
    workspaceLayout: updateWorkspacePreviewHeight(studioState.workspaceLayout, nextPreviewHeight),
  };
}

export function setStudioPreviewMode(
  studioState: StudioState,
  previewMode: PreviewMode
): StudioState {
  return {
    ...studioState,
    workspaceLayout: {
      ...studioState.workspaceLayout,
      previewMode,
    },
    inspectorAccordions: {
      ...studioState.inspectorAccordions,
      fullscreenDrawerTab:
        previewMode === 'docked' ? 'none' : studioState.inspectorAccordions.fullscreenDrawerTab,
    },
  };
}

export function setStudioControlsCollapsed(
  studioState: StudioState,
  collapsed?: boolean
): StudioState {
  return {
    ...studioState,
    workspaceLayout: toggleControlsCollapsed(studioState.workspaceLayout, collapsed),
  };
}

export function setStudioExportCollapsed(
  studioState: StudioState,
  collapsed?: boolean
): StudioState {
  return {
    ...studioState,
    workspaceLayout: toggleExportCollapsed(studioState.workspaceLayout, collapsed),
  };
}

export function resetStudioWorkspaceLayout(studioState: StudioState): StudioState {
  return {
    ...studioState,
    workspaceLayout: createInitialWorkspaceLayoutState(),
  };
}

/**
 * Pure Inspector Accordion transitions (persisted across element state edits)
 */
export function setInspectorActiveSection(
  studioState: StudioState,
  activeSection: ControlSectionId
): StudioState {
  return {
    ...studioState,
    inspectorAccordions: {
      ...studioState.inspectorAccordions,
      activeSection,
    },
  };
}

export function toggleInspectorAccordionGroup(
  studioState: StudioState,
  groupId: string
): StudioState {
  const currentOpen = studioState.inspectorAccordions.openGroupIds;
  const isOpen = currentOpen.includes(groupId);
  const nextOpen = isOpen
    ? currentOpen.filter((id) => id !== groupId)
    : [...currentOpen, groupId];

  return {
    ...studioState,
    inspectorAccordions: {
      ...studioState.inspectorAccordions,
      openGroupIds: nextOpen,
    },
  };
}

export function expandAllInspectorGroupsInSection(
  studioState: StudioState,
  section?: ControlSectionId
): StudioState {
  const targetSection = section || studioState.inspectorAccordions.activeSection;
  const sectionGroups = ALL_ACCORDION_GROUP_IDS[targetSection] || [];
  const merged = Array.from(
    new Set([...studioState.inspectorAccordions.openGroupIds, ...sectionGroups])
  );

  return {
    ...studioState,
    inspectorAccordions: {
      ...studioState.inspectorAccordions,
      openGroupIds: merged,
    },
  };
}

export function collapseAllInspectorGroupsInSection(
  studioState: StudioState,
  section?: ControlSectionId
): StudioState {
  const targetSection = section || studioState.inspectorAccordions.activeSection;
  const sectionGroups = new Set(ALL_ACCORDION_GROUP_IDS[targetSection] || []);
  const filtered = studioState.inspectorAccordions.openGroupIds.filter(
    (id) => !sectionGroups.has(id)
  );

  return {
    ...studioState,
    inspectorAccordions: {
      ...studioState.inspectorAccordions,
      openGroupIds: filtered,
    },
  };
}

export function setFullscreenDrawerTab(
  studioState: StudioState,
  tab: FullscreenDrawerTab
): StudioState {
  return {
    ...studioState,
    inspectorAccordions: {
      ...studioState.inspectorAccordions,
      fullscreenDrawerTab: tab,
    },
  };
}

/**
 * Pure Imported Component State Transitions:
 * - `source.html` and `source.css` are stored verbatim as entered by the user without modification.
 * - `overrides` and `mapping` are stored in an independent layer; updating them NEVER mutates `source`.
 */
export function updateInstanceImportedSource(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<ImportedSourceCode>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const nextElementState = cloneElementState(currentInstance.state);
  const currentImported = nextElementState.imported || createDefaultImportedComponentData();

  nextElementState.imported = {
    ...currentImported,
    source: {
      html: patch.html !== undefined ? patch.html : currentImported.source.html,
      css: patch.css !== undefined ? patch.css : currentImported.source.css,
    },
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Restores `source.html` and `source.css` back to the original source (`initialSource`),
 * and resets overrides back to clean defaults.
 */
export function restoreInstanceImportedOriginalSource(
  studioState: StudioState,
  registry: ElementRegistry,
  instanceId: string
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const module = getElementModule(registry, currentInstance.elementType);
  const defaultImported =
    module?.defaultState.imported || createDefaultImportedComponentData();

  const nextElementState = cloneElementState(currentInstance.state);
  const currentImported = nextElementState.imported || createDefaultImportedComponentData();

  nextElementState.imported = {
    source: {
      html: currentImported.initialSource.html,
      css: currentImported.initialSource.css,
    },
    initialSource: {
      ...currentImported.initialSource,
    },
    overrides: {
      ...defaultImported.overrides,
      mapped: { ...defaultImported.overrides.mapped },
    },
    mapping: {
      ...defaultImported.mapping,
    },
  };

  nextElementState.dimensions = {
    ...nextElementState.dimensions,
    width: defaultImported.overrides.width,
    widthUnit: defaultImported.overrides.widthUnit,
    height: defaultImported.overrides.height,
    heightUnit: defaultImported.overrides.heightUnit,
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Clears `source.html` and `source.css` to empty strings while keeping `initialSource` available
 * for future restoration.
 */
export function clearInstanceImportedSource(
  studioState: StudioState,
  instanceId: string
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const nextElementState = cloneElementState(currentInstance.state);
  const currentImported = nextElementState.imported || createDefaultImportedComponentData();

  nextElementState.imported = {
    ...currentImported,
    source: {
      html: '',
      css: '',
    },
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Pure update of the independent `overrides` layer (width, height, spacing, colors, fonts,
 * borders, shadows, border-radius). NEVER touches `source.html` or `source.css`.
 */
export function updateInstanceImportedOverrides(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<Omit<ImportedComponentOverrides, 'mapped'>>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const nextElementState = cloneElementState(currentInstance.state);
  const currentImported = nextElementState.imported || createDefaultImportedComponentData();

  const nextOverrides: ImportedComponentOverrides = {
    ...currentImported.overrides,
    ...patch,
    mapped: { ...currentImported.overrides.mapped },
  };

  nextElementState.imported = {
    ...currentImported,
    overrides: nextOverrides,
  };

  // Sync independent width/height to dimensions summary without coupling width to height
  if (patch.width !== undefined) {
    nextElementState.dimensions.width = patch.width;
  }
  if (patch.widthUnit !== undefined) {
    nextElementState.dimensions.widthUnit = patch.widthUnit;
  }
  if (patch.height !== undefined) {
    nextElementState.dimensions.height = patch.height;
  }
  if (patch.heightUnit !== undefined) {
    nextElementState.dimensions.heightUnit = patch.heightUnit;
  }

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Pure update of mapped target overrides (Title, Description, Action, Image, Icon styles).
 * NEVER touches `source.html` or `source.css`.
 */
export function updateInstanceImportedMappedOverrides(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<ImportedMappedTargetOverrides>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const nextElementState = cloneElementState(currentInstance.state);
  const currentImported = nextElementState.imported || createDefaultImportedComponentData();

  nextElementState.imported = {
    ...currentImported,
    overrides: {
      ...currentImported.overrides,
      mapped: {
        ...currentImported.overrides.mapped,
        ...patch,
      },
    },
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Resets ONLY the independent `overrides` layer back to default while keeping `source.html`
 * and `source.css` 100% intact.
 */
export function resetInstanceImportedOverrides(
  studioState: StudioState,
  registry: ElementRegistry,
  instanceId: string
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const module = getElementModule(registry, currentInstance.elementType);
  const defaultImported =
    module?.defaultState.imported || createDefaultImportedComponentData();

  const nextElementState = cloneElementState(currentInstance.state);
  const currentImported = nextElementState.imported || createDefaultImportedComponentData();

  nextElementState.imported = {
    ...currentImported,
    overrides: {
      ...defaultImported.overrides,
      mapped: { ...defaultImported.overrides.mapped },
    },
  };

  nextElementState.dimensions = {
    ...nextElementState.dimensions,
    width: defaultImported.overrides.width,
    widthUnit: defaultImported.overrides.widthUnit,
    height: defaultImported.overrides.height,
    heightUnit: defaultImported.overrides.heightUnit,
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Updates manual selector mapping (`Root`, `Title`, `Description`, `Action`, `Image`, `Icon`).
 * NEVER touches `source.html` or `source.css`.
 */
export function updateInstanceImportedMapping(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<ImportedSelectorMapping>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const nextElementState = cloneElementState(currentInstance.state);
  const currentImported = nextElementState.imported || createDefaultImportedComponentData();

  nextElementState.imported = {
    ...currentImported,
    mapping: {
      ...currentImported.mapping,
      ...patch,
    },
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

/**
 * Resets ONLY the selector mapping back to default while keeping `source.html`, `source.css`,
 * and general overrides intact.
 */
export function resetInstanceImportedMapping(
  studioState: StudioState,
  registry: ElementRegistry,
  instanceId: string
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }

  const module = getElementModule(registry, currentInstance.elementType);
  const defaultImported =
    module?.defaultState.imported || createDefaultImportedComponentData();

  const nextElementState = cloneElementState(currentInstance.state);
  const currentImported = nextElementState.imported || createDefaultImportedComponentData();

  nextElementState.imported = {
    ...currentImported,
    mapping: {
      ...defaultImported.mapping,
    },
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

// ============================================================================
// Pure State Update Functions for Production Elements (Button, Carousel, Hero,
// Social Dock, Brand Identity, Auth Form)
// ============================================================================

export function updateInstanceButtonData(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<ButtonElementData>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentButton = ensureButtonData(nextElementState);
  nextElementState.button = {
    ...currentButton,
    ...patch,
    defaultStyle: { ...currentButton.defaultStyle },
    hoverStyle: { ...currentButton.hoverStyle },
    activeStyle: { ...currentButton.activeStyle },
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceButtonStateStyle(
  studioState: StudioState,
  instanceId: string,
  stateKey: 'defaultStyle' | 'hoverStyle' | 'activeStyle',
  patch: Partial<ButtonInteractiveStateStyle>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentButton = ensureButtonData(nextElementState);
  nextElementState.button = {
    ...currentButton,
    defaultStyle: { ...currentButton.defaultStyle },
    hoverStyle: { ...currentButton.hoverStyle },
    activeStyle: { ...currentButton.activeStyle },
    [stateKey]: {
      ...currentButton[stateKey],
      ...patch,
    },
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceCarouselData(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<CarouselElementData>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentCarousel = ensureCarouselData(nextElementState);
  nextElementState.carousel = {
    ...currentCarousel,
    ...patch,
    slides: patch.slides ? patch.slides : currentCarousel.slides,
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceCarouselSlideField(
  studioState: StudioState,
  instanceId: string,
  slideIndex: number,
  fieldKey: ContentFieldKey,
  patch: Partial<EditableText>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentCarousel = ensureCarouselData(nextElementState);
  if (slideIndex < 0 || slideIndex >= currentCarousel.slides.length) {
    return studioState;
  }

  const nextSlides = currentCarousel.slides.map((slide, idx) => {
    if (idx !== slideIndex) {
      return slide;
    }
    return {
      ...slide,
      [fieldKey]: {
        ...slide[fieldKey],
        ...patch,
      },
    };
  });

  nextElementState.carousel = {
    ...currentCarousel,
    slides: nextSlides,
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceCarouselSlideMeta(
  studioState: StudioState,
  instanceId: string,
  slideIndex: number,
  patch: Partial<
    Pick<
      CarouselSlideItem,
      'imageUrl' | 'imageAlt' | 'actionBackgroundColor' | 'actionTextColor'
    >
  >
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentCarousel = ensureCarouselData(nextElementState);
  if (slideIndex < 0 || slideIndex >= currentCarousel.slides.length) {
    return studioState;
  }

  const nextSlides = currentCarousel.slides.map((slide, idx) =>
    idx === slideIndex ? { ...slide, ...patch } : slide
  );

  nextElementState.carousel = {
    ...currentCarousel,
    slides: nextSlides,
  };

  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function addInstanceCarouselSlide(
  studioState: StudioState,
  instanceId: string,
  newSlide: CarouselSlideItem
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentCarousel = ensureCarouselData(nextElementState);
  const nextSlides = [...currentCarousel.slides, newSlide];
  nextElementState.carousel = {
    ...currentCarousel,
    slides: nextSlides,
    activeSlideIndex: nextSlides.length - 1,
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function removeInstanceCarouselSlide(
  studioState: StudioState,
  instanceId: string,
  slideIndex: number
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentCarousel = ensureCarouselData(nextElementState);
  if (currentCarousel.slides.length <= 1) {
    return studioState;
  }
  const nextSlides = currentCarousel.slides.filter((_, idx) => idx !== slideIndex);
  nextElementState.carousel = {
    ...currentCarousel,
    slides: nextSlides,
    activeSlideIndex: Math.min(currentCarousel.activeSlideIndex, nextSlides.length - 1),
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceHeroData(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<HeroElementData>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentHero = ensureHeroData(nextElementState);
  nextElementState.hero = {
    ...currentHero,
    ...patch,
    primaryAction: {
      ...currentHero.primaryAction,
      label: { ...currentHero.primaryAction.label },
    },
    secondaryAction: {
      ...currentHero.secondaryAction,
      label: { ...currentHero.secondaryAction.label },
    },
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceHeroAction(
  studioState: StudioState,
  instanceId: string,
  which: 'primaryAction' | 'secondaryAction',
  patch: Partial<HeroActionButtonConfig>,
  labelPatch?: Partial<EditableText>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentHero = ensureHeroData(nextElementState);
  const target = currentHero[which];
  nextElementState.hero = {
    ...currentHero,
    [which]: {
      ...target,
      ...patch,
      label: {
        ...target.label,
        ...(labelPatch || {}),
      },
    },
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceSocialDockData(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<SocialDockElementData>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentDock = ensureSocialDockData(nextElementState);
  nextElementState.socialDock = {
    ...currentDock,
    ...patch,
    items: patch.items ? patch.items : currentDock.items,
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceSocialDockItem(
  studioState: StudioState,
  instanceId: string,
  itemId: string,
  patch: Partial<SocialDockLinkItem>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentDock = ensureSocialDockData(nextElementState);
  nextElementState.socialDock = {
    ...currentDock,
    items: currentDock.items.map((item) =>
      item.id === itemId ? { ...item, ...patch } : item
    ),
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function addInstanceSocialDockItem(
  studioState: StudioState,
  instanceId: string,
  newItem: SocialDockLinkItem
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentDock = ensureSocialDockData(nextElementState);
  nextElementState.socialDock = {
    ...currentDock,
    items: [...currentDock.items, newItem],
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function removeInstanceSocialDockItem(
  studioState: StudioState,
  instanceId: string,
  itemId: string
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentDock = ensureSocialDockData(nextElementState);
  if (currentDock.items.length <= 1) {
    return studioState;
  }
  nextElementState.socialDock = {
    ...currentDock,
    items: currentDock.items.filter((item) => item.id !== itemId),
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceBrandIdentityData(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<BrandIdentityElementData>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentBrand = ensureBrandIdentityData(nextElementState);
  nextElementState.brandIdentity = {
    ...currentBrand,
    ...patch,
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceAuthFormData(
  studioState: StudioState,
  instanceId: string,
  patch: Partial<AuthFormElementData>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentAuth = ensureAuthFormData(nextElementState);
  nextElementState.authForm = {
    ...currentAuth,
    ...patch,
    fields: patch.fields ? patch.fields : currentAuth.fields,
    submitLabel: patch.submitLabel
      ? { ...currentAuth.submitLabel, ...patch.submitLabel }
      : { ...currentAuth.submitLabel },
    secondaryLinkText: patch.secondaryLinkText
      ? { ...currentAuth.secondaryLinkText, ...patch.secondaryLinkText }
      : { ...currentAuth.secondaryLinkText },
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}

export function updateInstanceAuthFormField(
  studioState: StudioState,
  instanceId: string,
  fieldId: string,
  patch: Partial<AuthFormFieldItem>
): StudioState {
  const currentInstance = studioState.instances[instanceId];
  if (!currentInstance) {
    return studioState;
  }
  const nextElementState = cloneElementState(currentInstance.state);
  const currentAuth = ensureAuthFormData(nextElementState);
  nextElementState.authForm = {
    ...currentAuth,
    fields: currentAuth.fields.map((field) =>
      field.id === fieldId ? { ...field, ...patch } : field
    ),
  };
  return {
    ...studioState,
    instances: {
      ...studioState.instances,
      [instanceId]: {
        ...currentInstance,
        stateVersion: currentInstance.stateVersion + 1,
        state: nextElementState,
      },
    },
  };
}



