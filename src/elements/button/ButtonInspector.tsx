/**
 * Beso Studio V2 — Production Button Inspector (Upgraded with Shared Control System)
 */

import React, { useState } from 'react';
import { ICON_LIBRARY_OPTIONS } from '../../core/assets/assetTypes';
import {
  ButtonElementData,
  ButtonIconPlacement,
  ButtonInteractiveStateStyle,
  ButtonSurfaceType,
  ButtonVariantMode,
  ContentFieldKey,
  EditableIcon,
  EditableText,
  GradientDirectionType,
  HeightUnitType,
  IconSourceType,
  IndependentDimensions,
  IndependentElementState,
  WidthUnitType,
} from '../../core/state/elementStateTypes';
import {
  ControlColor,
  ControlEffectsSection,
  ControlFile,
  ControlRange,
  ControlResetButton,
  ControlSection,
  ControlSelect,
  ControlTextInput,
  ControlToggle,
  ControlTypographyCard,
} from '../../shared/ui/controls';
import { BUTTON_DEFAULT_STATE, ensureButtonData } from './buttonModule';

export interface ButtonInspectorProps {
  state: IndependentElementState;
  onUpdateContentField: (fieldKey: ContentFieldKey, patch: Partial<EditableText>) => void;
  onUpdateIcon: (patch: Partial<EditableIcon>) => void;
  onUpdateDimensions: (patch: Partial<IndependentDimensions>) => void;
  onUpdateButtonData: (patch: Partial<ButtonElementData>) => void;
  onUpdateButtonStateStyle: (
    stateKey: 'defaultStyle' | 'hoverStyle' | 'activeStyle',
    patch: Partial<ButtonInteractiveStateStyle>
  ) => void;
  onResetAll: () => void;
}

type ButtonInspectorTab = 'content' | 'icon' | 'dimensions' | 'appearance';

