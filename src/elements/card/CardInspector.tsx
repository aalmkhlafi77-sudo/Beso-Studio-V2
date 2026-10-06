/**
 * Beso Studio V2 — Production Card Inspector (src/elements/card/CardInspector.tsx)
 *
 * Implements Task 3 Inspector controls for the Card element:
 * - Preserves the 4 major categories: المحتوى، الأبعاد، الأيقونة، الألوان والمظهر.
 * - Includes full controls for all 9 surface materials:
 *   solid | gradient | glass | metal | ivory | neon | dark | image | pattern
 * - Includes independent controls for:
 *   - نوع الخامة (materialType)
 *   - اللون الأساسي (primaryColor) — never modifies secondaryColor
 *   - اللون الثانوي (secondaryColor) — never modifies primaryColor
 *   - اتجاه التدرج (gradientDirection)
 *   - الشفافية (opacity)
 *   - الضبابية للزجاج (glassBlur)
 *   - شدة التوهج ولونه (glowIntensity & glowColor)
 *   - لون الإطار وسماكته (borderColor & borderWidth)
 *   - الظل ولونه (shadowIntensity & shadowColor)
 *   - استدارة الزوايا (borderRadius)
 *   - العرض والارتفاع مستقلان تمامًا
 */

import React, { useState } from 'react';
import { BUILTIN_ICON_LIBRARY } from '../../core/assets/assetTypes';
import { CONTENT_FIELD_LABELS, ControlSectionId } from '../../core/controls/controlTypes';
import {
  CardMaterialType,
  ContentFieldKey,
  DeclaredSurfaceTokens,
  EditableIcon,
  EditableText,
  GradientDirectionType,
  HeightUnitType,
  IconPositionType,
  IconSourceType,
  IndependentDimensions,
  IndependentElementState,
  PatternPresetType,
  WidthUnitType,
} from '../../core/state/elementStateTypes';
import {
  countAccordionGroupModifications,
  countModifiedInEditableText,
  countSectionModifications,
  InspectorAccordionState,
} from '../../core/state/workspaceLayoutStore';
import {
  AVAILABLE_FONTS,
  FONT_WEIGHT_OPTIONS,
  TEXT_ALIGNMENT_OPTIONS,
  TextAlignment,
} from '../../shared/typography/typographyTokens';
import { AccordionGroup } from '../../shared/ui/AccordionGroup';
import { CARD_DEFAULT_STATE, CARD_MATERIAL_OPTIONS } from './cardModule';

export interface CardInspectorProps {
  state: IndependentElementState;
  defaultState?: IndependentElementState;
  accordionState: InspectorAccordionState;
  onSelectSection: (section: ControlSectionId) => void;
  onToggleAccordionGroup: (groupId: string) => void;
  onExpandAllInSection: (section: ControlSectionId) => void;
  onCollapseAllInSection: (section: ControlSectionId) => void;
  onUpdateContentField: (fieldKey: ContentFieldKey, patch: Partial<EditableText>) => void;
  onResetContentField: (fieldKey: ContentFieldKey) => void;
  onUpdateIcon: (patch: Partial<EditableIcon>) => void;
  onResetIconField: (propertyKey?: keyof EditableIcon) => void;
  onUpdateDimensions: (patch: Partial<IndependentDimensions>) => void;
  onResetDimensionField: (dimensionKey: keyof IndependentDimensions) => void;
  onUpdateSurface: (patch: Partial<DeclaredSurfaceTokens>) => void;
  onResetSurfaceField: (surfaceKey: keyof DeclaredSurfaceTokens) => void;
  onResetAccordionGroup: (groupId: string) => void;
  onResetCategorySection: (section: ControlSectionId) => void;
  onResetAll: () => void;
}

const BASIC_CONTENT_KEYS: ContentFieldKey[] = ['title', 'description', 'badge', 'actionLabel'];
const METRIC_CONTENT_KEYS: ContentFieldKey[] = ['number', 'percentage', 'analysis'];
const ALL_CONTENT_KEYS: ContentFieldKey[] = [
  'title',
  'description',
  'number',
  'percentage',
  'analysis',
  'actionLabel',
  'badge',
];

