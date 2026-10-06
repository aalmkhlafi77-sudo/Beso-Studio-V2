/**
 * Beso Studio V2 — Workspace Layout State & Inspector Accordion State
 *
 * Strictly separated from ElementInstance.state (Contract Probe state):
 * - Changing workspace panel widths or preview height NEVER alters element dimensions.
 * - Changing element dimensions NEVER alters workspace panel widths or preview height.
 */

import { ControlSectionId } from '../controls/controlTypes';
import {
  ContentFieldKey,
  DeclaredSurfaceTokens,
  EditableIcon,
  EditableText,
  IndependentDimensions,
  IndependentElementState,
} from './elementStateTypes';

export type PreviewMode = 'docked' | 'fullscreen';

export type FullscreenDrawerTab = 'none' | 'inspector' | 'library' | 'export';

/**
 * Requirement 5: Independent WorkspaceLayoutState contract
 */
export type WorkspaceLayoutState = {
  controlsWidth: number;
  stageWidth: number;
  previewHeight: number;
  previewMode: PreviewMode;
  controlsCollapsed: boolean;
  exportCollapsed: boolean;
};

export interface InspectorAccordionState {
  activeSection: ControlSectionId;
  openGroupIds: string[];
  fullscreenDrawerTab: FullscreenDrawerTab;
}

export const WORKSPACE_LAYOUT_BOUNDS = {
  minControlsWidth: 320,
  maxControlsWidth: 780,
  defaultControlsWidth: 520,

  minStageWidth: 340,
  maxStageWidth: 1100,
  defaultStageWidth: 680,

  minPreviewHeight: 240,
  maxPreviewHeight: 820,
  defaultPreviewHeight: 420,
} as const;

export const ALL_ACCORDION_GROUP_IDS: Record<ControlSectionId, string[]> = {
  content: ['content-basic', 'content-metrics', 'content-advanced'],
  dimensions: ['dimensions-basic', 'dimensions-advanced'],
  icon: ['icon-basic', 'icon-advanced'],
  appearance: ['appearance-basic', 'appearance-advanced'],
};

/**
 * Default open groups: only the primary basic group in each category is open by default;
 * all advanced groups are collapsed by default.
 */
export const DEFAULT_OPEN_ACCORDION_IDS: string[] = [
  'content-basic',
  'dimensions-basic',
  'icon-basic',
  'appearance-basic',
];

