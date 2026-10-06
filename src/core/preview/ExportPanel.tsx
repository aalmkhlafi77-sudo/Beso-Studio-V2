/**
 * Beso Studio V2 — Separated ExportPanel Component
 *
 * Implements Requirement 2:
 * - Separated from PreviewStage so PreviewStage alone can float/stick on desktop scroll
 *   while ExportPanel remains below the preview or in an independent collapsible region.
 */

import React, { useState } from 'react';
import { buildStandaloneHtmlDocument, ExportBundle } from '../export/exportBundle';
import { PreviewResult } from '../registry/elementRegistry';
import { PreviewState } from '../state/studioStore';

export interface ExportPanelProps {
  previewResult: PreviewResult;
  exportBundle: ExportBundle;
  previewState: PreviewState;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onUpdatePreviewState: (patch: Partial<PreviewState>) => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  previewResult,
  exportBundle,
  previewState,
  collapsed = false,
  onToggleCollapsed,
  onUpdatePreviewState,
}) => {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const handleCopy = (content: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 1800);
  };

  const standaloneHtmlDoc = buildStandaloneHtmlDocument(exportBundle);

  return (
    <section className="studio-panel studio-export-panel" aria-label="لوحة التصدير المستقلة (ExportPanel)">
      <div className="studio-panel-header">
        <div>
          <h2 className="studio-panel-title">لوحة التصدير المستقلة (ExportPanel)</h2>
          <div className="studio-panel-meta">
            كود HTML/CSS نقي مستقل تمامًا عن React وTailwind
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {!collapsed && (
            <>
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
                {copiedLabel === 'ملف HTML الكامل'
                  ? 'تم نسخ الملف الكامل'
                  : 'نسخ صفحة HTML+CSS كاملة'}
              </button>
            </>
          )}

          {onToggleCollapsed && (
            <button
              type="button"
              className="studio-btn studio-btn-ghost"
              aria-expanded={!collapsed}
              onClick={onToggleCollapsed}
            >
              {collapsed ? 'فتح لوحة التصدير ▾' : 'طي لوحة التصدير ▴'}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
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
              التحقق والتحذيرات ({exportBundle.validationErrors.length + exportBundle.warnings.length})
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

                {exportBundle.warnings.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="studio-panel-meta">
                      التحذيرات المرصودة في حزمة التصدير (Warnings: {exportBundle.warnings.length}):
                    </div>
                    {exportBundle.warnings.map((warn, idx) => (
                      <div
                        key={`${warn.code}-${idx}`}
                        style={{
                          padding: '0.7rem 0.95rem',
                          borderRadius: 'var(--studio-radius-sm)',
                          backgroundColor: 'var(--studio-bg-elevated)',
                          border: '1px solid var(--studio-accent)',
                          fontSize: '0.82rem',
                        }}
                      >
                        <strong>[{warn.code}]</strong>: {warn.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};
