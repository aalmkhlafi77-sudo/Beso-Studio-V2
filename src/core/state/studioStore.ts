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
  CARD_DEFAULT_STATE,
  CARD_ELEMENT_ID,
  cardRegistration,
} from '../../elements/card/cardModule';
import {
  CONTRACT_PROBE_DEFAULT_STATE,
  CONTRACT_PROBE_ID,
  contractProbeRegistration,
} from '../../elements/contract-probe/contractProbeModule';
import { StudioThemeMode } from '../../shared/theme/themeTokens';
import { ControlSectionId } from '../controls/controlTypes';
import {
  createEmptyRegistry,
  ElementRegistry,
  getElementModule,
  registerElement,
} from '../registry/elementRegistry';
import {
  cloneElementState,
  ContentFieldKey,
  DeclaredSurfaceTokens,
  EditableIcon,
  EditableText,
  IndependentDimensions,
  IndependentElementState,
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
 * Creates the Studio ElementRegistry containing the production Card element and Contract Probe.
 */
export function createPhaseOneRegistry(): ElementRegistry {
  const empty = createEmptyRegistry();
  const withCard = registerElement(empty, cardRegistration);
  return registerElement(withCard, contractProbeRegistration);
}

export function createInitialStudioState(
  registry: ElementRegistry = createPhaseOneRegistry()
): StudioState {
  const cardMod = getElementModule(registry, CARD_ELEMENT_ID);
  const initialCardState = cardMod
    ? cloneElementState(cardMod.defaultState)
    : cloneElementState(CARD_DEFAULT_STATE);

  const probeModule = getElementModule(registry, CONTRACT_PROBE_ID);
  const initialProbeState = probeModule
    ? cloneElementState(probeModule.defaultState)
    : cloneElementState(CONTRACT_PROBE_DEFAULT_STATE);

  const cardInstanceId = 'card-instance-1';
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
      [cardInstanceId]: {
        id: cardInstanceId,
        label: 'البطاقة الإنتاجية #1 (Card)',
        elementType: CARD_ELEMENT_ID,
        scopeId: 'beso-card-1',
        stateVersion: 1,
        state: initialCardState,
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

