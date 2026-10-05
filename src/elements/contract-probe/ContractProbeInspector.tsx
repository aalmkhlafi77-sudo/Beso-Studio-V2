/**
 * Beso Studio V2 — Contract Probe Inspector
 * Provides independent controls and single-field reset buttons for:
 * 1. All 7 independent content fields (title, description, number, percentage, analysis, actionLabel, badge)
 * 2. Independent dimensions (width vs height, units, min/max, optional lockAspectRatio)
 * 3. Independent icon configuration (visible, source, value, color, size, rotate, position)
 * 4. Declared surface tokens (colors, radius, border width, paddings, gap)
 */

import React, { useState } from 'react';
import { BUILTIN_ICON_LIBRARY } from '../../core/assets/assetTypes';
import { CONTENT_FIELD_LABELS, ControlSectionId } from '../../core/controls/controlTypes';
import {
  ContentFieldKey,
  DeclaredSurfaceTokens,
  EditableIcon,
  EditableText,
  HeightUnitType,
  IconPositionType,
  IconSourceType,
  IndependentDimensions,
  IndependentElementState,
  WidthUnitType,
} from '../../core/state/elementStateTypes';
import {
  AVAILABLE_FONTS,
  FONT_WEIGHT_OPTIONS,
  TEXT_ALIGNMENT_OPTIONS,
  TextAlignment,
} from '../../shared/typography/typographyTokens';

export interface ContractProbeInspectorProps {
  state: IndependentElementState;
  onUpdateContentField: (fieldKey: ContentFieldKey, patch: Partial<EditableText>) => void;
  onResetContentField: (fieldKey: ContentFieldKey) => void;
  onUpdateIcon: (patch: Partial<EditableIcon>) => void;
  onResetIconField: (propertyKey?: keyof EditableIcon) => void;
  onUpdateDimensions: (patch: Partial<IndependentDimensions>) => void;
  onResetDimensionField: (dimensionKey: keyof IndependentDimensions) => void;
  onUpdateSurface: (patch: Partial<DeclaredSurfaceTokens>) => void;
  onResetSurfaceField: (surfaceKey: keyof DeclaredSurfaceTokens) => void;
  onResetAll: () => void;
}

const ORDERED_CONTENT_KEYS: ContentFieldKey[] = [
  'title',
  'description',
  'number',
  'percentage',
  'analysis',
  'actionLabel',
  'badge',
];

