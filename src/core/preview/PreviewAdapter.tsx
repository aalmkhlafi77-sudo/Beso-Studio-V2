/**
 * Beso Studio V2 — Preview Adapter & Export Code Viewer
 * Strictly enforces Principle 4 & 8:
 * - Preview and Export rely on the exact same generator output.
 * - Studio Shell CSS is strictly isolated from the generated element's scoped CSS.
 */

import React, { useState } from 'react';
import { VIEWPORT_PRESETS } from '../../shared/responsive/viewportPresets';
import { buildStandaloneHtmlDocument, ExportBundle } from '../export/exportBundle';
import { PreviewResult } from '../registry/elementRegistry';
import { IndependentDimensions } from '../state/elementStateTypes';
import { PreviewState } from '../state/studioStore';

export interface PreviewAdapterProps {
  instanceLabel: string;
  previewResult: PreviewResult;
  exportBundle: ExportBundle;
  dimensions: IndependentDimensions;
  previewState: PreviewState;
  onUpdatePreviewState: (patch: Partial<PreviewState>) => void;
}

export const PreviewAdapter: React.FC<PreviewAdapterProps> = ({
  instanceLabel,
  previewResult,
  exportBundle,
  dimensions,
  previewState,
  onUpdatePreviewState,
}) => {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const selectedViewport =
    VIEWPORT_PRESETS.find((v) => v.id === previewState.viewportPresetId) || VIEWPORT_PRESETS[0];

  const stageMaxWidth =
    selectedViewport.widthPx === 'fluid' ? '100%' : `${selectedViewport.widthPx}px`;

  const handleCopy = (content: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 1800);
  };

  const standaloneHtmlDoc = buildStandaloneHtmlDocument(exportBundle);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Live Scoped Preview Panel */}
      <section className="studio-panel" aria-label="منطقة المعاينة المباشرة">
        <div className="studio-panel-header">
          <div>
            <h2 className="studio-panel-title">المعاينة الحية المعزولة (Preview)</h2>
            <div className="studio-panel-meta">
              {instanceLabel} · النطاق: {previewResult.scopeId}
            </div>
          </div>

          {/* Responsive Viewport Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <label htmlFor="viewport-preset-select" className="studio-panel-meta">
              عرض الشاشة:
            </label>
            <select
              id="viewport-preset-select"
              className="studio-select"
              style={{ width: 'auto', minWidth: '175px' }}
              value={previewState.viewportPresetId}
              onChange={(e) => onUpdatePreviewState({ viewportPresetId: e.target.value })}
            >
              {VIEWPORT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Independent Dimensions Telemetry Bar */}
        <div
          style={{
            padding: '0.55rem 1.125rem',
            borderBottom: '1px solid var(--studio-border-subtle)',
            backgroundColor: 'var(--studio-surface-muted)',
          }}
        >
          <div className="studio-metrics-strip">
            <span>
              العرض المستقل (Width): <strong>{previewResult.dimensionsSummary.widthCss}</strong>
            </span>
            <span className="studio-metrics-separator">·</span>
            <span>
              الارتفاع المستقل (Height): <strong>{previewResult.dimensionsSummary.heightCss}</strong>
            </span>
            <span className="studio-metrics-separator">·</span>
            <span>
              قفل النسبة: <strong>{dimensions.lockAspectRatio ? 'مفعل' : 'معطل (مستقل تمامًا)'}</strong>
            </span>
            <span className="studio-metrics-separator">·</span>
            <span>
              حالة التحقق:{' '}
              <strong>
                {exportBundle.validationErrors.length === 0
                  ? 'سليم (0 أخطاء)'
                  : `${exportBundle.validationErrors.length} تنبيه`}
              </strong>
            </span>
          </div>
        </div>

        <div className="studio-panel-body">
          <div className="studio-preview-viewport-wrapper" data-studio-preview-stage="true">
            <div className="studio-preview-stage" style={{ maxWidth: stageMaxWidth }}>
              {/* Inject Scoped CSS for this element instance only */}
              <style data-scoped-style-for={previewResult.scopeId}>{previewResult.css}</style>
              {/* Render exact generator HTML output */}
              <div
                className="beso-isolated-scope-host"
                dangerouslySetInnerHTML={{ __html: previewResult.html }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* React-Independent Export Bundle Panel */}
      <section className="studio-panel" aria-label="حزمة التصدير المستقلة">
        <div className="studio-panel-header">
          <div>
            <h2 className="studio-panel-title">حزمة التصدير المستقلة (ExportBundle)</h2>
            <div className="studio-panel-meta">
              كود HTML/CSS نقي مستقل تمامًا عن React وTailwind
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="studio-btn"
              onClick={() =>
                handleCopy(
                  previewState.activeOutputTab === 'css'
                    ? exportBundle.css
                    : previewState.activeOutputTab === 'bundle'
                      ? JSON.stringify(exportBundle, null, 2)
                      : exportBundle.html,
                  'الكود المعروض'
                )
              }
            >
              {copiedLabel === 'الكود المعروض' ? 'تم النسخ بنجاح' : 'نسخ التبويب الحالي'}
            </button>
            <button
              type="button"
              className="studio-btn studio-btn-primary"
              onClick={() => handleCopy(standaloneHtmlDoc, 'ملف HTML الكامل')}
            >
              {copiedLabel === 'ملف HTML الكامل' ? 'تم نسخ الملف الكامل' : 'نسخ صفحة HTML+CSS كاملة'}
            </button>
          </div>
        </div>

        {/* Code Output Tabs */}
        <div className="studio-tabs-bar" role="tablist" aria-label="تبويبات الكود المصدر">
          <button
            type="button"
            role="tab"
            className="studio-tab-btn"
            data-active={previewState.activeOutputTab === 'html'}
            onClick={() => onUpdatePreviewState({ activeOutputTab: 'html' })}
          >
            HTML المولد
          </button>
          <button
            type="button"
            role="tab"
            className="studio-tab-btn"
            data-active={previewState.activeOutputTab === 'css'}
            onClick={() => onUpdatePreviewState({ activeOutputTab: 'css' })}
          >
            CSS المعزول ({previewResult.scopeId})
          </button>
          <button
            type="button"
            role="tab"
            className="studio-tab-btn"
            data-active={previewState.activeOutputTab === 'bundle'}
            onClick={() => onUpdatePreviewState({ activeOutputTab: 'bundle' })}
          >
            بيانات الحزمة (Metadata & JSON)
          </button>
          <button
            type="button"
            role="tab"
            className="studio-tab-btn"
            data-active={previewState.activeOutputTab === 'validation'}
            onClick={() => onUpdatePreviewState({ activeOutputTab: 'validation' })}
          >
            التحقق ({exportBundle.validationErrors.length})
          </button>
        </div>

        <div className="studio-panel-body">
          {previewState.activeOutputTab === 'html' && (
            <pre className="studio-code-block">
              <code>{exportBundle.html}</code>
            </pre>
          )}

          {previewState.activeOutputTab === 'css' && (
            <pre className="studio-code-block">
              <code>{exportBundle.css}</code>
            </pre>
          )}

          {previewState.activeOutputTab === 'bundle' && (
            <pre className="studio-code-block">
              <code>{JSON.stringify(exportBundle, null, 2)}</code>
            </pre>
          )}

          {previewState.activeOutputTab === 'validation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {exportBundle.validationErrors.length === 0 ? (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--studio-radius-sm)',
                    backgroundColor: 'var(--studio-success-soft)',
                    border: '1px solid var(--studio-success)',
                    fontSize: '0.85rem',
                  }}
                >
                  حزمة التصدير اجتازت جميع فحوص العقد: لا توجد قيم undefined أو NaN، وجميع القواعد
                  معزولة داخل النطاق {exportBundle.metadata.scopeSelector}.
                </div>
              ) : (
                exportBundle.validationErrors.map((err, idx) => (
                  <div
                    key={`${err.code}-${idx}`}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--studio-radius-sm)',
                      backgroundColor: 'var(--studio-danger-soft)',
                      border: '1px solid var(--studio-danger)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <strong>{err.code}</strong> ({err.field}): {err.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
