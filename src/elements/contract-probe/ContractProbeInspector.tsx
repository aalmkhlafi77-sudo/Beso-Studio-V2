/**
 * Beso Studio V2 — Organized Contract Probe Inspector (Upgraded with Shared Control System)
 *
 * Uses the unified control components (`src/shared/ui/controls/`):
 * - Sticky Inspector Header + 4 Major Category Tabs (`content`, `dimensions`, `icon`, `appearance`)
 * - Accessible Accordion groups (`<button>`, `aria-expanded`, `aria-controls`)
 * - Dedicated Per-Field Typography Cards (`ControlTypographyCard`)
 * - Visual Material Selection Cards (`ControlMaterialGrid`)
 * - Real Color Picker (`ControlColor`)
 * - Image File Uploader (`ControlFile`)
 * - Glow & Animation Effects Section (`ControlEffectsSection`)
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
  countSectionModifications,
  InspectorAccordionState,
} from '../../core/state/workspaceLayoutStore';
import { AccordionGroup } from '../../shared/ui/AccordionGroup';
import {
  ControlColor,
  ControlEffectsSection,
  ControlFile,
  ControlMaterialGrid,
  ControlRange,
  ControlResetButton,
  ControlSelect,
  ControlTextInput,
  ControlToggle,
  ControlTypographyCard,
} from '../../shared/ui/controls';
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
  content: 'المحتوى والنصوص',
  dimensions: 'الأبعاد والقياسات',
  icon: 'الأيقونة والشعار',
  appearance: 'الألوان والخامات والمؤثرات',
};

const WIDTH_UNIT_OPTIONS = [
  { value: 'px', label: 'بكسل (px)' },
  { value: '%', label: 'نسبة مئوية (%)' },
  { value: 'vw', label: 'عرض الشاشة (vw)' },
  { value: 'auto', label: 'تلقائي (auto)' },
];

const HEIGHT_UNIT_OPTIONS = [
  { value: 'px', label: 'بكسل (px)' },
  { value: '%', label: 'نسبة مئوية (%)' },
  { value: 'vh', label: 'ارتفاع الشاشة (vh)' },
  { value: 'auto', label: 'تلقائي (auto)' },
];

const ICON_SOURCE_OPTIONS = [
  { value: 'icon-library', label: 'مكتبة الأيقونات القياسية' },
  { value: 'emoji', label: 'رمز تعبيري (Emoji / Symbol)' },
  { value: 'svg', label: 'مسار SVG مخصص' },
  { value: 'image', label: 'صورة مرفوعة أو رابط' },
  { value: 'none', label: 'بدون أيقونة' },
];

const ICON_POSITION_OPTIONS = [
  { value: 'start', label: 'البداية - يمين في RTL (Start)' },
  { value: 'center', label: 'الوسط (Center)' },
  { value: 'end', label: 'النهاية - يسار في RTL (End)' },
  { value: 'custom', label: 'موضع حر مخصص (Custom)' },
];

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

const BUILTIN_ICON_SELECT_OPTIONS = BUILTIN_ICON_LIBRARY.map((item) => ({
  value: item.id,
  label: item.label,
}));

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
  const [selectedTypographyField, setSelectedTypographyField] =
    useState<ContentFieldKey>('title');

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

  return (
    <section
      className="studio-panel studio-inspector-panel"
      aria-label="منطقة المفتش المنظم (Inspector Panel)"
    >
      {/* Sticky Inspector Header + 4 Category Tabs + Toolbar */}
      <div className="studio-inspector-sticky-header">
        <div className="studio-panel-header">
          <div>
            <h2 className="studio-panel-title">مفتش الخصائص المنظم (Inspector)</h2>
            <div className="studio-panel-meta">
              إجمالي القيم المعدلة في العنصر: {totalModCount}
            </div>
          </div>

          <ControlResetButton
            onClick={onResetAll}
            label="إعادة ضبط العنصر بالكامل"
            isModified={totalModCount > 0}
            testId="reset-all-element-btn"
          />
        </div>

        <div className="studio-tabs-bar" role="tablist" aria-label="أقسام المفتش الأربعة">
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

        <div className="studio-inspector-toolbar">
          <span className="studio-panel-meta">
            القسم النشط: <strong>{SECTION_TITLES[activeSection]}</strong> · التعديلات:{' '}
            {activeSectionModCount}
          </span>

          <div className="studio-header-actions">
            <button
              type="button"
              className="studio-btn studio-btn-secondary"
              data-testid="expand-all-groups-btn"
              onClick={() => onExpandAllInSection(activeSection)}
            >
              فتح الكل
            </button>
            <button
              type="button"
              className="studio-btn studio-btn-secondary"
              data-testid="collapse-all-groups-btn"
              onClick={() => onCollapseAllInSection(activeSection)}
            >
              طي الكل
            </button>
            <ControlResetButton
              onClick={() => onResetCategorySection(activeSection)}
              label={`إعادة ضبط ${SECTION_TITLES[activeSection]}`}
              isModified={activeSectionModCount > 0}
              testId={`reset-section-${activeSection}`}
            />
          </div>
        </div>
      </div>

      <div className="studio-panel-body">
        {activeSection === 'content' && (
          <div className="studio-accordion-stack">
            <AccordionGroup
              groupId="content-basic"
              title="النصوص الأساسية (العنوان، الوصف، الوسم، زر الإجراء)"
              subtitle="كل حقل نصي في بطاقة مستقلة مع حجم الخط ونوعه ولونه ومحاذاة نصه"
              isOpen={openSet.has('content-basic')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'content-basic'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="ui-typography-cards-stack">
                {BASIC_CONTENT_KEYS.map((key) => (
                  <ControlTypographyCard
                    key={key}
                    fieldKey={key}
                    field={state.content[key]}
                    defaultField={defaultState.content[key]}
                    onUpdate={(patch) => onUpdateContentField(key, patch)}
                    onResetField={() => onResetContentField(key)}
                    testIdPrefix="probe-content"
                  />
                ))}
              </div>
            </AccordionGroup>

            <AccordionGroup
              groupId="content-metrics"
              title="المؤشرات الرقمية والتحليل (الرقم، النسبة، التحليل)"
              subtitle="بطاقات تحرير مستقلة للرقم والنسبة المئوية والتحليل"
              isOpen={openSet.has('content-metrics')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'content-metrics'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="ui-typography-cards-stack">
                {METRIC_CONTENT_KEYS.map((key) => (
                  <ControlTypographyCard
                    key={key}
                    fieldKey={key}
                    field={state.content[key]}
                    defaultField={defaultState.content[key]}
                    onUpdate={(patch) => onUpdateContentField(key, patch)}
                    onResetField={() => onResetContentField(key)}
                    testIdPrefix="probe-metric"
                  />
                ))}
              </div>
            </AccordionGroup>

            <AccordionGroup
              groupId="content-advanced"
              title="خيارات متقدمة: الطباعة المركزة لحقل محدد"
              subtitle="اختر أي حقل نصي لتخصيص طباعته بشكل منفرد"
              isOpen={openSet.has('content-advanced')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'content-advanced'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="ui-typography-cards-stack">
                <ControlSelect
                  label="اختر الحقل النصي المستهدف"
                  value={selectedTypographyField}
                  options={ALL_CONTENT_KEYS.map((k) => ({
                    value: k,
                    label: CONTENT_FIELD_LABELS[k],
                  }))}
                  onChange={(val) => setSelectedTypographyField(val as ContentFieldKey)}
                  fullWidth
                />

                <ControlTypographyCard
                  fieldKey={selectedTypographyField}
                  field={state.content[selectedTypographyField]}
                  defaultField={defaultState.content[selectedTypographyField]}
                  onUpdate={(patch) =>
                    onUpdateContentField(selectedTypographyField, patch)
                  }
                  onResetField={() => onResetContentField(selectedTypographyField)}
                  testIdPrefix="probe-focused"
                />
              </div>
            </AccordionGroup>
          </div>
        )}

        {activeSection === 'dimensions' && (
          <div className="studio-accordion-stack">
            <AccordionGroup
              groupId="dimensions-basic"
              title="الأبعاد الأساسية (العرض والارتفاع المستقلان)"
              subtitle="تغيير العرض لا يغير الارتفاع، وتغيير الارتفاع لا يغير العرض"
              isOpen={openSet.has('dimensions-basic')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'dimensions-basic'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="ui-control-grid-2">
                <ControlRange
                  label="العرض المستقل (Width)"
                  value={typeof dimensions.width === 'number' ? dimensions.width : 460}
                  min={220}
                  max={1200}
                  step={4}
                  unit={dimensions.widthUnit === 'auto' ? 'auto' : dimensions.widthUnit}
                  disabled={dimensions.width === 'auto' || dimensions.widthUnit === 'auto'}
                  isModified={dimensions.width !== defaultState.dimensions.width}
                  onChange={(nextW) =>
                    onUpdateDimensions({
                      width: nextW,
                      widthUnit:
                        dimensions.widthUnit === 'auto' ? 'px' : dimensions.widthUnit,
                    })
                  }
                  onReset={() => onResetDimensionField('width')}
                  numberTestId="input-dimension-width"
                />

                <ControlSelect
                  label="وحدة قياس العرض (Width Unit)"
                  value={dimensions.widthUnit}
                  options={WIDTH_UNIT_OPTIONS}
                  isModified={dimensions.widthUnit !== defaultState.dimensions.widthUnit}
                  onChange={(unitVal) => {
                    const u = unitVal as WidthUnitType;
                    if (u === 'auto') {
                      onUpdateDimensions({ width: 'auto', widthUnit: 'auto' });
                    } else {
                      onUpdateDimensions({
                        widthUnit: u,
                        width: typeof dimensions.width === 'number' ? dimensions.width : 460,
                      });
                    }
                  }}
                  onReset={() => onResetDimensionField('widthUnit')}
                />

                <ControlRange
                  label="الارتفاع المستقل (Height)"
                  value={typeof dimensions.height === 'number' ? dimensions.height : 360}
                  min={180}
                  max={1000}
                  step={4}
                  unit={dimensions.heightUnit === 'auto' ? 'auto' : dimensions.heightUnit}
                  disabled={dimensions.height === 'auto' || dimensions.heightUnit === 'auto'}
                  isModified={dimensions.height !== defaultState.dimensions.height}
                  onChange={(nextH) =>
                    onUpdateDimensions({
                      height: nextH,
                      heightUnit:
                        dimensions.heightUnit === 'auto' ? 'px' : dimensions.heightUnit,
                    })
                  }
                  onReset={() => onResetDimensionField('height')}
                  numberTestId="input-dimension-height"
                />

                <ControlSelect
                  label="وحدة قياس الارتفاع (Height Unit)"
                  value={dimensions.heightUnit}
                  options={HEIGHT_UNIT_OPTIONS}
                  isModified={dimensions.heightUnit !== defaultState.dimensions.heightUnit}
                  onChange={(unitVal) => {
                    const u = unitVal as HeightUnitType;
                    if (u === 'auto') {
                      onUpdateDimensions({ height: 'auto', heightUnit: 'auto' });
                    } else {
                      onUpdateDimensions({
                        heightUnit: u,
                        height:
                          typeof dimensions.height === 'number' ? dimensions.height : 360,
                      });
                    }
                  }}
                  onReset={() => onResetDimensionField('heightUnit')}
                />
              </div>
            </AccordionGroup>

            <AccordionGroup
              groupId="dimensions-advanced"
              title="خيارات متقدمة: الحدود الدنيا والقصوى للأبعاد"
              subtitle="الحد الأدنى والأقصى للعرض والارتفاع وقفل النسبة"
              isOpen={openSet.has('dimensions-advanced')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'dimensions-advanced'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="ui-control-grid-2">
                <ControlRange
                  label="الحد الأدنى للعرض (minWidth)"
                  value={dimensions.minWidth}
                  min={160}
                  max={800}
                  step={10}
                  unit="px"
                  isModified={dimensions.minWidth !== defaultState.dimensions.minWidth}
                  onChange={(val) => onUpdateDimensions({ minWidth: val })}
                  onReset={() => onResetDimensionField('minWidth')}
                />

                <ControlRange
                  label="الحد الأقصى للعرض (maxWidth)"
                  value={typeof dimensions.maxWidth === 'number' ? dimensions.maxWidth : 960}
                  min={320}
                  max={1600}
                  step={20}
                  unit="px"
                  isModified={dimensions.maxWidth !== defaultState.dimensions.maxWidth}
                  onChange={(val) => onUpdateDimensions({ maxWidth: val })}
                  onReset={() => onResetDimensionField('maxWidth')}
                />

                <ControlRange
                  label="الحد الأدنى للارتفاع (minHeight)"
                  value={dimensions.minHeight}
                  min={120}
                  max={700}
                  step={10}
                  unit="px"
                  isModified={dimensions.minHeight !== defaultState.dimensions.minHeight}
                  onChange={(val) => onUpdateDimensions({ minHeight: val })}
                  onReset={() => onResetDimensionField('minHeight')}
                />

                <ControlToggle
                  label="قفل نسبة العرض إلى الارتفاع"
                  checked={dimensions.lockAspectRatio}
                  isModified={
                    dimensions.lockAspectRatio !== defaultState.dimensions.lockAspectRatio
                  }
                  onChange={(checked) => onUpdateDimensions({ lockAspectRatio: checked })}
                  onReset={() => onResetDimensionField('lockAspectRatio')}
                />
              </div>
            </AccordionGroup>
          </div>
        )}

        {activeSection === 'icon' && (
          <div className="studio-accordion-stack">
            <AccordionGroup
              groupId="icon-basic"
              title="إعدادات الأيقونة الأساسية (الظهور، المصدر، القيمة، اللون، الحجم)"
              subtitle="تعديل الأيقونة مستقل تمامًا عن النصوص والأبعاد"
              isOpen={openSet.has('icon-basic')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'icon-basic'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="ui-typography-cards-stack">
                <ControlToggle
                  label="إظهار الأيقونة في العنصر"
                  checked={icon.visible}
                  isModified={icon.visible !== defaultState.icon.visible}
                  onChange={(checked) => onUpdateIcon({ visible: checked })}
                  onReset={() => onResetIconField('visible')}
                />

                <div className="ui-control-grid-2">
                  <ControlSelect
                    label="مصدر الأيقونة (Icon Source)"
                    value={icon.source}
                    options={ICON_SOURCE_OPTIONS}
                    isModified={icon.source !== defaultState.icon.source}
                    onChange={(srcVal) =>
                      onUpdateIcon({ source: srcVal as IconSourceType })
                    }
                    onReset={() => onResetIconField('source')}
                    selectTestId="select-icon-source"
                  />

                  {icon.source === 'icon-library' ? (
                    <ControlSelect
                      label="اختر الأيقونة من المكتبة"
                      value={icon.value}
                      options={BUILTIN_ICON_SELECT_OPTIONS}
                      isModified={icon.value !== defaultState.icon.value}
                      onChange={(val) => onUpdateIcon({ value: val })}
                      onReset={() => onResetIconField('value')}
                    />
                  ) : icon.source !== 'image' ? (
                    <ControlTextInput
                      label="قيمة الأيقونة (رمز Emoji أو مسار SVG)"
                      value={icon.value}
                      isModified={icon.value !== defaultState.icon.value}
                      onChange={(val) => onUpdateIcon({ value: val })}
                      onReset={() => onResetIconField('value')}
                      inputTestId="input-icon-value"
                    />
                  ) : null}
                </div>

                {icon.source === 'image' && (
                  <ControlFile
                    label="رفع صورة الأيقونة"
                    value={icon.value}
                    isModified={icon.value !== defaultState.icon.value}
                    onChange={(url) => onUpdateIcon({ value: url })}
                    onReset={() => onResetIconField('value')}
                  />
                )}

                <div className="ui-control-grid-2">
                  <ControlColor
                    label="لون الأيقونة (Icon Color)"
                    value={icon.color}
                    isModified={icon.color !== defaultState.icon.color}
                    onChange={(nextColor) => onUpdateIcon({ color: nextColor })}
                    onReset={() => onResetIconField('color')}
                  />

                  <ControlRange
                    label="حجم الأيقونة (Icon Size)"
                    value={icon.size}
                    min={14}
                    max={88}
                    step={2}
                    unit="px"
                    isModified={icon.size !== defaultState.icon.size}
                    onChange={(nextSize) => onUpdateIcon({ size: nextSize })}
                    onReset={() => onResetIconField('size')}
                  />
                </div>
              </div>
            </AccordionGroup>

            <AccordionGroup
              groupId="icon-advanced"
              title="خيارات متقدمة: الدوران والتموضع"
              subtitle="زاوية الدوران وموضع الأيقونة داخل الرأس"
              isOpen={openSet.has('icon-advanced')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'icon-advanced'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="ui-control-grid-2">
                <ControlRange
                  label="زاوية الدوران (Rotation)"
                  value={icon.rotate}
                  min={-180}
                  max={180}
                  step={5}
                  unit="deg"
                  isModified={icon.rotate !== defaultState.icon.rotate}
                  onChange={(deg) => onUpdateIcon({ rotate: deg })}
                  onReset={() => onResetIconField('rotate')}
                />

                <ControlSelect
                  label="موضع الأيقونة (Position)"
                  value={icon.position}
                  options={ICON_POSITION_OPTIONS}
                  isModified={icon.position !== defaultState.icon.position}
                  onChange={(pos) => onUpdateIcon({ position: pos as IconPositionType })}
                  onReset={() => onResetIconField('position')}
                />
              </div>
            </AccordionGroup>
          </div>
        )}

        {activeSection === 'appearance' && (
          <div className="studio-accordion-stack">
            <AccordionGroup
              groupId="appearance-basic"
              title="الخامة البصرية والألوان الأساسية واستدارة الزوايا"
              subtitle="بطاقات اختيار مرئية للخامات التسع مع منتقيات ألوان مستقلة"
              isOpen={openSet.has('appearance-basic')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'appearance-basic'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="ui-typography-cards-stack">
                <ControlMaterialGrid
                  label="نوع الخامة البصرية (9 خامات مرئية)"
                  value={surface.materialType}
                  isModified={surface.materialType !== defaultState.surface.materialType}
                  onChange={(nextMat: CardMaterialType) =>
                    onUpdateSurface({ materialType: nextMat })
                  }
                  onReset={() => onResetSurfaceField('materialType')}
                />

                <ControlFile
                  label="صورة خلفية السطح (Surface Image)"
                  value={surface.imageSourceUrl}
                  isModified={
                    surface.imageSourceUrl !== defaultState.surface.imageSourceUrl
                  }
                  onChange={(nextUrl) => onUpdateSurface({ imageSourceUrl: nextUrl })}
                  onReset={() => onResetSurfaceField('imageSourceUrl')}
                />

                <div className="ui-control-grid-2">
                  <ControlColor
                    label="لون الخلفية الأساسي"
                    value={surface.backgroundColor}
                    isModified={
                      surface.backgroundColor !== defaultState.surface.backgroundColor
                    }
                    onChange={(nextColor) =>
                      onUpdateSurface({
                        backgroundColor: nextColor,
                        primaryColor: nextColor,
                      })
                    }
                    onReset={() => {
                      onResetSurfaceField('backgroundColor');
                      onResetSurfaceField('primaryColor');
                    }}
                  />

                  <ControlColor
                    label="اللون الثانوي"
                    value={surface.secondaryColor}
                    isModified={
                      surface.secondaryColor !== defaultState.surface.secondaryColor
                    }
                    onChange={(nextColor) => onUpdateSurface({ secondaryColor: nextColor })}
                    onReset={() => onResetSurfaceField('secondaryColor')}
                  />

                  <ControlColor
                    label="لون الإطار (Border Color)"
                    value={surface.borderColor}
                    isModified={surface.borderColor !== defaultState.surface.borderColor}
                    onChange={(nextColor) => onUpdateSurface({ borderColor: nextColor })}
                    onReset={() => onResetSurfaceField('borderColor')}
                  />

                  <ControlColor
                    label="لون خلفية الزر"
                    value={surface.actionBackgroundColor}
                    isModified={
                      surface.actionBackgroundColor !==
                      defaultState.surface.actionBackgroundColor
                    }
                    onChange={(nextColor) =>
                      onUpdateSurface({
                        actionBackgroundColor: nextColor,
                        accentColor: nextColor,
                      })
                    }
                    onReset={() => onResetSurfaceField('actionBackgroundColor')}
                  />
                </div>

                <ControlRange
                  label="استدارة الزوايا (Border Radius)"
                  value={surface.borderRadius}
                  min={0}
                  max={48}
                  step={2}
                  unit="px"
                  isModified={surface.borderRadius !== defaultState.surface.borderRadius}
                  onChange={(val) => onUpdateSurface({ borderRadius: val })}
                  onReset={() => onResetSurfaceField('borderRadius')}
                />
              </div>
            </AccordionGroup>

            <AccordionGroup
              groupId="appearance-advanced"
              title="المؤثرات (التوهج والحركة) والزجاج والظلال والمسافات"
              subtitle="تفعيل التوهج والحركة، ضبابية الزجاج، الظلال، والمسافات الداخلية"
              isOpen={openSet.has('appearance-advanced')}
              modifiedCount={countAccordionGroupModifications(
                state,
                defaultState,
                'appearance-advanced'
              )}
              onToggle={onToggleAccordionGroup}
              onResetGroup={onResetAccordionGroup}
            >
              <div className="ui-typography-cards-stack">
                <ControlEffectsSection
                  glowColor={surface.glowColor}
                  glowIntensity={surface.glowIntensity}
                  defaultGlowColor={defaultState.surface.glowColor}
                  defaultGlowIntensity={defaultState.surface.glowIntensity}
                  onUpdateGlow={(patch) => onUpdateSurface(patch)}
                  onResetGlow={() => {
                    onResetSurfaceField('glowColor');
                    onResetSurfaceField('glowIntensity');
                  }}
                />

                <div className="ui-control-grid-2">
                  <ControlSelect
                    label="اتجاه التدرج"
                    value={surface.gradientDirection}
                    options={GRADIENT_DIRECTIONS}
                    isModified={
                      surface.gradientDirection !== defaultState.surface.gradientDirection
                    }
                    onChange={(dir) =>
                      onUpdateSurface({ gradientDirection: dir as GradientDirectionType })
                    }
                    onReset={() => onResetSurfaceField('gradientDirection')}
                  />

                  <ControlSelect
                    label="نمط النقش الهندسي"
                    value={surface.patternType}
                    options={PATTERN_PRESETS}
                    isModified={surface.patternType !== defaultState.surface.patternType}
                    onChange={(pat) =>
                      onUpdateSurface({ patternType: pat as PatternPresetType })
                    }
                    onReset={() => onResetSurfaceField('patternType')}
                  />

                  <ControlRange
                    label="سماكة الإطار (Border Width)"
                    value={surface.borderWidth}
                    min={0}
                    max={12}
                    step={1}
                    unit="px"
                    isModified={surface.borderWidth !== defaultState.surface.borderWidth}
                    onChange={(val) => onUpdateSurface({ borderWidth: val })}
                    onReset={() => onResetSurfaceField('borderWidth')}
                  />

                  <ControlRange
                    label="المسافة الفاصلة (Gap)"
                    value={surface.gap}
                    min={4}
                    max={48}
                    step={2}
                    unit="px"
                    isModified={surface.gap !== defaultState.surface.gap}
                    onChange={(val) => onUpdateSurface({ gap: val })}
                    onReset={() => onResetSurfaceField('gap')}
                  />

                  <ControlRange
                    label="الحشو الأفقي (Padding X)"
                    value={surface.paddingX}
                    min={8}
                    max={64}
                    step={2}
                    unit="px"
                    isModified={surface.paddingX !== defaultState.surface.paddingX}
                    onChange={(val) => onUpdateSurface({ paddingX: val })}
                    onReset={() => onResetSurfaceField('paddingX')}
                  />

                  <ControlRange
                    label="الحشو الرأسي (Padding Y)"
                    value={surface.paddingY}
                    min={8}
                    max={64}
                    step={2}
                    unit="px"
                    isModified={surface.paddingY !== defaultState.surface.paddingY}
                    onChange={(val) => onUpdateSurface({ paddingY: val })}
                    onReset={() => onResetSurfaceField('paddingY')}
                  />
                </div>
              </div>
            </AccordionGroup>
          </div>
        )}
      </div>
    </section>
  );
};