export const ButtonInspector: React.FC<ButtonInspectorProps> = ({
  state,
  onUpdateContentField,
  onUpdateIcon,
  onUpdateDimensions,
  onUpdateButtonData,
  onUpdateButtonStateStyle,
  onResetAll,
}) => {
  const btn = ensureButtonData(state);
  const [activeTab, setActiveTab] = useState<ButtonInspectorTab>('content');
  const [activeStateTab, setActiveStateTab] = useState<
    'defaultStyle' | 'hoverStyle' | 'activeStyle'
  >('defaultStyle');

  const currentInteractiveStyle = btn[activeStateTab];

  return (
    <section
      className="studio-panel studio-inspector-panel"
      aria-label="مفتش خصائص الزر (Button Inspector)"
    >
      {/* Sticky Header & Tabs */}
      <div className="studio-inspector-sticky-header">
        <div className="studio-panel-header">
          <div>
            <h2 className="studio-panel-title">مفتش الزر الإنتاجي (Button Inspector)</h2>
            <div className="studio-panel-meta">
              نمط: {btn.variantMode} · خامة: {btn.surfaceType} · حالات تفاعلية مستقلة
            </div>
          </div>
          <ControlResetButton
            onClick={onResetAll}
            label="إعادة ضبط الزر"
            testId="reset-button-all-btn"
          />
        </div>

        <div className="studio-tabs-bar" role="tablist" aria-label="أقسام مفتش الزر">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'content'}
            className="studio-tab-btn"
            data-active={activeTab === 'content'}
            onClick={() => setActiveTab('content')}
          >
            النص والنمط
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'icon'}
            className="studio-tab-btn"
            data-active={activeTab === 'icon'}
            onClick={() => setActiveTab('icon')}
          >
            الأيقونة وموضعها
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dimensions'}
            className="studio-tab-btn"
            data-active={activeTab === 'dimensions'}
            onClick={() => setActiveTab('dimensions')}
          >
            الأبعاد والحدود
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'appearance'}
            className="studio-tab-btn"
            data-active={activeTab === 'appearance'}
            onClick={() => setActiveTab('appearance')}
          >
            الألوان والحالات والمؤثرات
          </button>
        </div>
      </div>

      <div className="studio-panel-body">
        {activeTab === 'content' && (
          <div className="ui-typography-cards-stack">
            <ControlSection
              title="نمط الزر والخامة وحالة التعطيل"
              subtitle="اختر بين زر رئيسي أو نصي أو زر أيقونة فقط"
            >
              <div className="ui-control-grid-2">
                <ControlSelect
                  label="نمط الزر (Variant Mode)"
                  value={btn.variantMode}
                  options={[
                    { value: 'primary', label: 'زر إجراء رئيسي (Primary Button)' },
                    { value: 'text', label: 'زر نصي (Text Button)' },
                    { value: 'icon-only', label: 'زر أيقونة فقط (Icon-Only Button)' },
                  ]}
                  onChange={(val) =>
                    onUpdateButtonData({ variantMode: val as ButtonVariantMode })
                  }
                />

                <ControlSelect
                  label="خامة الخلفية (Surface Material)"
                  value={btn.surfaceType}
                  options={[
                    { value: 'solid', label: 'خلفية مصمتة (Solid)' },
                    { value: 'gradient', label: 'تدرج لوني (Gradient)' },
                    { value: 'glass', label: 'زجاج ضبابي (Glass)' },
                    { value: 'neon', label: 'نيون متوهج (Neon)' },
                  ]}
                  onChange={(val) =>
                    onUpdateButtonData({ surfaceType: val as ButtonSurfaceType })
                  }
                />
              </div>

              <ControlToggle
                label="حالة التعطيل (Disabled State)"
                description="عند تفعيلها يتم تعطيل تفاعل النقر والتمرير مع إضافة سمة aria-disabled."
                checked={btn.disabled}
                onChange={(checked) => onUpdateButtonData({ disabled: checked })}
                activeText="معطل (Disabled)"
                inactiveText="مفعل (Enabled)"
              />
            </ControlSection>

            <ControlTypographyCard
              fieldKey="actionLabel"
              customTitle="نص الزر الرئيسي (Button Action Label)"
              field={state.content.actionLabel}
              defaultField={BUTTON_DEFAULT_STATE.content.actionLabel}
              onUpdate={(patch) => onUpdateContentField('actionLabel', patch)}
              onResetField={() =>
                onUpdateContentField('actionLabel', {
                  ...BUTTON_DEFAULT_STATE.content.actionLabel,
                })
              }
              testIdPrefix="button-label"
            />

            <ControlTypographyCard
              fieldKey="badge"
              customTitle="الشارة المرفقة بالزر (Button Badge)"
              field={state.content.badge}
              defaultField={BUTTON_DEFAULT_STATE.content.badge}
              onUpdate={(patch) => onUpdateContentField('badge', patch)}
              onResetField={() =>
                onUpdateContentField('badge', {
                  ...BUTTON_DEFAULT_STATE.content.badge,
                })
              }
              testIdPrefix="button-badge"
            />
          </div>
        )}

        {activeTab === 'icon' && (
          <ControlSection
            title="الأيقونة المستقلة وموضعها بالنسبة للنص"
            subtitle="تخصيص الأيقونة دون التأثير على نص الزر أو أبعاده"
          >
            <ControlToggle
              label="إظهار الأيقونة داخل الزر"
              checked={state.icon.visible}
              onChange={(checked) => onUpdateIcon({ visible: checked })}
            />

            <div className="ui-control-grid-2">
              <ControlSelect
                label="مصدر الأيقونة (Icon Source)"
                value={state.icon.source}
                options={[
                  { value: 'icon-library', label: 'مكتبة الأيقونات القياسية' },
                  { value: 'emoji', label: 'رمز Emoji' },
                  { value: 'svg', label: 'مسار SVG مخصص' },
                  { value: 'image', label: 'صورة مرفوعة' },
                  { value: 'none', label: 'بدون أيقونة' },
                ]}
                onChange={(val) => onUpdateIcon({ source: val as IconSourceType })}
              />

              <ControlSelect
                label="موضع الأيقونة (Icon Placement)"
                value={btn.iconPlacement}
                options={[
                  { value: 'start', label: 'قبل النص (Start)' },
                  { value: 'end', label: 'بعد النص (End)' },
                  { value: 'top', label: 'أعلى النص (Top)' },
                ]}
                onChange={(val) =>
                  onUpdateButtonData({ iconPlacement: val as ButtonIconPlacement })
                }
              />
            </div>

            {state.icon.source === 'icon-library' ? (
              <ControlSelect
                label="اختر الأيقونة من المكتبة"
                value={state.icon.value}
                options={ICON_LIBRARY_OPTIONS.map((opt) => ({
                  value: opt.id,
                  label: opt.label,
                }))}
                onChange={(val) => onUpdateIcon({ value: val })}
                fullWidth
              />
            ) : state.icon.source === 'image' ? (
              <ControlFile
                label="صورة أيقونة الزر"
                value={state.icon.value}
                onChange={(url) => onUpdateIcon({ value: url })}
              />
            ) : (
              <ControlTextInput
                label="قيمة الأيقونة (Emoji أو SVG Path)"
                value={state.icon.value}
                onChange={(val) => onUpdateIcon({ value: val })}
                fullWidth
              />
            )}

            <div className="ui-control-grid-2">
              <ControlColor
                label="لون الأيقونة (Icon Color)"
                value={state.icon.color}
                onChange={(nextColor) => onUpdateIcon({ color: nextColor })}
              />

              <ControlRange
                label="حجم الأيقونة (Icon Size)"
                value={state.icon.size}
                min={12}
                max={64}
                step={1}
                unit="px"
                onChange={(val) => onUpdateIcon({ size: val })}
              />
            </div>
          </ControlSection>
        )}

        {activeTab === 'dimensions' && (
          <ControlSection
            title="الأبعاد المستقلة والاستدارة والحدود"
            subtitle="تغيير العرض لا يغير الارتفاع، وتغيير الارتفاع لا يغير العرض"
          >
            <div className="ui-control-grid-2">
              <ControlRange
                label="العرض المستقل (Width)"
                value={
                  typeof state.dimensions.width === 'number'
                    ? state.dimensions.width
                    : 240
                }
                min={80}
                max={800}
                step={4}
                unit={
                  state.dimensions.widthUnit === 'auto'
                    ? 'auto'
                    : state.dimensions.widthUnit
                }
                disabled={state.dimensions.width === 'auto'}
                onChange={(val) =>
                  onUpdateDimensions({
                    width: val,
                    widthUnit:
                      state.dimensions.widthUnit === 'auto'
                        ? 'px'
                        : state.dimensions.widthUnit,
                  })
                }
              />

              <ControlSelect
                label="وحدة العرض (Width Unit)"
                value={state.dimensions.widthUnit}
                options={[
                  { value: 'px', label: 'px' },
                  { value: '%', label: '%' },
                  { value: 'auto', label: 'auto' },
                ]}
                onChange={(u) => {
                  const unit = u as WidthUnitType;
                  onUpdateDimensions({
                    widthUnit: unit,
                    width: unit === 'auto' ? 'auto' : 240,
                  });
                }}
              />

              <ControlRange
                label="الارتفاع المستقل (Height)"
                value={
                  typeof state.dimensions.height === 'number'
                    ? state.dimensions.height
                    : 54
                }
                min={32}
                max={240}
                step={2}
                unit={
                  state.dimensions.heightUnit === 'auto'
                    ? 'auto'
                    : state.dimensions.heightUnit
                }
                disabled={state.dimensions.height === 'auto'}
                onChange={(val) =>
                  onUpdateDimensions({
                    height: val,
                    heightUnit:
                      state.dimensions.heightUnit === 'auto'
                        ? 'px'
                        : state.dimensions.heightUnit,
                  })
                }
              />

              <ControlSelect
                label="وحدة الارتفاع (Height Unit)"
                value={state.dimensions.heightUnit}
                options={[
                  { value: 'px', label: 'px' },
                  { value: 'auto', label: 'auto' },
                ]}
                onChange={(u) => {
                  const unit = u as HeightUnitType;
                  onUpdateDimensions({
                    heightUnit: unit,
                    height: unit === 'auto' ? 'auto' : 54,
                  });
                }}
              />

              <ControlRange
                label="استدارة الزوايا (Border Radius)"
                value={btn.borderRadius}
                min={0}
                max={99}
                step={1}
                unit="px"
                onChange={(val) => onUpdateButtonData({ borderRadius: val })}
              />

              <ControlRange
                label="سماكة الإطار (Border Width)"
                value={btn.borderWidth}
                min={0}
                max={10}
                step={1}
                unit="px"
                onChange={(val) => onUpdateButtonData({ borderWidth: val })}
              />
            </div>
          </ControlSection>
        )}

        {activeTab === 'appearance' && (
          <div className="ui-typography-cards-stack">
            <ControlSection
              title="تخصيص الحالات التفاعلية المستقلة (Default / Hover / Active)"
              subtitle="تعديل حالة Hover أو Active لا يغير ألوان الحالة الافتراضية"
            >
              <div
                className="studio-category-bar"
                role="tablist"
                aria-label="حالات الزر التفاعلية"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeStateTab === 'defaultStyle'}
                  className="studio-category-tab"
                  data-active={activeStateTab === 'defaultStyle'}
                  onClick={() => setActiveStateTab('defaultStyle')}
                >
                  الحالة الافتراضية (Default)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeStateTab === 'hoverStyle'}
                  className="studio-category-tab"
                  data-active={activeStateTab === 'hoverStyle'}
                  onClick={() => setActiveStateTab('hoverStyle')}
                >
                  عند التمرير (Hover)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeStateTab === 'activeStyle'}
                  className="studio-category-tab"
                  data-active={activeStateTab === 'activeStyle'}
                  onClick={() => setActiveStateTab('activeStyle')}
                >
                  عند الضغط (Active)
                </button>
              </div>

              <div className="ui-control-grid-2">
                <ControlColor
                  label="اللون الأساسي للخلفية"
                  value={currentInteractiveStyle.backgroundColor}
                  onChange={(nextColor) =>
                    onUpdateButtonStateStyle(activeStateTab, {
                      backgroundColor: nextColor,
                    })
                  }
                />

                <ControlColor
                  label="اللون الثانوي (للتدرج)"
                  value={currentInteractiveStyle.secondaryColor}
                  onChange={(nextColor) =>
                    onUpdateButtonStateStyle(activeStateTab, {
                      secondaryColor: nextColor,
                    })
                  }
                />

                <ControlColor
                  label="لون النص في هذه الحالة"
                  value={currentInteractiveStyle.textColor}
                  onChange={(nextColor) =>
                    onUpdateButtonStateStyle(activeStateTab, { textColor: nextColor })
                  }
                />

                <ControlColor
                  label="لون الإطار في هذه الحالة"
                  value={currentInteractiveStyle.borderColor}
                  onChange={(nextColor) =>
                    onUpdateButtonStateStyle(activeStateTab, { borderColor: nextColor })
                  }
                />
              </div>

              <ControlSelect
                label="اتجاه التدرج اللوني"
                value={btn.gradientDirection}
                options={[
                  { value: '135deg', label: 'قطري 135°' },
                  { value: '90deg', label: 'أفقي 90°' },
                  { value: '180deg', label: 'عمودي 180°' },
                  { value: '45deg', label: 'قطري عكسي 45°' },
                ]}
                onChange={(val) =>
                  onUpdateButtonData({
                    gradientDirection: val as GradientDirectionType,
                  })
                }
                fullWidth
              />
            </ControlSection>

            <ControlEffectsSection
              glowColor={currentInteractiveStyle.glowColor}
              glowIntensity={currentInteractiveStyle.glowIntensity}
              onUpdateGlow={(patch) =>
                onUpdateButtonStateStyle(activeStateTab, patch)
              }
              testId={`button-effects-${activeStateTab}`}
            />
          </div>
        )}
      </div>
    </section>
  );
};