export function clampValue(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function createInitialWorkspaceLayoutState(): WorkspaceLayoutState {
  return {
    controlsWidth: WORKSPACE_LAYOUT_BOUNDS.defaultControlsWidth,
    stageWidth: WORKSPACE_LAYOUT_BOUNDS.defaultStageWidth,
    previewHeight: WORKSPACE_LAYOUT_BOUNDS.defaultPreviewHeight,
    previewMode: 'docked',
    controlsCollapsed: false,
    exportCollapsed: false,
  };
}

export function createInitialInspectorAccordionState(): InspectorAccordionState {
  return {
    activeSection: 'content',
    openGroupIds: [...DEFAULT_OPEN_ACCORDION_IDS],
    fullscreenDrawerTab: 'none',
  };
}

/**
 * Pure update for vertical resize handle (adjusts controlsWidth and stageWidth within bounds).
 */
export function updateWorkspaceColumnsWidth(
  layout: WorkspaceLayoutState,
  nextControlsWidth: number,
  totalWorkspaceWidth?: number
): WorkspaceLayoutState {
  const clampedControls = clampValue(
    nextControlsWidth,
    WORKSPACE_LAYOUT_BOUNDS.minControlsWidth,
    WORKSPACE_LAYOUT_BOUNDS.maxControlsWidth
  );

  let nextStageWidth = layout.stageWidth;
  if (typeof totalWorkspaceWidth === 'number' && totalWorkspaceWidth > 720) {
    const remaining = totalWorkspaceWidth - clampedControls - 24;
    nextStageWidth = clampValue(
      remaining,
      WORKSPACE_LAYOUT_BOUNDS.minStageWidth,
      WORKSPACE_LAYOUT_BOUNDS.maxStageWidth
    );
  } else {
    const delta = clampedControls - layout.controlsWidth;
    nextStageWidth = clampValue(
      layout.stageWidth - delta,
      WORKSPACE_LAYOUT_BOUNDS.minStageWidth,
      WORKSPACE_LAYOUT_BOUNDS.maxStageWidth
    );
  }

  return {
    ...layout,
    controlsWidth: clampedControls,
    stageWidth: nextStageWidth,
  };
}

/**
 * Pure update for horizontal resize handle (adjusts previewHeight within bounds).
 */
export function updateWorkspacePreviewHeight(
  layout: WorkspaceLayoutState,
  nextPreviewHeight: number
): WorkspaceLayoutState {
  const clampedHeight = clampValue(
    nextPreviewHeight,
    WORKSPACE_LAYOUT_BOUNDS.minPreviewHeight,
    WORKSPACE_LAYOUT_BOUNDS.maxPreviewHeight
  );

  return {
    ...layout,
    previewHeight: clampedHeight,
  };
}

export function setWorkspacePreviewMode(
  layout: WorkspaceLayoutState,
  previewMode: PreviewMode
): WorkspaceLayoutState {
  return {
    ...layout,
    previewMode,
  };
}

export function toggleControlsCollapsed(
  layout: WorkspaceLayoutState,
  collapsed?: boolean
): WorkspaceLayoutState {
  return {
    ...layout,
    controlsCollapsed: collapsed !== undefined ? collapsed : !layout.controlsCollapsed,
  };
}

export function toggleExportCollapsed(
  layout: WorkspaceLayoutState,
  collapsed?: boolean
): WorkspaceLayoutState {
  return {
    ...layout,
    exportCollapsed: collapsed !== undefined ? collapsed : !layout.exportCollapsed,
  };
}

/**
 * Comparison helpers to count modified values per field, accordion group, and section.
 */
export function isEditableTextModified(current: EditableText, def: EditableText): boolean {
  return (
    current.value !== def.value ||
    current.visible !== def.visible ||
    current.color !== def.color ||
    current.fontFamily !== def.fontFamily ||
    current.fontSize !== def.fontSize ||
    current.fontWeight !== def.fontWeight ||
    current.lineHeight !== def.lineHeight ||
    current.letterSpacing !== def.letterSpacing ||
    current.align !== def.align
  );
}

export function isEditableTextTypographyModified(
  current: EditableText,
  def: EditableText
): boolean {
  return (
    current.fontFamily !== def.fontFamily ||
    current.fontSize !== def.fontSize ||
    current.fontWeight !== def.fontWeight ||
    current.lineHeight !== def.lineHeight ||
    current.letterSpacing !== def.letterSpacing ||
    current.align !== def.align
  );
}

export function countModifiedInEditableText(current: EditableText, def: EditableText): number {
  let count = 0;
  if (current.value !== def.value) count += 1;
  if (current.visible !== def.visible) count += 1;
  if (current.color !== def.color) count += 1;
  if (current.fontFamily !== def.fontFamily) count += 1;
  if (current.fontSize !== def.fontSize) count += 1;
  if (current.fontWeight !== def.fontWeight) count += 1;
  if (current.lineHeight !== def.lineHeight) count += 1;
  if (current.letterSpacing !== def.letterSpacing) count += 1;
  if (current.align !== def.align) count += 1;
  return count;
}

export function countAccordionGroupModifications(
  state: IndependentElementState,
  defaults: IndependentElementState,
  groupId: string
): number {
  switch (groupId) {
    case 'content-basic': {
      const keys: ContentFieldKey[] = ['title', 'description', 'badge', 'actionLabel'];
      return keys.reduce((acc, k) => {
        const cur = state.content[k];
        const def = defaults.content[k];
        let diff = 0;
        if (cur.value !== def.value) diff += 1;
        if (cur.visible !== def.visible) diff += 1;
        if (cur.color !== def.color) diff += 1;
        return acc + diff;
      }, 0);
    }
    case 'content-metrics': {
      const keys: ContentFieldKey[] = ['number', 'percentage', 'analysis'];
      return keys.reduce((acc, k) => {
        const cur = state.content[k];
        const def = defaults.content[k];
        let diff = 0;
        if (cur.value !== def.value) diff += 1;
        if (cur.visible !== def.visible) diff += 1;
        if (cur.color !== def.color) diff += 1;
        return acc + diff;
      }, 0);
    }
    case 'content-advanced': {
      const allKeys: ContentFieldKey[] = [
        'title',
        'description',
        'number',
        'percentage',
        'analysis',
        'actionLabel',
        'badge',
      ];
      return allKeys.reduce((acc, k) => {
        const cur = state.content[k];
        const def = defaults.content[k];
        let diff = 0;
        if (cur.fontFamily !== def.fontFamily) diff += 1;
        if (cur.fontSize !== def.fontSize) diff += 1;
        if (cur.fontWeight !== def.fontWeight) diff += 1;
        if (cur.lineHeight !== def.lineHeight) diff += 1;
        if (cur.letterSpacing !== def.letterSpacing) diff += 1;
        if (cur.align !== def.align) diff += 1;
        return acc + diff;
      }, 0);
    }
    case 'dimensions-basic': {
      let diff = 0;
      if (state.dimensions.width !== defaults.dimensions.width) diff += 1;
      if (state.dimensions.widthUnit !== defaults.dimensions.widthUnit) diff += 1;
      if (state.dimensions.height !== defaults.dimensions.height) diff += 1;
      if (state.dimensions.heightUnit !== defaults.dimensions.heightUnit) diff += 1;
      return diff;
    }
    case 'dimensions-advanced': {
      const keys: Array<keyof IndependentDimensions> = [
        'minWidth',
        'maxWidth',
        'minHeight',
        'maxHeight',
        'lockAspectRatio',
      ];
      return keys.reduce(
        (acc, k) => acc + (state.dimensions[k] !== defaults.dimensions[k] ? 1 : 0),
        0
      );
    }
    case 'icon-basic': {
      const keys: Array<keyof EditableIcon> = ['visible', 'source', 'value', 'color', 'size'];
      return keys.reduce((acc, k) => acc + (state.icon[k] !== defaults.icon[k] ? 1 : 0), 0);
    }
    case 'icon-advanced': {
      const keys: Array<keyof EditableIcon> = ['rotate', 'position'];
      return keys.reduce((acc, k) => acc + (state.icon[k] !== defaults.icon[k] ? 1 : 0), 0);
    }
    case 'appearance-basic': {
      const keys: Array<keyof DeclaredSurfaceTokens> = [
        'materialType',
        'primaryColor',
        'secondaryColor',
        'gradientDirection',
        'opacity',
        'backgroundColor',
        'borderColor',
        'accentColor',
        'actionBackgroundColor',
        'actionTextColor',
        'borderRadius',
      ];
      return keys.reduce((acc, k) => acc + (state.surface[k] !== defaults.surface[k] ? 1 : 0), 0);
    }
    case 'appearance-advanced': {
      const keys: Array<keyof DeclaredSurfaceTokens> = [
        'glassBlur',
        'glowIntensity',
        'glowColor',
        'shadowIntensity',
        'shadowColor',
        'patternType',
        'imageSourceUrl',
        'badgeBackgroundColor',
        'iconContainerBackground',
        'borderWidth',
        'paddingX',
        'paddingY',
        'gap',
      ];
      return keys.reduce((acc, k) => acc + (state.surface[k] !== defaults.surface[k] ? 1 : 0), 0);
    }
    default:
      return 0;
  }
}

export function countSectionModifications(
  state: IndependentElementState,
  defaults: IndependentElementState,
  section: ControlSectionId
): number {
  const groups = ALL_ACCORDION_GROUP_IDS[section] || [];
  return groups.reduce(
    (sum, groupId) => sum + countAccordionGroupModifications(state, defaults, groupId),
    0
  );
}
