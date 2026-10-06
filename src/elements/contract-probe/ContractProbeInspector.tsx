/**
 * Beso Studio V2 — Organized Contract Probe Inspector with Accessible Accordions
 *
 * Implements Requirement 1:
 * - Preserves the 4 major categories: المحتوى، الأبعاد، الأيقونة، الألوان والمظهر.
 * - Organizes each category into collapsible Accordion groups (<button>, aria-expanded, aria-controls).
 * - Opens ONLY the primary basic group by default; keeps Advanced Options collapsed by default.
 * - Provides Expand All (فتح الكل) and Collapse All (طي الكل).
 * - Preserves open accordion state across element edits and fullscreen transitions.
 * - Shows modified values count per category and per Accordion group.
 * - Supports Reset Field, Reset Group, Reset Category Section, and Reset Element.
 * - Keeps title, description, number, percentage, analysis, actionLabel, and badge strictly independent.
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
import { CONTRACT_PROBE_DEFAULT_STATE } from './contractProbeModule';

export interface ContractProbeInspectorProps {
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
  appearance: 'الألوان والمظهر',
};

export const ContractProbeInspector: React.FC<ContractProbeInspectorProps> = ({
  state,
  defaultState = CONTRACT_PROBE_DEFAULT_STATE,
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
              id={`visible-${key}`}
              checked={item.visible}
              onChange={(e) => onUpdateContentField(key, { visible: e.target.checked })}
            />
            <label
              htmlFor={`visible-${key}`}
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
              title="إعادة ضبط هذا الحقل المستقل وحده"
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
    <section className="studio-panel" aria-label="المفتش المنظم (Inspector)">
      {/* Inspector Header with Element-Level Reset */}
      <div className="studio-panel-header">
        <div>
          <h2 className="studio-panel-title">المفتش المنظم (Inspector)</h2>
          <div className="studio-panel-meta">
            إجمالي القيم المعدلة في العنصر: {totalModCount} · الحقول والمجموعات معزولة
          </div>
        </div>

        <button
          type="button"
          className="studio-btn studio-btn-ghost"
          onClick={onResetAll}
          data-testid="reset-entire-element-btn"
          title="إعادة ضبط جميع حقول العنصر إلى الوضع الافتراضي"
        >
          إعادة ضبط العنصر ({totalModCount})
        </button>
      </div>

      {/* 4 Major Categories Tabs */}
      <div className="studio-tabs-bar" role="tablist" aria-label="فئات المفتش الأربع الكبرى">
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

      {/* Category Action Bar: Expand All, Collapse All, Reset Category Section */}
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

      {/* Category Accordion Groups */}
      <div className="studio-panel-body studio-accordion-stack">
        {/* ==================== 1. CONTENT CATEGORY ==================== */}
        {activeSection === 'content' && (
          <>
            {/* Group 1.1: Primary Content Fields (Open by default) */}
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

            {/* Group 1.2: Independent Quantitative & Analytical Fields */}
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

            {/* Group 1.3: Advanced Typography Options (Collapsed by default) */}
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
            {/* Group 2.1: Basic Independent Width & Height (Open by default) */}
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
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="studio-btn"
                    onClick={() =>
                      onUpdateDimensions({
                        width: typeof dimensions.width === 'number' ? dimensions.width + 50 : 500,
                      })
                    }
                  >
                    زيادة عرض العنصر فقط (+50px)
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
                    زيادة ارتفاع العنصر فقط (+50px)
                  </button>
                </div>

                <div className="studio-field-grid">
                  {/* Width Field */}
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

                  {/* Height Field */}
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
                </div>
              </div>
            </AccordionGroup>

            {/* Group 2.2: Advanced Dimension Constraints (Collapsed by default) */}
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
                    <label className="studio-field-label">
                      <span>الحد الأدنى للعرض (minWidth)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetDimensionField('minWidth')}
                      >
                        ضبط
                      </button>
                    </label>
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
                    <label className="studio-field-label">
                      <span>الحد الأقصى للعرض (maxWidth)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetDimensionField('maxWidth')}
                      >
                        ضبط
                      </button>
                    </label>
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
                    <label className="studio-field-label">
                      <span>الحد الأدنى للارتفاع (minHeight)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetDimensionField('minHeight')}
                      >
                        ضبط
                      </button>
                    </label>
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
                    <label className="studio-field-label">
                      <span>الحد الأقصى للارتفاع (maxHeight)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetDimensionField('maxHeight')}
                      >
                        ضبط
                      </button>
                    </label>
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
            {/* Group 3.1: Basic Icon Settings (Open by default) */}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    <label className="studio-field-label">
                      <span>مصدر الأيقونة (source)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetIconField('source')}
                      >
                        ضبط
                      </button>
                    </label>
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
                      <label className="studio-field-label">
                        <span>اختيار الأيقونة (value)</span>
                        <button
                          type="button"
                          className="studio-btn studio-btn-ghost"
                          onClick={() => onResetIconField('value')}
                        >
                          ضبط
                        </button>
                      </label>
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
                      <label className="studio-field-label">
                        <span>قيمة الأيقونة (value)</span>
                        <button
                          type="button"
                          className="studio-btn studio-btn-ghost"
                          onClick={() => onResetIconField('value')}
                        >
                          ضبط
                        </button>
                      </label>
                      <input
                        type="text"
                        className="studio-input"
                        value={icon.value}
                        onChange={(e) => onUpdateIcon({ value: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="studio-field">
                    <label className="studio-field-label">
                      <span>لون الأيقونة (color)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetIconField('color')}
                      >
                        ضبط
                      </button>
                    </label>
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
                      <span>الحجم ({icon.size}px)</span>
                      <button
                        type="button"
                        className="studio-btn studio-btn-ghost"
                        onClick={() => onResetIconField('size')}
                      >
                        ضبط
                      </button>
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
                </div>
              </div>
            </AccordionGroup>

            {/* Group 3.2: Advanced Icon Transform & Position (Collapsed by default) */}
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
                  <label className="studio-field-label">
                    <span>زاوية الدوران ({icon.rotate}°)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetIconField('rotate')}
                    >
                      ضبط
                    </button>
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
                  <label className="studio-field-label">
                    <span>موضع الأيقونة (position)</span>
                    <button
                      type="button"
                      className="studio-btn studio-btn-ghost"
                      onClick={() => onResetIconField('position')}
                    >
                      ضبط
                    </button>
                  </label>
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

        {/* ==================== 4. APPEARANCE CATEGORY ==================== */}
        {activeSection === 'appearance' && (
          <>
            {/* Group 4.1: Basic Surface Colors & Radius (Open by default) */}
            <AccordionGroup
              groupId="appearance-basic"
              title="الألوان الأساسية واستدارة الزوايا"
              subtitle="مفتوحة افتراضيًا"
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
              </div>
            </AccordionGroup>

            {/* Group 4.2: Advanced Surface Spacing & Borders (Collapsed by default) */}
            <AccordionGroup
              groupId="appearance-advanced"
              title="خيارات متقدمة — المسافات الداخلية وسماكة الإطار"
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
            </AccordionGroup>
          </>
        )}
      </div>
    </section>
  );
};
