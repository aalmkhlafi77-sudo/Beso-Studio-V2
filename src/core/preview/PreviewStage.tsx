/**
 * Beso Studio V2 — Separated PreviewStage Component
 *
 * Implements Requirement 2 & 3:
 * - Separated from ExportPanel.
 * - In desktop docked mode, ONLY PreviewStage is sticky while scrolling the page
 *   (the parent column is not sticky, so ExportPanel scrolls normally below it).
 * - Uses an internal scrollable container controlled by WorkspaceLayoutState.previewHeight
 *   without trapping page scroll.
 * - Supports switching to Fullscreen Preview mode.
 */

import React from 'react';
import { VIEWPORT_PRESETS } from '../../shared/responsive/viewportPresets';
import { ExportBundle } from '../export/exportBundle';
import { PreviewResult } from '../registry/elementRegistry';
import { IndependentDimensions } from '../state/elementStateTypes';
import { PreviewState } from '../state/studioStore';
import { WorkspaceLayoutState } from '../state/workspaceLayoutStore';

export interface PreviewStageProps {
  instanceLabel: string;
  previewResult: PreviewResult;
  exportBundle: ExportBundle;
  dimensions: IndependentDimensions;
  previewState: PreviewState;
  workspaceLayout: WorkspaceLayoutState;
  onUpdatePreviewState: (patch: Partial<PreviewState>) => void;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
  onResetWorkspaceLayout?: () => void;
  onToggleControlsCollapsed?: () => void;
}

export const PreviewStage: React.FC<PreviewStageProps> = ({
  instanceLabel,
  previewResult,
  exportBundle,
  dimensions,
  previewState,
  workspaceLayout,
  onUpdatePreviewState,
  onEnterFullscreen,
  onExitFullscreen,
  onResetWorkspaceLayout,
  onToggleControlsCollapsed,
}) => {
  const isFullscreen = workspaceLayout.previewMode === 'fullscreen';

  const selectedViewport =
    VIEWPORT_PRESETS.find((v) => v.id === previewState.viewportPresetId) || VIEWPORT_PRESETS[0];

  const stageMaxWidth =
    selectedViewport.widthPx === 'fluid' ? '100%' : `${selectedViewport.widthPx}px`;

  return (
    <section
      className="studio-panel studio-preview-stage-panel"
      data-preview-mode={workspaceLayout.previewMode}
      aria-label="منصة المعاينة الحية المعزولة (PreviewStage)"
    >
      <div className="studio-panel-header">
        <div>
          <h2 className="studio-panel-title">
            {isFullscreen
              ? 'العرض الكامل للمعاينة (Fullscreen Preview)'
              : 'المعاينة الثابتة المعزولة (PreviewStage)'}
          </h2>
          <div className="studio-panel-meta">
            {instanceLabel} · النطاق: {previewResult.scopeId}
          </div>
        </div>

        {/* Preview Stage Actions & Viewport Selector */}
        <div className="studio-stage-toolbar">
          <label htmlFor={`viewport-select-${workspaceLayout.previewMode}`} className="studio-panel-meta">
            محاكاة الشاشة:
          </label>
          <select
            id={`viewport-select-${workspaceLayout.previewMode}`}
            className="studio-select"
            style={{ width: 'auto', minWidth: '155px' }}
            value={previewState.viewportPresetId}
            onChange={(e) => onUpdatePreviewState({ viewportPresetId: e.target.value })}
          >
            {VIEWPORT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>

          {!isFullscreen && onToggleControlsCollapsed && (
            <button
              type="button"
              className="studio-btn studio-btn-ghost"
              onClick={onToggleControlsCollapsed}
              title="طي أو إظهار عمود المكتبة والمفتش"
            >
              {workspaceLayout.controlsCollapsed ? 'إظهار لوحة التحكم' : 'طي لوحة التحكم'}
            </button>
          )}

          {!isFullscreen && onResetWorkspaceLayout && (
            <button
              type="button"
              className="studio-btn studio-btn-ghost"
              onClick={onResetWorkspaceLayout}
              data-testid="reset-workspace-layout-btn"
              title="إعادة أبعاد لوحات مساحة العمل إلى الوضع الافتراضي"
            >
              إعادة التخطيط الافتراضي
            </button>
          )}

          {!isFullscreen && onEnterFullscreen && (
            <button
              type="button"
              className="studio-btn studio-btn-primary"
              data-testid="enter-fullscreen-btn"
              onClick={onEnterFullscreen}
            >
              وضع العرض الكامل
            </button>
          )}

          {isFullscreen && onExitFullscreen && (
            <button
              type="button"
              className="studio-btn studio-btn-primary"
              data-testid="exit-fullscreen-btn"
              onClick={onExitFullscreen}
            >
              خروج من العرض الكامل (Esc)
            </button>
          )}
        </div>
      </div>

      {/* Independent Dimensions vs Workspace Layout Telemetry Bar */}
      <div className="studio-stage-telemetry-bar">
        <div className="studio-metrics-strip">
          <span>
            أبعاد العنصر (Element):{' '}
            <strong>
              {previewResult.dimensionsSummary.widthCss} × {previewResult.dimensionsSummary.heightCss}
            </strong>
          </span>
          <span className="studio-metrics-separator">·</span>
          <span>
            قفل النسبة: <strong>{dimensions.lockAspectRatio ? 'مفعل' : 'معطل (مستقل)'}</strong>
          </span>
          <span className="studio-metrics-separator">·</span>
          <span>
            أبعاد اللوحات (Workspace):{' '}
            <strong>
              تحكم {workspaceLayout.controlsWidth}px / ارتفاع معاينة {workspaceLayout.previewHeight}px
            </strong>
          </span>
          <span className="studio-metrics-separator">·</span>
          <span>
            التحقق:{' '}
            <strong>
              {exportBundle.validationErrors.length === 0
                ? 'سليم (0 أخطاء)'
                : `${exportBundle.validationErrors.length} تنبيه`}
            </strong>
          </span>
        </div>
      </div>

      {/* Scrollable Internal Viewport Canvas */}
      <div className="studio-panel-body studio-preview-stage-body">
        <div
          className="studio-preview-viewport-wrapper"
          data-studio-preview-stage="true"
          style={
            isFullscreen
              ? { height: 'calc(100vh - 150px)', maxHeight: 'calc(100vh - 150px)' }
              : { height: `${workspaceLayout.previewHeight}px`, maxHeight: '72vh' }
          }
        >
          <div className="studio-preview-stage" style={{ maxWidth: stageMaxWidth }}>
            {/* Scoped CSS for this element instance only */}
            <style data-scoped-style-for={previewResult.scopeId}>{previewResult.css}</style>
            {/* Exact generator HTML output */}
            <div
              className="beso-isolated-scope-host"
              dangerouslySetInnerHTML={{ __html: previewResult.html }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
