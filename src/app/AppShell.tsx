/**
 * Beso Studio V2 — Responsive RTL Studio Shell (Task 2: Organized Workspace)
 *
 * Implements:
 * 1. Top Bar Contract (3 clean zones: Brand wordmark, Navigation links, Theme & AdSlot actions).
 * 2. Organized Inspector with accessible Accordions, modified value counts, and 3-tier resets.
 * 3. Sticky PreviewStage separated from ExportPanel (only PreviewStage floats on desktop scroll).
 * 4. Fullscreen Preview Mode ('docked' | 'fullscreen') with Drawer for Library/Inspector/Export
 *    and Escape key exit without losing any element or accordion state.
 * 5. Vertical & Horizontal Resize Handles with Pointer Events, keyboard support, and live readouts.
 */

import React, { useEffect, useRef, useState } from 'react';
import { ExportPanel } from '../core/preview/ExportPanel';
import { PreviewAdapter } from '../core/preview/PreviewAdapter';
import { PreviewStage } from '../core/preview/PreviewStage';
import {
  countElementsByCategory,
  ElementOriginGroup,
  getElementModule,
  LIBRARY_CATEGORIES,
  LibraryCategoryFilterId,
  listRegisteredElements,
  queryRegistryElements,
  RegisteredElementEntry,
  resolveElementOriginGroup,
  resolveElementPrimaryCategory,
  resolveElementTags,
} from '../core/registry/elementRegistry';
import {
  createInitialStudioState,
  resetInstanceContentField,
  resizeStudioPreviewHeight,
  resizeStudioWorkspaceColumns,
  updateInstanceContentField,
  updateInstanceDimensions,
  updateInstanceIcon,
} from '../core/state/studioStore';
import { WORKSPACE_LAYOUT_BOUNDS } from '../core/state/workspaceLayoutStore';
import { AuthFormInspector } from '../elements/auth-form/AuthFormInspector';
import { AUTH_FORM_ELEMENT_ID } from '../elements/auth-form/authFormModule';
import { BrandIdentityInspector } from '../elements/brand-identity/BrandIdentityInspector';
import { BRAND_IDENTITY_ELEMENT_ID } from '../elements/brand-identity/brandIdentityModule';
import { ButtonInspector } from '../elements/button/ButtonInspector';
import { BUTTON_ELEMENT_ID } from '../elements/button/buttonModule';
import { CardInspector } from '../elements/card/CardInspector';
import { CARD_ELEMENT_ID } from '../elements/card/cardModule';
import { CarouselInspector } from '../elements/carousel/CarouselInspector';
import { CAROUSEL_ELEMENT_ID } from '../elements/carousel/carouselModule';
import { ContractProbeInspector } from '../elements/contract-probe/ContractProbeInspector';
import { HeroInspector } from '../elements/hero/HeroInspector';
import { HERO_ELEMENT_ID } from '../elements/hero/heroModule';
import { ImportedComponentInspector } from '../elements/imported-component/ImportedComponentInspector';
import { IMPORTED_COMPONENT_ID } from '../elements/imported-component/importedComponentModule';
import { SocialDockInspector } from '../elements/social-dock/SocialDockInspector';
import { SOCIAL_DOCK_ELEMENT_ID } from '../elements/social-dock/socialDockModule';
import { STUDIO_THEMES, StudioThemeMode } from '../shared/theme/themeTokens';
import { AdSlot, resolveAdSlotRenderDecision } from '../shared/ui/AdSlot';
import { WorkspaceResizeHandle } from '../shared/ui/WorkspaceResizeHandle';
import { useStudio } from './providers';
import { STUDIO_ROUTES } from './routes';

interface VerificationCheckItem {
  id: string;
  title: string;
  passed: boolean;
  details: string;
}

