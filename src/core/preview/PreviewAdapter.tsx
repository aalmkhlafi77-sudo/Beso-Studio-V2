/**
 * Beso Studio V2 — PreviewAdapter Coordinator
 *
 * Composes:
 * 1. Sticky PreviewStage (with horizontal resize handle at its bottom edge).
 * 2. Independent ExportPanel positioned below PreviewStage.
 */

import React from 'react';
import { WorkspaceResizeHandle } from '../../shared/ui/WorkspaceResizeHandle';
import { ExportBundle } from '../export/exportBundle';
import { PreviewResult } from '../registry/elementRegistry';
import { IndependentDimensions } from '../state/elementStateTypes';
import { PreviewState } from '../state/studioStore';
import {
  WORKSPACE_LAYOUT_BOUNDS,
  WorkspaceLayoutState,
} from '../state/workspaceLayoutStore';
import { ExportPanel } from './ExportPanel';
import { PreviewStage } from './PreviewStage';

export interface PreviewAdapterProps {
  instanceLabel: string;
  previewResult: PreviewResult;
  exportBundle: ExportBundle;
  dimensions: IndependentDimensions;
  previewState: PreviewState;
  workspaceLayout: WorkspaceLayoutState;
  onUpdatePreviewState: (patch: Partial<PreviewState>) => void;
  onResizePreviewHeight: (nextHeight: number) => void;
  onEnterFullscreen: () => void;
  onExitFullscreen: () => void;
  onResetWorkspaceLayout: () => void;
  onToggleControlsCollapsed: () => void;
  onToggleExportCollapsed: () => void;
}

export const PreviewAdapter: React.FC<PreviewAdapterProps> = ({
  instanceLabel,
  previewResult,
  exportBundle,
  dimensions,
  previewState,
  workspaceLayout,
  onUpdatePreviewState,
  onResizePreviewHeight,
  onEnterFullscreen,
  onExitFullscreen,
  onResetWorkspaceLayout,
  onToggleControlsCollapsed,
  onToggleExportCollapsed,
}) => {
  return (
    <div className="studio-stage-stack">
      {/* Sticky Unit: ONLY PreviewStage + Horizontal Height Resize Handle stick on desktop scroll */}
      <div className="studio-preview-sticky-unit">
        <PreviewStage
          instanceLabel={instanceLabel}
          previewResult={previewResult}
          exportBundle={exportBundle}
          dimensions={dimensions}
          previewState={previewState}
          workspaceLayout={workspaceLayout}
          onUpdatePreviewState={onUpdatePreviewState}
          onEnterFullscreen={onEnterFullscreen}
          onExitFullscreen={onExitFullscreen}
          onResetWorkspaceLayout={onResetWorkspaceLayout}
          onToggleControlsCollapsed={onToggleControlsCollapsed}
        />

        {/* Horizontal Resize Handle for Preview Height */}
        <WorkspaceResizeHandle
          orientation="horizontal"
          label="مقبض تغيير ارتفاع منطقة المعاينة"
          value={workspaceLayout.previewHeight}
          min={WORKSPACE_LAYOUT_BOUNDS.minPreviewHeight}
          max={WORKSPACE_LAYOUT_BOUNDS.maxPreviewHeight}
          measurementText={`ارتفاع المعاينة: ${workspaceLayout.previewHeight}px (ارتفاع العنصر ثابت: ${previewResult.dimensionsSummary.heightCss})`}
          onChange={onResizePreviewHeight}
          onReset={onResetWorkspaceLayout}
        />
      </div>

      {/* Separated ExportPanel below the sticky preview */}
      <ExportPanel
        previewResult={previewResult}
        exportBundle={exportBundle}
        previewState={previewState}
        collapsed={workspaceLayout.exportCollapsed}
        onToggleCollapsed={onToggleExportCollapsed}
        onUpdatePreviewState={onUpdatePreviewState}
      />
    </div>
  );
};
