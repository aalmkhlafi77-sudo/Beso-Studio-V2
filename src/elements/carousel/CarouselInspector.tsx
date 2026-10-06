/**
 * Beso Studio V2 — Production Carousel Inspector (Upgraded with Shared Control System)
 *
 * Uses the unified control components (`src/shared/ui/controls/`):
 * - Sticky Inspector Header & Tabs (`slides`, `navigation`, `dimensions`, `appearance`)
 * - `ControlFile` for uploading/replacing/deleting each slide's image independently
 * - `ControlTypographyCard` for each slide's 7 independent text fields (`title`, `description`,
 *   `number`, `percentage`, `analysis`, `actionLabel`, `badge`)
 * - `ControlColor` with swatch, native color picker, HEX input, human color name, and reset
 * - `ControlRange`, `ControlSelect`, `ControlToggle`, `ControlResetButton`, and `ControlEffectsSection`
 */

import React, { useState } from 'react';
import {
  CarouselElementData,
  CarouselLayoutMode,
  CarouselSlideItem,
  ContentFieldKey,
  DeclaredSurfaceTokens,
  EditableText,
  HeightUnitType,
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
import {
  CAROUSEL_DEFAULT_STATE,
  createCarouselSlide,
  DEFAULT_CAROUSEL_DATA,
  DEFAULT_CAROUSEL_SLIDES,
  ensureCarouselData,
} from './carouselModule';

export interface CarouselInspectorProps {
  state: IndependentElementState;
  onUpdateDimensions: (patch: Partial<IndependentDimensions>) => void;
  onUpdateSurface?: (patch: Partial<DeclaredSurfaceTokens>) => void;
  onUpdateCarouselData: (patch: Partial<CarouselElementData>) => void;
  onUpdateCarouselSlideField: (
    slideIndex: number,
    fieldKey: ContentFieldKey,
    patch: Partial<EditableText>
  ) => void;
  onUpdateCarouselSlideMeta: (
    slideIndex: number,
    patch: Partial<
      Pick<
        CarouselSlideItem,
        'imageUrl' | 'imageAlt' | 'actionBackgroundColor' | 'actionTextColor'
      >
    >
  ) => void;
  onAddCarouselSlide: (newSlide: CarouselSlideItem) => void;
  onRemoveCarouselSlide: (slideIndex: number) => void;
  onResetAll: () => void;
}

type CarouselInspectorTab = 'slides' | 'navigation' | 'dimensions' | 'appearance';

const SLIDE_CONTENT_KEYS: ContentFieldKey[] = [
  'title',
  'description',
  'number',
  'percentage',
  'analysis',
  'actionLabel',
  'badge',
];

const LAYOUT_MODE_OPTIONS = [
  { value: 'single', label: 'صورة واحدة كاملة (Single Slide)' },
  { value: 'two-columns', label: 'عمودان متجاوران (Two Columns)' },
  { value: 'cards-3d', label: 'بطاقات ثلاثية الأبعاد (3D Cards)' },
];

const DIRECTION_OPTIONS = [
  { value: 'rtl', label: 'من اليمين إلى اليسار (RTL)' },
  { value: 'ltr', label: 'من اليسار إلى اليمين (LTR)' },
];

const WIDTH_UNIT_OPTIONS = [
  { value: 'px', label: 'بكسل (px)' },
  { value: '%', label: 'نسبة مئوية (%)' },
  { value: 'auto', label: 'تلقائي (auto)' },
];

const HEIGHT_UNIT_OPTIONS = [
  { value: 'auto', label: 'تلقائي (auto)' },
  { value: 'px', label: 'بكسل (px)' },
];

export const CarouselInspector: React.FC<CarouselInspectorProps> = ({
  state,
  onUpdateDimensions,
  onUpdateSurface,
  onUpdateCarouselData,
  onUpdateCarouselSlideField,
  onUpdateCarouselSlideMeta,
  onAddCarouselSlide,
  onRemoveCarouselSlide,
  onResetAll,
}) => {
  const [activeTab, setActiveTab] = useState<CarouselInspectorTab>('slides');
  const carousel = ensureCarouselData(state);
  const safeIdx = Math.min(
    Math.max(0, carousel.activeSlideIndex),
    Math.max(0, carousel.slides.length - 1)
  );
  const currentSlide = carousel.slides[safeIdx];
  const defaultSlide =
    DEFAULT_CAROUSEL_SLIDES[safeIdx] || DEFAULT_CAROUSEL_SLIDES[0];

  const handleAddSlide = () => {
    const nextNum = carousel.slides.length + 1;
    const newSlide = createCarouselSlide(
      `slide-${Date.now()}`,
      `شريحة مخصصة #${nextNum}`,
      `وصف مستقل تمامًا للشريحة رقم ${nextNum} دون أي ارتباط بالشرائح الأخرى.`,
      `${nextNum}00+`,
      `+${nextNum * 5}%`,
      `تحليل مستقل للشريحة #${nextNum}`,
      `إجراء الشريحة #${nextNum}`,
      `شريحة 0${nextNum}`,
      '#d4af37'
    );
    onAddCarouselSlide(newSlide);
  };

  return (
    <section
      className="studio-panel studio-inspector-panel"
      aria-label="مفتش عارض الشرائح (Carousel Inspector)"
    >
      {/* Sticky Inspector Header & Tabs */}
      <div className="studio-inspector-sticky-header">
        <div className="studio-panel-header">
          <div>
            <h2 className="studio-panel-title">مفتش عارض الشرائح (Carousel Inspector)</h2>
            <div className="studio-panel-meta">
              {carousel.slides.length} شرائح مستقلة · شريحة نشطة #{safeIdx + 1} · تخطيط:{' '}
              {carousel.layoutMode}
            </div>
          </div>

          <ControlResetButton
            onClick={onResetAll}
            label="إعادة ضبط الكاروسيل"
            testId="reset-carousel-all-btn"
          />
        </div>

        <div className="studio-tabs-bar" role="tablist" aria-label="أقسام مفتش الكاروسيل">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'slides'}
            className="studio-tab-btn"
            data-active={activeTab === 'slides'}
            onClick={() => setActiveTab('slides')}
          >
            الشرائح والمحتوى ({carousel.slides.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'navigation'}
            className="studio-tab-btn"
            data-active={activeTab === 'navigation'}
            onClick={() => setActiveTab('navigation')}
          >
            التخطيط والتشغيل التلقائي
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
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'appearance'}
            className="studio-tab-btn"
            data-active={activeTab === 'appearance'}
            onClick={() => setActiveTab('appearance')}
          >
            الألوان والمؤثرات
          </button>
        </div>
      </div>

      <div className="studio-panel-body">
        {/* ====================================================================
            TAB 1: SLIDES & INDEPENDENT SLIDE CONTENT + IMAGE UPLOAD
            ==================================================================== */}
        {activeTab === 'slides' && (
          <div className="ui-typography-cards-stack">
            <ControlSection
              title={`إدارة الشرائح المستقلة (${carousel.slides.length} شرائح)`}
              subtitle="اختر الشريحة النشطة لتعديل صورتها ونصوصها وألوانها بمعزل تام عن بقية الشرائح"
              testId="carousel-slides-switcher-section"
            >
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="studio-btn studio-btn-primary"
                  data-testid="carousel-add-slide-btn"
                  onClick={handleAddSlide}
                >
                  + إضافة شريحة جديدة
                </button>
                {carousel.slides.length > 1 && (
                  <button
                    type="button"
                    className="studio-btn studio-btn-danger"
                    data-testid="carousel-remove-slide-btn"
                    onClick={() => onRemoveCarouselSlide(safeIdx)}
                  >
                    ✕ حذف الشريحة الحالية (#{safeIdx + 1})
                  </button>
                )}
              </div>

              <div
                className="studio-category-bar"
                role="tablist"
                aria-label="قائمة شرائح الكاروسيل"
              >
                {carousel.slides.map((s, idx) => {
                  const isActive = idx === safeIdx;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className="studio-category-tab"
                      data-active={isActive}
                      data-testid={`carousel-slide-tab-${idx}`}
                      onClick={() => onUpdateCarouselData({ activeSlideIndex: idx })}
                    >
                      <span>شريحة #{idx + 1}</span>
                      <span className="studio-category-badge">
                        {s.badge.value || s.title.value.slice(0, 12)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ControlSection>

            {currentSlide && (
              <>
                {/* Slide Image Upload + Alt Text + CTA Button Colors */}
                <ControlSection
                  title={`صورة وألوان زر الشريحة النشطة (#${safeIdx + 1})`}
                  subtitle="رفع صورة خاصة بهذه الشريحة فقط دون التأثير على الشرائح الأخرى"
                  testId={`carousel-slide-media-section-${safeIdx}`}
                >
                  <ControlFile
                    label={`صورة الشريحة #${safeIdx + 1} (Slide Image)`}
                    description="ارفع صورة من جهازك أو اسحبها إلى هنا أو أدخل رابطًا مباشرًا."
                    value={currentSlide.imageUrl}
                    defaultPreviewUrl={defaultSlide.imageUrl}
                    isModified={currentSlide.imageUrl !== defaultSlide.imageUrl}
                    onChange={(nextUrl) =>
                      onUpdateCarouselSlideMeta(safeIdx, {
                        imageUrl: nextUrl || defaultSlide.imageUrl,
                      })
                    }
                    onReset={() =>
                      onUpdateCarouselSlideMeta(safeIdx, {
                        imageUrl: defaultSlide.imageUrl,
                      })
                    }
                    testId={`carousel-slide-image-${safeIdx}`}
                  />

                  <ControlTextInput
                    label="النص البديل للصورة (Image Alt Text)"
                    value={currentSlide.imageAlt}
                    isModified={currentSlide.imageAlt !== defaultSlide.imageAlt}
                    onChange={(val) =>
                      onUpdateCarouselSlideMeta(safeIdx, { imageAlt: val })
                    }
                    onReset={() =>
                      onUpdateCarouselSlideMeta(safeIdx, {
                        imageAlt: defaultSlide.imageAlt,
                      })
                    }
                    fullWidth
                  />

                  <div className="ui-control-grid-2">
                    <ControlColor
                      label="لون خلفية زر الشريحة"
                      value={currentSlide.actionBackgroundColor}
                      isModified={
                        currentSlide.actionBackgroundColor !==
                        defaultSlide.actionBackgroundColor
                      }
                      onChange={(nextColor) =>
                        onUpdateCarouselSlideMeta(safeIdx, {
                          actionBackgroundColor: nextColor,
                        })
                      }
                      onReset={() =>
                        onUpdateCarouselSlideMeta(safeIdx, {
                          actionBackgroundColor: defaultSlide.actionBackgroundColor,
                        })
                      }
                      testId={`carousel-slide-cta-bg-${safeIdx}`}
                    />

                    <ControlColor
                      label="لون نص زر الشريحة"
                      value={currentSlide.actionTextColor}
                      isModified={
                        currentSlide.actionTextColor !== defaultSlide.actionTextColor
                      }
                      onChange={(nextColor) =>
                        onUpdateCarouselSlideMeta(safeIdx, {
                          actionTextColor: nextColor,
                        })
                      }
                      onReset={() =>
                        onUpdateCarouselSlideMeta(safeIdx, {
                          actionTextColor: defaultSlide.actionTextColor,
                        })
                      }
                      testId={`carousel-slide-cta-text-${safeIdx}`}
                    />
                  </div>
                </ControlSection>

                {/* Dedicated Typography Cards for Each of the 7 Fields in the Active Slide */}
                <ControlSection
                  title={`الحقول النصية المستقلة للشريحة #${safeIdx + 1}`}
                  subtitle="كل حقل نصي في بطاقة مستقلة مع حجم الخط ووزنه ونوعه ولونه ومحاذاة نصه"
                  testId={`carousel-slide-typography-section-${safeIdx}`}
                >
                  <div className="ui-typography-cards-stack">
                    {SLIDE_CONTENT_KEYS.map((fieldKey) => (
                      <ControlTypographyCard
                        key={`${currentSlide.id}-${fieldKey}`}
                        fieldKey={fieldKey}
                        field={currentSlide[fieldKey]}
                        defaultField={defaultSlide[fieldKey]}
                        onUpdate={(patch) =>
                          onUpdateCarouselSlideField(safeIdx, fieldKey, patch)
                        }
                        onResetField={() =>
                          onUpdateCarouselSlideField(safeIdx, fieldKey, {
                            ...defaultSlide[fieldKey],
                          })
                        }
                        testIdPrefix={`carousel-slide-${safeIdx}`}
                      />
                    ))}
                  </div>
                </ControlSection>
              </>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB 2: LAYOUT, NAVIGATION ARROWS, DOTS & AUTOPLAY
            ==================================================================== */}
        {activeTab === 'navigation' && (
          <ControlSection
            title="نمط تخطيط العرض والتنقل والتشغيل التلقائي"
            subtitle="التحكم في تخطيط الشرائح، الأسهم، النقاط، وسرعة التبديل التلقائي"
            onResetSection={() =>
              onUpdateCarouselData({
                layoutMode: DEFAULT_CAROUSEL_DATA.layoutMode,
                direction: DEFAULT_CAROUSEL_DATA.direction,
                showArrows: DEFAULT_CAROUSEL_DATA.showArrows,
                showDots: DEFAULT_CAROUSEL_DATA.showDots,
                autoPlay: DEFAULT_CAROUSEL_DATA.autoPlay,
                pauseOnHover: DEFAULT_CAROUSEL_DATA.pauseOnHover,
                intervalMs: DEFAULT_CAROUSEL_DATA.intervalMs,
              })
            }
          >
            <div className="ui-control-grid-2">
              <ControlSelect
                label="نمط التخطيط (Layout Mode)"
                value={carousel.layoutMode}
                options={LAYOUT_MODE_OPTIONS}
                isModified={carousel.layoutMode !== DEFAULT_CAROUSEL_DATA.layoutMode}
                onChange={(val) =>
                  onUpdateCarouselData({ layoutMode: val as CarouselLayoutMode })
                }
                onReset={() =>
                  onUpdateCarouselData({
                    layoutMode: DEFAULT_CAROUSEL_DATA.layoutMode,
                  })
                }
              />

              <ControlSelect
                label="اتجاه العرض (Direction)"
                value={carousel.direction}
                options={DIRECTION_OPTIONS}
                isModified={carousel.direction !== DEFAULT_CAROUSEL_DATA.direction}
                onChange={(val) =>
                  onUpdateCarouselData({ direction: val as 'rtl' | 'ltr' })
                }
                onReset={() =>
                  onUpdateCarouselData({
                    direction: DEFAULT_CAROUSEL_DATA.direction,
                  })
                }
              />
            </div>

            <div className="ui-control-grid-2">
              <ControlToggle
                label="إظهار أسهم التنقل (Show Arrows)"
                checked={carousel.showArrows}
                isModified={carousel.showArrows !== DEFAULT_CAROUSEL_DATA.showArrows}
                onChange={(checked) => onUpdateCarouselData({ showArrows: checked })}
                onReset={() =>
                  onUpdateCarouselData({ showArrows: DEFAULT_CAROUSEL_DATA.showArrows })
                }
              />

              <ControlToggle
                label="إظهار نقاط الشرائح (Show Dots)"
                checked={carousel.showDots}
                isModified={carousel.showDots !== DEFAULT_CAROUSEL_DATA.showDots}
                onChange={(checked) => onUpdateCarouselData({ showDots: checked })}
                onReset={() =>
                  onUpdateCarouselData({ showDots: DEFAULT_CAROUSEL_DATA.showDots })
                }
              />

              <ControlToggle
                label="التشغيل التلقائي (AutoPlay)"
                checked={carousel.autoPlay}
                isModified={carousel.autoPlay !== DEFAULT_CAROUSEL_DATA.autoPlay}
                onChange={(checked) => onUpdateCarouselData({ autoPlay: checked })}
                onReset={() =>
                  onUpdateCarouselData({ autoPlay: DEFAULT_CAROUSEL_DATA.autoPlay })
                }
              />

              <ControlToggle
                label="إيقاف مؤقت عند التمرير (Pause on Hover)"
                checked={carousel.pauseOnHover}
                isModified={
                  carousel.pauseOnHover !== DEFAULT_CAROUSEL_DATA.pauseOnHover
                }
                onChange={(checked) => onUpdateCarouselData({ pauseOnHover: checked })}
                onReset={() =>
                  onUpdateCarouselData({
                    pauseOnHover: DEFAULT_CAROUSEL_DATA.pauseOnHover,
                  })
                }
              />
            </div>

            <ControlRange
              label="الفاصل الزمني للتبديل التلقائي (Interval)"
              value={carousel.intervalMs}
              min={1000}
              max={10000}
              step={250}
              unit="ms"
              isModified={carousel.intervalMs !== DEFAULT_CAROUSEL_DATA.intervalMs}
              onChange={(val) => onUpdateCarouselData({ intervalMs: val })}
              onReset={() =>
                onUpdateCarouselData({ intervalMs: DEFAULT_CAROUSEL_DATA.intervalMs })
              }
              fullWidth
            />
          </ControlSection>
        )}

        {/* ====================================================================
            TAB 3: INDEPENDENT DIMENSIONS
            ==================================================================== */}
        {activeTab === 'dimensions' && (
          <ControlSection
            title="العرض والارتفاع المستقلان للكاروسيل"
            subtitle="تعديل العرض لا يغير الارتفاع، وتعديل الارتفاع لا يغير العرض"
          >
            <div className="ui-control-grid-2">
              <ControlRange
                label="عرض الكاروسيل (Width)"
                value={
                  typeof state.dimensions.width === 'number'
                    ? state.dimensions.width
                    : 680
                }
                min={280}
                max={1400}
                step={10}
                unit={
                  state.dimensions.widthUnit === 'auto'
                    ? 'auto'
                    : state.dimensions.widthUnit
                }
                disabled={state.dimensions.width === 'auto'}
                isModified={
                  state.dimensions.width !== CAROUSEL_DEFAULT_STATE.dimensions.width
                }
                onChange={(val) =>
                  onUpdateDimensions({
                    width: val,
                    widthUnit:
                      state.dimensions.widthUnit === 'auto'
                        ? 'px'
                        : state.dimensions.widthUnit,
                  })
                }
                onReset={() =>
                  onUpdateDimensions({
                    width: CAROUSEL_DEFAULT_STATE.dimensions.width,
                    widthUnit: CAROUSEL_DEFAULT_STATE.dimensions.widthUnit,
                  })
                }
              />

              <ControlSelect
                label="وحدة العرض (Width Unit)"
                value={state.dimensions.widthUnit}
                options={WIDTH_UNIT_OPTIONS}
                onChange={(u) => {
                  const unit = u as WidthUnitType;
                  onUpdateDimensions({
                    widthUnit: unit,
                    width: unit === 'auto' ? 'auto' : 680,
                  });
                }}
              />

              <ControlRange
                label="ارتفاع الكاروسيل (Height)"
                value={
                  typeof state.dimensions.height === 'number'
                    ? state.dimensions.height
                    : 380
                }
                min={220}
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
                onReset={() =>
                  onUpdateDimensions({
                    height: CAROUSEL_DEFAULT_STATE.dimensions.height,
                    heightUnit: CAROUSEL_DEFAULT_STATE.dimensions.heightUnit,
                  })
                }
              />

              <ControlSelect
                label="وحدة الارتفاع (Height Unit)"
                value={state.dimensions.heightUnit}
                options={HEIGHT_UNIT_OPTIONS}
                onChange={(u) => {
                  const unit = u as HeightUnitType;
                  onUpdateDimensions({
                    heightUnit: unit,
                    height: unit === 'auto' ? 'auto' : 380,
                  });
                }}
              />
            </div>
          </ControlSection>
        )}

        {/* ====================================================================
            TAB 4: APPEARANCE, NAVIGATION COLORS & EFFECTS
            ==================================================================== */}
        {activeTab === 'appearance' && (
          <div className="ui-typography-cards-stack">
            <ControlSection
              title="ألوان الأسهم والنقاط وخلفية الكاروسيل"
              subtitle="منتقيات ألوان مستقلة للأسهم والنقاط والخلفية"
            >
              <div className="ui-control-grid-2">
                <ControlColor
                  label="لون الأسهم (Arrow Color)"
                  value={carousel.arrowColor}
                  isModified={carousel.arrowColor !== DEFAULT_CAROUSEL_DATA.arrowColor}
                  onChange={(nextColor) =>
                    onUpdateCarouselData({ arrowColor: nextColor })
                  }
                  onReset={() =>
                    onUpdateCarouselData({
                      arrowColor: DEFAULT_CAROUSEL_DATA.arrowColor,
                    })
                  }
                />

                <ControlColor
                  label="لون النقطة النشطة (Active Dot Color)"
                  value={carousel.activeDotColor}
                  isModified={
                    carousel.activeDotColor !== DEFAULT_CAROUSEL_DATA.activeDotColor
                  }
                  onChange={(nextColor) =>
                    onUpdateCarouselData({ activeDotColor: nextColor })
                  }
                  onReset={() =>
                    onUpdateCarouselData({
                      activeDotColor: DEFAULT_CAROUSEL_DATA.activeDotColor,
                    })
                  }
                />
              </div>

              {onUpdateSurface && (
                <div className="ui-control-grid-2">
                  <ControlColor
                    label="لون الخلفية الأساسي (Primary Color)"
                    value={state.surface.primaryColor}
                    isModified={
                      state.surface.primaryColor !==
                      CAROUSEL_DEFAULT_STATE.surface.primaryColor
                    }
                    onChange={(nextColor) =>
                      onUpdateSurface({ primaryColor: nextColor })
                    }
                    onReset={() =>
                      onUpdateSurface({
                        primaryColor: CAROUSEL_DEFAULT_STATE.surface.primaryColor,
                      })
                    }
                  />

                  <ControlColor
                    label="اللون الثانوي (Secondary Color)"
                    value={state.surface.secondaryColor}
                    isModified={
                      state.surface.secondaryColor !==
                      CAROUSEL_DEFAULT_STATE.surface.secondaryColor
                    }
                    onChange={(nextColor) =>
                      onUpdateSurface({ secondaryColor: nextColor })
                    }
                    onReset={() =>
                      onUpdateSurface({
                        secondaryColor: CAROUSEL_DEFAULT_STATE.surface.secondaryColor,
                      })
                    }
                  />
                </div>
              )}
            </ControlSection>

            {onUpdateSurface && (
              <ControlEffectsSection
                glowColor={state.surface.glowColor}
                glowIntensity={state.surface.glowIntensity}
                defaultGlowColor={CAROUSEL_DEFAULT_STATE.surface.glowColor}
                defaultGlowIntensity={CAROUSEL_DEFAULT_STATE.surface.glowIntensity}
                onUpdateGlow={(patch) => onUpdateSurface(patch)}
                onResetGlow={() =>
                  onUpdateSurface({
                    glowColor: CAROUSEL_DEFAULT_STATE.surface.glowColor,
                    glowIntensity: CAROUSEL_DEFAULT_STATE.surface.glowIntensity,
                  })
                }
                testId="carousel-effects-section"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};