function runInBrowserContractChecks(): VerificationCheckItem[] {
  const initial = createInitialStudioState();
  const instanceId = initial.activeInstanceId;

  // 1. Text field independence
  const beforeDesc = initial.instances[instanceId].state.content.description.value;
  const beforeNum = initial.instances[instanceId].state.content.number.value;
  const beforePct = initial.instances[instanceId].state.content.percentage.value;
  const beforeAnalysis = initial.instances[instanceId].state.content.analysis.value;

  const afterTitleEdit = updateInstanceContentField(initial, instanceId, 'title', {
    value: 'عنوان معدل للاختبار الفوري',
  });
  const sAfterTitle = afterTitleEdit.instances[instanceId].state;
  const textIndependent =
    sAfterTitle.content.title.value === 'عنوان معدل للاختبار الفوري' &&
    sAfterTitle.content.description.value === beforeDesc &&
    sAfterTitle.content.number.value === beforeNum &&
    sAfterTitle.content.percentage.value === beforePct &&
    sAfterTitle.content.analysis.value === beforeAnalysis;

  // 2. Width & Height independence
  const origHeight = initial.instances[instanceId].state.dimensions.height;
  const afterWidthEdit = updateInstanceDimensions(initial, instanceId, { width: 640 });
  const widthIndependent =
    afterWidthEdit.instances[instanceId].state.dimensions.width === 640 &&
    afterWidthEdit.instances[instanceId].state.dimensions.height === origHeight;

  const origWidth = afterWidthEdit.instances[instanceId].state.dimensions.width;
  const afterHeightEdit = updateInstanceDimensions(afterWidthEdit, instanceId, { height: 510 });
  const heightIndependent =
    afterHeightEdit.instances[instanceId].state.dimensions.height === 510 &&
    afterHeightEdit.instances[instanceId].state.dimensions.width === origWidth;

  // 3. Icon independence from text & dimensions
  const afterIconEdit = updateInstanceIcon(afterHeightEdit, instanceId, {
    source: 'emoji',
    value: '★',
    rotate: 45,
    size: 40,
  });
  const iconIndependent =
    afterIconEdit.instances[instanceId].state.icon.value === '★' &&
    afterIconEdit.instances[instanceId].state.content.title.value ===
      initial.instances[instanceId].state.content.title.value &&
    afterIconEdit.instances[instanceId].state.dimensions.width === 640 &&
    afterIconEdit.instances[instanceId].state.dimensions.height === 510;

  // 4. AdSlot disabled by default
  const defaultSlot = initial.admin.advertising.slots[0];
  const adDecision = resolveAdSlotRenderDecision({
    id: defaultSlot.id,
    placement: defaultSlot.placement,
    enabled: initial.admin.advertising.enabled && defaultSlot.enabled,
    width: defaultSlot.width,
    height: defaultSlot.height,
  });

  // 5. Single field reset
  const editedTwo = updateInstanceContentField(afterTitleEdit, instanceId, 'number', {
    value: '9,999',
  });
  const resetOnlyTitle = resetInstanceContentField(
    editedTwo,
    { entries: {} },
    instanceId,
    'title'
  );
  const singleResetPassed =
    resetOnlyTitle.instances[instanceId].state.content.title.value ===
      initial.instances[instanceId].state.content.title.value &&
    resetOnlyTitle.instances[instanceId].state.content.number.value === '9,999';

  // 6. Workspace Layout vs Element Dimensions Independence
  const afterLayoutResize = resizeStudioPreviewHeight(
    resizeStudioWorkspaceColumns(afterHeightEdit, 620, 1400),
    560
  );
  const layoutIndependent =
    afterLayoutResize.workspaceLayout.controlsWidth === 620 &&
    afterLayoutResize.workspaceLayout.previewHeight === 560 &&
    afterLayoutResize.instances[instanceId].state.dimensions.width === 640 &&
    afterLayoutResize.instances[instanceId].state.dimensions.height === 510;

  return [
    {
      id: 'text-independence',
      title: 'استقلال الحقول النصية السبعة (Title, Description, Number, Percentage, Analysis)',
      passed: textIndependent,
      details:
        'تغيير العنوان لم يغير الوصف أو الرقم أو النسبة أو التحليل، وكل حقل محتفظ بقيمته وتنسيقه.',
    },
    {
      id: 'dimension-independence',
      title: 'استقلال العرض والارتفاع (Width & Height Independence)',
      passed: widthIndependent && heightIndependent,
      details: `عند تعديل العرض إلى 640px بقي الارتفاع ${origHeight}px، وعند تعديل الارتفاع إلى 510px بقي العرض 640px.`,
    },
    {
      id: 'workspace-vs-element-independence',
      title: 'استقلال مقابض تحجيم مساحة العمل عن أبعاد العنصر (Workspace vs Element Dimensions)',
      passed: layoutIndependent,
      details:
        'تغيير عرض لوحة التحكم إلى 620px وارتفاع المعاينة إلى 560px لم يغير عرض العنصر (640px) ولا ارتفاعه (510px).',
    },
    {
      id: 'icon-independence',
      title: 'استقلال الأيقونة عن النصوص والأبعاد',
      passed: iconIndependent,
      details:
        'تغيير مصدر الأيقونة وحجمها ودورانها لم يغير أي قيمة نصية أو لونية أو بعدية أخرى.',
    },
    {
      id: 'single-field-reset',
      title: 'إعادة ضبط حقل منفرد تعيد ذلك الحقل فقط',
      passed: singleResetPassed,
      details:
        'إعادة ضبط حقل العنوان أعادت العنوان لقيمته الافتراضية وبقي الرقم المعدل (9,999) كما هو.',
    },
    {
      id: 'adslot-default-off',
      title: 'تعطيل AdSlot افتراضيًا وعدم تأثيره على التخطيط',
      passed: !adDecision.shouldRender && !initial.admin.advertising.enabled,
      details: 'المساحة الإعلانية معطلة افتراضيًا (shouldRender: false) ولا تحقن أي عنصر في DOM.',
    },
  ];
}

