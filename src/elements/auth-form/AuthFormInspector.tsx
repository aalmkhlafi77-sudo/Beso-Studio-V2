/**
 * Beso Studio V2 — Production Auth Form Inspector (Upgraded with Shared Control System)
 */

import React, { useState } from 'react';
import {
  AuthFormElementData,
  AuthFormFieldItem,
  AuthFormMaterialType,
  AuthFormMode,
  ContentFieldKey,
  EditableText,
  HeightUnitType,
  IndependentDimensions,
  IndependentElementState,
  WidthUnitType,
} from '../../core/state/elementStateTypes';
import {
  ControlColor,
  ControlEffectsSection,
  ControlMaterialGrid,
  ControlRange,
  ControlResetButton,
  ControlSection,
  ControlSelect,
  ControlTextInput,
  ControlToggle,
  ControlTypographyCard,
  MaterialCardOption,
} from '../../shared/ui/controls';
import { AUTH_FORM_DEFAULT_STATE, ensureAuthFormData } from './authFormModule';

export interface AuthFormInspectorProps {
  state: IndependentElementState;
  onUpdateContentField: (fieldKey: ContentFieldKey, patch: Partial<EditableText>) => void;
  onUpdateDimensions: (patch: Partial<IndependentDimensions>) => void;
  onUpdateAuthFormData: (patch: Partial<AuthFormElementData>) => void;
  onUpdateAuthFormField: (fieldId: string, patch: Partial<AuthFormFieldItem>) => void;
  onResetAll: () => void;
}

type AuthFormTab = 'mode' | 'fields' | 'typography' | 'dimensions';

const AUTH_MATERIAL_CARDS: ReadonlyArray<MaterialCardOption<AuthFormMaterialType>> = [
  {
    value: 'glass',
    labelAr: 'زجاج ضبابي',
    labelEn: 'Glass',
    shortDesc: 'نموذج مصادقة بلوري شفاف',
  },
  {
    value: 'metal',
    labelAr: 'معدن مصقول',
    labelEn: 'Metal',
    shortDesc: 'نموذج مصادقة معدني فاخر',
  },
  {
    value: 'neon',
    labelAr: 'نيون متوهج',
    labelEn: 'Neon',
    shortDesc: 'نموذج مصادقة بإطار مضيء',
  },
];

