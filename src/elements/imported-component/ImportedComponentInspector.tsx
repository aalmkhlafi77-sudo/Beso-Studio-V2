/**
 * Beso Studio V2 — Imported Component Inspector & Editor Workspace
 *
 * Implements:
 * 1. Dedicated Editor Workspace + Expandable Modal Window containing:
 *    - HTML Editor (`source.html`)
 *    - CSS Editor (`source.css`)
 *    - Preview Button ("معاينة داخل iframe معزول")
 *    - Clear & Restore Original Source Button ("مسح وإعادة المصدر الأصلي")
 * 2. Isolated `<iframe sandbox="" srcdoc="...">` live preview with zero JavaScript execution.
 * 3. Independent `overrides` layer controls:
 *    Width, Height, Spacing (padding/margin/gap), Colors, Fonts, Borders, Shadows, Border Radius.
 * 4. Optional manual CSS selector mapping (Root, Title, Description, Action, Image, Icon)
 *    without running any script inside the user's iframe.
 * 5. Real-time Warnings detector & Export view (HTML, CSS, Warnings).
 */

import React, { useEffect, useState } from 'react';
import { ExportBundle } from '../../core/export/exportBundle';
import {
  HeightUnitType,
  IndependentElementState,
  ImportedComponentOverrides,
  ImportedMappedTargetOverrides,
  ImportedSelectorMapping,
  ImportedSourceCode,
  TextAlignment,
  WidthUnitType,
} from '../../core/state/elementStateTypes';
import { AVAILABLE_FONTS } from '../../shared/typography/typographyTokens';
import {
  analyzeImportedComponentWarnings,
  buildImportedIframeSrcDoc,
  ensureImportedData,
  IMPORTED_COMPONENT_ID,
} from './importedComponentModule';

export interface ImportedComponentInspectorProps {
  instanceId: string;
  scopeId: string;
  state: IndependentElementState;
  exportBundle: ExportBundle;
  onUpdateSource: (patch: Partial<ImportedSourceCode>) => void;
  onRestoreOriginalSource: () => void;
  onClearSource: () => void;
  onUpdateOverrides: (patch: Partial<Omit<ImportedComponentOverrides, 'mapped'>>) => void;
  onUpdateMappedOverrides: (patch: Partial<ImportedMappedTargetOverrides>) => void;
  onResetOverrides: () => void;
  onUpdateMapping: (patch: Partial<ImportedSelectorMapping>) => void;
  onResetMapping: () => void;
}

type InspectorTabId = 'editor' | 'overrides' | 'mapping' | 'warnings-export';

const SAMPLE_WARNING_HTML = `<div class="promo-box" onclick="alert('blocked')">
  <span class="promo-icon">★</span>
  <img class="promo-img" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500" alt="External" />
  <h2 class="promo-title">عرض خارجي مع روابط وموارد</h2>
  <p class="promo-desc">يختبر هذا المثال رصد التحذيرات للروابط والصور والخطوط والمحددات العامة.</p>
  <a class="promo-action" href="https://example.com/offer">انتقل إلى الرابط الخارجي</a>
</div>`;

const SAMPLE_WARNING_CSS = `@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');

body {
  background: #ff0055;
}

div {
  box-sizing: border-box;
}

@keyframes pulseGlow {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.promo-box {
  background: #132a23;
  color: #ffffff;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #d4af37;
  animation: pulseGlow 3s infinite;
}`;