export const ContractProbeInspector: React.FC<ContractProbeInspectorProps> = ({
  state,
  onUpdateContentField,
  onResetContentField,
  onUpdateIcon,
  onResetIconField,
  onUpdateDimensions,
  onResetDimensionField,
  onUpdateSurface,
  onResetSurfaceField,
  onResetAll,
}) => {
  const [activeSection, setActiveSection] = useState<ControlSectionId>('content');
  const [activeContentField, setActiveContentField] = useState<ContentFieldKey>('title');

  const currentTextField = state.content[activeContentField];
  const { icon, dimensions, surface } = state;

  return (
    <section className="studio-panel" aria-label="المفتش التجريبي (Inspector)">
      <div className="studio-panel-header">
        <div>
          <h2 className="studio-panel-title">المفتش المستقل (Contract Inspector)</h2>
          <div className="studio-panel-meta">
            تعديل أو إعادة ضبط أي حقل يتم بمعزل تام عن بقية الحقول
          </div>
        </div>
        <button
          type="button"
          className="studio-btn studio-btn-ghost"
          onClick={onResetAll}
          title="إعادة ضبط جميع حقول هذه النسخة إلى القيم الافتراضية"
        >
          إعادة ضبط النسخة بالكامل
        </button>
      </div>

      {/* Main Inspector Section Tabs */}
      <div className="studio-tabs-bar" role="tablist" aria-label="أقسام المفتش">
        <button
          type="button"
          role="tab"
          className="studio-tab-btn"
          data-active={activeSection === 'content'}
          onClick={() => setActiveSection('content')}
        >
          1. النصوص السبعة المستقلة
        </button>
        <button
          type="button"
          role="tab"
          className="studio-tab-btn"
          data-active={activeSection === 'dimensions'}
          onClick={() => setActiveSection('dimensions')}
        >
          2. العرض والارتفاع المستقلان
        </button>
        <button
          type="button"
          role="tab"
          className="studio-tab-btn"
          data-active={activeSection === 'icon'}
          onClick={() => setActiveSection('icon')}
        >
          3. الأيقونة المستقلة
        </button>
        <button
          type="button"
          role="tab"
          className="studio-tab-btn"
          data-active={activeSection === 'appearance'}
          onClick={() => setActiveSection('appearance')}
        >
          4. الألوان والأحجام المعلنة
        </button>
      </div>

      <div className="studio-panel-body">
        {/* SECTION 1: INDEPENDENT CONTENT FIELDS */}
        {activeSection === 'content' && (
          <div>
            {/* Quick Overview Matrix of all 7 fields for rapid editing */}
            <div className="studio-control-group">
              <div className="studio-control-header">
                <span className="studio-control-label">
                  التحرير السريع للحقول النصية السبعة (مستقلة تمامًا)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {ORDERED_CONTENT_KEYS.map((key) => {
                  const item = state.content[key];
                  const isSelected = activeContentField === key;
                  return (
                    <div
                      key={key}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--studio-radius-sm)',
                        border: isSelected
                          ? '1px solid var(--studio-accent)'
                          : '1px solid var(--studio-border-subtle)',
                        backgroundColor: isSelected
                          ? 'var(--studio-accent-soft)'
                          : 'var(--studio-surface-muted)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          marginBottom: '0.4rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            id={`visible-${key}`}
                            checked={item.visible}
                            onChange={(e) =>
                              onUpdateContentField(key, { visible: e.target.checked })
                            }
                          />
                          <label
                            htmlFor={`visible-${key}`}
                            style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            {CONTENT_FIELD_LABELS[key]}
                          </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="studio-btn studio-btn-ghost"
                            onClick={() => setActiveContentField(key)}
                          >
                            {isSelected ? 'تخصيص الخط واللون ▼' : 'تخصيص الخط واللون'}
                          </button>
                          <button
                            type="button"
                            className="studio-btn studio-btn-ghost"
                            onClick={() => onResetContentField(key)}
                            data-testid={`reset-content-${key}`}
                          >
                            إعادة ضبط الحقل فقط
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        className="studio-input"
                        aria-label={CONTENT_FIELD_LABELS[key]}
                        data-testid={`input-content-${key}`}
                        value={item.value}
                        onChange={(e) => onUpdateContentField(key, { value: e.target.value })}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Typography & Color Editor for the Selected Text Field */}
            <div className="studio-control-group">
              <div className="studio-control-header">
                <span className="studio-control-label">
                  إعدادات الخط واللون المستقلة لحقل: {CONTENT_FIELD_LABELS[activeContentField]}
                </span>
                <button
                  type="button"
                  className="studio-btn studio-btn-ghost"
                  onClick={() => onResetContentField(activeContentField)}
                >
                  إعادة ضبط {activeContentField} فقط
                </button>
              </div>

              <div className="studio-field-grid">
                <div className="studio-field">
                  <label className="studio-field-label">لون النص المستقل</label>
                  <div className="studio-color-row">
                    <input
                      type="color"
                      className="studio-color-swatch"
                      value={currentTextField.color}
                      onChange={(e) =>
                        onUpdateContentField(activeContentField, { color: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      className="studio-input studio-input-num"
                      value={currentTextField.color}
                      onChange={(e) =>
                        onUpdateContentField(activeContentField, { color: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">عائلة الخط</label>
                  <select
                    className="studio-select"
                    value={currentTextField.fontFamily}
                    onChange={(e) =>
                      onUpdateContentField(activeContentField, { fontFamily: e.target.value })
                    }
                  >
                    {AVAILABLE_FONTS.map((font) => (
                      <option key={font.id} value={font.cssValue}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>حجم الخط</span>
                    <span>{currentTextField.fontSize}px</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={72}
                    className="studio-input studio-input-num"
                    value={currentTextField.fontSize}
                    onChange={(e) =>
                      onUpdateContentField(activeContentField, {
                        fontSize: Number(e.target.value) || 14,
                      })
                    }
                  />
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">وزن الخط</label>
                  <select
                    className="studio-select"
                    value={currentTextField.fontWeight}
                    onChange={(e) =>
                      onUpdateContentField(activeContentField, {
                        fontWeight: Number(e.target.value),
                      })
                    }
                  >
                    {FONT_WEIGHT_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>ارتفاع السطر</span>
                    <span>{currentTextField.lineHeight}</span>
                  </label>
                  <input
                    type="number"
                    step={0.05}
                    min={1}
                    max={2.5}
                    className="studio-input studio-input-num"
                    value={currentTextField.lineHeight}
                    onChange={(e) =>
                      onUpdateContentField(activeContentField, {
                        lineHeight: Number(e.target.value) || 1.4,
                      })
                    }
                  />
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">المحاذاة</label>
                  <select
                    className="studio-select"
                    value={currentTextField.align}
                    onChange={(e) =>
                      onUpdateContentField(activeContentField, {
                        align: e.target.value as TextAlignment,
                      })
                    }
                  >
                    {TEXT_ALIGNMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: INDEPENDENT WIDTH & HEIGHT */}
        {activeSection === 'dimensions' && (
          <div>
            {/* Interactive Independence Proof Controls */}
            <div className="studio-control-group">
              <div className="studio-control-header">
                <span className="studio-control-label">
                  اختبار فوري لاستقلال العرض عن الارتفاع
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="studio-btn"
                  onClick={() =>
                    onUpdateDimensions({
                      width:
                        typeof dimensions.width === 'number' ? dimensions.width + 50 : 500,
                    })
                  }
                >
                  زيادة العرض فقط (+50px) دون المساس بالارتفاع
                </button>
                <button
                  type="button"
                  className="studio-btn"
                  onClick={() =>
                    onUpdateDimensions({
                      height:
                        typeof dimensions.height === 'number' ? dimensions.height + 50 : 380,
                    })
                  }
                >
                  زيادة الارتفاع فقط (+50px) دون المساس بالعرض
                </button>
              </div>
            </div>

            {/* Independent Width Control Group */}
            <div className="studio-control-group">
              <div className="studio-control-header">
                <span className="studio-control-label">
                  1. التحكم المستقل في العرض (Width)
                </span>
                <button
                  type="button"
                  className="studio-btn studio-btn-ghost"
                  onClick={() => onResetDimensionField('width')}
                >
                  إعادة ضبط العرض فقط
                </button>
              </div>

              <div className="studio-field-grid">
                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>قيمة العرض</span>
                    <span>
                      {dimensions.width === 'auto'
                        ? 'auto'
                        : `${dimensions.width}${dimensions.widthUnit}`}
                    </span>
                  </label>
                  <input
                    type="number"
                    min={180}
                    max={1200}
                    disabled={dimensions.width === 'auto'}
                    className="studio-input studio-input-num"
                    data-testid="input-dimension-width"
                    value={dimensions.width === 'auto' ? 460 : dimensions.width}
                    onChange={(e) =>
                      onUpdateDimensions({ width: Number(e.target.value) || 300 })
                    }
                  />
                  {typeof dimensions.width === 'number' && (
                    <input
                      type="range"
                      min={240}
                      max={860}
                      value={dimensions.width}
                      onChange={(e) => onUpdateDimensions({ width: Number(e.target.value) })}
                    />
                  )}
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">وحدة العرض (widthUnit)</label>
                  <select
                    className="studio-select"
                    value={dimensions.widthUnit}
                    onChange={(e) => {
                      const nextUnit = e.target.value as WidthUnitType;
                      onUpdateDimensions({
                        widthUnit: nextUnit,
                        width:
                          nextUnit === 'auto'
                            ? 'auto'
                            : dimensions.width === 'auto'
                              ? 460
                              : dimensions.width,
                      });
                    }}
                  >
                    <option value="px">px (بكسل)</option>
                    <option value="%">% (نسبة مئوية)</option>
                    <option value="vw">vw (عرض الشاشة)</option>
                    <option value="auto">auto (تلقائي)</option>
                  </select>
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">الحد الأدنى للعرض (minWidth px)</label>
                  <input
                    type="number"
                    min={120}
                    max={800}
                    className="studio-input studio-input-num"
                    value={dimensions.minWidth}
                    onChange={(e) =>
                      onUpdateDimensions({ minWidth: Number(e.target.value) || 200 })
                    }
                  />
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">الحد الأقصى للعرض (maxWidth px)</label>
                  <input
                    type="number"
                    min={240}
                    max={1600}
                    className="studio-input studio-input-num"
                    value={dimensions.maxWidth === 'none' ? 960 : dimensions.maxWidth}
                    onChange={(e) =>
                      onUpdateDimensions({ maxWidth: Number(e.target.value) || 960 })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Independent Height Control Group */}
            <div className="studio-control-group">
              <div className="studio-control-header">
                <span className="studio-control-label">
                  2. التحكم المستقل في الارتفاع (Height)
                </span>
                <button
                  type="button"
                  className="studio-btn studio-btn-ghost"
                  onClick={() => onResetDimensionField('height')}
                >
                  إعادة ضبط الارتفاع فقط
                </button>
              </div>

              <div className="studio-field-grid">
                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>قيمة الارتفاع</span>
                    <span>
                      {dimensions.height === 'auto'
                        ? 'auto'
                        : `${dimensions.height}${dimensions.heightUnit}`}
                    </span>
                  </label>
                  <input
                    type="number"
                    min={140}
                    max={1000}
                    disabled={dimensions.height === 'auto'}
                    className="studio-input studio-input-num"
                    data-testid="input-dimension-height"
                    value={dimensions.height === 'auto' ? 340 : dimensions.height}
                    onChange={(e) =>
                      onUpdateDimensions({ height: Number(e.target.value) || 260 })
                    }
                  />
                  {typeof dimensions.height === 'number' && (
                    <input
                      type="range"
                      min={180}
                      max={720}
                      value={dimensions.height}
                      onChange={(e) => onUpdateDimensions({ height: Number(e.target.value) })}
                    />
                  )}
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">وحدة الارتفاع (heightUnit)</label>
                  <select
                    className="studio-select"
                    value={dimensions.heightUnit}
                    onChange={(e) => {
                      const nextUnit = e.target.value as HeightUnitType;
                      onUpdateDimensions({
                        heightUnit: nextUnit,
                        height:
                          nextUnit === 'auto'
                            ? 'auto'
                            : dimensions.height === 'auto'
                              ? 340
                              : dimensions.height,
                      });
                    }}
                  >
                    <option value="px">px (بكسل)</option>
                    <option value="%">% (نسبة مئوية)</option>
                    <option value="vh">vh (ارتفاع الشاشة)</option>
                    <option value="auto">auto (تلقائي)</option>
                  </select>
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">الحد الأدنى للارتفاع (minHeight px)</label>
                  <input
                    type="number"
                    min={100}
                    max={800}
                    className="studio-input studio-input-num"
                    value={dimensions.minHeight}
                    onChange={(e) =>
                      onUpdateDimensions({ minHeight: Number(e.target.value) || 160 })
                    }
                  />
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">الحد الأقصى للارتفاع (maxHeight px)</label>
                  <input
                    type="number"
                    min={200}
                    max={1400}
                    className="studio-input studio-input-num"
                    value={dimensions.maxHeight === 'none' ? 900 : dimensions.maxHeight}
                    onChange={(e) =>
                      onUpdateDimensions({ maxHeight: Number(e.target.value) || 900 })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Aspect Ratio Lock Option (Disabled by default) */}
            <div className="studio-control-group">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={dimensions.lockAspectRatio}
                  onChange={(e) =>
                    onUpdateDimensions({ lockAspectRatio: e.target.checked })
                  }
                />
                <span>
                  قفل نسبة العرض إلى الارتفاع اختياريًا (lockAspectRatio) — معطل افتراضيًا لضمان
                  الاستقلال التام
                </span>
              </label>
            </div>
          </div>
        )}

        {/* SECTION 3: INDEPENDENT ICON */}
        {activeSection === 'icon' && (
          <div className="studio-control-group">
            <div className="studio-control-header">
              <span className="studio-control-label">
                إعدادات الأيقونة المستقلة (لا تؤثر على النصوص أو الأبعاد)
              </span>
              <button
                type="button"
                className="studio-btn studio-btn-ghost"
                onClick={() => onResetIconField()}
              >
                إعادة ضبط الأيقونة فقط
              </button>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={icon.visible}
                  onChange={(e) => onUpdateIcon({ visible: e.target.checked })}
                />
                <span>إظهار الأيقونة (visible)</span>
              </label>
            </div>

            <div className="studio-field-grid">
              <div className="studio-field">
                <label className="studio-field-label">مصدر الأيقونة (source)</label>
                <select
                  className="studio-select"
                  value={icon.source}
                  onChange={(e) => {
                    const nextSource = e.target.value as IconSourceType;
                    const defaultVal =
                      nextSource === 'emoji'
                        ? '✦'
                        : nextSource === 'icon-library'
                          ? 'diamond'
                          : icon.value;
                    onUpdateIcon({ source: nextSource, value: defaultVal });
                  }}
                >
                  <option value="icon-library">مكتبة الأيقونات (icon-library)</option>
                  <option value="emoji">رمز تعبيري (emoji)</option>
                  <option value="svg">مسار SVG مخصص (svg)</option>
                  <option value="none">بدون أيقونة (none)</option>
                </select>
              </div>

              {icon.source === 'icon-library' ? (
                <div className="studio-field">
                  <label className="studio-field-label">اختيار الأيقونة (value)</label>
                  <select
                    className="studio-select"
                    value={icon.value}
                    onChange={(e) => onUpdateIcon({ value: e.target.value })}
                  >
                    {BUILTIN_ICON_LIBRARY.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="studio-field">
                  <label className="studio-field-label">قيمة الأيقونة (value)</label>
                  <input
                    type="text"
                    className="studio-input"
                    value={icon.value}
                    onChange={(e) => onUpdateIcon({ value: e.target.value })}
                  />
                </div>
              )}

              <div className="studio-field">
                <label className="studio-field-label">لون الأيقونة (color)</label>
                <div className="studio-color-row">
                  <input
                    type="color"
                    className="studio-color-swatch"
                    value={icon.color}
                    onChange={(e) => onUpdateIcon({ color: e.target.value })}
                  />
                  <input
                    type="text"
                    className="studio-input studio-input-num"
                    value={icon.color}
                    onChange={(e) => onUpdateIcon({ color: e.target.value })}
                  />
                </div>
              </div>

              <div className="studio-field">
                <label className="studio-field-label">
                  <span>الحجم (size)</span>
                  <span>{icon.size}px</span>
                </label>
                <input
                  type="number"
                  min={12}
                  max={96}
                  className="studio-input studio-input-num"
                  value={icon.size}
                  onChange={(e) => onUpdateIcon({ size: Number(e.target.value) || 24 })}
                />
              </div>

              <div className="studio-field">
                <label className="studio-field-label">
                  <span>الدوران (rotate)</span>
                  <span>{icon.rotate}°</span>
                </label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={icon.rotate}
                  onChange={(e) => onUpdateIcon({ rotate: Number(e.target.value) })}
                />
              </div>

              <div className="studio-field">
                <label className="studio-field-label">موضع الأيقونة (position)</label>
                <select
                  className="studio-select"
                  value={icon.position}
                  onChange={(e) =>
                    onUpdateIcon({ position: e.target.value as IconPositionType })
                  }
                >
                  <option value="start">البداية (start)</option>
                  <option value="center">الوسط (center)</option>
                  <option value="end">النهاية (end)</option>
                  <option value="custom">توزيع حر (custom)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: DECLARED SURFACE TOKENS (COLORS & SIZES) */}
        {activeSection === 'appearance' && (
          <div className="studio-control-group">
            <div className="studio-control-header">
              <span className="studio-control-label">
                الألوان والأحجام المعلنة في العقد (لا توجد ألوان مخفية في CSS)
              </span>
            </div>

            <div className="studio-field-grid">
              <div className="studio-field">
                <label className="studio-field-label">
                  <span>لون خلفية العنصر</span>
                  <button
                    type="button"
                    className="studio-btn studio-btn-ghost"
                    onClick={() => onResetSurfaceField('backgroundColor')}
                  >
                    ضبط
                  </button>
                </label>
                <div className="studio-color-row">
                  <input
                    type="color"
                    className="studio-color-swatch"
                    value={surface.backgroundColor}
                    onChange={(e) => onUpdateSurface({ backgroundColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="studio-input studio-input-num"
                    value={surface.backgroundColor}
                    onChange={(e) => onUpdateSurface({ backgroundColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="studio-field">
                <label className="studio-field-label">
                  <span>لون الإطار (Border)</span>
                  <button
                    type="button"
                    className="studio-btn studio-btn-ghost"
                    onClick={() => onResetSurfaceField('borderColor')}
                  >
                    ضبط
                  </button>
                </label>
                <div className="studio-color-row">
                  <input
                    type="color"
                    className="studio-color-swatch"
                    value={surface.borderColor}
                    onChange={(e) => onUpdateSurface({ borderColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="studio-input studio-input-num"
                    value={surface.borderColor}
                    onChange={(e) => onUpdateSurface({ borderColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="studio-field">
                <label className="studio-field-label">
                  <span>لون خلفية زر الإجراء</span>
                  <button
                    type="button"
                    className="studio-btn studio-btn-ghost"
                    onClick={() => onResetSurfaceField('actionBackgroundColor')}
                  >
                    ضبط
                  </button>
                </label>
                <div className="studio-color-row">
                  <input
                    type="color"
                    className="studio-color-swatch"
                    value={surface.actionBackgroundColor}
                    onChange={(e) => onUpdateSurface({ actionBackgroundColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="studio-input studio-input-num"
                    value={surface.actionBackgroundColor}
                    onChange={(e) => onUpdateSurface({ actionBackgroundColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="studio-field">
                <label className="studio-field-label">
                  <span>استدارة الزوايا ({surface.borderRadius}px)</span>
                  <button
                    type="button"
                    className="studio-btn studio-btn-ghost"
                    onClick={() => onResetSurfaceField('borderRadius')}
                  >
                    ضبط
                  </button>
                </label>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={surface.borderRadius}
                  onChange={(e) => onUpdateSurface({ borderRadius: Number(e.target.value) })}
                />
              </div>

              <div className="studio-field">
                <label className="studio-field-label">
                  <span>الحشو الأفقي ({surface.paddingX}px)</span>
                  <button
                    type="button"
                    className="studio-btn studio-btn-ghost"
                    onClick={() => onResetSurfaceField('paddingX')}
                  >
                    ضبط
                  </button>
                </label>
                <input
                  type="number"
                  min={8}
                  max={64}
                  className="studio-input studio-input-num"
                  value={surface.paddingX}
                  onChange={(e) => onUpdateSurface({ paddingX: Number(e.target.value) || 16 })}
                />
              </div>

              <div className="studio-field">
                <label className="studio-field-label">
                  <span>الحشو الرأسي ({surface.paddingY}px)</span>
                  <button
                    type="button"
                    className="studio-btn studio-btn-ghost"
                    onClick={() => onResetSurfaceField('paddingY')}
                  >
                    ضبط
                  </button>
                </label>
                <input
                  type="number"
                  min={8}
                  max={64}
                  className="studio-input studio-input-num"
                  value={surface.paddingY}
                  onChange={(e) => onUpdateSurface({ paddingY: Number(e.target.value) || 16 })}
                />
              </div>

              <div className="studio-field">
                <label className="studio-field-label">
                  <span>تباعد العناصر الداخلي ({surface.gap}px)</span>
                  <button
                    type="button"
                    className="studio-btn studio-btn-ghost"
                    onClick={() => onResetSurfaceField('gap')}
                  >
                    ضبط
                  </button>
                </label>
                <input
                  type="number"
                  min={4}
                  max={40}
                  className="studio-input studio-input-num"
                  value={surface.gap}
                  onChange={(e) => onUpdateSurface({ gap: Number(e.target.value) || 12 })}
                />
              </div>

              <div className="studio-field">
                <label className="studio-field-label">
                  <span>سماكة الإطار ({surface.borderWidth}px)</span>
                  <button
                    type="button"
                    className="studio-btn studio-btn-ghost"
                    onClick={() => onResetSurfaceField('borderWidth')}
                  >
                    ضبط
                  </button>
                </label>
                <input
                  type="number"
                  min={0}
                  max={8}
                  className="studio-input studio-input-num"
                  value={surface.borderWidth}
                  onChange={(e) => onUpdateSurface({ borderWidth: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
