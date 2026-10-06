/**
 * Beso Studio V2 — Studio Context & State Provider
 * Manages immutable StudioState (Element instances + WorkspaceLayoutState + InspectorAccordionState)
 * inside React state without global mutable state or localStorage dependency.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ControlSectionId } from '../core/controls/controlTypes';
import { ElementRegistry } from '../core/registry/elementRegistry';
import {
  ContentFieldKey,
  DeclaredSurfaceTokens,
  EditableIcon,
  EditableText,
  IndependentDimensions,
} from '../core/state/elementStateTypes';
import {
  collapseAllInspectorGroupsInSection,
  createInitialStudioState,
  createPhaseOneRegistry,
  expandAllInspectorGroupsInSection,
  PreviewState,
  resetEntireInstanceState,
  resetInstanceAccordionGroup,
  resetInstanceCategorySection,
  resetInstanceContentField,
  resetInstanceDimensionField,
  resetInstanceIconField,
  resetInstanceSurfaceField,
  resetStudioWorkspaceLayout,
  resizeStudioPreviewHeight,
  resizeStudioWorkspaceColumns,
  setActiveInstance,
  setAdvertisingSlotEnabled,
  setFullscreenDrawerTab,
  setInspectorActiveSection,
  setPreviewState,
  setStudioControlsCollapsed,
  setStudioExportCollapsed,
  setStudioPreviewMode,
  setStudioThemeMode,
  StudioState,
  toggleInspectorAccordionGroup,
  updateInstanceContentField,
  updateInstanceDimensions,
  updateInstanceIcon,
  updateInstanceSurface,
} from '../core/state/studioStore';
import { FullscreenDrawerTab, PreviewMode } from '../core/state/workspaceLayoutStore';
import { applyDocumentTheme, StudioThemeMode } from '../shared/theme/themeTokens';
import { StudioRouteId } from './routes';

export interface StudioContextValue {
  registry: ElementRegistry;
  studioState: StudioState;
  activeRoute: StudioRouteId;
  setActiveRoute: (route: StudioRouteId) => void;
  selectInstance: (instanceId: string) => void;
  setTheme: (theme: StudioThemeMode) => void;

  // Element State Actions
  updateContentField: (fieldKey: ContentFieldKey, patch: Partial<EditableText>) => void;
  resetContentField: (fieldKey: ContentFieldKey) => void;
  updateIcon: (patch: Partial<EditableIcon>) => void;
  resetIconField: (propertyKey?: keyof EditableIcon) => void;
  updateDimensions: (patch: Partial<IndependentDimensions>) => void;
  resetDimensionField: (dimensionKey: keyof IndependentDimensions) => void;
  updateSurface: (patch: Partial<DeclaredSurfaceTokens>) => void;
  resetSurfaceField: (surfaceKey: keyof DeclaredSurfaceTokens) => void;
  resetAccordionGroup: (groupId: string) => void;
  resetCategorySection: (section: ControlSectionId) => void;
  resetActiveInstance: () => void;

  // Inspector Accordion Actions
  selectInspectorSection: (section: ControlSectionId) => void;
  toggleAccordionGroup: (groupId: string) => void;
  expandAllGroupsInSection: (section?: ControlSectionId) => void;
  collapseAllGroupsInSection: (section?: ControlSectionId) => void;
  setDrawerTab: (tab: FullscreenDrawerTab) => void;

  // Workspace Layout Actions (Independent from Element State)
  resizeColumnsWidth: (nextControlsWidth: number, totalWorkspaceWidth?: number) => void;
  resizePreviewHeight: (nextPreviewHeight: number) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  toggleControlsPanel: (collapsed?: boolean) => void;
  toggleExportPanel: (collapsed?: boolean) => void;
  resetWorkspaceLayout: () => void;

  // Preview & AdSlot Actions
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

  // Support Escape key to exit fullscreen mode or close fullscreen drawer
  useEffect(() => {
    if (studioState.workspaceLayout.previewMode !== 'fullscreen') {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setStudioState((prev) => setStudioPreviewMode(prev, 'docked'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studioState.workspaceLayout.previewMode]);

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
      resetAccordionGroup: (groupId) =>
        setStudioState((prev) =>
          resetInstanceAccordionGroup(prev, registry, prev.activeInstanceId, groupId)
        ),
      resetCategorySection: (section) =>
        setStudioState((prev) =>
          resetInstanceCategorySection(prev, registry, prev.activeInstanceId, section)
        ),
      resetActiveInstance: () =>
        setStudioState((prev) =>
          resetEntireInstanceState(prev, registry, prev.activeInstanceId)
        ),

      selectInspectorSection: (section) =>
        setStudioState((prev) => setInspectorActiveSection(prev, section)),
      toggleAccordionGroup: (groupId) =>
        setStudioState((prev) => toggleInspectorAccordionGroup(prev, groupId)),
      expandAllGroupsInSection: (section) =>
        setStudioState((prev) => expandAllInspectorGroupsInSection(prev, section)),
      collapseAllGroupsInSection: (section) =>
        setStudioState((prev) => collapseAllInspectorGroupsInSection(prev, section)),
      setDrawerTab: (tab) =>
        setStudioState((prev) => setFullscreenDrawerTab(prev, tab)),

      resizeColumnsWidth: (nextControlsWidth, totalWorkspaceWidth) =>
        setStudioState((prev) =>
          resizeStudioWorkspaceColumns(prev, nextControlsWidth, totalWorkspaceWidth)
        ),
      resizePreviewHeight: (nextPreviewHeight) =>
        setStudioState((prev) => resizeStudioPreviewHeight(prev, nextPreviewHeight)),
      setPreviewMode: (mode) =>
        setStudioState((prev) => setStudioPreviewMode(prev, mode)),
      toggleControlsPanel: (collapsed) =>
        setStudioState((prev) => setStudioControlsCollapsed(prev, collapsed)),
      toggleExportPanel: (collapsed) =>
        setStudioState((prev) => setStudioExportCollapsed(prev, collapsed)),
      resetWorkspaceLayout: () =>
        setStudioState((prev) => resetStudioWorkspaceLayout(prev)),

      updatePreviewState: (patch) =>
        setStudioState((prev) => setPreviewState(prev, patch)),
      toggleAdSlot: (slotId, enabled) =>
        setStudioState((prev) => setAdvertisingSlotEnabled(prev, slotId, enabled)),
    }),
    [registry, studioState, activeRoute]
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
