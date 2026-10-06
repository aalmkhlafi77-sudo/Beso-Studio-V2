/**
 * Beso Studio V2 — PreviewAdapter Coordinator
 *
 * Composes the sticky PreviewStage unit inside `.studio-stage-stack` so that
 * `.studio-stage-stack` and `.studio-column-stage` span the entire height of the
 * workspace row alongside the Inspector column without `ExportPanel` prematurely
 * terminating the sticky scope.
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
}) => {
  return (
    <div className="studio-stage-stack" data-testid="studio-stage-stack">
      {/* Sticky Unit: spans within the full-height .studio-stage-stack track on desktop */}
      <div className="studio-preview-sticky-unit" data-testid="studio-preview-sticky-unit">
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
    </div>
  );
};
