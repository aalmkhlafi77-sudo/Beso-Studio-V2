/**
 * Beso Studio V2 — Production Social Dock Inspector (Upgraded with Shared Control System)
 */

import React, { useState } from 'react';
import {
  ContentFieldKey,
  EditableText,
  HeightUnitType,
  IndependentDimensions,
  IndependentElementState,
  SocialDockElementData,
  SocialDockLinkItem,
  SocialDockOrientation,
  SocialDockPosition,
  WidthUnitType,
} from '../../core/state/elementStateTypes';
import {
  ControlColor,
  ControlEffectsSection,
  ControlRange,
  ControlResetButton,
  ControlSection,
  ControlSelect,
  ControlTextInput,
  ControlToggle,
  ControlTypographyCard,
} from '../../shared/ui/controls';
import { ensureSocialDockData, SOCIAL_DOCK_DEFAULT_STATE } from './socialDockModule';

export interface SocialDockInspectorProps {
  state: IndependentElementState;
  onUpdateContentField: (fieldKey: ContentFieldKey, patch: Partial<EditableText>) => void;
  onUpdateDimensions: (patch: Partial<IndependentDimensions>) => void;
  onUpdateSocialDockData: (patch: Partial<SocialDockElementData>) => void;
  onUpdateSocialDockItem: (itemId: string, patch: Partial<SocialDockLinkItem>) => void;
  onAddSocialDockItem: (item: SocialDockLinkItem) => void;
  onRemoveSocialDockItem: (itemId: string) => void;
  onResetAll: () => void;
}

type SocialDockTab = 'links' | 'layout' | 'dimensions';