export const ImportedComponentInspector: React.FC<ImportedComponentInspectorProps> = ({
  instanceId,
  scopeId,
  state,
  exportBundle,
  onUpdateSource,
  onRestoreOriginalSource,
  onClearSource,
  onUpdateOverrides,
  onUpdateMappedOverrides,
  onResetOverrides,
  onUpdateMapping,
  onResetMapping,
}) => {
  const imported = ensureImportedData(state);
  const { source, overrides, mapping } = imported;

  const [activeTab, setActiveTab] = useState<InspectorTabId>('editor');
  const [draftHtml, setDraftHtml] = useState<string>(source.html);
  const [draftCss, setDraftCss] = useState<string>(source.css);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [previewRevision, setPreviewRevision] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync draft editors when external state reset/restoration happens
  useEffect(() => {
    setDraftHtml(source.html);
    setDraftCss(source.css);
  }, [source.html, source.css]);

  const detectedWarnings = analyzeImportedComponentWarnings(source.html, source.css);

  const iframeSrcDoc = buildImportedIframeSrcDoc({
    instanceId,
    scopeId,
    state,
  });

  const handleApplyAndPreview = () => {
    onUpdateSource({
      html: draftHtml,
      css: draftCss,
    });
    setPreviewRevision((r) => r + 1);
  };

  const handleHtmlChange = (nextHtml: string) => {
    setDraftHtml(nextHtml);
    onUpdateSource({ html: nextHtml });
  };

  const handleCssChange = (nextCss: string) => {
    setDraftCss(nextCss);
    onUpdateSource({ css: nextCss });
  };

  const handleClearAndRestoreOriginal = () => {
    onRestoreOriginalSource();
    setPreviewRevision((r) => r + 1);
  };

  const handleClearEditorsOnly = () => {
    setDraftHtml('');
    setDraftCss('');
    onClearSource();
    setPreviewRevision((r) => r + 1);
  };

  const handleCopyText = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const renderCodeEditorsBlock = (inModal = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--studio-radius-sm)',
          backgroundColor: 'var(--studio-bg-elevated)',
          border: '1px solid var(--studio-border-subtle)',
        }}
      >
        <div style={{ fontSize: '0.78rem', color: 'var(--studio-text-secondary)' }}>
          يُحفظ <code>source.html</code> و <code>source.css</code> كما أدخلتهما تمامًا دون تعديل، ويُعرضان داخل{' '}
          <code>&lt;iframe sandbox=&quot;&quot;&gt;</code> معزول بدون JavaScript.
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="studio-btn studio-btn-primary"
            data-testid={inModal ? 'imported-modal-preview-btn' : 'imported-preview-btn'}
            onClick={handleApplyAndPreview}
          >
            معاينة (تحديث المعاينة المعزولة)
          </button>

          <button
            type="button"
            className="studio-btn"
            data-testid={inModal ? 'imported-modal-restore-btn' : 'imported-restore-source-btn'}
            onClick={handleClearAndRestoreOriginal}
            title="مسح التعديلات وإعادة كود المصدر الأصلي"
          >
            مسح وإعادة المصدر الأصلي
          </button>

          <button
            type="button"
            className="studio-btn studio-btn-ghost"
            data-testid={inModal ? 'imported-modal-clear-btn' : 'imported-clear-source-btn'}
            onClick={handleClearEditorsOnly}
            title="تفريغ محرري HTML و CSS"
          >
            مسح الكود
          </button>

          {!inModal && (
            <button
              type="button"
              className="studio-btn studio-btn-ghost"
              data-testid="open-imported-modal-btn"
              onClick={() => setIsEditorModalOpen(true)}
            >
              نافذة التحرير الموسعة ⤢
            </button>
          )}
        </div>
      </div>

      {/* HTML & CSS Editors Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: inModal ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
          gap: '0.85rem',
        }}
      >
        <div className="studio-field-card">
          <div className="studio-field-header">
            <label
              htmlFor={inModal ? 'imported-html-modal-input' : 'imported-html-input'}
              className="studio-field-title"
            >
              محرر HTML الأصلي (<code>source.html</code>)
            </label>
            <span className="studio-panel-meta">{draftHtml.length} حرف</span>
          </div>
          <textarea
            id={inModal ? 'imported-html-modal-input' : 'imported-html-input'}
            data-testid={inModal ? 'imported-modal-html-editor' : 'imported-html-editor'}
            className="studio-textarea"
            dir="ltr"
            rows={inModal ? 12 : 7}
            style={{
              fontFamily: 'var(--studio-font-mono)',
              fontSize: '0.78rem',
              lineHeight: 1.55,
            }}
            value={draftHtml}
            onChange={(e) => handleHtmlChange(e.target.value)}
            placeholder="أدخل كود HTML الخارجي هنا..."
          />
        </div>

        <div className="studio-field-card">
          <div className="studio-field-header">
            <label
              htmlFor={inModal ? 'imported-css-modal-input' : 'imported-css-input'}
              className="studio-field-title"
            >
              محرر CSS الأصلي (<code>source.css</code>)
            </label>
            <span className="studio-panel-meta">{draftCss.length} حرف</span>
          </div>
          <textarea
            id={inModal ? 'imported-css-modal-input' : 'imported-css-input'}
            data-testid={inModal ? 'imported-modal-css-editor' : 'imported-css-editor'}
            className="studio-textarea"
            dir="ltr"
            rows={inModal ? 12 : 7}
            style={{
              fontFamily: 'var(--studio-font-mono)',
              fontSize: '0.78rem',
              lineHeight: 1.55,
            }}
            value={draftCss}
            onChange={(e) => handleCssChange(e.target.value)}
            placeholder="أدخل كود CSS الخارجي هنا..."
          />
        </div>
      </div>

      {/* Quick test preset for warnings */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <span className="studio-panel-meta">
          التحذيرات المرصودة حاليًا: <strong>{detectedWarnings.length}</strong>
        </span>
        <button
          type="button"
          className="studio-btn studio-btn-ghost"
          data-testid="load-warning-sample-btn"
          onClick={() => {
            setDraftHtml(SAMPLE_WARNING_HTML);
            setDraftCss(SAMPLE_WARNING_CSS);
            onUpdateSource({
              html: SAMPLE_WARNING_HTML,
              css: SAMPLE_WARNING_CSS,
            });
            setPreviewRevision((r) => r + 1);
          }}
        >
          تحميل مثال لاختبار التحذيرات (@import / @keyframes / روابط / محددات عامة)
        </button>
      </div>

      {/* Embedded Isolated Iframe Preview inside Editor Workspace */}
      <div className="studio-field-card">
        <div className="studio-field-header">
          <span className="studio-field-title">
            معاينة iframe المعزولة الفورية (Sandbox Iframe — No JS)
          </span>
          <span className="studio-panel-meta">تحديث #{previewRevision}</span>
        </div>
        <iframe
          key={`inspector-iframe-${previewRevision}`}
          data-testid="inspector-isolated-iframe"
          sandbox=""
          referrerPolicy="no-referrer"
          title="معاينة المحرر المعزولة للعنصر المستورد"
          srcDoc={iframeSrcDoc}
          style={{
            width: '100%',
            height: inModal ? '300px' : '230px',
            border: '1px dashed var(--studio-border-strong)',
            borderRadius: 'var(--studio-radius-sm)',
            backgroundColor: 'rgba(0, 0, 0, 0.14)',
          }}
        />
      </div>
    </div>
  );

  return (
    <section
      className="studio-panel"
      aria-label="مفتش ومساحة تحرير العنصر المستورد (Imported Component Inspector)"
    >
      <div className="studio-panel-header">
        <div>
          <h2 className="studio-panel-title">
            استيراد عنصر خارجي ({IMPORTED_COMPONENT_ID})
          </h2>
          <div className="studio-panel-meta">
            حفظ المصدر الأصلي <code>source.html</code> و <code>source.css</code> + طبقة{' '}
            <code>overrides</code> مستقلة + معاينة <code>iframe</code> معزولة
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="studio-btn studio-btn-ghost"
            onClick={onResetOverrides}
            data-testid="reset-imported-overrides-btn"
          >
            إعادة ضبط Overrides فقط
          </button>
          <button
            type="button"
            className="studio-btn"
            onClick={handleClearAndRestoreOriginal}
          >
            إعادة ضبط العنصر المستورد
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs for Imported Component */}
      <div className="studio-tabs-bar" role="tablist" aria-label="أقسام العنصر المستورد">
        <button
          type="button"
          role="tab"
          className="studio-tab-btn"
          data-active={activeTab === 'editor'}
          onClick={() => setActiveTab('editor')}
        >
          1. محرر HTML / CSS والمعاينة
        </button>
        <button
          type="button"
          role="tab"
          className="studio-tab-btn"
          data-active={activeTab === 'overrides'}
          onClick={() => setActiveTab('overrides')}
        >
          2. التخصيصات العامة (Overrides)
        </button>
        <button
          type="button"
          role="tab"
          className="studio-tab-btn"
          data-active={activeTab === 'mapping'}
          onClick={() => setActiveTab('mapping')}
        >
          3. ربط المحددات الاختياري (Mapping)
        </button>
        <button
          type="button"
          role="tab"
          className="studio-tab-btn"
          data-active={activeTab === 'warnings-export'}
          onClick={() => setActiveTab('warnings-export')}
        >
          4. التحذيرات والتصدير ({detectedWarnings.length})
        </button>
      </div>

      <div className="studio-panel-body">
        {/* TAB 1: HTML/CSS EDITOR & ISOLATED IFRAME PREVIEW */}
        {activeTab === 'editor' && renderCodeEditorsBlock(false)}

        {/* TAB 2: INDEPENDENT OVERRIDES LAYER (GENERAL CUSTOMIZATIONS) */}
        {activeTab === 'overrides' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--studio-radius-sm)',
                backgroundColor: 'var(--studio-bg-elevated)',
                border: '1px solid var(--studio-border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--studio-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span>
                جميع التخصيصات أدناه تُحفظ في طبقة <code>overrides</code> مستقلة ولا تعدل{' '}
                <code>source.html</code> أو <code>source.css</code> على الإطلاق.
              </span>
              <button
                type="button"
                className="studio-btn studio-btn-ghost"
                onClick={onResetOverrides}
              >
                مسح جميع التخصيصات (Overrides)
              </button>
            </div>

            {/* 1. Width & Height (Independent) */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">الأبعاد المستقلة (العرض والارتفاع)</span>
              </div>
              <div className="studio-control-grid-2">
                <label className="studio-control-row">
                  <span className="studio-control-label">العرض (Width)</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="number"
                      className="studio-input"
                      data-testid="imported-override-width"
                      disabled={overrides.width === 'auto' || overrides.widthUnit === 'auto'}
                      value={overrides.width === 'auto' ? '' : overrides.width}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val) && val > 0) {
                          onUpdateOverrides({ width: val });
                        }
                      }}
                    />
                    <select
                      className="studio-select"
                      style={{ width: '90px' }}
                      value={overrides.widthUnit}
                      onChange={(e) => {
                        const u = e.target.value as WidthUnitType;
                        onUpdateOverrides({
                          widthUnit: u,
                          width: u === 'auto' ? 'auto' : typeof overrides.width === 'number' ? overrides.width : 480,
                        });
                      }}
                    >
                      <option value="px">px</option>
                      <option value="%">%</option>
                      <option value="vw">vw</option>
                      <option value="auto">auto</option>
                    </select>
                  </div>
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">الارتفاع (Height)</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="number"
                      className="studio-input"
                      data-testid="imported-override-height"
                      disabled={overrides.height === 'auto' || overrides.heightUnit === 'auto'}
                      value={overrides.height === 'auto' ? '' : overrides.height}
                      placeholder="auto"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val) && val > 0) {
                          onUpdateOverrides({ height: val, heightUnit: 'px' });
                        }
                      }}
                    />
                    <select
                      className="studio-select"
                      style={{ width: '90px' }}
                      value={overrides.heightUnit}
                      onChange={(e) => {
                        const u = e.target.value as HeightUnitType;
                        onUpdateOverrides({
                          heightUnit: u,
                          height: u === 'auto' ? 'auto' : typeof overrides.height === 'number' ? overrides.height : 320,
                        });
                      }}
                    >
                      <option value="auto">auto</option>
                      <option value="px">px</option>
                      <option value="%">%</option>
                      <option value="vh">vh</option>
                    </select>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. Spacing (Padding, Margin, Gap) */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">المسافات (Spacing: Padding / Margin / Gap)</span>
              </div>
              <div className="studio-control-grid-2">
                <label className="studio-control-row">
                  <span className="studio-control-label">حشو أفقي Padding X (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="من المصدر الأصلي"
                    value={overrides.paddingX ?? ''}
                    onChange={(e) =>
                      onUpdateOverrides({
                        paddingX: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">حشو عمودي Padding Y (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="من المصدر الأصلي"
                    value={overrides.paddingY ?? ''}
                    onChange={(e) =>
                      onUpdateOverrides({
                        paddingY: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">الهامش الخارجي Margin (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="من المصدر الأصلي"
                    value={overrides.margin ?? ''}
                    onChange={(e) =>
                      onUpdateOverrides({
                        margin: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">تباعد العناصر Gap (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="من المصدر الأصلي"
                    value={overrides.gap ?? ''}
                    onChange={(e) =>
                      onUpdateOverrides({
                        gap: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
            </div>

            {/* 3. Colors */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">الألوان العامة (Colors)</span>
              </div>
              <div className="studio-control-grid-3">
                <label className="studio-control-row">
                  <span className="studio-control-label">لون الخلفية</span>
                  <div className="studio-color-input-wrap">
                    <input
                      type="color"
                      className="studio-color-Swatch"
                      value={overrides.backgroundColor || '#102820'}
                      onChange={(e) => onUpdateOverrides({ backgroundColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="studio-input"
                      dir="ltr"
                      data-testid="imported-override-bg-color"
                      placeholder="افتراضي المصدر"
                      value={overrides.backgroundColor}
                      onChange={(e) => onUpdateOverrides({ backgroundColor: e.target.value })}
                    />
                  </div>
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">لون النص العام</span>
                  <div className="studio-color-input-wrap">
                    <input
                      type="color"
                      className="studio-color-Swatch"
                      value={overrides.textColor || '#ffffff'}
                      onChange={(e) => onUpdateOverrides({ textColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="studio-input"
                      dir="ltr"
                      placeholder="افتراضي المصدر"
                      value={overrides.textColor}
                      onChange={(e) => onUpdateOverrides({ textColor: e.target.value })}
                    />
                  </div>
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">اللون المميز (Accent)</span>
                  <div className="studio-color-input-wrap">
                    <input
                      type="color"
                      className="studio-color-Swatch"
                      value={overrides.accentColor || '#d4af37'}
                      onChange={(e) => onUpdateOverrides({ accentColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="studio-input"
                      dir="ltr"
                      placeholder="افتراضي المصدر"
                      value={overrides.accentColor}
                      onChange={(e) => onUpdateOverrides({ accentColor: e.target.value })}
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Typography / Fonts */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">الخطوط والمحاذاة (Typography)</span>
              </div>
              <div className="studio-control-grid-2">
                <label className="studio-control-row">
                  <span className="studio-control-label">عائلة الخط (Font Family)</span>
                  <select
                    className="studio-select"
                    value={overrides.fontFamily}
                    onChange={(e) => onUpdateOverrides({ fontFamily: e.target.value })}
                  >
                    <option value="">من المصدر الأصلي</option>
                    {AVAILABLE_FONTS.map((f) => (
                      <option key={f.id} value={f.cssValue}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">حجم الخط العام (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="من المصدر الأصلي"
                    value={overrides.fontSize ?? ''}
                    onChange={(e) =>
                      onUpdateOverrides({
                        fontSize: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">وزن الخط (Font Weight)</span>
                  <select
                    className="studio-select"
                    value={overrides.fontWeight ?? ''}
                    onChange={(e) =>
                      onUpdateOverrides({
                        fontWeight: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  >
                    <option value="">من المصدر الأصلي</option>
                    <option value="400">400 (عادي)</option>
                    <option value="500">500 (متوسط)</option>
                    <option value="600">600 (شبه عريض)</option>
                    <option value="700">700 (عريض)</option>
                    <option value="800">800 (عريض جدًا)</option>
                  </select>
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">محاذاة النص (Text Align)</span>
                  <select
                    className="studio-select"
                    value={overrides.textAlign}
                    onChange={(e) =>
                      onUpdateOverrides({
                        textAlign: e.target.value as TextAlignment | '',
                      })
                    }
                  >
                    <option value="">من المصدر الأصلي</option>
                    <option value="start">بداية السطر (Start)</option>
                    <option value="center">توسيط (Center)</option>
                    <option value="end">نهاية السطر (End)</option>
                  </select>
                </label>
              </div>
            </div>

            {/* 5. Borders, Shadows & Border Radius */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">الحدود والظلال والاستدارة (Borders, Shadows & Radius)</span>
              </div>
              <div className="studio-control-grid-2">
                <label className="studio-control-row">
                  <span className="studio-control-label">استدارة الزوايا Border Radius (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    data-testid="imported-override-radius"
                    placeholder="من المصدر الأصلي"
                    value={overrides.borderRadius ?? ''}
                    onChange={(e) =>
                      onUpdateOverrides({
                        borderRadius: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">سماكة الإطار Border Width (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="من المصدر الأصلي"
                    value={overrides.borderWidth ?? ''}
                    onChange={(e) =>
                      onUpdateOverrides({
                        borderWidth: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">نمط الإطار (Border Style)</span>
                  <select
                    className="studio-select"
                    value={overrides.borderStyle}
                    onChange={(e) =>
                      onUpdateOverrides({
                        borderStyle: e.target.value as ImportedComponentOverrides['borderStyle'],
                      })
                    }
                  >
                    <option value="">من المصدر الأصلي</option>
                    <option value="solid">متصل (solid)</option>
                    <option value="dashed">متقطع (dashed)</option>
                    <option value="dotted">منقط (dotted)</option>
                    <option value="none">بدون إطار (none)</option>
                  </select>
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">لون الإطار (Border Color)</span>
                  <div className="studio-color-input-wrap">
                    <input
                      type="color"
                      className="studio-color-Swatch"
                      value={overrides.borderColor || '#d4af37'}
                      onChange={(e) => onUpdateOverrides({ borderColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="studio-input"
                      dir="ltr"
                      placeholder="من المصدر الأصلي"
                      value={overrides.borderColor}
                      onChange={(e) => onUpdateOverrides({ borderColor: e.target.value })}
                    />
                  </div>
                </label>

                <label className="studio-control-row" style={{ gridColumn: '1 / -1' }}>
                  <span className="studio-control-label">الظلال (Box Shadow CSS)</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    placeholder="مثال: 0 20px 44px rgba(0, 0, 0, 0.45)"
                    value={overrides.boxShadow}
                    onChange={(e) => onUpdateOverrides({ boxShadow: e.target.value })}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OPTIONAL MANUAL SELECTOR MAPPING (Root, Title, Description, Action, Image, Icon) */}
        {activeTab === 'mapping' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--studio-radius-sm)',
                backgroundColor: 'var(--studio-bg-elevated)',
                border: '1px solid var(--studio-border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--studio-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span>
                ربط اختياري يدوي لمحددات CSS (Root, Title, Description, Action, Image, Icon) دون تشغيل أي كود داخل الـ iframe.
              </span>
              <button
                type="button"
                className="studio-btn studio-btn-ghost"
                onClick={onResetMapping}
              >
                إعادة المحددات الافتراضية
              </button>
            </div>

            {/* 1. Root Selector */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">1. Root Selector (الحاوي الجذري)</span>
              </div>
              <label className="studio-control-row">
                <span className="studio-control-label">محدد الجذر (CSS Selector)</span>
                <input
                  type="text"
                  className="studio-input"
                  dir="ltr"
                  data-testid="imported-mapping-root"
                  placeholder=".ext-widget"
                  value={mapping.root}
                  onChange={(e) => onUpdateMapping({ root: e.target.value })}
                />
              </label>
            </div>

            {/* 2. Title Selector & Overrides */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">2. Title Mapping (محدد العنوان وتخصيصه)</span>
              </div>
              <div className="studio-control-grid-3">
                <label className="studio-control-row">
                  <span className="studio-control-label">محدد Title</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    data-testid="imported-mapping-title"
                    placeholder=".ext-widget__title"
                    value={mapping.title}
                    onChange={(e) => onUpdateMapping({ title: e.target.value })}
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">لون Title</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    data-testid="imported-mapped-title-color"
                    placeholder="#ffffff"
                    value={overrides.mapped.titleColor}
                    onChange={(e) => onUpdateMappedOverrides({ titleColor: e.target.value })}
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">حجم خط Title (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="تلقائي"
                    value={overrides.mapped.titleFontSize ?? ''}
                    onChange={(e) =>
                      onUpdateMappedOverrides({
                        titleFontSize: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
            </div>

            {/* 3. Description Selector & Overrides */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">3. Description Mapping (محدد الوصف وتخصيصه)</span>
              </div>
              <div className="studio-control-grid-3">
                <label className="studio-control-row">
                  <span className="studio-control-label">محدد Description</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    data-testid="imported-mapping-description"
                    placeholder=".ext-widget__desc"
                    value={mapping.description}
                    onChange={(e) => onUpdateMapping({ description: e.target.value })}
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">لون Description</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    placeholder="#b7ccc4"
                    value={overrides.mapped.descriptionColor}
                    onChange={(e) => onUpdateMappedOverrides({ descriptionColor: e.target.value })}
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">حجم خط Description (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="تلقائي"
                    value={overrides.mapped.descriptionFontSize ?? ''}
                    onChange={(e) =>
                      onUpdateMappedOverrides({
                        descriptionFontSize: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
            </div>

            {/* 4. Action Selector & Overrides */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">4. Action Mapping (محدد الزر/الإجراء وتخصيصه)</span>
              </div>
              <div className="studio-control-grid-3">
                <label className="studio-control-row">
                  <span className="studio-control-label">محدد Action</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    data-testid="imported-mapping-action"
                    placeholder=".ext-widget__action"
                    value={mapping.action}
                    onChange={(e) => onUpdateMapping({ action: e.target.value })}
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">خلفية Action</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    placeholder="#d4af37"
                    value={overrides.mapped.actionBackgroundColor}
                    onChange={(e) =>
                      onUpdateMappedOverrides({ actionBackgroundColor: e.target.value })
                    }
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">لون نص Action</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    placeholder="#091713"
                    value={overrides.mapped.actionTextColor}
                    onChange={(e) => onUpdateMappedOverrides({ actionTextColor: e.target.value })}
                  />
                </label>
              </div>
            </div>

            {/* 5. Image Selector & Overrides */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">5. Image Mapping (محدد الصورة وتخصيصه)</span>
              </div>
              <div className="studio-control-grid-3">
                <label className="studio-control-row">
                  <span className="studio-control-label">محدد Image</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    data-testid="imported-mapping-image"
                    placeholder=".ext-widget__img"
                    value={mapping.image}
                    onChange={(e) => onUpdateMapping({ image: e.target.value })}
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">استدارة الصورة (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="تلقائي"
                    value={overrides.mapped.imageBorderRadius ?? ''}
                    onChange={(e) =>
                      onUpdateMappedOverrides({
                        imageBorderRadius: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">أقصى ارتفاع للصورة (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="تلقائي"
                    value={overrides.mapped.imageMaxHeight ?? ''}
                    onChange={(e) =>
                      onUpdateMappedOverrides({
                        imageMaxHeight: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
            </div>

            {/* 6. Icon Selector & Overrides */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">6. Icon Mapping (محدد الأيقونة وتخصيصه)</span>
              </div>
              <div className="studio-control-grid-3">
                <label className="studio-control-row">
                  <span className="studio-control-label">محدد Icon</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    data-testid="imported-mapping-icon"
                    placeholder=".ext-widget__icon"
                    value={mapping.icon}
                    onChange={(e) => onUpdateMapping({ icon: e.target.value })}
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">لون Icon</span>
                  <input
                    type="text"
                    className="studio-input"
                    dir="ltr"
                    placeholder="#d4af37"
                    value={overrides.mapped.iconColor}
                    onChange={(e) => onUpdateMappedOverrides({ iconColor: e.target.value })}
                  />
                </label>

                <label className="studio-control-row">
                  <span className="studio-control-label">حجم Icon (px)</span>
                  <input
                    type="number"
                    className="studio-input"
                    placeholder="تلقائي"
                    value={overrides.mapped.iconSize ?? ''}
                    onChange={(e) =>
                      onUpdateMappedOverrides({
                        iconSize: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WARNINGS & EXPORT (HTML, CSS, Warnings) */}
        {activeTab === 'warnings-export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* Warnings Section */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">
                  تحذيرات فحص الكود المستورد (Warnings: {detectedWarnings.length})
                </span>
                <span className="studio-panel-meta">
                  فحص الروابط الخارجية، المحددات العامة، @import، @keyframes، والصور/الخطوط الخارجية
                </span>
              </div>

              {detectedWarnings.length === 0 ? (
                <div
                  style={{
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--studio-radius-sm)',
                    backgroundColor: 'var(--studio-success-soft)',
                    border: '1px solid var(--studio-success)',
                    fontSize: '0.82rem',
                  }}
                >
                  لم يتم رصد أي تحذيرات في الكود الحالي (لا توجد روابط خارجية، محددات عامة، @import، @keyframes، أو موارد خارجية).
                </div>
              ) : (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  data-testid="imported-warnings-list"
                >
                  {detectedWarnings.map((w, idx) => (
                    <div
                      key={`${w.code}-${idx}`}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--studio-radius-sm)',
                        backgroundColor: 'var(--studio-bg-elevated)',
                        border: '1px solid var(--studio-accent)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <strong>
                          [{w.code}] {w.categoryLabelAr}
                        </strong>
                        <code style={{ fontSize: '0.74rem', direction: 'ltr' }}>{w.matchSnippet}</code>
                      </div>
                      <span style={{ color: 'var(--studio-text-secondary)' }}>{w.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Exported HTML */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">تصدير HTML (Exported HTML)</span>
                <button
                  type="button"
                  className="studio-btn studio-btn-ghost"
                  onClick={() => handleCopyText(exportBundle.html, 'html')}
                >
                  {copiedKey === 'html' ? 'تم النسخ' : 'نسخ HTML'}
                </button>
              </div>
              <pre className="studio-code-block" style={{ maxHeight: '180px' }}>
                <code>{exportBundle.html}</code>
              </pre>
            </div>

            {/* Exported CSS (Source + Independent Overrides) */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">
                  تصدير CSS (المصدر المعزول + طبقة Overrides المستقلة)
                </span>
                <button
                  type="button"
                  className="studio-btn studio-btn-ghost"
                  onClick={() => handleCopyText(exportBundle.css, 'css')}
                >
                  {copiedKey === 'css' ? 'تم النسخ' : 'نسخ CSS'}
                </button>
              </div>
              <pre className="studio-code-block" style={{ maxHeight: '220px' }}>
                <code>{exportBundle.css}</code>
              </pre>
            </div>

            {/* Exported Warnings JSON */}
            <div className="studio-field-card">
              <div className="studio-field-header">
                <span className="studio-field-title">
                  تصدير التحذيرات (Exported Warnings — {exportBundle.warnings.length})
                </span>
                <button
                  type="button"
                  className="studio-btn studio-btn-ghost"
                  onClick={() =>
                    handleCopyText(JSON.stringify(exportBundle.warnings, null, 2), 'warnings')
                  }
                >
                  {copiedKey === 'warnings' ? 'تم النسخ' : 'نسخ Warnings JSON'}
                </button>
              </div>
              <pre className="studio-code-block" style={{ maxHeight: '160px' }}>
                <code>{JSON.stringify(exportBundle.warnings, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* EXPANDED MODAL EDITOR WINDOW */}
      {isEditorModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="نافذة تحرير واستيراد عنصر خارجي (HTML / CSS)"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            backgroundColor: 'rgba(5, 14, 11, 0.82)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            className="studio-panel"
            style={{
              width: 'min(1120px, 96vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.55)',
            }}
          >
            <div className="studio-panel-header">
              <div>
                <h3 className="studio-panel-title">
                  نافذة تحرير العنصر المستورد (Imported Component Workspace)
                </h3>
                <div className="studio-panel-meta">
                  محرر HTML + محرر CSS + معاينة iframe معزولة + حفظ المصدر الأصلي دون تعديل
                </div>
              </div>
              <button
                type="button"
                className="studio-btn studio-btn-primary"
                data-testid="close-imported-modal-btn"
                onClick={() => setIsEditorModalOpen(false)}
              >
                إغلاق النافذة ✕
              </button>
            </div>
            <div className="studio-panel-body">{renderCodeEditorsBlock(true)}</div>
          </div>
        </div>
      )}
    </section>
  );
};
