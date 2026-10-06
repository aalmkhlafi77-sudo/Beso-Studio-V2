/**
 * Beso Studio V2 — Studio Context & State Provider
 * Manages immutable StudioState (Element instances + WorkspaceLayoutState + InspectorAccordionState)
 * inside React state without global mutable state or localStorage dependency.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ControlSectionId } from '../core/controls/controlTypes';
import { ElementRegistry } from '../core/registry/elementRegistry';
import {
  AuthFormElementData,
  AuthFormFieldItem,
  BrandIdentityElementData,
  ButtonElementData,
  ButtonInteractiveStateStyle,
  CarouselElementData,
  CarouselSlideItem,
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
  SocialDockElementData,
  SocialDockLinkItem,
} from '../core/state/elementStateTypes';
import {
  addInstanceCarouselSlide,
  addInstanceSocialDockItem,
  clearInstanceImportedSource,
  collapseAllInspectorGroupsInSection,
  createInitialStudioState,
  createPhaseOneRegistry,
  expandAllInspectorGroupsInSection,
  PreviewState,
  removeInstanceCarouselSlide,
  removeInstanceSocialDockItem,
  resetEntireInstanceState,
  resetInstanceAccordionGroup,
  resetInstanceCategorySection,
  resetInstanceContentField,
  resetInstanceDimensionField,
  resetInstanceIconField,
  resetInstanceImportedMapping,
  resetInstanceImportedOverrides,
  resetInstanceSurfaceField,
  resetStudioWorkspaceLayout,
  resizeStudioPreviewHeight,
  resizeStudioWorkspaceColumns,
  restoreInstanceImportedOriginalSource,
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
  updateInstanceAuthFormData,
  updateInstanceAuthFormField,
  updateInstanceBrandIdentityData,
  updateInstanceButtonData,
  updateInstanceButtonStateStyle,
  updateInstanceCarouselData,
  updateInstanceCarouselSlideField,
  updateInstanceCarouselSlideMeta,
  updateInstanceContentField,
  updateInstanceDimensions,
  updateInstanceHeroAction,
  updateInstanceHeroData,
  updateInstanceIcon,
  updateInstanceImportedMappedOverrides,
  updateInstanceImportedMapping,
  updateInstanceImportedOverrides,
  updateInstanceImportedSource,
  updateInstanceSocialDockData,
  updateInstanceSocialDockItem,
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

  // Imported Component Actions
  updateImportedSource: (patch: Partial<ImportedSourceCode>) => void;
  restoreImportedOriginalSource: () => void;
  clearImportedSource: () => void;
  updateImportedOverrides: (patch: Partial<Omit<ImportedComponentOverrides, 'mapped'>>) => void;
  updateImportedMappedOverrides: (patch: Partial<ImportedMappedTargetOverrides>) => void;
  resetImportedOverrides: () => void;
  updateImportedMapping: (patch: Partial<ImportedSelectorMapping>) => void;
  resetImportedMapping: () => void;

  // Production Elements Actions (Button, Carousel, Hero, Social Dock, Brand Identity, Auth Form)
  updateButtonData: (patch: Partial<ButtonElementData>) => void;
  updateButtonStateStyle: (
    stateKey: 'defaultStyle' | 'hoverStyle' | 'activeStyle',
    patch: Partial<ButtonInteractiveStateStyle>
  ) => void;
  updateCarouselData: (patch: Partial<CarouselElementData>) => void;
  updateCarouselSlideField: (
    slideIndex: number,
    fieldKey: ContentFieldKey,
    patch: Partial<EditableText>
  ) => void;
  updateCarouselSlideMeta: (
    slideIndex: number,
    patch: Partial<
      Pick<
        CarouselSlideItem,
        'imageUrl' | 'imageAlt' | 'actionBackgroundColor' | 'actionTextColor'
      >
    >
  ) => void;
  addCarouselSlide: (newSlide: CarouselSlideItem) => void;
  removeCarouselSlide: (slideIndex: number) => void;
  updateHeroData: (patch: Partial<HeroElementData>) => void;
  updateHeroAction: (
    which: 'primaryAction' | 'secondaryAction',
    patch: Partial<HeroActionButtonConfig>,
    labelPatch?: Partial<EditableText>
  ) => void;
  updateSocialDockData: (patch: Partial<SocialDockElementData>) => void;
  updateSocialDockItem: (itemId: string, patch: Partial<SocialDockLinkItem>) => void;
  addSocialDockItem: (newItem: SocialDockLinkItem) => void;
  removeSocialDockItem: (itemId: string) => void;
  updateBrandIdentityData: (patch: Partial<BrandIdentityElementData>) => void;
  updateAuthFormData: (patch: Partial<AuthFormElementData>) => void;
  updateAuthFormField: (fieldId: string, patch: Partial<AuthFormFieldItem>) => void;
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

      updateImportedSource: (patch) =>
        setStudioState((prev) =>
          updateInstanceImportedSource(prev, prev.activeInstanceId, patch)
        ),
      restoreImportedOriginalSource: () =>
        setStudioState((prev) =>
          restoreInstanceImportedOriginalSource(prev, registry, prev.activeInstanceId)
        ),
      clearImportedSource: () =>
        setStudioState((prev) =>
          clearInstanceImportedSource(prev, prev.activeInstanceId)
        ),
      updateImportedOverrides: (patch) =>
        setStudioState((prev) =>
          updateInstanceImportedOverrides(prev, prev.activeInstanceId, patch)
        ),
      updateImportedMappedOverrides: (patch) =>
        setStudioState((prev) =>
          updateInstanceImportedMappedOverrides(prev, prev.activeInstanceId, patch)
        ),
      resetImportedOverrides: () =>
        setStudioState((prev) =>
          resetInstanceImportedOverrides(prev, registry, prev.activeInstanceId)
        ),
      updateImportedMapping: (patch) =>
        setStudioState((prev) =>
          updateInstanceImportedMapping(prev, prev.activeInstanceId, patch)
        ),
      resetImportedMapping: () =>
        setStudioState((prev) =>
          resetInstanceImportedMapping(prev, registry, prev.activeInstanceId)
        ),

      updateButtonData: (patch) =>
        setStudioState((prev) =>
          updateInstanceButtonData(prev, prev.activeInstanceId, patch)
        ),
      updateButtonStateStyle: (stateKey, patch) =>
        setStudioState((prev) =>
          updateInstanceButtonStateStyle(prev, prev.activeInstanceId, stateKey, patch)
        ),
      updateCarouselData: (patch) =>
        setStudioState((prev) =>
          updateInstanceCarouselData(prev, prev.activeInstanceId, patch)
        ),
      updateCarouselSlideField: (slideIndex, fieldKey, patch) =>
        setStudioState((prev) =>
          updateInstanceCarouselSlideField(
            prev,
            prev.activeInstanceId,
            slideIndex,
            fieldKey,
            patch
          )
        ),
      updateCarouselSlideMeta: (slideIndex, patch) =>
        setStudioState((prev) =>
          updateInstanceCarouselSlideMeta(prev, prev.activeInstanceId, slideIndex, patch)
        ),
      addCarouselSlide: (newSlide) =>
        setStudioState((prev) =>
          addInstanceCarouselSlide(prev, prev.activeInstanceId, newSlide)
        ),
      removeCarouselSlide: (slideIndex) =>
        setStudioState((prev) =>
          removeInstanceCarouselSlide(prev, prev.activeInstanceId, slideIndex)
        ),
      updateHeroData: (patch) =>
        setStudioState((prev) =>
          updateInstanceHeroData(prev, prev.activeInstanceId, patch)
        ),
      updateHeroAction: (which, patch, labelPatch) =>
        setStudioState((prev) =>
          updateInstanceHeroAction(prev, prev.activeInstanceId, which, patch, labelPatch)
        ),
      updateSocialDockData: (patch) =>
        setStudioState((prev) =>
          updateInstanceSocialDockData(prev, prev.activeInstanceId, patch)
        ),
      updateSocialDockItem: (itemId, patch) =>
        setStudioState((prev) =>
          updateInstanceSocialDockItem(prev, prev.activeInstanceId, itemId, patch)
        ),
      addSocialDockItem: (newItem) =>
        setStudioState((prev) =>
          addInstanceSocialDockItem(prev, prev.activeInstanceId, newItem)
        ),
      removeSocialDockItem: (itemId) =>
        setStudioState((prev) =>
          removeInstanceSocialDockItem(prev, prev.activeInstanceId, itemId)
        ),
      updateBrandIdentityData: (patch) =>
        setStudioState((prev) =>
          updateInstanceBrandIdentityData(prev, prev.activeInstanceId, patch)
        ),
      updateAuthFormData: (patch) =>
        setStudioState((prev) =>
          updateInstanceAuthFormData(prev, prev.activeInstanceId, patch)
        ),
      updateAuthFormField: (fieldId, patch) =>
        setStudioState((prev) =>
          updateInstanceAuthFormField(prev, prev.activeInstanceId, fieldId, patch)
        ),
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