export const SocialDockInspector: React.FC<SocialDockInspectorProps> = ({
  state,
  onUpdateContentField,
  onUpdateDimensions,
  onUpdateSocialDockData,
  onUpdateSocialDockItem,
  onAddSocialDockItem,
  onRemoveSocialDockItem,
  onResetAll,
}) => {
  const dock = ensureSocialDockData(state);
  const [activeTab, setActiveTab] = useState<SocialDockTab>('links');

  const handleAddLink = () => {
    const nextOrder = dock.items.length + 1;
    onAddSocialDockItem({
      id: `social-${Date.now()}`,
      name: `منصة #${nextOrder}`,
      url: 'https://example.com',
      icon: '✦',
      color: '#d4af37',
      backgroundColor: '#0e2820',
      size: 46,
      order: nextOrder,
      visible: true,
      ariaLabel: `زيارة منصة رقم ${nextOrder}`,
      openInNewTab: true,
    });
  };

  return (
    <section
      className="studio-panel studio-inspector-panel"
      aria-label="مفتش شريط التواصل الاجتماعي (Social Dock Inspector)"
    >
      <div className="studio-inspector-sticky-header">
        <div className="studio-panel-header">
          <div>
            <h2 className="studio-panel-title">مفتش شريط الروابط الاجتماعية (Social Dock)</h2>
            <div className="studio-panel-meta">
              {dock.items.length} روابط ديناميكية · ألوان وأحجام وترتيب مستقل
            </div>
          </div>
          <ControlResetButton
            onClick={onResetAll}
            label="إعادة ضبط الشريط"
            testId="reset-social-dock-all-btn"
          />
        </div>

        <div className="studio-tabs-bar" role="tablist" aria-label="أقسام مفتش الروابط">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'links'}
            className="studio-tab-btn"
            data-active={activeTab === 'links'}
            onClick={() => setActiveTab('links')}
          >
            الروابط الاجتماعية ({dock.items.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'layout'}
            className="studio-tab-btn"
            data-active={activeTab === 'layout'}
            onClick={() => setActiveTab('layout')}
          >
            الاتجاه والعنوان والمؤثرات
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
        {activeTab === 'links' && (
          <div className="ui-typography-cards-stack">
            <ControlSection
              title={`قائمة الروابط الاجتماعية (${dock.items.length} روابط)`}
              subtitle="تعديل أي رابط لا يؤثر على ألوان أو حجم أو ترتيب بقية الروابط"
            >
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  className="studio-btn studio-btn-primary"
                  onClick={handleAddLink}
                >
                  + إضافة رابط اجتماعي جديد
                </button>
              </div>

              <div className="ui-typography-cards-stack">
                {dock.items.map((item) => (
                  <div
                    key={item.id}
                    className="ui-typography-field-card"
                    data-visible={item.visible}
                  >
                    <div className="ui-typography-field-card__header">
                      <div className="ui-typography-field-card__title-group">
                        <span className="ui-typography-field-card__badge">
                          #{item.order}
                        </span>
                        <h4 className="ui-typography-field-card__title">
                          {item.icon} {item.name}
                        </h4>
                      </div>

                      {dock.items.length > 1 && (
                        <button
                          type="button"
                          className="studio-btn studio-btn-danger"
                          onClick={() => onRemoveSocialDockItem(item.id)}
                        >
                          ✕ حذف الرابط
                        </button>
                      )}
                    </div>

                    <div className="ui-typography-field-card__body">
                      <ControlToggle
                        label={`إظهار رابط ${item.name}`}
                        checked={item.visible}
                        onChange={(checked) =>
                          onUpdateSocialDockItem(item.id, { visible: checked })
                        }
                      />

                      <div className="ui-control-grid-2">
                        <ControlTextInput
                          label="اسم المنصة (Platform Name)"
                          value={item.name}
                          onChange={(val) =>
                            onUpdateSocialDockItem(item.id, { name: val })
                          }
                        />

                        <ControlTextInput
                          label="رمز الأيقونة (Icon / Symbol)"
                          value={item.icon}
                          onChange={(val) =>
                            onUpdateSocialDockItem(item.id, { icon: val })
                          }
                        />
                      </div>

                      <ControlTextInput
                        label="الرابط الكامل (URL)"
                        dir="ltr"
                        value={item.url}
                        onChange={(val) =>
                          onUpdateSocialDockItem(item.id, { url: val })
                        }
                        fullWidth
                      />

                      <ControlTextInput
                        label="النص البديل لإمكانية الوصول (aria-label)"
                        value={item.ariaLabel}
                        onChange={(val) =>
                          onUpdateSocialDockItem(item.id, { ariaLabel: val })
                        }
                        fullWidth
                      />

                      <div className="ui-control-grid-2">
                        <ControlColor
                          label="لون الأيقونة (Icon Color)"
                          value={item.color}
                          onChange={(nextColor) =>
                            onUpdateSocialDockItem(item.id, { color: nextColor })
                          }
                        />

                        <ControlColor
                          label="لون خلفية الأيقونة"
                          value={item.backgroundColor}
                          onChange={(nextColor) =>
                            onUpdateSocialDockItem(item.id, {
                              backgroundColor: nextColor,
                            })
                          }
                        />

                        <ControlRange
                          label="حجم زر الرابط (Size)"
                          value={item.size}
                          min={28}
                          max={80}
                          step={2}
                          unit="px"
                          onChange={(val) =>
                            onUpdateSocialDockItem(item.id, { size: val })
                          }
                        />

                        <ControlRange
                          label="ترتيب الظهور (Order)"
                          value={item.order}
                          min={1}
                          max={20}
                          step={1}
                          unit="#"
                          onChange={(val) =>
                            onUpdateSocialDockItem(item.id, { order: val })
                          }
                        />
                      </div>

                      <ControlToggle
                        label="فتح الرابط في تبويب جديد (target='_blank')"
                        checked={item.openInNewTab}
                        onChange={(checked) =>
                          onUpdateSocialDockItem(item.id, { openInNewTab: checked })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ControlSection>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="ui-typography-cards-stack">
            <ControlSection
              title="اتجاه الشريط وموضعه"
              subtitle="أفقي أو رأسي مع تحديد موضع التثبيت"
            >
              <div className="ui-control-grid-2">
                <ControlSelect
                  label="نمط العرض (Orientation)"
                  value={dock.orientation}
                  options={[
                    { value: 'horizontal', label: 'أفقي (Horizontal)' },
                    { value: 'vertical', label: 'رأسي (Vertical)' },
                  ]}
                  onChange={(val) =>
                    onUpdateSocialDockData({
                      orientation: val as SocialDockOrientation,
                    })
                  }
                />

                <ControlSelect
                  label="موضع الشريط (Dock Position)"
                  value={dock.dockPosition}
                  options={[
                    { value: 'inline', label: 'تلقائي ضمن السياق (Inline)' },
                    { value: 'bottom-center', label: 'أسفل المنتصف (Bottom Center)' },
                    { value: 'start-side', label: 'الجانب الأيمن / البداية (Start Side)' },
                    { value: 'end-side', label: 'الجانب الأيسر / النهاية (End Side)' },
                  ]}
                  onChange={(val) =>
                    onUpdateSocialDockData({
                      dockPosition: val as SocialDockPosition,
                    })
                  }
                />
              </div>
            </ControlSection>

            <ControlTypographyCard
              fieldKey="title"
              customTitle="عنوان شريط الروابط الاجتماعية"
              field={state.content.title}
              defaultField={SOCIAL_DOCK_DEFAULT_STATE.content.title}
              onUpdate={(patch) => onUpdateContentField('title', patch)}
              onResetField={() =>
                onUpdateContentField('title', {
                  ...SOCIAL_DOCK_DEFAULT_STATE.content.title,
                })
              }
              testIdPrefix="social-dock-title"
            />

            <ControlEffectsSection
              glowColor={state.surface.glowColor}
              glowIntensity={state.surface.glowIntensity}
              onUpdateGlow={() => {}}
              testId="social-dock-effects"
            />
          </div>
        )}

        {activeTab === 'dimensions' && (
          <ControlSection title="العرض والارتفاع المستقلان لشريط الروابط">
            <div className="ui-control-grid-2">
              <ControlRange
                label="العرض المستقل (Width)"
                value={
                  typeof state.dimensions.width === 'number'
                    ? state.dimensions.width
                    : 360
                }
                min={160}
                max={1000}
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
                    widthUnit: 'px',
                  })
                }
              />

              <ControlSelect
                label="وحدة العرض (Width Unit)"
                value={state.dimensions.widthUnit}
                options={[
                  { value: 'auto', label: 'auto' },
                  { value: 'px', label: 'px' },
                  { value: '%', label: '%' },
                ]}
                onChange={(u) => {
                  const unit = u as WidthUnitType;
                  onUpdateDimensions({
                    widthUnit: unit,
                    width: unit === 'auto' ? 'auto' : 360,
                  });
                }}
              />

              <ControlRange
                label="الارتفاع المستقل (Height)"
                value={
                  typeof state.dimensions.height === 'number'
                    ? state.dimensions.height
                    : 120
                }
                min={64}
                max={600}
                step={8}
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
                    height: unit === 'auto' ? 'auto' : 120,
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
