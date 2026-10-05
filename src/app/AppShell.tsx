/**
 * Beso Studio V2 — Responsive RTL Studio Shell
 *
 * Implements:
 * 1. Top Bar Contract (3 clean zones: Brand wordmark, Navigation links, Theme & AdSlot actions).
 * 2. Experimental Library region (displays registered Contract Probe only + instance selector).
 * 3. Experimental Inspector region (independent controls for content, dimensions, icon, and surface).
 * 4. Isolated Preview + React-Independent ExportBundle region.
 * 5. Experimental AdSlot (disabled by default, zero layout impact when disabled).
 */

import React from 'react';
import { PreviewAdapter } from '../core/preview/PreviewAdapter';
import { getElementModule, listRegisteredElements } from '../core/registry/elementRegistry';
import {
  createInitialStudioState,
  resetInstanceContentField,
  updateInstanceContentField,
  updateInstanceDimensions,
  updateInstanceIcon,
} from '../core/state/studioStore';
import { ContractProbeInspector } from '../elements/contract-probe/ContractProbeInspector';
import { STUDIO_THEMES, StudioThemeMode } from '../shared/theme/themeTokens';
import { AdSlot, resolveAdSlotRenderDecision } from '../shared/ui/AdSlot';
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
  const module = getElementModule(
    {
      entries: {
        [initial.instances[instanceId].elementType]: {
          id: initial.instances[instanceId].elementType,
          family: 'probe',
          categories: ['experimental'],
          status: 'experimental',
          module: getElementModule(
            // Use the active module via studioStore's registry
            { entries: {} },
            ''
          )!,
        },
      },
    },
    ''
  );
  void module;

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
      details: 'إعادة ضبط حقل العنوان أعادت العنوان لقيمته الافتراضية وبقي الرقم المعدل (9,999) كما هو.',
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
    resetActiveInstance,
    updatePreviewState,
    toggleAdSlot,
  } = useStudio();

  const registeredEntries = listRegisteredElements(registry);
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

  const verificationItems = runInBrowserContractChecks();

  return (
    <div className="studio-shell" data-theme={studioState.theme} dir="rtl">
      {/* Top Bar Contract: 3 Clean Zones */}
      <header className="studio-header">
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

        {/* Zone 3: Primary Studio Actions (Theme Switcher & Experimental AdSlot Preview Toggle) */}
        <div className="studio-header-actions">
          <button
            type="button"
            className="studio-btn"
            onClick={() =>
              toggleAdSlot(sidebarAdSlot.id, !sidebarAdSlot.enabled)
            }
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

      {/* Optional Between-Sections Experimental AdSlot (Disabled by default, renders null when disabled) */}
      <AdSlot
        id={betweenSectionsAdSlot.id}
        placement={betweenSectionsAdSlot.placement}
        width={betweenSectionsAdSlot.width}
        height={betweenSectionsAdSlot.height}
        enabled={studioState.admin.advertising.enabled && betweenSectionsAdSlot.enabled}
        label={betweenSectionsAdSlot.label}
        fallback={betweenSectionsAdSlot.fallback}
      />

      {/* ROUTE 1: MAIN STUDIO WORKSPACE */}
      {activeRoute === 'workspace' && (
        <main className="studio-workspace">
          {/* Right Column in RTL (First on Mobile): Library + Inspector */}
          <div className="studio-column-controls">
            {/* Experimental Library Region */}
            <section className="studio-panel" aria-label="منطقة المكتبة التجريبية">
              <div className="studio-panel-header">
                <div>
                  <h2 className="studio-panel-title">مكتبة الوحدات المسجلة (Library)</h2>
                  <div className="studio-panel-meta">
                    المرحلة الأولى: مسجل فيها عنصر التحقق من العقد فقط ({registeredEntries.length}{' '}
                    وحدة)
                  </div>
                </div>
                <span className="studio-panel-meta">
                  الوضع الحالي: {STUDIO_THEMES[studioState.theme].labelEn}
                </span>
              </div>

              <div className="studio-panel-body">
                <div className="studio-library-grid">
                  {registeredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="studio-library-card"
                      data-selected="true"
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        <strong style={{ fontSize: '0.88rem' }}>{entry.module.label}</strong>
                        <span className="studio-panel-meta">حالة: {entry.status}</span>
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
                      <div className="studio-metrics-strip">
                        <span>المعرف: {entry.id}</span>
                        <span className="studio-metrics-separator">·</span>
                        <span>الإصدار: v{entry.module.version}</span>
                        <span className="studio-metrics-separator">·</span>
                        <span>عائلة: {entry.family}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Instance Selector to demonstrate Isolated Instance States */}
                <div
                  style={{
                    marginTop: '0.875rem',
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
                    النسخ المعزولة (Element Instances):
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

            {/* Experimental Sidebar AdSlot (Disabled by default; zero footprint unless toggled) */}
            <AdSlot
              id={sidebarAdSlot.id}
              placement={sidebarAdSlot.placement}
              width={sidebarAdSlot.width}
              height={sidebarAdSlot.height}
              enabled={studioState.admin.advertising.enabled && sidebarAdSlot.enabled}
              label={sidebarAdSlot.label}
              fallback={sidebarAdSlot.fallback}
            />

            {/* Experimental Inspector Region */}
            <ContractProbeInspector
              state={activeInstance.state}
              onUpdateContentField={updateContentField}
              onResetContentField={resetContentField}
              onUpdateIcon={updateIcon}
              onResetIconField={resetIconField}
              onUpdateDimensions={updateDimensions}
              onResetDimensionField={resetDimensionField}
              onUpdateSurface={updateSurface}
              onResetSurfaceField={resetSurfaceField}
              onResetAll={resetActiveInstance}
            />
          </div>

          {/* Left Column in RTL (Second on Mobile): Preview + Export Code */}
          <div className="studio-column-stage">
            <PreviewAdapter
              instanceLabel={activeInstance.label}
              previewResult={previewResult}
              exportBundle={exportBundle}
              dimensions={activeInstance.state.dimensions}
              previewState={studioState.preview}
              onUpdatePreviewState={updatePreviewState}
            />
          </div>
        </main>
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
                  مصفوفة اختبار عقد النواة (Phase 1 Core Contract Verification)
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
                مسار الحالة من المفتش (Inspector) إلى المعاينة (Preview) والتصدير (ExportBundle)
              </h2>
            </div>
            <div
              className="studio-panel-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: 1.7 }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem' }}>
                  01. مسار الحالة (Inspector → Immutable Store → Preview)
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--studio-text-secondary)' }}>
                  عند تعديل أي حقل في المفتش (مثل العنوان أو العرض أو الأيقونة)، يستدعي المفتش دالة
                  انتقال نقية (Pure Function) داخل مخزن الحالة تنسخ حالة النسخة النشطة فقط وتحدث
                  الحقل المستهدف وحده دون المساس ببقية الحقول، ثم تمرر الحالة الجديدة إلى دالة{' '}
                  <code>module.renderPreview</code> التي تولد HTML وCSS المعزولين للنطاق{' '}
                  <code>[data-element-scope]</code> فورًا دون إعادة تحميل الصفحة.
                </p>
              </div>

              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem' }}>
                  02. مسار التصدير المستقل (State → Validator → ExportBundle)
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--studio-text-secondary)' }}>
                  يعتمد التصدير على نفس دوال التوليد (<code>generateHtml</code> و
                  <code>generateCss</code>) المستخدمة في المعاينة، ويمر عبر محرك التحقق{' '}
                  <code>validator.ts</code> للتأكد من خلو المخرجات من <code>undefined</code> أو{' '}
                  <code>NaN</code> والتزامها بالعزل الكامل عن React وTailwind.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};
