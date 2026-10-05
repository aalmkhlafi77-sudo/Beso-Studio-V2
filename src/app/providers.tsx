/**
 * Beso Studio V2 — Studio Context & State Provider
 * Manages immutable StudioState and ElementRegistry inside React state
 * without global mutable state or localStorage dependency.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ElementRegistry } from '../core/registry/elementRegistry';
import {
  ContentFieldKey,
  DeclaredSurfaceTokens,
  EditableIcon,
  EditableText,
  IndependentDimensions,
} from '../core/state/elementStateTypes';
import {
  createInitialStudioState,
  createPhaseOneRegistry,
  PreviewState,
  resetEntireInstanceState,
  resetInstanceContentField,
  resetInstanceDimensionField,
  resetInstanceIconField,
  resetInstanceSurfaceField,
  setActiveInstance,
  setAdvertisingSlotEnabled,
  setPreviewState,
  setStudioThemeMode,
  StudioState,
  updateInstanceContentField,
  updateInstanceDimensions,
  updateInstanceIcon,
  updateInstanceSurface,
} from '../core/state/studioStore';
import { applyDocumentTheme, StudioThemeMode } from '../shared/theme/themeTokens';
import { StudioRouteId } from './routes';

export interface StudioContextValue {
  registry: ElementRegistry;
  studioState: StudioState;
  activeRoute: StudioRouteId;
  setActiveRoute: (route: StudioRouteId) => void;
  selectInstance: (instanceId: string) => void;
  setTheme: (theme: StudioThemeMode) => void;
  updateContentField: (fieldKey: ContentFieldKey, patch: Partial<EditableText>) => void;
  resetContentField: (fieldKey: ContentFieldKey) => void;
  updateIcon: (patch: Partial<EditableIcon>) => void;
  resetIconField: (propertyKey?: keyof EditableIcon) => void;
  updateDimensions: (patch: Partial<IndependentDimensions>) => void;
  resetDimensionField: (dimensionKey: keyof IndependentDimensions) => void;
  updateSurface: (patch: Partial<DeclaredSurfaceTokens>) => void;
  resetSurfaceField: (surfaceKey: keyof DeclaredSurfaceTokens) => void;
  resetActiveInstance: () => void;
  updatePreviewState: (patch: Partial<PreviewState>) => void;
  toggleAdSlot: (slotId: string, enabled: boolean) => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export const StudioProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const registry = useMemo(() => createPhaseOneRegistry(), []);
  const [studioState, setStudioState] = useState<StudioState>(() =>
    createInitialStudioState(registry)
  );
  const [activeRoute, setActiveRoute] = useState<StudioRouteId>('workspace');

  useEffect(() => {
    applyDocumentTheme(studioState.theme);
  }, [studioState.theme]);

  const activeInstanceId = studioState.activeInstanceId;

  const value = useMemo<StudioContextValue>(
    () => ({
      registry,
      studioState,
      activeRoute,
      setActiveRoute,
      selectInstance: (instanceId) =>
        setStudioState((prev) => setActiveInstance(prev, instanceId)),
      setTheme: (theme) => setStudioState((prev) => setStudioThemeMode(prev, theme)),
      updateContentField: (fieldKey, patch) =>
        setStudioState((prev) =>
          updateInstanceContentField(prev, prev.activeInstanceId, fieldKey, patch)
        ),
      resetContentField: (fieldKey) =>
        setStudioState((prev) =>
          resetInstanceContentField(prev, registry, prev.activeInstanceId, fieldKey)
        ),
      updateIcon: (patch) =>
        setStudioState((prev) => updateInstanceIcon(prev, prev.activeInstanceId, patch)),
      resetIconField: (propertyKey) =>
        setStudioState((prev) =>
          resetInstanceIconField(prev, registry, prev.activeInstanceId, propertyKey)
        ),
      updateDimensions: (patch) =>
        setStudioState((prev) => updateInstanceDimensions(prev, prev.activeInstanceId, patch)),
      resetDimensionField: (dimensionKey) =>
        setStudioState((prev) =>
          resetInstanceDimensionField(prev, registry, prev.activeInstanceId, dimensionKey)
        ),
      updateSurface: (patch) =>
        setStudioState((prev) => updateInstanceSurface(prev, prev.activeInstanceId, patch)),
      resetSurfaceField: (surfaceKey) =>
        setStudioState((prev) =>
          resetInstanceSurfaceField(prev, registry, prev.activeInstanceId, surfaceKey)
        ),
      resetActiveInstance: () =>
        setStudioState((prev) =>
          resetEntireInstanceState(prev, registry, prev.activeInstanceId)
        ),
      updatePreviewState: (patch) =>
        setStudioState((prev) => setPreviewState(prev, patch)),
      toggleAdSlot: (slotId, enabled) =>
        setStudioState((prev) => setAdvertisingSlotEnabled(prev, slotId, enabled)),
    }),
    [registry, studioState, activeRoute, activeInstanceId]
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudio must be used inside StudioProviders');
  }
  return ctx;
}
