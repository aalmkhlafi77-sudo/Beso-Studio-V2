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
  CONTRACT_PROBE_DEFAULT_STATE,
  CONTRACT_PROBE_ID,
  contractProbeRegistration,
} from '../../elements/contract-probe/contractProbeModule';
import { StudioThemeMode } from '../../shared/theme/themeTokens';
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
  admin: AdminConfig;
}

/**
 * Creates the Phase 1 ElementRegistry containing ONLY Contract Probe.
 */
export function createPhaseOneRegistry(): ElementRegistry {
  const empty = createEmptyRegistry();
  return registerElement(empty, contractProbeRegistration);
}

export function createInitialStudioState(
  registry: ElementRegistry = createPhaseOneRegistry()
): StudioState {
  const probeModule = getElementModule(registry, CONTRACT_PROBE_ID);
  const initialElementState = probeModule
    ? cloneElementState(probeModule.defaultState)
    : cloneElementState(CONTRACT_PROBE_DEFAULT_STATE);

  const primaryInstanceId = 'probe-instance-1';
  const secondaryInstanceId = 'probe-instance-2';

  const secondaryState = cloneElementState(initialElementState);
  secondaryState.content.title.value = 'نسخة معزولة ثانية (Instance #2)';
  secondaryState.content.number.value = '2,950';
  secondaryState.dimensions.width = 400;
  secondaryState.dimensions.height = 300;

  return {
    activeInstanceId: primaryInstanceId,
    instances: {
      [primaryInstanceId]: {
        id: primaryInstanceId,
        label: 'مسبار العقد #1 (الرئيسي)',
        elementType: CONTRACT_PROBE_ID,
        scopeId: 'beso-probe-1',
        stateVersion: 1,
        state: initialElementState,
      },
      [secondaryInstanceId]: {
        id: secondaryInstanceId,
        label: 'مسبار العقد #2 (اختبار عزل النسخ)',
        elementType: CONTRACT_PROBE_ID,
        scopeId: 'beso-probe-2',
        stateVersion: 1,
        state: secondaryState,
      },
    },
    theme: 'emerald-luxury',
    preview: {
      viewportPresetId: 'fluid',
      activeOutputTab: 'html',
      showGrid: true,
    },
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
