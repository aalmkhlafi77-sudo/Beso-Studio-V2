/**
 * Beso Studio V2 — Production Brand Identity Inspector (Upgraded with Shared Control System)
 */

import React, { useState } from 'react';
import {
  BrandIdentityElementData,
  BrandIdentityMaterialType,
  ContentFieldKey,
  DeclaredSurfaceTokens,
  EditableText,
  HeightUnitType,
  IndependentDimensions,
  IndependentElementState,
  WidthUnitType,
} from '../../core/state/elementStateTypes';
import { AVAILABLE_FONTS } from '../../shared/typography/typographyTokens';
import {
  ControlColor,
  ControlEffectsSection,
  ControlFile,
  ControlMaterialGrid,
  ControlRange,
  ControlResetButton,
  ControlSection,
  ControlSelect,
  ControlTextInput,
  ControlTypographyCard,
  MaterialCardOption,
} from '../../shared/ui/controls';
import {
  BRAND_IDENTITY_DEFAULT_STATE,
  ensureBrandIdentityData,
} from './brandIdentityModule';

export interface BrandIdentityInspectorProps {
  state: IndependentElementState;
  onUpdateContentField: (fieldKey: ContentFieldKey, patch: Partial<EditableText>) => void;
  onUpdateDimensions: (patch: Partial<IndependentDimensions>) => void;
  onUpdateSurface: (patch: Partial<DeclaredSurfaceTokens>) => void;
  onUpdateBrandIdentityData: (patch: Partial<BrandIdentityElementData>) => void;
  onResetAll: () => void;
}

type BrandIdentityTab = 'logo' | 'typography' | 'appearance' | 'dimensions';

const BRAND_MATERIAL_CARDS: ReadonlyArray<MaterialCardOption<BrandIdentityMaterialType>> = [
  {
    value: 'glass',
    labelAr: 'زجاج ضبابي',
    labelEn: 'Glass',
    shortDesc: 'شفافية بلورية مع ضبابية الخلفية',
  },
  {
    value: 'metal',
    labelAr: 'معدن مصقول',
    labelEn: 'Metal',
    shortDesc: 'انعكاس معدني متدرج متعدد الطبقات',
  },
  {
    value: 'ivory',
    labelAr: 'عاجي لؤلؤي',
    labelEn: 'Ivory',
    shortDesc: 'سطح عاجي دافئ ناعم الإضاءة',
  },
  {
    value: 'dark',
    labelAr: 'داكن فاخر',
    labelEn: 'Dark',
    shortDesc: 'عمق ليلي فحمي بلمسة ذهبية هادئة',
  },
  {
    value: 'gradient',
    labelAr: 'تدرج لوني',
    labelEn: 'Gradient',
    shortDesc: 'مزج انسيابي بين ألوان الهوية',
  },
];