export const AppShell: React.FC = () => {
  const {
    registry,
    studioState,
    activeRoute,
    setActiveRoute,
    selectInstance,
    setTheme,
    updateContentField,
    resetContentField,
    updateIcon,
    resetIconField,
    updateDimensions,
    resetDimensionField,
    updateSurface,
    resetSurfaceField,
    resetAccordionGroup,
    resetCategorySection,
    resetActiveInstance,
    selectInspectorSection,
    toggleAccordionGroup,
    expandAllGroupsInSection,
    collapseAllGroupsInSection,
    setDrawerTab,
    resizeColumnsWidth,
    resizePreviewHeight,
    setPreviewMode,
    toggleControlsPanel,
    toggleExportPanel,
    resetWorkspaceLayout,
    updatePreviewState,
    toggleAdSlot,
    updateImportedSource,
    restoreImportedOriginalSource,
    clearImportedSource,
    updateImportedOverrides,
    updateImportedMappedOverrides,
    resetImportedOverrides,
    updateImportedMapping,
    resetImportedMapping,
    updateButtonData,
    updateButtonStateStyle,
    updateCarouselData,
    updateCarouselSlideField,
    updateCarouselSlideMeta,
    addCarouselSlide,
    removeCarouselSlide,
    updateHeroData,
    updateHeroAction,
    updateSocialDockData,
    updateSocialDockItem,
    addSocialDockItem,
    removeSocialDockItem,
    updateBrandIdentityData,
    updateAuthFormData,
    updateAuthFormField,
  } = useStudio();

  const headerRef = useRef<HTMLElement | null>(null);
  const workspaceContainerRef = useRef<HTMLElement | null>(null);
  const [headerHeightPx, setHeaderHeightPx] = useState<number>(64);
  const [selectedLibraryCategory, setSelectedLibraryCategory] =
    useState<LibraryCategoryFilterId>('all');
  const [librarySearchQuery, setLibrarySearchQuery] = useState<string>('');

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) {
      return;
    }

    const updateHeaderHeight = () => {
      const measured = Math.ceil(headerEl.getBoundingClientRect().height || headerEl.offsetHeight || 0);
      setHeaderHeightPx(measured);
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.style.setProperty('--studio-header-height', `${measured}px`);
      }
    };

    // Measure immediately on load and when theme changes
    updateHeaderHeight();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      observer.observe(headerEl);
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [studioState.theme]);

  const registeredEntries = listRegisteredElements(registry);
  const categoryCounts = countElementsByCategory(registry);
  const filteredEntries = queryRegistryElements(
    registry,
    selectedLibraryCategory,
    librarySearchQuery
  );

  const activeInstance = studioState.instances[studioState.activeInstanceId];
  const activeModule = getElementModule(registry, activeInstance.elementType);

  if (!activeModule) {
    return <div className="studio-shell">خطأ: لم يتم العثور على وحدة العنصر في السجل.</div>;
  }

  const renderInput = {
    instanceId: activeInstance.id,
    scopeId: activeInstance.scopeId,
    state: activeInstance.state,
  };

  const previewResult = activeModule.renderPreview(renderInput);
  const exportBundle = activeModule.generateCode(renderInput);

  const sidebarAdSlot = studioState.admin.advertising.slots[0];
  const betweenSectionsAdSlot = studioState.admin.advertising.slots[1];
  const { workspaceLayout, inspectorAccordions } = studioState;
  const isFullscreen = workspaceLayout.previewMode === 'fullscreen';
  const activeDrawer = inspectorAccordions.fullscreenDrawerTab;

  const verificationItems = runInBrowserContractChecks();

  const handleSelectLibraryElement = (elementId: string) => {
    const matchingInstance = Object.values(studioState.instances).find(
      (inst) => inst.elementType === elementId
    );
    if (matchingInstance) {
      selectInstance(matchingInstance.id);
    }
  };

  const renderLibraryCardItem = (entry: RegisteredElementEntry) => {
    const isSelected = activeInstance.elementType === entry.id;
    const primaryCatId = resolveElementPrimaryCategory(entry);
    const catMeta = LIBRARY_CATEGORIES.find((c) => c.id === primaryCatId);
    const originGroup = resolveElementOriginGroup(entry);
    const tags = resolveElementTags(entry);

    const originBadgeLabel =
      originGroup === 'imported'
        ? 'عنصر مستورد (Imported)'
        : originGroup === 'template'
          ? 'قالب (Template)'
          : 'عنصر أصيل (Native)';

    const iconGlyphMap: Record<string, string> = {
      button: '◉',
      card: '▣',
      carousel: '❖',
      hero: '★',
      'auth-form': '🔒',
      'brand-identity': '◈',
      'social-dock': '✦',
      'imported-component': '⟨/⟩',
      'contract-probe': '⚙',
    };

    return (
      <button
        key={entry.id}
        type="button"
        className="studio-library-card"
        data-selected={isSelected}
        data-origin={originGroup}
        data-category={primaryCatId}
        data-testid={`library-card-${entry.id}`}
        onClick={() => handleSelectLibraryElement(entry.id)}
      >
        <div className="studio-library-card__header">
          <div className="studio-library-card__title-group">
            <span className="studio-library-card__icon-chip" aria-hidden="true">
              {iconGlyphMap[entry.id] || '◈'}
            </span>
            <strong style={{ fontSize: '0.88rem' }}>{entry.module.label}</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span className="studio-library-card__origin-badge">
              {originBadgeLabel}
            </span>
            <span className="studio-category-badge">{entry.status}</span>
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.78rem',
            color: 'var(--studio-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {entry.module.description}
        </p>
        <div className="studio-metrics-strip" style={{ flexWrap: 'wrap' }}>
          <span>التصنيف: {catMeta ? catMeta.labelAr : primaryCatId}</span>
          <span className="studio-metrics-separator">·</span>
          <span>المعرف: {entry.id}</span>
          <span className="studio-metrics-separator">·</span>
          <span>عائلة: {entry.family}</span>
        </div>
        {tags.length > 0 && (
          <div className="studio-library-card__tags">
            {tags.slice(0, 6).map((tag) => (
              <span key={tag} className="studio-library-card__tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </button>
    );
  };

  const renderOriginSection = (
    origin: ElementOriginGroup,
    sectionTitle: string,
    sectionSubtitle: string,
    items: RegisteredElementEntry[]
  ) => {
    if (items.length === 0) {
      return null;
    }
    return (
      <div
        key={origin}
        className="studio-origin-section"
        data-testid={`library-origin-group-${origin}`}
      >
        <div className="studio-origin-section__header">
          <div className="studio-origin-section__title-wrap">
            <strong className="studio-origin-section__title">{sectionTitle}</strong>
            <span className="studio-category-badge">{items.length}</span>
          </div>
          <span className="studio-panel-meta">{sectionSubtitle}</span>
        </div>
        <div className="studio-library-grid">{items.map(renderLibraryCardItem)}</div>
      </div>
    );
  };

  const nativeFiltered = filteredEntries.filter(
    (e) => resolveElementOriginGroup(e) === 'native'
  );
  const importedFiltered = filteredEntries.filter(
    (e) => resolveElementOriginGroup(e) === 'imported'
  );
  const templateFiltered = filteredEntries.filter(
    (e) => resolveElementOriginGroup(e) === 'template'
  );

  const renderLibraryPanel = () => (
    <section className="studio-panel" aria-label="منطقة المكتبة">
      <div className="studio-panel-header">
        <div>
          <h2 className="studio-panel-title">مكتبة العناصر المنظمة (Element Library)</h2>
          <div className="studio-panel-meta">
            إجمالي العناصر المسجلة ديناميكيًا من السجل: {registeredEntries.length} عنصرًا ضمن{' '}
            {LIBRARY_CATEGORIES.length} تصنيفات قياسية
          </div>
        </div>
        <span className="studio-panel-meta">
          الوضع الحالي: {STUDIO_THEMES[studioState.theme].labelEn}
        </span>
      </div>

      <div
        className="studio-panel-body"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        {/* Fast Search by Element Name, ID, or Tag */}
        <div className="studio-library-search-bar">
          <span className="studio-library-search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            className="studio-library-search-input"
            aria-label="بحث سريع في مكتبة العناصر بالاسم أو الوسم"
            data-testid="library-search-input"
            placeholder="ابحث بالاسم أو المعرف أو الوسم (مثال: button, carousel, hero, auth, glass, neon)..."
            value={librarySearchQuery}
            onChange={(e) => setLibrarySearchQuery(e.target.value)}
          />
          {librarySearchQuery.trim() !== '' && (
            <button
              type="button"
              className="studio-btn studio-btn-reset"
              onClick={() => setLibrarySearchQuery('')}
            >
              مسح البحث ✕
            </button>
          )}
        </div>

        {/* Category Filter Tabs (All + 9 Mandatory Categories with independent badges) */}
        <div
          role="tablist"
          aria-label="تصنيفات مكتبة العناصر"
          data-testid="library-category-tabs"
          className="studio-category-bar"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedLibraryCategory === 'all'}
            className="studio-category-tab"
            data-active={selectedLibraryCategory === 'all'}
            data-testid="library-category-tab-all"
            onClick={() => setSelectedLibraryCategory('all')}
          >
            <span>الكل</span>
            <span className="studio-category-badge">{categoryCounts.all}</span>
          </button>

          {LIBRARY_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;
            const isSelected = selectedLibraryCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className="studio-category-tab"
                data-active={isSelected}
                data-testid={`library-category-tab-${cat.id}`}
                title={cat.examplesText}
                onClick={() => setSelectedLibraryCategory(cat.id)}
              >
                <span>{cat.labelAr}</span>
                <span className="studio-category-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Filtered Results Separated clearly by Origin (Native vs Imported vs Templates) */}
        {filteredEntries.length === 0 ? (
          <div
            data-testid="library-empty-state"
            style={{
              padding: '1rem',
              borderRadius: 'var(--studio-radius-md)',
              border: '1px dashed var(--studio-border-subtle)',
              textAlign: 'center',
              color: 'var(--studio-text-secondary)',
              fontSize: '0.82rem',
            }}
          >
            لا توجد عناصر مطابقة في هذا التصنيف أو البحث حاليًا.
            {selectedLibraryCategory !== 'all' && (
              <div style={{ marginTop: '0.45rem' }}>
                <button
                  type="button"
                  className="studio-btn"
                  onClick={() => {
                    setSelectedLibraryCategory('all');
                    setLibrarySearchQuery('');
                  }}
                >
                  عرض جميع العناصر المسجلة ({categoryCounts.all})
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {renderOriginSection(
              'native',
              'العناصر الأصلية في الاستوديو (Studio Native Elements)',
              'وحدات إنتاجية مستقلة قابلة للتخصيص الكامل',
              nativeFiltered
            )}
            {renderOriginSection(
              'imported',
              'العناصر المستوردة المعزولة (Imported HTML/CSS Components)',
              'عزل داخل Sandbox Iframe مع طبقة Overrides مستقلة',
              importedFiltered
            )}
            {renderOriginSection(
              'template',
              'القوالب الجاهزة (Templates)',
              'تركيبات متعددة العناصر قابلة للتعديل',
              templateFiltered
            )}
          </div>
        )}

        {/* Instance Selector */}
        <div
          style={{
            marginTop: '0.4rem',
            paddingTop: '0.875rem',
            borderTop: '1px solid var(--studio-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            النسخ المعزولة النشطة (Element Instances):
          </span>
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {Object.values(studioState.instances).map((inst) => (
              <button
                key={inst.id}
                type="button"
                className="studio-tab-btn"
                data-active={studioState.activeInstanceId === inst.id}
                onClick={() => selectInstance(inst.id)}
              >
                {inst.label} (v{inst.stateVersion})
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const renderInspectorPanel = () => {
    const sharedProps = {
      state: activeInstance.state,
      defaultState: activeModule.defaultState,
      accordionState: inspectorAccordions,
      onSelectSection: selectInspectorSection,
      onToggleAccordionGroup: toggleAccordionGroup,
      onExpandAllInSection: expandAllGroupsInSection,
      onCollapseAllInSection: collapseAllGroupsInSection,
      onUpdateContentField: updateContentField,
      onResetContentField: resetContentField,
      onUpdateIcon: updateIcon,
      onResetIconField: resetIconField,
      onUpdateDimensions: updateDimensions,
      onResetDimensionField: resetDimensionField,
      onUpdateSurface: updateSurface,
      onResetSurfaceField: resetSurfaceField,
      onResetAccordionGroup: resetAccordionGroup,
      onResetCategorySection: resetCategorySection,
      onResetAll: resetActiveInstance,
    };

    if (activeInstance.elementType === BUTTON_ELEMENT_ID) {
      return (
        <ButtonInspector
          state={activeInstance.state}
          onUpdateContentField={updateContentField}
          onUpdateIcon={updateIcon}
          onUpdateDimensions={updateDimensions}
          onUpdateButtonData={updateButtonData}
          onUpdateButtonStateStyle={updateButtonStateStyle}
          onResetAll={resetActiveInstance}
        />
      );
    }

    if (activeInstance.elementType === CARD_ELEMENT_ID) {
      return <CardInspector {...sharedProps} />;
    }

    if (activeInstance.elementType === CAROUSEL_ELEMENT_ID) {
      return (
        <CarouselInspector
          state={activeInstance.state}
          onUpdateDimensions={updateDimensions}
          onUpdateSurface={updateSurface}
          onUpdateCarouselData={updateCarouselData}
          onUpdateCarouselSlideField={updateCarouselSlideField}
          onUpdateCarouselSlideMeta={updateCarouselSlideMeta}
          onAddCarouselSlide={addCarouselSlide}
          onRemoveCarouselSlide={removeCarouselSlide}
          onResetAll={resetActiveInstance}
        />
      );
    }

    if (activeInstance.elementType === HERO_ELEMENT_ID) {
      return (
        <HeroInspector
          state={activeInstance.state}
          onUpdateContentField={updateContentField}
          onUpdateIcon={updateIcon}
          onUpdateDimensions={updateDimensions}
          onUpdateHeroData={updateHeroData}
          onUpdateHeroAction={updateHeroAction}
          onResetAll={resetActiveInstance}
        />
      );
    }

    if (activeInstance.elementType === SOCIAL_DOCK_ELEMENT_ID) {
      return (
        <SocialDockInspector
          state={activeInstance.state}
          onUpdateContentField={updateContentField}
          onUpdateDimensions={updateDimensions}
          onUpdateSocialDockData={updateSocialDockData}
          onUpdateSocialDockItem={updateSocialDockItem}
          onAddSocialDockItem={addSocialDockItem}
          onRemoveSocialDockItem={removeSocialDockItem}
          onResetAll={resetActiveInstance}
        />
      );
    }

    if (activeInstance.elementType === BRAND_IDENTITY_ELEMENT_ID) {
      return (
        <BrandIdentityInspector
          state={activeInstance.state}
          onUpdateContentField={updateContentField}
          onUpdateDimensions={updateDimensions}
          onUpdateSurface={updateSurface}
          onUpdateBrandIdentityData={updateBrandIdentityData}
          onResetAll={resetActiveInstance}
        />
      );
    }

    if (activeInstance.elementType === AUTH_FORM_ELEMENT_ID) {
      return (
        <AuthFormInspector
          state={activeInstance.state}
          onUpdateContentField={updateContentField}
          onUpdateDimensions={updateDimensions}
          onUpdateAuthFormData={updateAuthFormData}
          onUpdateAuthFormField={updateAuthFormField}
          onResetAll={resetActiveInstance}
        />
      );
    }

    if (activeInstance.elementType === IMPORTED_COMPONENT_ID) {
      return (
        <ImportedComponentInspector
          instanceId={activeInstance.id}
          scopeId={activeInstance.scopeId}
          state={activeInstance.state}
          exportBundle={exportBundle}
          onUpdateSource={updateImportedSource}
          onRestoreOriginalSource={restoreImportedOriginalSource}
          onClearSource={clearImportedSource}
          onUpdateOverrides={updateImportedOverrides}
          onUpdateMappedOverrides={updateImportedMappedOverrides}
          onResetOverrides={resetImportedOverrides}
          onUpdateMapping={updateImportedMapping}
          onResetMapping={resetImportedMapping}
        />
      );
    }

    return <ContractProbeInspector {...sharedProps} />;
  };

  return (
    <div
      className="studio-shell"
      data-theme={studioState.theme}
      dir="rtl"
      style={
        {
          '--studio-header-height': `${headerHeightPx}px`,
        } as React.CSSProperties
      }
    >
      {/* Top Bar Contract: 3 Clean Zones */}
      <header ref={headerRef} className="studio-header">
        {/* Zone 1: Single text wordmark */}
        <a
          href="#workspace"
          className="studio-brand"
          onClick={(e) => {
            e.preventDefault();
            setActiveRoute('workspace');
          }}
        >
          Beso Studio V2
        </a>

        {/* Zone 2: Clean navigation links */}
        <nav className="studio-nav" aria-label="التنقل الرئيسي للاستوديو">
          {STUDIO_ROUTES.map((route) => (
            <button
              key={route.id}
              type="button"
              className="studio-nav-link"
              data-active={activeRoute === route.id}
              onClick={() => setActiveRoute(route.id)}
            >
              {route.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Studio Actions */}
        <div className="studio-header-actions">
          <button
            type="button"
            className="studio-btn"
            onClick={() => toggleAdSlot(sidebarAdSlot.id, !sidebarAdSlot.enabled)}
            title="المساحات الإعلانية معطلة افتراضيًا؛ يمكنك معاينة الـ Placeholder التجريبي هنا"
          >
            {sidebarAdSlot.enabled
              ? 'إخفاء AdSlot التجريبي'
              : 'معاينة AdSlot (معطل افتراضيًا)'}
          </button>

          <button
            type="button"
            className="studio-btn studio-btn-primary"
            data-testid="theme-toggle-button"
            onClick={() => {
              const nextTheme: StudioThemeMode =
                studioState.theme === 'emerald-luxury' ? 'ivory-pearl' : 'emerald-luxury';
              setTheme(nextTheme);
            }}
          >
            {studioState.theme === 'emerald-luxury'
              ? 'الوضع: Emerald Luxury (تبديل إلى Ivory Pearl)'
              : 'الوضع: Ivory Pearl (تبديل إلى Emerald Luxury)'}
          </button>
        </div>
      </header>

      {/* Optional Between-Sections Experimental AdSlot (Disabled by default) */}
      <AdSlot
        id={betweenSectionsAdSlot.id}
        placement={betweenSectionsAdSlot.placement}
        width={betweenSectionsAdSlot.width}
        height={betweenSectionsAdSlot.height}
        enabled={studioState.admin.advertising.enabled && betweenSectionsAdSlot.enabled}
        label={betweenSectionsAdSlot.label}
        fallback={betweenSectionsAdSlot.fallback}
      />

      {/* ROUTE 1: MAIN STUDIO WORKSPACE (DOCKED MODE) */}
      {activeRoute === 'workspace' && (
        <main
          ref={workspaceContainerRef}
          className="studio-workspace"
          data-controls-collapsed={workspaceLayout.controlsCollapsed}
          style={
            {
              '--workspace-controls-width': `${workspaceLayout.controlsWidth}px`,
            } as React.CSSProperties
          }
        >
          {/* Right Column in RTL (First on Mobile): Library + Inspector */}
          {!workspaceLayout.controlsCollapsed && (
            <div className="studio-column-controls">
              {renderLibraryPanel()}

              {/* Experimental Sidebar AdSlot (Disabled by default) */}
              <AdSlot
                id={sidebarAdSlot.id}
                placement={sidebarAdSlot.placement}
                width={sidebarAdSlot.width}
                height={sidebarAdSlot.height}
                enabled={studioState.admin.advertising.enabled && sidebarAdSlot.enabled}
                label={sidebarAdSlot.label}
                fallback={sidebarAdSlot.fallback}
              />

              {renderInspectorPanel()}
            </div>
          )}

          {/* Vertical Resize Handle between Controls and Stage (Desktop only) */}
          {!workspaceLayout.controlsCollapsed && (
            <WorkspaceResizeHandle
              orientation="vertical"
              label="مقبض تغيير عرض لوحة التحكم والمعاينة"
              value={workspaceLayout.controlsWidth}
              min={WORKSPACE_LAYOUT_BOUNDS.minControlsWidth}
              max={WORKSPACE_LAYOUT_BOUNDS.maxControlsWidth}
              measurementText={`عرض التحكم: ${workspaceLayout.controlsWidth}px · عرض المعاينة: ${workspaceLayout.stageWidth}px (عرض العنصر ثابت: ${previewResult.dimensionsSummary.widthCss})`}
              onChange={(nextWidth) => {
                const containerW = workspaceContainerRef.current?.clientWidth;
                resizeColumnsWidth(nextWidth, containerW);
              }}
              onReset={resetWorkspaceLayout}
            />
          )}

          {/* Left Column in RTL: Full-height Sticky Track for PreviewStage + Horizontal Handle */}
          <div className="studio-column-stage" data-testid="studio-column-stage">
            <PreviewAdapter
              instanceLabel={activeInstance.label}
              previewResult={previewResult}
              exportBundle={exportBundle}
              dimensions={activeInstance.state.dimensions}
              previewState={studioState.preview}
              workspaceLayout={workspaceLayout}
              onUpdatePreviewState={updatePreviewState}
              onResizePreviewHeight={resizePreviewHeight}
              onEnterFullscreen={() => setPreviewMode('fullscreen')}
              onExitFullscreen={() => setPreviewMode('docked')}
              onResetWorkspaceLayout={resetWorkspaceLayout}
              onToggleControlsCollapsed={() => toggleControlsPanel()}
            />
          </div>

          {/* Separated Natural-Flow Row for ExportPanel so it never terminates PreviewStage sticky scope early */}
          <div className="studio-workspace-export-row" data-testid="studio-workspace-export-row">
            <ExportPanel
              previewResult={previewResult}
              exportBundle={exportBundle}
              previewState={studioState.preview}
              collapsed={workspaceLayout.exportCollapsed}
              onToggleCollapsed={() => toggleExportPanel()}
              onUpdatePreviewState={updatePreviewState}
            />
          </div>
        </main>
      )}

      {/* FULLSCREEN PREVIEW LAYER (Independent Fixed Overlay with Collapsible Drawer) */}
      {isFullscreen && (
        <div
          className="studio-fullscreen-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="وضع العرض الكامل للمعاينة"
        >
          {/* Compact Top Action Bar for Fullscreen Mode */}
          <div className="studio-fullscreen-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.95rem' }}>وضع العرض الكامل (Fullscreen)</strong>
              <span className="studio-panel-meta">
                اضغط Escape للخروج الفوري دون فقدان أي تعديلات
              </span>
            </div>

            {/* Drawer Toggle Bar (Minimized Library, Inspector, and Export panels) */}
            <div className="studio-fullscreen-drawer-triggers">
              <button
                type="button"
                className="studio-tab-btn"
                data-active={activeDrawer === 'inspector'}
                onClick={() =>
                  setDrawerTab(activeDrawer === 'inspector' ? 'none' : 'inspector')
                }
              >
                درج المفتش (Inspector)
              </button>
              <button
                type="button"
                className="studio-tab-btn"
                data-active={activeDrawer === 'library'}
                onClick={() => setDrawerTab(activeDrawer === 'library' ? 'none' : 'library')}
              >
                درج المكتبة (Library)
              </button>
              <button
                type="button"
                className="studio-tab-btn"
                data-active={activeDrawer === 'export'}
                onClick={() => setDrawerTab(activeDrawer === 'export' ? 'none' : 'export')}
              >
                درج التصدير (Export)
              </button>
              <button
                type="button"
                className="studio-btn studio-btn-primary"
                data-testid="fullscreen-topbar-exit-btn"
                onClick={() => setPreviewMode('docked')}
              >
                خروج من العرض الكامل (Esc)
              </button>
            </div>
          </div>

          <div className="studio-fullscreen-body">
            {/* Collapsible Drawer for Tools in Fullscreen */}
            {activeDrawer !== 'none' && (
              <aside
                className="studio-fullscreen-drawer"
                aria-label="درج الأدوات في وضع العرض الكامل"
              >
                <div className="studio-fullscreen-drawer-header">
                  <strong>
                    {activeDrawer === 'inspector'
                      ? 'درج المفتش المنظم'
                      : activeDrawer === 'library'
                        ? 'درج المكتبة والنسخ'
                        : 'درج لوحة التصدير'}
                  </strong>
                  <button
                    type="button"
                    className="studio-btn studio-btn-ghost"
                    onClick={() => setDrawerTab('none')}
                  >
                    إغلاق الدرج ✕
                  </button>
                </div>

                <div className="studio-fullscreen-drawer-content">
                  {activeDrawer === 'inspector' && renderInspectorPanel()}
                  {activeDrawer === 'library' && renderLibraryPanel()}
                  {activeDrawer === 'export' && (
                    <ExportPanel
                      previewResult={previewResult}
                      exportBundle={exportBundle}
                      previewState={studioState.preview}
                      onUpdatePreviewState={updatePreviewState}
                    />
                  )}
                </div>
              </aside>
            )}

            {/* Fullscreen Stage Canvas */}
            <div className="studio-fullscreen-stage-area">
              <PreviewStage
                instanceLabel={activeInstance.label}
                previewResult={previewResult}
                exportBundle={exportBundle}
                dimensions={activeInstance.state.dimensions}
                previewState={studioState.preview}
                workspaceLayout={workspaceLayout}
                onUpdatePreviewState={updatePreviewState}
                onExitFullscreen={() => setPreviewMode('docked')}
              />
            </div>
          </div>
        </div>
      )}

      {/* ROUTE 2: INTERACTIVE CONTRACT VERIFICATION MATRIX */}
      {activeRoute === 'contract-verification' && (
        <main
          style={{
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <section className="studio-panel">
            <div className="studio-panel-header">
              <div>
                <h2 className="studio-panel-title">
                  مصفوفة اختبار عقد النواة ومساحة العمل (Core & Workspace Verification)
                </h2>
                <div className="studio-panel-meta">
                  تعمل هذه الفحوص في المتصفح كما تعمل عبر أمر npm test في سطر الأوامر
                </div>
              </div>
            </div>
            <div className="studio-panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {verificationItems.map((check, idx) => (
                  <div
                    key={check.id}
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: 'var(--studio-radius-md)',
                      border: check.passed
                        ? '1px solid var(--studio-success)'
                        : '1px solid var(--studio-danger)',
                      backgroundColor: check.passed
                        ? 'var(--studio-success-soft)'
                        : 'var(--studio-danger-soft)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <strong>
                        0{idx + 1}. {check.title}
                      </strong>
                      <span className="studio-panel-meta">
                        {check.passed ? 'ناجح (PASSED)' : 'فاشل (FAILED)'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--studio-text)' }}>
                      {check.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ROUTE 3: ARCHITECTURE & DATA FLOW SUMMARY */}
      {activeRoute === 'architecture-overview' && (
        <main
          style={{
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <section className="studio-panel">
            <div className="studio-panel-header">
              <h2 className="studio-panel-title">
                تنظيم مساحة العمل وفصل WorkspaceLayoutState عن ElementState
              </h2>
            </div>
            <div
              className="studio-panel-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: 1.7 }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem' }}>
                  01. فصل حالة تخطيط مساحة العمل (WorkspaceLayoutState) عن حالة العنصر
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--studio-text-secondary)' }}>
                  تحتفظ <code>WorkspaceLayoutState</code> بأبعاد اللوحات (
                  <code>controlsWidth</code>، <code>stageWidth</code>، <code>previewHeight</code>)
                  ووضع المعاينة (<code>docked | fullscreen</code>) بمعزل تام عن{' '}
                  <code>ElementInstance.state.dimensions</code>. تغيير حجم لوحة التحكم أو ارتفاع
                  المعاينة لا يغير عرض أو ارتفاع العنصر إطلاقًا.
                </p>
              </div>

              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem' }}>
                  02. المعاينة الثابتة (Sticky PreviewStage) وفصل ExportPanel
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--studio-text-secondary)' }}>
                  تم فصل <code>PreviewStage</code> عن <code>ExportPanel</code> بحيث يبقى{' '}
                  <code>PreviewStage</code> وحده عائمًا (Sticky) أثناء تمرير الصفحة على سطح المكتب،
                  بينما تبقى لوحة التصدير أسفله قابلة للتمرير والطي.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};
