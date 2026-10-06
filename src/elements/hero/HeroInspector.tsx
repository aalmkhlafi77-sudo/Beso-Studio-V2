/**
 * Beso Studio V2 — Production Hero Section Inspector (Upgraded with Shared Control System)
 */

import React, { useState } from 'react';
import {
  ContentFieldKey,
  EditableIcon,
  EditableText,
  HeightUnitType,
  HeroActionButtonConfig,
  HeroAspectRatioType,
  HeroElementData,
  HeroObjectFitType,
  HeroVariantType,
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
import { ensureHeroData, HERO_DEFAULT_STATE } from './heroModule';

export interface HeroInspectorProps {
  state: IndependentElementState;
  onUpdateContentField: (fieldKey: ContentFieldKey, patch: Partial<EditableText>) => void;
  onUpdateIcon: (patch: Partial<EditableIcon>) => void;
  onUpdateDimensions: (patch: Partial<IndependentDimensions>) => void;
  onUpdateHeroData: (patch: Partial<HeroElementData>) => void;
  onUpdateHeroAction: (
    which: 'primaryAction' | 'secondaryAction',
    patch: Partial<HeroActionButtonConfig>,
    labelPatch?: Partial<EditableText>
  ) => void;
  onResetAll: () => void;
}

type HeroInspectorTab = 'content' | 'media' | 'actions' | 'dimensions';

const HERO_TEXT_KEYS: ContentFieldKey[] = [
  'title',
  'description',
  'badge',
  'number',
  'percentage',
  'analysis',
];

export const HeroInspector: React.FC<HeroInspectorProps> = ({
  state,
  onUpdateContentField,
  onUpdateIcon,
  onUpdateDimensions,
  onUpdateHeroData,
  onUpdateHeroAction,
  onResetAll,
}) => {
  const hero = ensureHeroData(state);
  const [activeTab, setActiveTab] = useState<HeroInspectorTab>('content');

  return (
    <section
      className="studio-panel studio-inspector-panel"
      aria-label="مفتش قسم الواجهة الرئيسي (Hero Inspector)"
    >
      <div className="studio-inspector-sticky-header">
        <div className="studio-panel-header">
          <div>
            <h2 className="studio-panel-title">مفتش قسم الواجهة الرئيسي (Hero Inspector)</h2>
            <div className="studio-panel-meta">
              نمط: {hero.variant} · زرّان مستقلان · طبقة Overlay · استجابة كاملة
            </div>
          </div>
          <ControlResetButton
            onClick={onResetAll}
            label="إعادة ضبط Hero"
            testId="reset-hero-all-btn"
          />
        </div>

        <div className="studio-tabs-bar" role="tablist" aria-label="أقسام مفتش الـ Hero">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'content'}
            className="studio-tab-btn"
            data-active={activeTab === 'content'}
            onClick={() => setActiveTab('content')}
          >
            النصوص والخطوط
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'media'}
            className="studio-tab-btn"
            data-active={activeTab === 'media'}
            onClick={() => setActiveTab('media')}
          >
            النمط والصورة والمؤثرات
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'actions'}
            className="studio-tab-btn"
            data-active={activeTab === 'actions'}
            onClick={() => setActiveTab('actions')}
          >
            الأزرار والشعار
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dimensions'}
            className="studio-tab-btn"
            data-active={activeTab === 'dimensions'}
            onClick={() => setActiveTab('dimensions')}
          >
            الأبعاد المستقلة
          </button>
        </div>
      </div>

      <div className="studio-panel-body">
        {activeTab === 'content' && (
          <div className="ui-typography-cards-stack">
            {HERO_TEXT_KEYS.map((fieldKey) => (
              <ControlTypographyCard
                key={fieldKey}
                fieldKey={fieldKey}
                field={state.content[fieldKey]}
                defaultField={HERO_DEFAULT_STATE.content[fieldKey]}
                onUpdate={(patch) => onUpdateContentField(fieldKey, patch)}
                onResetField={() =>
                  onUpdateContentField(fieldKey, {
                    ...HERO_DEFAULT_STATE.content[fieldKey],
                  })
                }
                testIdPrefix="hero-content"
              />
            ))}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="ui-typography-cards-stack">
            <ControlSection
              title="نمط Hero والصورة المرفوعة والطبقة الشفافة (Overlay)"
              subtitle="6 أنماط Hero مع رفع صورة مخصصة وضبط Object Fit ونسبة العرض"
            >
              <div className="ui-control-grid-2">
                <ControlSelect
                  label="نمط Hero (Variant)"
                  value={hero.variant}
                  options={[
                    { value: 'single-image', label: 'Hero بصورة واحدة (Single Image)' },
                    { value: 'split', label: 'Hero مقسم (Split Layout)' },
                    { value: 'background-image', label: 'Hero بخلفية صورة (Background Image)' },
                    { value: 'gradient', label: 'Hero بخلفية تدرج (Gradient)' },
                    { value: 'glass', label: 'Hero زجاجي (Glass)' },
                    { value: 'neon', label: 'Hero نيون (Neon)' },
                  ]}
                  onChange={(val) =>
                    onUpdateHeroData({ variant: val as HeroVariantType })
                  }
                />

                <ControlSelect
                  label="ملاءمة الصورة (Object Fit)"
                  value={hero.objectFit}
                  options={[
                    { value: 'cover', label: 'تغطية كاملة (cover)' },
                    { value: 'contain', label: 'احتواء كامل (contain)' },
                    { value: 'fill', label: 'ملء الإطار (fill)' },
                  ]}
                  onChange={(val) =>
                    onUpdateHeroData({ objectFit: val as HeroObjectFitType })
                  }
                />

                <ControlSelect
                  label="نسبة العرض للصورة (Aspect Ratio)"
                  value={hero.aspectRatio}
                  options={[
                    { value: '16/9', label: '16 / 9' },
                    { value: '4/3', label: '4 / 3' },
                    { value: '21/9', label: '21 / 9' },
                    { value: '1/1', label: '1 / 1' },
                    { value: 'auto', label: 'تلقائي (auto)' },
                  ]}
                  onChange={(val) =>
                    onUpdateHeroData({ aspectRatio: val as HeroAspectRatioType })
                  }
                />

                <ControlRange
                  label="الشفافية العامة (%)"
                  value={hero.opacity}
                  min={10}
                  max={100}
                  step={2}
                  unit="%"
                  onChange={(val) => onUpdateHeroData({ opacity: val })}
                />
              </div>

              <ControlFile
                label="صورة قسم الـ Hero (Hero Image)"
                description="ارفع صورة من الجهاز أو اسحبها إلى هنا أو أدخل رابطًا مباشرًا."
                value={hero.imageUrl}
                onChange={(nextUrl) => onUpdateHeroData({ imageUrl: nextUrl })}
                testId="hero-image-file"
              />

              <ControlToggle
                label="تفعيل طبقة التعتيم (Overlay)"
                checked={hero.overlayEnabled}
                onChange={(checked) => onUpdateHeroData({ overlayEnabled: checked })}
              />

              <div className="ui-control-grid-2">
                <ControlColor
                  label="لون طبقة الـ Overlay"
                  value={hero.overlayColor}
                  disabled={!hero.overlayEnabled}
                  onChange={(nextColor) =>
                    onUpdateHeroData({ overlayColor: nextColor })
                  }
                />

                <ControlRange
                  label="شفافية الـ Overlay (%)"
                  value={hero.overlayOpacity}
                  min={0}
                  max={100}
                  step={2}
                  unit="%"
                  disabled={!hero.overlayEnabled}
                  onChange={(val) => onUpdateHeroData({ overlayOpacity: val })}
                />

                <ControlRange
                  label="ضبابية الزجاج (Glass Blur)"
                  value={hero.glassBlur}
                  min={0}
                  max={40}
                  step={1}
                  unit="px"
                  onChange={(val) => onUpdateHeroData({ glassBlur: val })}
                />
              </div>
            </ControlSection>

            <ControlEffectsSection
              glowColor={hero.glowColor}
              glowIntensity={hero.glowIntensity}
              onUpdateGlow={(patch) => onUpdateHeroData(patch)}
              testId="hero-effects-section"
            />
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="ui-typography-cards-stack">
            <ControlSection
              title="الزر الأساسي والزر الثانوي المستقلان"
              subtitle="تخصيص نص ولون وظهور كل زر على حدة"
            >
              <ControlToggle
                label="إظهار الزر الأول (Primary Action)"
                checked={hero.primaryAction.visible}
                onChange={(checked) =>
                  onUpdateHeroAction('primaryAction', { visible: checked })
                }
              />

              <ControlTextInput
                label="نص الزر الأول"
                value={hero.primaryAction.label.value}
                onChange={(val) =>
                  onUpdateHeroAction('primaryAction', {}, { value: val })
                }
                fullWidth
              />

              <div className="ui-control-grid-2">
                <ControlColor
                  label="لون خلفية الزر الأول"
                  value={hero.primaryAction.backgroundColor}
                  onChange={(nextColor) =>
                    onUpdateHeroAction('primaryAction', {
                      backgroundColor: nextColor,
                    })
                  }
                />

                <ControlColor
                  label="لون نص الزر الأول"
                  value={hero.primaryAction.textColor}
                  onChange={(nextColor) =>
                    onUpdateHeroAction('primaryAction', { textColor: nextColor })
                  }
                />
              </div>

              <ControlToggle
                label="إظهار الزر الثاني (Secondary Action)"
                checked={hero.secondaryAction.visible}
                onChange={(checked) =>
                  onUpdateHeroAction('secondaryAction', { visible: checked })
                }
              />

              <ControlTextInput
                label="نص الزر الثاني"
                value={hero.secondaryAction.label.value}
                onChange={(val) =>
                  onUpdateHeroAction('secondaryAction', {}, { value: val })
                }
                fullWidth
              />

              <div className="ui-control-grid-2">
                <ControlColor
                  label="لون خلفية الزر الثاني"
                  value={hero.secondaryAction.backgroundColor}
                  onChange={(nextColor) =>
                    onUpdateHeroAction('secondaryAction', {
                      backgroundColor: nextColor,
                    })
                  }
                />

                <ControlColor
                  label="لون نص الزر الثاني"
                  value={hero.secondaryAction.textColor}
                  onChange={(nextColor) =>
                    onUpdateHeroAction('secondaryAction', { textColor: nextColor })
                  }
                />
              </div>
            </ControlSection>

            <ControlSection title="الشعار والأيقونة المستقلة في الـ Hero">
              <ControlToggle
                label="إظهار الشعار / الأيقونة"
                checked={state.icon.visible}
                onChange={(checked) => onUpdateIcon({ visible: checked })}
              />

              <div className="ui-control-grid-2">
                <ControlColor
                  label="لون الأيقونة"
                  value={state.icon.color}
                  onChange={(nextColor) => onUpdateIcon({ color: nextColor })}
                />

                <ControlRange
                  label="حجم الأيقونة"
                  value={state.icon.size}
                  min={16}
                  max={72}
                  step={2}
                  unit="px"
                  onChange={(val) => onUpdateIcon({ size: val })}
                />
              </div>
            </ControlSection>
          </div>
        )}

        {activeTab === 'dimensions' && (
          <ControlSection
            title="العرض والارتفاع المستقلان لقسم الـ Hero"
            subtitle="يدعم التجاوب التلقائي على 1440px و768px و390px و360px"
          >
            <div className="ui-control-grid-2">
              <ControlRange
                label="العرض المستقل (Width)"
                value={
                  typeof state.dimensions.width === 'number'
                    ? state.dimensions.width
                    : 760
                }
                min={300}
                max={1440}
                step={10}
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
                    width: unit === 'auto' ? 'auto' : 760,
                  });
                }}
              />

              <ControlRange
                label="الارتفاع المستقل (Height)"
                value={
                  typeof state.dimensions.height === 'number'
                    ? state.dimensions.height
                    : 420
                }
                min={240}
                max={960}
                step={10}
                unit={
                  state.dimensions.heightUnit === 'auto'
                    ? 'auto'
                    : state.dimensions.heightUnit
                }
                disabled={state.dimensions.height === 'auto'}
                onChange={(val) =>
                  onUpdateDimensions({
                    height: val,
                    heightUnit: 'px',
                  })
                }
              />

              <ControlSelect
                label="وحدة الارتفاع (Height Unit)"
                value={state.dimensions.heightUnit}
                options={[
                  { value: 'auto', label: 'auto' },
                  { value: 'px', label: 'px' },
                ]}
                onChange={(u) => {
                  const unit = u as HeightUnitType;
                  onUpdateDimensions({
                    heightUnit: unit,
                    height: unit === 'auto' ? 'auto' : 420,
                  });
                }}
              />
            </div>
          </ControlSection>
        )}
      </div>
    </section>
  );
};