export const AuthFormInspector: React.FC<AuthFormInspectorProps> = ({
  state,
  onUpdateContentField,
  onUpdateDimensions,
  onUpdateAuthFormData,
  onUpdateAuthFormField,
  onResetAll,
}) => {
  const auth = ensureAuthFormData(state);
  const [activeTab, setActiveTab] = useState<AuthFormTab>('mode');

  return (
    <section
      className="studio-panel studio-inspector-panel"
      aria-label="مفتش نموذج المصادقة (Auth Form Inspector)"
    >
      <div className="studio-inspector-sticky-header">
        <div className="studio-panel-header">
          <div>
            <h2 className="studio-panel-title">مفتش نموذج المصادقة (Auth Form Inspector)</h2>
            <div className="studio-panel-meta">
              الوضع: {auth.mode} · الخامة: {auth.material} · نموذج واجهة متوافق مع معايير الوصول
            </div>
          </div>
          <ControlResetButton
            onClick={onResetAll}
            label="إعادة ضبط النموذج"
            testId="reset-auth-form-all-btn"
          />
        </div>

        <div className="studio-tabs-bar" role="tablist" aria-label="أقسام مفتش النموذج">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mode'}
            className="studio-tab-btn"
            data-active={activeTab === 'mode'}
            onClick={() => setActiveTab('mode')}
          >
            الوضع والخامة والمؤثرات
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'fields'}
            className="studio-tab-btn"
            data-active={activeTab === 'fields'}
            onClick={() => setActiveTab('fields')}
          >
            حقول الإدخال والرسائل ({auth.fields.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'typography'}
            className="studio-tab-btn"
            data-active={activeTab === 'typography'}
            onClick={() => setActiveTab('typography')}
          >
            النصوص والأزرار
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
        {activeTab === 'mode' && (
          <div className="ui-typography-cards-stack">
            <ControlSection
              title="وضع النموذج والخامة وإظهار كلمة المرور"
              subtitle="اختر بين تسجيل الدخول أو إنشاء حساب أو استعادة كلمة المرور"
            >
              <ControlSelect
                label="وضع النموذج (Form Mode)"
                value={auth.mode}
                options={[
                  { value: 'login', label: 'تسجيل الدخول (Login)' },
                  { value: 'register', label: 'إنشاء حساب جديد (Register)' },
                  { value: 'recover', label: 'استعادة كلمة المرور (Recover)' },
                ]}
                onChange={(val) =>
                  onUpdateAuthFormData({ mode: val as AuthFormMode })
                }
                fullWidth
              />

              <ControlMaterialGrid
                label="خامة خلفية النموذج (3 خامات مرئية)"
                value={auth.material}
                options={AUTH_MATERIAL_CARDS}
                onChange={(nextMat) =>
                  onUpdateAuthFormData({ material: nextMat })
                }
                testId="auth-form-material-grid"
              />

              <div className="ui-control-grid-2">
                <ControlToggle
                  label="إظهار زر تبديل كلمة المرور"
                  checked={auth.showPasswordToggle}
                  onChange={(checked) =>
                    onUpdateAuthFormData({ showPasswordToggle: checked })
                  }
                />

                <ControlToggle
                  label="معاينة كلمة المرور مكشوفة"
                  checked={auth.passwordRevealed}
                  onChange={(checked) =>
                    onUpdateAuthFormData({ passwordRevealed: checked })
                  }
                />
              </div>

              <div className="ui-control-grid-2">
                <ControlColor
                  label="لون خلفية زر الإرسال"
                  value={auth.submitBackgroundColor}
                  onChange={(nextColor) =>
                    onUpdateAuthFormData({ submitBackgroundColor: nextColor })
                  }
                />

                <ControlColor
                  label="لون نص زر الإرسال"
                  value={auth.submitTextColor}
                  onChange={(nextColor) =>
                    onUpdateAuthFormData({ submitTextColor: nextColor })
                  }
                />
              </div>
            </ControlSection>

            <ControlEffectsSection
              glowColor={auth.glowColor}
              glowIntensity={auth.glowIntensity}
              onUpdateGlow={(patch) => onUpdateAuthFormData(patch)}
              testId="auth-form-effects"
            />
          </div>
        )}

        {activeTab === 'fields' && (
          <div className="ui-typography-cards-stack">
            {auth.fields.map((field) => (
              <div key={field.id} className="ui-typography-field-card">
                <div className="ui-typography-field-card__header">
                  <div className="ui-typography-field-card__title-group">
                    <span className="ui-typography-field-card__badge">
                      {field.fieldName}
                    </span>
                    <h4 className="ui-typography-field-card__title">
                      {field.icon} {field.label}
                    </h4>
                  </div>
                </div>

                <div className="ui-typography-field-card__body">
                  <div className="ui-control-grid-2">
                    <ControlTextInput
                      label="اسم الحقل البرمجي (fieldName)"
                      dir="ltr"
                      value={field.fieldName}
                      onChange={(val) =>
                        onUpdateAuthFormField(field.id, { fieldName: val })
                      }
                    />

                    <ControlTextInput
                      label="عنوان الحقل الظاهر (Label)"
                      value={field.label}
                      onChange={(val) =>
                        onUpdateAuthFormField(field.id, { label: val })
                      }
                    />

                    <ControlTextInput
                      label="نص الإرشاد داخل الحقل (Placeholder)"
                      value={field.placeholder}
                      onChange={(val) =>
                        onUpdateAuthFormField(field.id, { placeholder: val })
                      }
                    />

                    <ControlTextInput
                      label="الأيقونة المرافقة"
                      value={field.icon}
                      onChange={(val) =>
                        onUpdateAuthFormField(field.id, { icon: val })
                      }
                    />
                  </div>

                  <div className="ui-control-grid-2">
                    <ControlToggle
                      label="إظهار النص المساعد (Helper Text)"
                      checked={field.showHelper}
                      onChange={(checked) =>
                        onUpdateAuthFormField(field.id, { showHelper: checked })
                      }
                    />

                    <ControlToggle
                      label="إظهار رسالة الخطأ (Error State)"
                      checked={field.showError}
                      onChange={(checked) =>
                        onUpdateAuthFormField(field.id, { showError: checked })
                      }
                    />
                  </div>

                  <div className="ui-control-grid-2">
                    <ControlTextInput
                      label="محتوى النص المساعد"
                      value={field.helperText}
                      onChange={(val) =>
                        onUpdateAuthFormField(field.id, { helperText: val })
                      }
                    />

                    <ControlTextInput
                      label="محتوى رسالة الخطأ"
                      value={field.errorMessage}
                      onChange={(val) =>
                        onUpdateAuthFormField(field.id, { errorMessage: val })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="ui-typography-cards-stack">
            <ControlTypographyCard
              fieldKey="title"
              customTitle="عنوان نموذج المصادقة (Form Title)"
              field={state.content.title}
              defaultField={AUTH_FORM_DEFAULT_STATE.content.title}
              onUpdate={(patch) => onUpdateContentField('title', patch)}
              onResetField={() =>
                onUpdateContentField('title', {
                  ...AUTH_FORM_DEFAULT_STATE.content.title,
                })
              }
              testIdPrefix="auth-title"
            />

            <ControlTypographyCard
              fieldKey="description"
              customTitle="الوصف التوضيحي للنموذج (Form Description)"
              field={state.content.description}
              defaultField={AUTH_FORM_DEFAULT_STATE.content.description}
              onUpdate={(patch) => onUpdateContentField('description', patch)}
              onResetField={() =>
                onUpdateContentField('description', {
                  ...AUTH_FORM_DEFAULT_STATE.content.description,
                })
              }
              testIdPrefix="auth-description"
            />

            <ControlSection title="نصوص زر الإرسال والرابط الثانوي">
              <div className="ui-control-grid-2">
                <ControlTextInput
                  label="نص زر الإرسال (Submit Button Label)"
                  value={auth.submitLabel.value}
                  onChange={(val) =>
                    onUpdateAuthFormData({
                      submitLabel: { ...auth.submitLabel, value: val },
                    })
                  }
                />

                <ControlTextInput
                  label="نص الرابط الثانوي (Secondary Link)"
                  value={auth.secondaryLinkText.value}
                  onChange={(val) =>
                    onUpdateAuthFormData({
                      secondaryLinkText: { ...auth.secondaryLinkText, value: val },
                    })
                  }
                />
              </div>
            </ControlSection>
          </div>
        )}

        {activeTab === 'dimensions' && (
          <ControlSection title="العرض والارتفاع المستقلان لنموذج المصادقة">
            <div className="ui-control-grid-2">
              <ControlRange
                label="العرض المستقل (Width)"
                value={
                  typeof state.dimensions.width === 'number'
                    ? state.dimensions.width
                    : 440
                }
                min={280}
                max={960}
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
                    width: unit === 'auto' ? 'auto' : 440,
                  });
                }}
              />

              <ControlRange
                label="الارتفاع المستقل (Height)"
                value={
                  typeof state.dimensions.height === 'number'
                    ? state.dimensions.height
                    : 460
                }
                min={260}
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
                    height: unit === 'auto' ? 'auto' : 460,
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