export const BrandIdentityInspector: React.FC<BrandIdentityInspectorProps> = ({
  state,
  onUpdateContentField,
  onUpdateDimensions,
  onUpdateSurface,
  onUpdateBrandIdentityData,
  onResetAll,
}) => {
  const brand = ensureBrandIdentityData(state);
  const [activeTab, setActiveTab] = useState<BrandIdentityTab>('logo');

  return (
    <section
      className="studio-panel studio-inspector-panel"
      aria-label="مفتش الهوية البصرية (Brand Identity Inspector)"
    >
      <div className="studio-inspector-sticky-header">
        <div className="studio-panel-header">
          <div>
            <h2 className="studio-panel-title">مفتش بطاقة الهوية البصرية (Brand Identity)</h2>
            <div className="studio-panel-meta">
              شعار نصي وصوري · رمز مستقل · لوحة ألوان ثلاثية · 5 خامات
            </div>
          </div>
          <ControlResetButton
            onClick={onResetAll}
            label="إعادة ضبط الهوية"
            testId="reset-brand-identity-all-btn"
          />
        </div>

        <div className="studio-tabs-bar" role="tablist" aria-label="أقسام مفتش الهوية">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'logo'}
            className="studio-tab-btn"
            data-active={activeTab === 'logo'}
            onClick={() => setActiveTab('logo')}
          >
            الشعار والرمز
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'typography'}
            className="studio-tab-btn"
            data-active={activeTab === 'typography'}
            onClick={() => setActiveTab('typography')}
          >
            النصوص والخطوط
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'appearance'}
            className="studio-tab-btn"
            data-active={activeTab === 'appearance'}
            onClick={() => setActiveTab('appearance')}
          >
            لوحة الألوان والخامة والمؤثرات
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dimensions'}
            className="studio-tab-btn"
            data-active={activeTab === 'dimensions'}
            onClick={() => setActiveTab('dimensions')}
          >
            الأبعاد والمسافات
          </button>
        </div>
      </div>

      <div className="studio-panel-body">
        {activeTab === 'logo' && (
          <ControlSection
            title="الشعار النصي والشعار الصوري والرمز المستقل"
            subtitle="تحكم مستقل في الشعار النصي ورفع الشعار الصوري والرمز"
          >
            <div className="ui-control-grid-2">
              <ControlTextInput
                label="الشعار النصي (Logo Text)"
                value={brand.logoText}
                onChange={(val) => onUpdateBrandIdentityData({ logoText: val })}
              />

              <ControlTextInput
                label="الرمز المستقل (Symbol Icon)"
                value={brand.symbolIcon}
                onChange={(val) => onUpdateBrandIdentityData({ symbolIcon: val })}
              />

              <ControlRange
                label="حجم خط الشعار"
                value={brand.logoFontSize}
                min={16}
                max={56}
                step={1}
                unit="px"
                onChange={(val) => onUpdateBrandIdentityData({ logoFontSize: val })}
              />

              <ControlSelect
                label="وزن خط الشعار (Font Weight)"
                value={brand.logoFontWeight}
                options={[
                  { value: 400, label: '400 عادي' },
                  { value: 500, label: '500 متوسط' },
                  { value: 600, label: '600 شبه عريض' },
                  { value: 700, label: '700 عريض' },
                ]}
                onChange={(val) =>
                  onUpdateBrandIdentityData({ logoFontWeight: Number(val) || 700 })
                }
              />
            </div>

            <ControlSelect
              label="نوع خط الهوية (Brand Font Family)"
              value={brand.brandFontFamily}
              options={AVAILABLE_FONTS.map((f) => ({
                value: f.cssValue,
                label: f.label,
              }))}
              onChange={(val) => onUpdateBrandIdentityData({ brandFontFamily: val })}
              fullWidth
            />

            <ControlFile
              label="رفع الشعار الصوري (Brand Logo Image)"
              description="ارفع صورة الشعار من الجهاز أو اسحبها إلى هنا أو أدخل رابطًا مباشرًا."
              value={brand.logoImageUrl}
              onChange={(nextUrl) =>
                onUpdateBrandIdentityData({ logoImageUrl: nextUrl })
              }
              testId="brand-logo-file"
            />
          </ControlSection>
        )}

        {activeTab === 'typography' && (
          <div className="ui-typography-cards-stack">
            <ControlTypographyCard
              fieldKey="title"
              customTitle="العنوان الرئيسي لبطاقة الهوية (Title)"
              field={state.content.title}
              defaultField={BRAND_IDENTITY_DEFAULT_STATE.content.title}
              onUpdate={(patch) => onUpdateContentField('title', patch)}
              onResetField={() =>
                onUpdateContentField('title', {
                  ...BRAND_IDENTITY_DEFAULT_STATE.content.title,
                })
              }
              testIdPrefix="brand-title"
            />

            <ControlTypographyCard
              fieldKey="description"
              customTitle="وصف الهوية البصرية (Description)"
              field={state.content.description}
              defaultField={BRAND_IDENTITY_DEFAULT_STATE.content.description}
              onUpdate={(patch) => onUpdateContentField('description', patch)}
              onResetField={() =>
                onUpdateContentField('description', {
                  ...BRAND_IDENTITY_DEFAULT_STATE.content.description,
                })
              }
              testIdPrefix="brand-description"
            />

            <ControlTypographyCard
              fieldKey="badge"
              customTitle="شارة إصدار الهوية (Badge)"
              field={state.content.badge}
              defaultField={BRAND_IDENTITY_DEFAULT_STATE.content.badge}
              onUpdate={(patch) => onUpdateContentField('badge', patch)}
              onResetField={() =>
                onUpdateContentField('badge', {
                  ...BRAND_IDENTITY_DEFAULT_STATE.content.badge,
                })
              }
              testIdPrefix="brand-badge"
            />
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="ui-typography-cards-stack">
            <ControlSection
              title="الخامة ولوحة الألوان الثلاثية (Primary · Secondary · Accent)"
              subtitle="كل لون في لوحة الهوية مستقل تمامًا عن الألوان الأخرى"
            >
              <ControlMaterialGrid
                label="خامة بطاقة الهوية (5 خامات مرئية)"
                value={brand.material}
                options={BRAND_MATERIAL_CARDS}
                onChange={(nextMat) =>
                  onUpdateBrandIdentityData({ material: nextMat })
                }
                testId="brand-material-grid"
              />

              <div className="ui-control-grid-2">
                <ControlColor
                  label="اللون الرئيسي للهوية (Primary Brand Color)"
                  value={brand.primaryBrandColor}
                  onChange={(nextColor) =>
                    onUpdateBrandIdentityData({ primaryBrandColor: nextColor })
                  }
                />

                <ControlColor
                  label="اللون الثانوي للهوية (Secondary Brand Color)"
                  value={brand.secondaryBrandColor}
                  onChange={(nextColor) =>
                    onUpdateBrandIdentityData({ secondaryBrandColor: nextColor })
                  }
                />

                <ControlColor
                  label="اللون المساعد للهوية (Accent Brand Color)"
                  value={brand.accentBrandColor}
                  onChange={(nextColor) =>
                    onUpdateBrandIdentityData({ accentBrandColor: nextColor })
                  }
                />

                <ControlColor
                  label="لون الرمز المستقل (Symbol Color)"
                  value={brand.symbolColor}
                  onChange={(nextColor) =>
                    onUpdateBrandIdentityData({ symbolColor: nextColor })
                  }
                />
              </div>
            </ControlSection>

            <ControlEffectsSection
              glowColor={brand.glowColor}
              glowIntensity={brand.glowIntensity}
              onUpdateGlow={(patch) => onUpdateBrandIdentityData(patch)}
              testId="brand-effects-section"
            />
          </div>
        )}

        {activeTab === 'dimensions' && (
          <ControlSection title="الأبعاد المستقلة والمسافات الداخلية">
            <div className="ui-control-grid-2">
              <ControlRange
                label="العرض المستقل (Width)"
                value={
                  typeof state.dimensions.width === 'number'
                    ? state.dimensions.width
                    : 540
                }
                min={260}
                max={1200}
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
                    width: unit === 'auto' ? 'auto' : 540,
                  });
                }}
              />

              <ControlRange
                label="الارتفاع المستقل (Height)"
                value={
                  typeof state.dimensions.height === 'number'
                    ? state.dimensions.height
                    : 340
                }
                min={200}
                max={900}
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
                    height: unit === 'auto' ? 'auto' : 340,
                  });
                }}
              />

              <ControlRange
                label="الحشو الأفقي (Padding X)"
                value={state.surface.paddingX}
                min={8}
                max={64}
                step={2}
                unit="px"
                onChange={(val) => onUpdateSurface({ paddingX: val })}
              />

              <ControlRange
                label="تباعد العناصر (Gap)"
                value={state.surface.gap}
                min={4}
                max={48}
                step={2}
                unit="px"
                onChange={(val) => onUpdateSurface({ gap: val })}
              />
            </div>
          </ControlSection>
        )}
      </div>
    </section>
  );
};