const SECTION_TITLES: Record<ControlSectionId, string> = {
  content: 'المحتوى',
  dimensions: 'الأبعاد',
  icon: 'الأيقونة',
  appearance: 'الألوان والمظهر والخامة',
};

const GRADIENT_DIRECTIONS: Array<{ value: GradientDirectionType; label: string }> = [
  { value: '135deg', label: 'قطري 135° (135deg)' },
  { value: '90deg', label: 'أفقي 90° (90deg)' },
  { value: '180deg', label: 'رأسي 180° (180deg)' },
  { value: '45deg', label: 'قطري صاعد 45° (45deg)' },
  { value: '225deg', label: 'قطري عكسي 225° (225deg)' },
  { value: '0deg', label: 'من الأسفل للأعلى 0° (0deg)' },
];

const PATTERN_PRESETS: Array<{ value: PatternPresetType; label: string }> = [
  { value: 'dots', label: 'نقاط هندسية (Dots)' },
  { value: 'grid', label: 'شبكة متعامدة (Grid)' },
  { value: 'diagonal', label: 'خطوط مائلة (Diagonal)' },
  { value: 'waves', label: 'دوائر متموجة (Waves)' },
];

export const CardInspector: React.FC<CardInspectorProps> = ({
  state,
  defaultState = CARD_DEFAULT_STATE,
  accordionState,
  onSelectSection,
  onToggleAccordionGroup,
  onExpandAllInSection,
  onCollapseAllInSection,
  onUpdateContentField,
  onResetContentField,
  onUpdateIcon,
  onResetIconField,
  onUpdateDimensions,
  onResetDimensionField,
  onUpdateSurface,
  onResetSurfaceField,
  onResetAccordionGroup,
  onResetCategorySection,
  onResetAll,
}) => {
  const [selectedTypographyField, setSelectedTypographyField] = useState<ContentFieldKey>('title');

  const activeSection = accordionState.activeSection;
  const openSet = new Set(accordionState.openGroupIds);

  const contentModCount = countSectionModifications(state, defaultState, 'content');
  const dimensionsModCount = countSectionModifications(state, defaultState, 'dimensions');
  const iconModCount = countSectionModifications(state, defaultState, 'icon');
  const appearanceModCount = countSectionModifications(state, defaultState, 'appearance');
  const totalModCount =
    contentModCount + dimensionsModCount + iconModCount + appearanceModCount;

  const activeSectionModCount = countSectionModifications(state, defaultState, activeSection);

  const { icon, dimensions, surface } = state;
  const currentTypographyField = state.content[selectedTypographyField];

  const renderIndependentTextFieldEditor = (key: ContentFieldKey) => {
    const item = state.content[key];
    const defItem = defaultState.content[key];
    const fieldMods = countModifiedInEditableText(item, defItem);

    return (
      <div
        key={key}
        className="studio-independent-field-card"
        data-modified={fieldMods > 0}
        data-field-key={key}
      >
        <div className="studio-independent-field-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id={`card-visible-${key}`}
              checked={item.visible}
              onChange={(e) => onUpdateContentField(key, { visible: e.target.checked })}
            />
            <label
              htmlFor={`card-visible-${key}`}
              style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {CONTENT_FIELD_LABELS[key]}
            </label>
            {fieldMods > 0 && (
              <span className="studio-modified-count" data-modified="true">
                {fieldMods} معدل
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <input
              type="color"
              className="studio-color-swatch-sm"
              title={`لون مستقل لحقل ${CONTENT_FIELD_LABELS[key]}`}
              value={item.color}
              onChange={(e) => onUpdateContentField(key, { color: e.target.value })}
            />
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
  };

  return (
    <section className="studio-panel" aria-label="مفتش البطاقة الإنتاجية (Card Inspector)">
      <div className="studio-panel-header">
        <div>
          <h2 className="studio-panel-title">مفتش البطاقة الإنتاجية (Card Inspector)</h2>
          <div className="studio-panel-meta">
            الخامة النشطة: {surface.materialType} · إجمالي القيم المعدلة: {totalModCount}
          </div>
        </div>

        <button
          type="button"
          className="studio-btn studio-btn-ghost"
          onClick={onResetAll}
          data-testid="reset-entire-element-btn"
        >
          إعادة ضبط البطاقة ({totalModCount})
        </button>
      </div>

      {/* 4 Major Categories Tabs */}
      <div className="studio-tabs-bar" role="tablist" aria-label="فئات مفتش البطاقة">
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'content'}
          className="studio-tab-btn"
          data-active={activeSection === 'content'}
          onClick={() => onSelectSection('content')}
        >
          المحتوى ({contentModCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'dimensions'}
          className="studio-tab-btn"
          data-active={activeSection === 'dimensions'}
          onClick={() => onSelectSection('dimensions')}
        >
          الأبعاد ({dimensionsModCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'icon'}
          className="studio-tab-btn"
          data-active={activeSection === 'icon'}
          onClick={() => onSelectSection('icon')}
        >
          الأيقونة ({iconModCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'appearance'}
          className="studio-tab-btn"
          data-active={activeSection === 'appearance'}
          onClick={() => onSelectSection('appearance')}
        >
          الألوان والمظهر ({appearanceModCount})
        </button>
      </div>

      {/* Category Action Bar */}
      <div className="studio-inspector-toolbar">
        <div className="studio-metrics-strip">
          <span>
            قسم <strong>{SECTION_TITLES[activeSection]}</strong>
          </span>
          <span className="studio-metrics-separator">·</span>
          <span>{activeSectionModCount} قيمة معدلة</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="studio-btn studio-btn-ghost"
            data-testid="expand-all-groups-btn"
            onClick={() => onExpandAllInSection(activeSection)}
          >
            فتح الكل
          </button>
          <button
            type="button"
            className="studio-btn studio-btn-ghost"
            data-testid="collapse-all-groups-btn"
            onClick={() => onCollapseAllInSection(activeSection)}
          >
            طي الكل
          </button>
          <button
            type="button"
            className="studio-btn studio-btn-ghost"
            data-testid={`reset-section-${activeSection}-btn`}
            onClick={() => onResetCategorySection(activeSection)}
            disabled={activeSectionModCount === 0}
          >
            إعادة ضبط القسم ({activeSectionModCount})
          </button>
        </div>
      </div>

      <div className="studio-panel-body studio-accordion-stack">
        {/* ==================== 1. CONTENT CATEGORY ==================== */}
        {activeSection === 'content' && (
          <>
            <AccordionGroup
              groupId="content-basic"
              title="الحقول النصية الأساسية"
              subtitle="العنوان، الوصف، الوسم، وزر الإجراء"
              isOpen={openSet.has('content-basic')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'content-basic'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {BASIC_CONTENT_KEYS.map((key) => renderIndependentTextFieldEditor(key))}
              </div>
            </AccordionGroup>

            <AccordionGroup
              groupId="content-metrics"
              title="حقول المؤشرات والتحليل المستقلة"
              subtitle="الرقم، النسبة المئوية، والنص التحليلي"
              isOpen={openSet.has('content-metrics')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'content-metrics'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {METRIC_CONTENT_KEYS.map((key) => renderIndependentTextFieldEditor(key))}
              </div>
            </AccordionGroup>

            <AccordionGroup
              groupId="content-advanced"
              title="خيارات متقدمة — خصائص الخط والمحاذاة المستقلة"
              subtitle="مطوية افتراضيًا"
              isOpen={openSet.has('content-advanced')}
              isAdvanced
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'content-advanced'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="studio-field">
                  <label className="studio-field-label">
                    اختر الحقل النصي لتخصيص خطه ومقياسه بشكل مستقل:
                  </label>
                  <select
                    className="studio-select"
                    value={selectedTypographyField}
                    onChange={(e) =>
                      setSelectedTypographyField(e.target.value as ContentFieldKey)
                    }
                  >
                    {ALL_CONTENT_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {CONTENT_FIELD_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="studio-field-grid">
                  <div className="studio-field">
                    <label className="studio-field-label">عائلة الخط</label>
                    <select
                      className="studio-select"
                      value={currentTypographyField.fontFamily}
                      onChange={(e) =>
                        onUpdateContentField(selectedTypographyField, {
                          fontFamily: e.target.value,
                        })
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
                      <span>{currentTypographyField.fontSize}px</span>
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={72}
                      className="studio-input studio-input-num"
                      value={currentTypographyField.fontSize}
                      onChange={(e) =>
                        onUpdateContentField(selectedTypographyField, {
                          fontSize: Number(e.target.value) || 14,
                        })
                      }
                    />
                  </div>

                  <div className="studio-field">
                    <label className="studio-field-label">وزن الخط</label>
                    <select
                      className="studio-select"
                      value={currentTypographyField.fontWeight}
                      onChange={(e) =>
                        onUpdateContentField(selectedTypographyField, {
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
                      <span>{currentTypographyField.lineHeight}</span>
                    </label>
                    <input
                      type="number"
                      step={0.05}
                      min={1}
                      max={2.5}
                      className="studio-input studio-input-num"
                      value={currentTypographyField.lineHeight}
                      onChange={(e) =>
                        onUpdateContentField(selectedTypographyField, {
                          lineHeight: Number(e.target.value) || 1.4,
                        })
                      }
                    />
                  </div>

                  <div className="studio-field">
                    <label className="studio-field-label">
                      <span>تباعد الأحرف</span>
                      <span>{currentTypographyField.letterSpacing}px</span>
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={-2}
                      max={10}
                      className="studio-input studio-input-num"
                      value={currentTypographyField.letterSpacing}
                      onChange={(e) =>
                        onUpdateContentField(selectedTypographyField, {
                          letterSpacing: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="studio-field">
                    <label className="studio-field-label">المحاذاة</label>
                    <select
                      className="studio-select"
                      value={currentTypographyField.align}
                      onChange={(e) =>
                        onUpdateContentField(selectedTypographyField, {
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
            </AccordionGroup>
          </>
        )}

        {/* ==================== 2. DIMENSIONS CATEGORY ==================== */}
        {activeSection === 'dimensions' && (
          <>
            <AccordionGroup
              groupId="dimensions-basic"
              title="الأبعاد الأساسية المستقلة (العرض والارتفاع)"
              subtitle="مفتوحة افتراضيًا"
              isOpen={openSet.has('dimensions-basic')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'dimensions-basic'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="studio-field-grid">
                  <div className="studio-field">
                    <div className="studio-field-label">
                      <span>العرض المستقل (width)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetDimensionField('width')}
                      >
                        إعادة ضبط العرض
                      </button>
                    </div>
                    <input
                      type="number"
                      min={180}
                      max={1200}
                      disabled={dimensions.width === 'auto'}
                      className="studio-input studio-input-num"
                      data-testid="input-dimension-width"
                      value={dimensions.width === 'auto' ? 440 : dimensions.width}
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
                    <div className="studio-field-label">
                      <span>وحدة العرض (widthUnit)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetDimensionField('widthUnit')}
                      >
                        ضبط
                      </button>
                    </div>
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
                                ? 440
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
                    <div className="studio-field-label">
                      <span>الارتفاع المستقل (height)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetDimensionField('height')}
                      >
                        إعادة ضبط الارتفاع
                      </button>
                    </div>
                    <input
                      type="number"
                      min={140}
                      max={1000}
                      disabled={dimensions.height === 'auto'}
                      className="studio-input studio-input-num"
                      data-testid="input-dimension-height"
                      value={dimensions.height === 'auto' ? 360 : dimensions.height}
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
                    <div className="studio-field-label">
                      <span>وحدة الارتفاع (heightUnit)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetDimensionField('heightUnit')}
                      >
                        ضبط
                      </button>
                    </div>
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
                                ? 360
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
                </div>
              </div>
            </AccordionGroup>

            <AccordionGroup
              groupId="dimensions-advanced"
              title="خيارات متقدمة — الحدود الدنيا والعليا وقفل النسبة"
              subtitle="مطوية افتراضيًا"
              isOpen={openSet.has('dimensions-advanced')}
              isAdvanced
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'dimensions-advanced'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="studio-field-grid">
                  <div className="studio-field">
                    <label className="studio-field-label">الحد الأدنى للعرض (minWidth)</label>
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
                    <label className="studio-field-label">الحد الأقصى للعرض (maxWidth)</label>
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

                  <div className="studio-field">
                    <label className="studio-field-label">الحد الأدنى للارتفاع (minHeight)</label>
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
                    <label className="studio-field-label">الحد الأقصى للارتفاع (maxHeight)</label>
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
                    قفل نسبة العرض إلى الارتفاع اختياريًا (lockAspectRatio) — معطل افتراضيًا
                  </span>
                </label>
              </div>
            </AccordionGroup>
          </>
        )}

        {/* ==================== 3. ICON CATEGORY ==================== */}
        {activeSection === 'icon' && (
          <>
            <AccordionGroup
              groupId="icon-basic"
              title="الإعدادات الأساسية للأيقونة"
              subtitle="الظهور، المصدر، القيمة، اللون، والحجم"
              isOpen={openSet.has('icon-basic')}
              modifiedCount={countAccordionGroupModifications(state, defaultState, 'icon-basic')}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
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

                  <button
                    type="button"
                    className="studio-btn studio-btn-ghost"
                    onClick={() => onResetIconField('visible')}
                  >
                    إعادة ضبط الظهور
                  </button>
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
                              ? 'crown'
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
                    <label className="studio-field-label">الحجم ({icon.size}px)</label>
                    <input
                      type="number"
                      min={12}
                      max={96}
                      className="studio-input studio-input-num"
                      value={icon.size}
                      onChange={(e) => onUpdateIcon({ size: Number(e.target.value) || 24 })}
                    />
                  </div>
                </div>
              </div>
            </AccordionGroup>

            <AccordionGroup
              groupId="icon-advanced"
              title="خيارات متقدمة — الدوران والتموضع"
              subtitle="مطوية افتراضيًا"
              isOpen={openSet.has('icon-advanced')}
              isAdvanced
              modifiedCount={countAccordionGroupModifications(state, defaultState, 'icon-advanced')}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="studio-field-grid">
                <div className="studio-field">
                  <label className="studio-field-label">زاوية الدوران ({icon.rotate}°)</label>
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
            </AccordionGroup>
          </>
        )}

        {/* ==================== 4. APPEARANCE & MATERIAL CATEGORY ==================== */}
        {activeSection === 'appearance' && (
          <>
            {/* Group 4.1: Card Material & Primary/Secondary Colors (Open by default) */}
            <AccordionGroup
              groupId="appearance-basic"
              title="خامة البطاقة والألوان الأساسية والاستدارة"
              subtitle="9 خامات مستقلة عن ألوان النصوص والأيقونة"
              isOpen={openSet.has('appearance-basic')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'appearance-basic'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="studio-field-grid">
                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>نوع الخامة (materialType)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetSurfaceField('materialType')}
                    >
                      ضبط
                    </button>
                  </label>
                  <select
                    className="studio-select"
                    data-testid="select-card-material"
                    value={surface.materialType}
                    onChange={(e) =>
                      onUpdateSurface({ materialType: e.target.value as CardMaterialType })
                    }
                  >
                    {CARD_MATERIAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>اللون الأساسي (primaryColor)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetSurfaceField('primaryColor')}
                    >
                      ضبط
                    </button>
                  </label>
                  <div className="studio-color-row">
                    <input
                      type="color"
                      className="studio-color-swatch"
                      value={surface.primaryColor}
                      onChange={(e) => onUpdateSurface({ primaryColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="studio-input studio-input-num"
                      data-testid="input-primary-color"
                      value={surface.primaryColor}
                      onChange={(e) => onUpdateSurface({ primaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>اللون الثانوي (secondaryColor)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetSurfaceField('secondaryColor')}
                    >
                      ضبط
                    </button>
                  </label>
                  <div className="studio-color-row">
                    <input
                      type="color"
                      className="studio-color-swatch"
                      value={surface.secondaryColor}
                      onChange={(e) => onUpdateSurface({ secondaryColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="studio-input studio-input-num"
                      data-testid="input-secondary-color"
                      value={surface.secondaryColor}
                      onChange={(e) => onUpdateSurface({ secondaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>اتجاه التدرج (gradientDirection)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetSurfaceField('gradientDirection')}
                    >
                      ضبط
                    </button>
                  </label>
                  <select
                    className="studio-select"
                    value={surface.gradientDirection}
                    onChange={(e) =>
                      onUpdateSurface({
                        gradientDirection: e.target.value as GradientDirectionType,
                      })
                    }
                  >
                    {GRADIENT_DIRECTIONS.map((dir) => (
                      <option key={dir.value} value={dir.value}>
                        {dir.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>الشفافية ({surface.opacity}%)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetSurfaceField('opacity')}
                    >
                      ضبط
                    </button>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={surface.opacity}
                    onChange={(e) => onUpdateSurface({ opacity: Number(e.target.value) })}
                  />
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>لون الإطار (borderColor)</span>
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
                    max={48}
                    value={surface.borderRadius}
                    onChange={(e) => onUpdateSurface({ borderRadius: Number(e.target.value) })}
                  />
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
                      onChange={(e) =>
                        onUpdateSurface({ actionBackgroundColor: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      className="studio-input studio-input-num"
                      value={surface.actionBackgroundColor}
                      onChange={(e) =>
                        onUpdateSurface({ actionBackgroundColor: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </AccordionGroup>

            {/* Group 4.2: Advanced Material Controls (Glass Blur, Glow, Shadow, Border Width, Pattern/Image, Spacing) */}
            <AccordionGroup
              groupId="appearance-advanced"
              title="خيارات متقدمة — الضبابية، التوهج، الظل، النقش، والمسافات"
              subtitle="مطوية افتراضيًا"
              isOpen={openSet.has('appearance-advanced')}
              isAdvanced
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'appearance-advanced'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="studio-field-grid">
                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>الضبابية للزجاج ({surface.glassBlur}px)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetSurfaceField('glassBlur')}
                    >
                      ضبط
                    </button>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={surface.glassBlur}
                    onChange={(e) => onUpdateSurface({ glassBlur: Number(e.target.value) })}
                  />
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>شدة التوهج ({surface.glowIntensity}px)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetSurfaceField('glowIntensity')}
                    >
                      ضبط
                    </button>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={surface.glowIntensity}
                    onChange={(e) =>
                      onUpdateSurface({ glowIntensity: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>شدة الظل ({surface.shadowIntensity}px)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetSurfaceField('shadowIntensity')}
                    >
                      ضبط
                    </button>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={surface.shadowIntensity}
                    onChange={(e) =>
                      onUpdateSurface({ shadowIntensity: Number(e.target.value) })
                    }
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
                    max={12}
                    className="studio-input studio-input-num"
                    value={surface.borderWidth}
                    onChange={(e) =>
                      onUpdateSurface({ borderWidth: Number(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>نوع النقش (patternType)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetSurfaceField('patternType')}
                    >
                      ضبط
                    </button>
                  </label>
                  <select
                    className="studio-select"
                    value={surface.patternType}
                    onChange={(e) =>
                      onUpdateSurface({ patternType: e.target.value as PatternPresetType })
                    }
                  >
                    {PATTERN_PRESETS.map((pat) => (
                      <option key={pat.value} value={pat.value}>
                        {pat.label}
                      </option>
                    ))}
                  </select>
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
                    onChange={(e) =>
                      onUpdateSurface({ paddingX: Number(e.target.value) || 16 })
                    }
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
                    onChange={(e) =>
                      onUpdateSurface({ paddingY: Number(e.target.value) || 16 })
                    }
                  />
                </div>

                <div className="studio-field">
                  <label className="studio-field-label">
                    <span>التباعد الداخلي ({surface.gap}px)</span>
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
              </div>
            </AccordionGroup>
          </>
        )}
      </div>
    </section>
  );
};
