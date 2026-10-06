/**
 * Beso Studio V2 — Phase 1 & Task 2 Core & Workspace Contract Test Suite
 *
 * Covers:
 * 1. Element registration in Registry (Contract Probe only, immutable registry).
 * 2. Independence of all 7 text fields + single-field reset independence.
 * 3. Independence of Width and Height (changing width never alters height, changing height never alters width).
 * 4. Independence of Icon from text, colors, and dimensions.
 * 5. Default disabling of AdSlot and zero layout rendering when disabled.
 * 6. HTML and CSS generation without `undefined` or `NaN` and with isolated scope selector.
 * 7. Independence of WorkspaceLayoutState (controlsWidth, stageWidth, previewHeight) from Element dimensions.
 * 8. Inspector Accordion groups (default basic open, advanced collapsed, expand/collapse all, state preserved during edits).
 * 9. Modified values count & 3-tier reset (single field, accordion group, category section, entire element).
 * 10. Fullscreen Preview transition ('docked' <-> 'fullscreen') without losing element or accordion state.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { DEFAULT_ADMIN_CONFIG } from '../../admin/configSchema';
import {
  AUTH_FORM_ELEMENT_ID,
  authFormModule,
  authFormRegistration,
} from '../../elements/auth-form/authFormModule';
import {
  BRAND_IDENTITY_ELEMENT_ID,
  brandIdentityModule,
  brandIdentityRegistration,
} from '../../elements/brand-identity/brandIdentityModule';
import {
  BUTTON_ELEMENT_ID,
  buttonModule,
  buttonRegistration,
} from '../../elements/button/buttonModule';
import {
  CARD_DEFAULT_STATE,
  CARD_ELEMENT_ID,
  CARD_MATERIAL_OPTIONS,
  cardModule,
  cardRegistration,
} from '../../elements/card/cardModule';
import {
  CAROUSEL_ELEMENT_ID,
  carouselModule,
  carouselRegistration,
  createCarouselSlide,
} from '../../elements/carousel/carouselModule';
import {
  CONTRACT_PROBE_DEFAULT_STATE,
  CONTRACT_PROBE_ID,
  contractProbeModule,
  contractProbeRegistration,
} from '../../elements/contract-probe/contractProbeModule';
import {
  HERO_ELEMENT_ID,
  heroModule,
  heroRegistration,
} from '../../elements/hero/heroModule';
import {
  analyzeImportedComponentWarnings,
  DEFAULT_IMPORTED_SOURCE_CSS,
  DEFAULT_IMPORTED_SOURCE_HTML,
  IMPORTED_COMPONENT_ID,
  importedComponentModule,
  importedComponentRegistration,
} from '../../elements/imported-component/importedComponentModule';
import {
  SOCIAL_DOCK_ELEMENT_ID,
  socialDockModule,
  socialDockRegistration,
} from '../../elements/social-dock/socialDockModule';
import { resolveAdSlotRenderDecision } from '../../shared/ui/AdSlot';
import {
  countElementsByCategory,
  createEmptyRegistry,
  getElementModule,
  LIBRARY_CATEGORIES,
  listRegisteredElements,
  queryRegistryElements,
  registerElement,
  resolveElementOriginGroup,
  resolveElementPrimaryCategory,
} from '../registry/elementRegistry';
import {
  addInstanceCarouselSlide,
  addInstanceSocialDockItem,
  clearInstanceImportedSource,
  collapseAllInspectorGroupsInSection,
  createInitialStudioState,
  createPhaseOneRegistry,
  expandAllInspectorGroupsInSection,
  removeInstanceCarouselSlide,
  removeInstanceSocialDockItem,
  resetEntireInstanceState,
  resetInstanceAccordionGroup,
  resetInstanceCategorySection,
  resetInstanceContentField,
  resetInstanceDimensionField,
  resetInstanceImportedMapping,
  resetInstanceImportedOverrides,
  resetStudioWorkspaceLayout,
  resizeStudioPreviewHeight,
  resizeStudioWorkspaceColumns,
  restoreInstanceImportedOriginalSource,
  setFullscreenDrawerTab,
  setStudioPreviewMode,
  setStudioThemeMode,
  toggleInspectorAccordionGroup,
  updateInstanceAuthFormData,
  updateInstanceAuthFormField,
  updateInstanceBrandIdentityData,
  updateInstanceButtonData,
  updateInstanceButtonStateStyle,
  updateInstanceCarouselData,
  updateInstanceCarouselSlideField,
  updateInstanceCarouselSlideMeta,
  updateInstanceContentField,
  updateInstanceDimensions,
  updateInstanceHeroAction,
  updateInstanceHeroData,
  updateInstanceIcon,
  updateInstanceImportedMappedOverrides,
  updateInstanceImportedMapping,
  updateInstanceImportedOverrides,
  updateInstanceImportedSource,
  updateInstanceSocialDockData,
  updateInstanceSocialDockItem,
  updateInstanceSurface,
} from '../state/studioStore';
import {
  countAccordionGroupModifications,
  countSectionModifications,
  WORKSPACE_LAYOUT_BOUNDS,
} from '../state/workspaceLayoutStore';
import {
  ALL_SURFACE_MATERIAL_CARDS,
  normalizeHexForColorInput,
  resolveHumanColorName,
  validateUploadedImageFile,
} from '../../shared/ui/controls';

describe('Beso Studio V2 — Core & Workspace Contract Tests', () => {
  it('1. اختبار تسجيل العناصر (Element Registration Test — 9 Registered Modules)', () => {
    const registry = createPhaseOneRegistry();
    const allElements = listRegisteredElements(registry);
    const stableElements = listRegisteredElements(registry, 'stable');
    const experimentalElements = listRegisteredElements(registry, 'experimental');

    assert.equal(allElements.length, 9);
    assert.equal(stableElements.length, 8);
    assert.equal(
      stableElements.some((e) => e.id === BUTTON_ELEMENT_ID),
      true
    );
    assert.equal(
      stableElements.some((e) => e.id === CARD_ELEMENT_ID),
      true
    );
    assert.equal(
      stableElements.some((e) => e.id === CAROUSEL_ELEMENT_ID),
      true
    );
    assert.equal(
      stableElements.some((e) => e.id === HERO_ELEMENT_ID),
      true
    );
    assert.equal(
      stableElements.some((e) => e.id === AUTH_FORM_ELEMENT_ID),
      true
    );
    assert.equal(
      stableElements.some((e) => e.id === BRAND_IDENTITY_ELEMENT_ID),
      true
    );
    assert.equal(
      stableElements.some((e) => e.id === SOCIAL_DOCK_ELEMENT_ID),
      true
    );
    assert.equal(
      stableElements.some((e) => e.id === IMPORTED_COMPONENT_ID),
      true
    );
    assert.equal(experimentalElements.length, 1);
    assert.equal(experimentalElements[0].id, CONTRACT_PROBE_ID);

    const card = getElementModule(registry, CARD_ELEMENT_ID);
    assert.ok(card, 'Card module must be retrievable from registry');
    assert.equal(card.id, 'card');
    assert.equal(card.type, 'card');
    assert.equal(card.metadata.isProductionReady, true);

    const imported = getElementModule(registry, IMPORTED_COMPONENT_ID);
    assert.ok(imported, 'Imported Component module must be retrievable from registry');
    assert.equal(imported.id, 'imported-component');
    assert.equal(imported.family, 'imported');
    assert.equal(imported.capabilities.usesJavaScript, false);

    const probe = getElementModule(registry, CONTRACT_PROBE_ID);
    assert.ok(probe, 'Contract Probe module must be retrievable from registry');
    assert.equal(probe.id, 'contract-probe');
    assert.equal(probe.type, 'contract-probe');
    assert.equal(probe.version, 1);
    assert.equal(probe.metadata.isProductionReady, false);
    assert.equal(typeof probe.renderPreview, 'function');
    assert.equal(typeof probe.generateHtml, 'function');
    assert.equal(typeof probe.generateCss, 'function');
    assert.equal(typeof probe.validate, 'function');
  });

  it('2. اختبار استقلال الحقول النصية وإعادة الضبط المنفرد (Text Fields Independence Test)', () => {
    const registry = createPhaseOneRegistry();
    const state0 = createInitialStudioState(registry);
    const id = state0.activeInstanceId;

    const initialContent = state0.instances[id].state.content;

    const state1 = updateInstanceContentField(state0, id, 'title', {
      value: 'عنوان جديد مستقل تمامًا',
      color: '#ffcc00',
    });

    const updatedContent1 = state1.instances[id].state.content;
    assert.equal(updatedContent1.title.value, 'عنوان جديد مستقل تمامًا');
    assert.equal(updatedContent1.title.color, '#ffcc00');

    assert.deepEqual(updatedContent1.description, initialContent.description);
    assert.deepEqual(updatedContent1.number, initialContent.number);
    assert.deepEqual(updatedContent1.percentage, initialContent.percentage);
    assert.deepEqual(updatedContent1.analysis, initialContent.analysis);
    assert.deepEqual(updatedContent1.actionLabel, initialContent.actionLabel);
    assert.deepEqual(updatedContent1.badge, initialContent.badge);

    const state2 = updateInstanceContentField(state1, id, 'number', {
      value: '77,500',
    });
    assert.equal(state2.instances[id].state.content.number.value, '77,500');
    assert.deepEqual(state2.instances[id].state.content.percentage, initialContent.percentage);
    assert.deepEqual(state2.instances[id].state.content.analysis, initialContent.analysis);

    const state3 = resetInstanceContentField(state2, registry, id, 'title');
    assert.deepEqual(state3.instances[id].state.content.title, initialContent.title);
    assert.equal(state3.instances[id].state.content.number.value, '77,500');
  });

  it('3. اختبار استقلال العرض والارتفاع (Width & Height Independence Test)', () => {
    const registry = createPhaseOneRegistry();
    const state0 = createInitialStudioState(registry);
    const id = state0.activeInstanceId;

    const initialWidth = state0.instances[id].state.dimensions.width;
    const initialHeight = state0.instances[id].state.dimensions.height;
    assert.equal(state0.instances[id].state.dimensions.lockAspectRatio, false);

    const stateWidthChanged = updateInstanceDimensions(state0, id, { width: 680 });
    assert.equal(stateWidthChanged.instances[id].state.dimensions.width, 680);
    assert.equal(stateWidthChanged.instances[id].state.dimensions.height, initialHeight);

    const stateHeightChanged = updateInstanceDimensions(stateWidthChanged, id, { height: 520 });
    assert.equal(stateHeightChanged.instances[id].state.dimensions.width, 680);
    assert.equal(stateHeightChanged.instances[id].state.dimensions.height, 520);

    const stateWidthReset = resetInstanceDimensionField(
      stateHeightChanged,
      registry,
      id,
      'width'
    );
    assert.equal(stateWidthReset.instances[id].state.dimensions.width, initialWidth);
    assert.equal(stateWidthReset.instances[id].state.dimensions.height, 520);
  });

  it('4. اختبار استقلال الأيقونة عن النص والأبعاد (Icon Independence Test)', () => {
    const registry = createPhaseOneRegistry();
    const state0 = createInitialStudioState(registry);
    const id = state0.activeInstanceId;

    const beforeContent = state0.instances[id].state.content;
    const beforeDimensions = state0.instances[id].state.dimensions;

    const stateIconChanged = updateInstanceIcon(state0, id, {
      visible: true,
      source: 'emoji',
      value: '⚡',
      color: '#10b981',
      size: 44,
      rotate: 90,
      position: 'end',
    });

    const afterInstance = stateIconChanged.instances[id].state;
    assert.equal(afterInstance.icon.source, 'emoji');
    assert.equal(afterInstance.icon.value, '⚡');
    assert.equal(afterInstance.icon.size, 44);
    assert.equal(afterInstance.icon.rotate, 90);
    assert.equal(afterInstance.icon.position, 'end');

    assert.deepEqual(afterInstance.content, beforeContent);
    assert.deepEqual(afterInstance.dimensions, beforeDimensions);
  });

  it('5. اختبار تعطيل AdSlot افتراضيًا (AdSlot Disabled by Default Test)', () => {
    const state0 = createInitialStudioState();
    assert.equal(DEFAULT_ADMIN_CONFIG.advertising.enabled, false);
    assert.equal(state0.admin.advertising.enabled, false);

    for (const slot of state0.admin.advertising.slots) {
      assert.equal(slot.enabled, false);
      const decision = resolveAdSlotRenderDecision({
        id: slot.id,
        placement: slot.placement,
        width: slot.width,
        height: slot.height,
        enabled: state0.admin.advertising.enabled && slot.enabled,
      });
      assert.equal(decision.shouldRender, false);
      assert.equal(decision.hasTrackingOrProviderCode, false);
    }

    const omittedEnabledDecision = resolveAdSlotRenderDecision({
      id: 'test-slot',
      placement: 'sidebar',
    });
    assert.equal(omittedEnabledDecision.shouldRender, false);
  });

  it('6. اختبار توليد HTML وCSS بدون undefined أو NaN وبنطاق معزول (Clean HTML/CSS Export Test)', () => {
    const state0 = createInitialStudioState();
    const activeInstance = state0.instances[state0.activeInstanceId];

    const renderInput = {
      instanceId: activeInstance.id,
      scopeId: activeInstance.scopeId,
      state: activeInstance.state,
    };

    const html = contractProbeModule.generateHtml(renderInput);
    const css = contractProbeModule.generateCss(renderInput);
    const preview = contractProbeModule.renderPreview(renderInput);
    const bundle = contractProbeModule.generateCode(renderInput);

    assert.ok(html.length > 0);
    assert.ok(css.length > 0);
    assert.equal(preview.html, bundle.html);
    assert.equal(preview.css, bundle.css);

    assert.equal(/\bundefined\b/.test(bundle.html), false, 'HTML must not contain undefined');
    assert.equal(/\bNaN\b/.test(bundle.html), false, 'HTML must not contain NaN');
    assert.equal(/\bundefined\b/.test(bundle.css), false, 'CSS must not contain undefined');
    assert.equal(/\bNaN\b/.test(bundle.css), false, 'CSS must not contain NaN');

    assert.equal(bundle.css.includes(`[data-element-scope="${activeInstance.scopeId}"]`), true);
    assert.equal(bundle.validationErrors.length, 0);
  });

  it('7. اختبار استقلال مقابض تحجيم مساحة العمل عن أبعاد العنصر (Workspace Layout vs Element Dimensions Independence)', () => {
    const state0 = createInitialStudioState();
    const id = state0.activeInstanceId;

    const initialElementWidth = state0.instances[id].state.dimensions.width;
    const initialElementHeight = state0.instances[id].state.dimensions.height;

    // Resize workspace columns and preview height
    const state1 = resizeStudioWorkspaceColumns(state0, 640, 1440);
    const state2 = resizeStudioPreviewHeight(state1, 580);

    assert.equal(state2.workspaceLayout.controlsWidth, 640);
    assert.equal(state2.workspaceLayout.previewHeight, 580);

    // Element dimensions MUST remain completely unchanged
    assert.equal(state2.instances[id].state.dimensions.width, initialElementWidth);
    assert.equal(state2.instances[id].state.dimensions.height, initialElementHeight);

    // Now change Element dimensions and verify WorkspaceLayoutState remains untouched
    const state3 = updateInstanceDimensions(state2, id, { width: 710, height: 490 });
    assert.equal(state3.instances[id].state.dimensions.width, 710);
    assert.equal(state3.instances[id].state.dimensions.height, 490);
    assert.equal(state3.workspaceLayout.controlsWidth, 640);
    assert.equal(state3.workspaceLayout.previewHeight, 580);

    // Verify clamping to min/max bounds
    const clampedMin = resizeStudioWorkspaceColumns(state3, 50);
    assert.equal(clampedMin.workspaceLayout.controlsWidth, WORKSPACE_LAYOUT_BOUNDS.minControlsWidth);
    const clampedMax = resizeStudioPreviewHeight(clampedMin, 5000);
    assert.equal(clampedMax.workspaceLayout.previewHeight, WORKSPACE_LAYOUT_BOUNDS.maxPreviewHeight);

    // Reset workspace layout
    const layoutReset = resetStudioWorkspaceLayout(clampedMax);
    assert.equal(
      layoutReset.workspaceLayout.controlsWidth,
      WORKSPACE_LAYOUT_BOUNDS.defaultControlsWidth
    );
    assert.equal(
      layoutReset.workspaceLayout.previewHeight,
      WORKSPACE_LAYOUT_BOUNDS.defaultPreviewHeight
    );
    // Element dimensions still 710 x 490
    assert.equal(layoutReset.instances[id].state.dimensions.width, 710);
    assert.equal(layoutReset.instances[id].state.dimensions.height, 490);
  });

  it('8. اختبار مجموعات Accordion وحفظ حالتها أثناء تعديل العنصر (Accordion Groups & State Persistence)', () => {
    const state0 = createInitialStudioState();
    const id = state0.activeInstanceId;

    // Only primary basic groups are open by default; advanced groups are collapsed by default
    assert.equal(state0.inspectorAccordions.openGroupIds.includes('content-basic'), true);
    assert.equal(state0.inspectorAccordions.openGroupIds.includes('content-advanced'), false);
    assert.equal(state0.inspectorAccordions.openGroupIds.includes('dimensions-advanced'), false);

    // Open content-metrics group
    const state1 = toggleInspectorAccordionGroup(state0, 'content-metrics');
    assert.equal(state1.inspectorAccordions.openGroupIds.includes('content-metrics'), true);

    // Modify element content and verify openGroupIds is preserved
    const state2 = updateInstanceContentField(state1, id, 'title', { value: 'عنوان محدث' });
    assert.deepEqual(
      state2.inspectorAccordions.openGroupIds,
      state1.inspectorAccordions.openGroupIds
    );

    // Expand All in 'content' section
    const expandedAll = expandAllInspectorGroupsInSection(state2, 'content');
    assert.equal(expandedAll.inspectorAccordions.openGroupIds.includes('content-basic'), true);
    assert.equal(expandedAll.inspectorAccordions.openGroupIds.includes('content-metrics'), true);
    assert.equal(expandedAll.inspectorAccordions.openGroupIds.includes('content-advanced'), true);

    // Collapse All in 'content' section
    const collapsedAll = collapseAllInspectorGroupsInSection(expandedAll, 'content');
    assert.equal(collapsedAll.inspectorAccordions.openGroupIds.includes('content-basic'), false);
    assert.equal(collapsedAll.inspectorAccordions.openGroupIds.includes('content-metrics'), false);
    assert.equal(collapsedAll.inspectorAccordions.openGroupIds.includes('content-advanced'), false);
    // Other section basic groups remain open
    assert.equal(collapsedAll.inspectorAccordions.openGroupIds.includes('dimensions-basic'), true);
  });

  it('9. اختبار عداد القيم المعدلة وإعادة ضبط المجموعة والقسم والعنصر (Modified Counter & Multi-Level Reset)', () => {
    const registry = createPhaseOneRegistry();
    const state0 = createInitialStudioState(registry);
    const id = 'probe-instance-1';

    assert.equal(
      countSectionModifications(
        state0.instances[id].state,
        CONTRACT_PROBE_DEFAULT_STATE,
        'content'
      ),
      0
    );

    // Modify title (in content-basic) and number (in content-metrics) and width (in dimensions-basic)
    let st = updateInstanceContentField(state0, id, 'title', {
      value: 'عنوان معدل',
      color: '#112233',
    });
    st = updateInstanceContentField(st, id, 'number', { value: '8,888' });
    st = updateInstanceDimensions(st, id, { width: 555 });

    assert.equal(
      countAccordionGroupModifications(
        st.instances[id].state,
        CONTRACT_PROBE_DEFAULT_STATE,
        'content-basic'
      ),
      2
    );
    assert.equal(
      countAccordionGroupModifications(
        st.instances[id].state,
        CONTRACT_PROBE_DEFAULT_STATE,
        'content-metrics'
      ),
      1
    );
    assert.equal(
      countSectionModifications(st.instances[id].state, CONTRACT_PROBE_DEFAULT_STATE, 'content'),
      3
    );

    // Reset ONLY 'content-basic' group -> 'content-metrics' (number) and 'dimensions' (width) remain modified
    const afterGroupReset = resetInstanceAccordionGroup(st, registry, id, 'content-basic');
    assert.equal(
      countAccordionGroupModifications(
        afterGroupReset.instances[id].state,
        CONTRACT_PROBE_DEFAULT_STATE,
        'content-basic'
      ),
      0
    );
    assert.equal(afterGroupReset.instances[id].state.content.number.value, '8,888');
    assert.equal(afterGroupReset.instances[id].state.dimensions.width, 555);

    // Reset entire 'content' section -> width (555) still preserved
    const afterSectionReset = resetInstanceCategorySection(
      afterGroupReset,
      registry,
      id,
      'content'
    );
    assert.equal(
      countSectionModifications(
        afterSectionReset.instances[id].state,
        CONTRACT_PROBE_DEFAULT_STATE,
        'content'
      ),
      0
    );
    assert.equal(afterSectionReset.instances[id].state.dimensions.width, 555);

    // Reset entire instance -> all fields return to default
    const afterFullReset = resetEntireInstanceState(afterSectionReset, registry, id);
    assert.equal(afterFullReset.instances[id].state.dimensions.width, 460);
  });

  it('10. اختبار وضع العرض الكامل (Fullscreen Preview Mode) دون فقدان الحالة', () => {
    const state0 = createInitialStudioState();
    const id = state0.activeInstanceId;

    const edited = updateInstanceContentField(state0, id, 'analysis', {
      value: 'تحليل مخصص قبل الدخول للعرض الكامل',
    });
    const withOpenAdvanced = toggleInspectorAccordionGroup(edited, 'content-advanced');

    // Enter fullscreen
    const inFullscreen = setStudioPreviewMode(withOpenAdvanced, 'fullscreen');
    assert.equal(inFullscreen.workspaceLayout.previewMode, 'fullscreen');

    // Open inspector drawer inside fullscreen
    const withDrawer = setFullscreenDrawerTab(inFullscreen, 'inspector');
    assert.equal(withDrawer.inspectorAccordions.fullscreenDrawerTab, 'inspector');

    // Exit fullscreen back to docked
    const backToDocked = setStudioPreviewMode(withDrawer, 'docked');
    assert.equal(backToDocked.workspaceLayout.previewMode, 'docked');
    assert.equal(backToDocked.inspectorAccordions.fullscreenDrawerTab, 'none');

    // Verify element state and accordion openGroupIds were not lost
    assert.equal(
      backToDocked.instances[id].state.content.analysis.value,
      'تحليل مخصص قبل الدخول للعرض الكامل'
    );
    assert.equal(
      backToDocked.inspectorAccordions.openGroupIds.includes('content-advanced'),
      true
    );
  });

  it('11. اختبار سلسلة الحاويات ونطاق Sticky Preview الكامل (Sticky Preview Parent Chain & Full Track Test)', () => {
    const cssPath = path.resolve(process.cwd(), 'src/styles/studio.css');
    const previewAdapterPath = path.resolve(
      process.cwd(),
      'src/core/preview/PreviewAdapter.tsx'
    );
    const appShellPath = path.resolve(process.cwd(), 'src/app/AppShell.tsx');

    const studioCss = fs.readFileSync(cssPath, 'utf-8');
    const previewAdapterSource = fs.readFileSync(previewAdapterPath, 'utf-8');
    const appShellSource = fs.readFileSync(appShellPath, 'utf-8');

    // 1. html, body and .studio-shell must use overflow-x: clip (not overflow-x: hidden which breaks sticky)
    assert.equal(
      studioCss.includes('overflow-x: clip;'),
      true,
      'studio.css must use overflow-x: clip to prevent horizontal scroll without breaking position: sticky'
    );

    // 2. .studio-column-stage and .studio-stage-stack must stretch to 100% height with overflow: visible
    assert.match(
      studioCss,
      /\.studio-column-stage\s*\{[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*100%;[\s\S]*?overflow:\s*visible;[\s\S]*?\}/
    );
    assert.match(
      studioCss,
      /\.studio-stage-stack\s*\{[\s\S]*?flex:\s*1\s+1\s+auto;[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*100%;[\s\S]*?overflow:\s*visible;[\s\S]*?\}/
    );

    // 3. ExportPanel must NOT be inside PreviewAdapter / .studio-stage-stack so it never terminates sticky scope early
    assert.equal(
      previewAdapterSource.includes('<ExportPanel'),
      false,
      'ExportPanel must be outside PreviewAdapter/.studio-stage-stack so sticky scope extends to the full workspace row height'
    );
    assert.equal(
      appShellSource.includes('studio-workspace-export-row'),
      true,
      'AppShell must render ExportPanel in its own natural-flow row (.studio-workspace-export-row)'
    );

    // 4. Desktop uses position: sticky with dynamic calc(var(--studio-header-height, 0px) + 0.5rem) (no hardcoded top: 4.5rem)
    assert.equal(
      studioCss.includes('top: 4.5rem'),
      false,
      'studio.css must not use a hardcoded top: 4.5rem for .studio-preview-sticky-unit'
    );
    assert.equal(
      studioCss.includes('top: calc(var(--studio-header-height, 0px) + 0.5rem);'),
      true,
      'studio.css must position .studio-preview-sticky-unit dynamically below --studio-header-height'
    );
    assert.equal(
      appShellSource.includes('ResizeObserver') &&
        appShellSource.includes('--studio-header-height') &&
        appShellSource.includes('ref={headerRef}'),
      true,
      'AppShell must measure .studio-header via ResizeObserver and update --studio-header-height'
    );
    assert.match(
      studioCss,
      /@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*?\.studio-preview-sticky-unit\s*\{[\s\S]*?position:\s*sticky;/
    );
    assert.match(
      studioCss,
      /@media\s*\(max-width:\s*1023px\)\s*\{[\s\S]*?\.studio-preview-sticky-unit\s*\{[\s\S]*?position:\s*static;/
    );
  });

  it('12. اختبار عنصر Card الإنتاجي: استقلال جميع الحقول النصية السبعة (Card Content Fields Independence)', () => {
    const state0 = createInitialStudioState();
    const cardId = 'card-instance-1';
    const initialContent = state0.instances[cardId].state.content;

    const afterTitle = updateInstanceContentField(state0, cardId, 'title', {
      value: 'بطاقة استثمارية مخصصة',
      color: '#ffd700',
    });
    assert.equal(afterTitle.instances[cardId].state.content.title.value, 'بطاقة استثمارية مخصصة');
    assert.deepEqual(
      afterTitle.instances[cardId].state.content.description,
      initialContent.description
    );
    assert.deepEqual(afterTitle.instances[cardId].state.content.number, initialContent.number);
    assert.deepEqual(
      afterTitle.instances[cardId].state.content.percentage,
      initialContent.percentage
    );
    assert.deepEqual(afterTitle.instances[cardId].state.content.analysis, initialContent.analysis);
    assert.deepEqual(
      afterTitle.instances[cardId].state.content.actionLabel,
      initialContent.actionLabel
    );
    assert.deepEqual(afterTitle.instances[cardId].state.content.badge, initialContent.badge);
  });

  it('13. اختبار عنصر Card: استقلال الخامة عن النصوص والأيقونة، واستقلال اللون الأساسي عن الثانوي (Card Material & Color Independence)', () => {
    const state0 = createInitialStudioState();
    const cardId = 'card-instance-1';

    const beforeContent = state0.instances[cardId].state.content;
    const beforeIcon = state0.instances[cardId].state.icon;
    const beforeSecondaryColor = state0.instances[cardId].state.surface.secondaryColor;

    // 1. Change primaryColor -> secondaryColor must NOT change
    const afterPrimary = updateInstanceSurface(state0, cardId, {
      primaryColor: '#1a4731',
    });
    assert.equal(afterPrimary.instances[cardId].state.surface.primaryColor, '#1a4731');
    assert.equal(
      afterPrimary.instances[cardId].state.surface.secondaryColor,
      beforeSecondaryColor
    );

    // 2. Change secondaryColor -> primaryColor must remain '#1a4731'
    const afterSecondary = updateInstanceSurface(afterPrimary, cardId, {
      secondaryColor: '#2d6a4f',
    });
    assert.equal(afterSecondary.instances[cardId].state.surface.primaryColor, '#1a4731');
    assert.equal(afterSecondary.instances[cardId].state.surface.secondaryColor, '#2d6a4f');

    // 3. Change materialType across all 9 materials -> text fields and icon must NOT change
    let current = afterSecondary;
    for (const mat of CARD_MATERIAL_OPTIONS) {
      current = updateInstanceSurface(current, cardId, {
        materialType: mat.value,
      });
      assert.equal(current.instances[cardId].state.surface.materialType, mat.value);
      assert.deepEqual(current.instances[cardId].state.content, beforeContent);
      assert.deepEqual(current.instances[cardId].state.icon, beforeIcon);
    }

    // 4. Change Icon -> surface material and colors must NOT change
    const surfaceBeforeIconChange = current.instances[cardId].state.surface;
    const afterIcon = updateInstanceIcon(current, cardId, {
      source: 'emoji',
      value: '💎',
      color: '#38bdf8',
      size: 38,
      rotate: 30,
      position: 'center',
    });
    assert.deepEqual(afterIcon.instances[cardId].state.surface, surfaceBeforeIconChange);
  });

  it('14. اختبار عنصر Card: استقلال العرض عن الارتفاع، وتوليد HTML/CSS نظيف للخامات التسع في الوضعين البصريين (Card Dimensions, Clean Export & Both Themes)', () => {
    let state = createInitialStudioState();
    const cardId = 'card-instance-1';

    const origHeight = state.instances[cardId].state.dimensions.height;
    state = updateInstanceDimensions(state, cardId, { width: 620 });
    assert.equal(state.instances[cardId].state.dimensions.width, 620);
    assert.equal(state.instances[cardId].state.dimensions.height, origHeight);

    state = updateInstanceDimensions(state, cardId, { height: 480 });
    assert.equal(state.instances[cardId].state.dimensions.width, 620);
    assert.equal(state.instances[cardId].state.dimensions.height, 480);

    // Test both studio themes ('emerald-luxury' and 'ivory-pearl') and all 9 materials
    const themes: Array<'emerald-luxury' | 'ivory-pearl'> = ['emerald-luxury', 'ivory-pearl'];
    for (const theme of themes) {
      state = setStudioThemeMode(state, theme);
      assert.equal(state.theme, theme);

      for (const mat of CARD_MATERIAL_OPTIONS) {
        state = updateInstanceSurface(state, cardId, { materialType: mat.value });
        const inst = state.instances[cardId];
        const input = {
          instanceId: inst.id,
          scopeId: inst.scopeId,
          state: inst.state,
        };

        const preview = cardModule.renderPreview(input);
        const bundle = cardModule.generateCode(input);

        assert.equal(preview.html, bundle.html);
        assert.equal(preview.css, bundle.css);
        assert.equal(bundle.html.includes(`data-card-material="${mat.value}"`), true);
        assert.equal(bundle.css.includes(`[data-element-scope="${inst.scopeId}"]`), true);
        assert.equal(/\bundefined\b/.test(bundle.html), false);
        assert.equal(/\bNaN\b/.test(bundle.html), false);
        assert.equal(/\bundefined\b/.test(bundle.css), false);
        assert.equal(/\bNaN\b/.test(bundle.css), false);
        assert.equal(bundle.validationErrors.length, 0);
      }
    }

    // Verify CARD_DEFAULT_STATE is valid
    assert.equal(cardModule.validate(CARD_DEFAULT_STATE).valid, true);
  });

  it('15. اختبار Imported Component: العزل داخل iframe، حماية Studio Shell، وتعطيل JavaScript الخارجي', () => {
    let state = createInitialStudioState();
    const importedId = 'imported-instance-1';
    const cardId = 'card-instance-1';
    const cardStateBefore = state.instances[cardId].state;

    const hostileHtml = `<div class="custom-box" onclick="window.top.location='https://evil.test'">
  <script src="https://evil.test/payload.js"></script>
  <script>document.body.innerHTML = 'hacked';</script>
  <a href="javascript:alert(1)" class="custom-link">رابط</a>
  <h3 class="custom-title">عنوان آمن</h3>
</div>`;
    const hostileCss = `body { background: #ff0000 !important; display: none !important; }
.studio-shell, .studio-header { opacity: 0 !important; pointer-events: none !important; }
.custom-box { padding: 18px; color: #ffffff; }`;

    state = updateInstanceImportedSource(state, importedId, {
      html: hostileHtml,
      css: hostileCss,
    });

    const inst = state.instances[importedId];
    const preview = importedComponentModule.renderPreview({
      instanceId: inst.id,
      scopeId: inst.scopeId,
      state: inst.state,
    });
    const bundle = importedComponentModule.generateCode({
      instanceId: inst.id,
      scopeId: inst.scopeId,
      state: inst.state,
    });

    // 1. Preview renders inside a strictly sandboxed iframe (sandbox="")
    assert.equal(preview.html.includes('<iframe'), true);
    assert.equal(preview.html.includes('sandbox=""'), true);
    assert.equal(preview.html.includes('srcdoc="'), true);

    // 2. Preview CSS injected into Studio DOM NEVER contains the user's raw CSS (protects Studio Shell!)
    assert.equal(preview.css.includes('.studio-shell'), false);
    assert.equal(preview.css.includes('background: #ff0000'), false);
    assert.equal(
      preview.css.includes(`[data-element-scope="${inst.scopeId}"]`),
      true
    );

    // 3. Exported HTML and iframe srcdoc strip <script>, inline on*, and javascript: URIs
    assert.equal(bundle.html.includes('<script'), false);
    assert.equal(bundle.html.includes('onclick='), false);
    assert.equal(bundle.html.includes('javascript:'), false);
    assert.equal(preview.html.includes('&lt;script'), false);

    // 4. Card instance is 100% unaffected
    assert.deepEqual(state.instances[cardId].state, cardStateBefore);
  });

  it('16. اختبار Imported Component: حفظ source.html و source.css دون تعديل، والمسح واستعادة المصدر الأصلي', () => {
    const registry = createPhaseOneRegistry();
    let state = createInitialStudioState(registry);
    const importedId = 'imported-instance-1';

    const rawUserHtml = `  <section class="my-raw-card" data-custom="1">\n    <h1>عنوان المستخدم الخام</h1>\n  </section>  `;
    const rawUserCss = `/* تعليق المستخدم */\n.my-raw-card {\n  background: #123456;\n  color: #abcdef;\n}`;

    state = updateInstanceImportedSource(state, importedId, {
      html: rawUserHtml,
      css: rawUserCss,
    });

    // Verbatim preservation (exact string match including leading/trailing whitespace & comments)
    assert.equal(state.instances[importedId].state.imported?.source.html, rawUserHtml);
    assert.equal(state.instances[importedId].state.imported?.source.css, rawUserCss);

    // Clear source
    const clearedState = clearInstanceImportedSource(state, importedId);
    assert.equal(clearedState.instances[importedId].state.imported?.source.html, '');
    assert.equal(clearedState.instances[importedId].state.imported?.source.css, '');
    // initialSource is still preserved
    assert.equal(
      clearedState.instances[importedId].state.imported?.initialSource.html,
      DEFAULT_IMPORTED_SOURCE_HTML
    );

    // Restore original source
    const restoredState = restoreInstanceImportedOriginalSource(
      clearedState,
      registry,
      importedId
    );
    assert.equal(
      restoredState.instances[importedId].state.imported?.source.html,
      DEFAULT_IMPORTED_SOURCE_HTML
    );
    assert.equal(
      restoredState.instances[importedId].state.imported?.source.css,
      DEFAULT_IMPORTED_SOURCE_CSS
    );
  });

  it('17. اختبار Imported Component: استقلال طبقة overrides وربط المحددات الاختياري (Mapping) دون تعديل المصدر', () => {
    const registry = createPhaseOneRegistry();
    let state = createInitialStudioState(registry);
    const importedId = 'imported-instance-1';

    const customHtml = `<div class="u-card"><span class="u-icon">★</span><img class="u-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" /><h4 class="u-title">عنوان</h4><p class="u-desc">وصف</p><button class="u-btn">إجراء</button></div>`;
    const customCss = `.u-card { padding: 10px; background: #111; }`;

    state = updateInstanceImportedSource(state, importedId, {
      html: customHtml,
      css: customCss,
    });

    // Apply general overrides (width, height, spacing, colors, typography, borders, shadows, border-radius)
    state = updateInstanceImportedOverrides(state, importedId, {
      width: 540,
      widthUnit: 'px',
      height: 360,
      heightUnit: 'px',
      paddingX: 28,
      paddingY: 24,
      margin: 12,
      gap: 18,
      backgroundColor: '#1a3a2f',
      textColor: '#f0fdf4',
      accentColor: '#eab308',
      fontFamily: "'Readex Pro', sans-serif",
      fontSize: 16,
      fontWeight: 600,
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: '#eab308',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      borderRadius: 24,
    });

    // Apply manual selector mapping (Root, Title, Description, Action, Image, Icon)
    state = updateInstanceImportedMapping(state, importedId, {
      root: '.u-card',
      title: '.u-title',
      description: '.u-desc',
      action: '.u-btn',
      image: '.u-img',
      icon: '.u-icon',
    });

    // Apply mapped target overrides
    state = updateInstanceImportedMappedOverrides(state, importedId, {
      titleColor: '#ffd700',
      titleFontSize: 26,
      descriptionColor: '#cbd5e1',
      actionBackgroundColor: '#10b981',
      actionTextColor: '#06281e',
      imageBorderRadius: 16,
      iconColor: '#38bdf8',
      iconSize: 28,
    });

    const instAfter = state.instances[importedId];
    // 1. Source HTML & CSS MUST remain 100% untouched!
    assert.equal(instAfter.state.imported?.source.html, customHtml);
    assert.equal(instAfter.state.imported?.source.css, customCss);

    // 2. Generated CSS contains both scoped source CSS and the independent overrides layer
    const bundle = importedComponentModule.generateCode({
      instanceId: instAfter.id,
      scopeId: instAfter.scopeId,
      state: instAfter.state,
    });
    assert.equal(bundle.css.includes('width: 540px !important;'), true);
    assert.equal(bundle.css.includes('height: 360px !important;'), true);
    assert.equal(bundle.css.includes('border-radius: 24px !important;'), true);
    assert.equal(bundle.css.includes(`[data-element-scope="${instAfter.scopeId}"] .u-title`), true);
    assert.equal(bundle.css.includes('color: #ffd700 !important;'), true);
    assert.equal(bundle.css.includes(`[data-element-scope="${instAfter.scopeId}"] .u-btn`), true);
    assert.equal(bundle.css.includes(`[data-element-scope="${instAfter.scopeId}"] .u-img`), true);
    assert.equal(bundle.css.includes(`[data-element-scope="${instAfter.scopeId}"] .u-icon`), true);

    // 3. Reset overrides and mapping -> source.html and source.css still remain customHtml and customCss!
    const afterResetOverrides = resetInstanceImportedOverrides(state, registry, importedId);
    const afterResetMapping = resetInstanceImportedMapping(
      afterResetOverrides,
      registry,
      importedId
    );
    assert.equal(afterResetMapping.instances[importedId].state.imported?.source.html, customHtml);
    assert.equal(afterResetMapping.instances[importedId].state.imported?.source.css, customCss);
    assert.equal(
      afterResetMapping.instances[importedId].state.imported?.overrides.borderRadius,
      null
    );
  });

  it('18. اختبار Imported Component: التحقق من التحذيرات (الروابط الخارجية، المحددات العامة، @import، @keyframes، والصور والخطوط الخارجية)', () => {
    const htmlWithWarnings = `
      <div class="box">
        <img src="https://cdn.example.com/banner.png" alt="ext" />
        <a href="https://example.org/docs">وثائق خارجية</a>
      </div>
    `;
    const cssWithWarnings = `
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
      body { margin: 0; }
      div { padding: 4px; }
      @keyframes floatUp {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .box {
        background-image: url('https://cdn.example.com/bg.jpg');
      }
    `;

    const warnings = analyzeImportedComponentWarnings(htmlWithWarnings, cssWithWarnings);
    const codes = new Set(warnings.map((w) => w.code));

    assert.equal(codes.has('EXTERNAL_LINK'), true, 'Must warn on external links');
    assert.equal(codes.has('EXTERNAL_IMAGE'), true, 'Must warn on external images');
    assert.equal(codes.has('EXTERNAL_FONT'), true, 'Must warn on external fonts');
    assert.equal(codes.has('CSS_AT_IMPORT'), true, 'Must warn on @import');
    assert.equal(codes.has('CSS_AT_KEYFRAMES'), true, 'Must warn on @keyframes');
    assert.equal(codes.has('GLOBAL_SELECTOR'), true, 'Must warn on global selectors (body, div)');

    // Also verify warnings are included in ExportBundle
    let state = createInitialStudioState();
    state = updateInstanceImportedSource(state, 'imported-instance-1', {
      html: htmlWithWarnings,
      css: cssWithWarnings,
    });
    const inst = state.instances['imported-instance-1'];
    const bundle = importedComponentModule.generateCode({
      instanceId: inst.id,
      scopeId: inst.scopeId,
      state: inst.state,
    });
    assert.equal(bundle.warnings.length >= 6, true);
    assert.equal(bundle.validationErrors.length, 0);
  });

  it('19. اختبار تنظيم مكتبة العناصر: التصنيفات التسعة، التصفية، البحث، والترتيب الحتمي المستقل عن ترتيب الإضافة', () => {
    const registry = createPhaseOneRegistry();

    // 1. Verify all 9 mandatory categories exist in LIBRARY_CATEGORIES
    assert.equal(LIBRARY_CATEGORIES.length, 9);
    const categoryIds = LIBRARY_CATEGORIES.map((c) => c.id);
    assert.deepEqual(categoryIds, [
      'controls',
      'cards',
      'media-showcase',
      'sections',
      'backgrounds-effects',
      'navigation-forms',
      'identity-social',
      'imported-elements',
      'templates',
    ]);

    // 2. Verify each registered element is assigned to its exact expected primary category & origin group
    const counts = countElementsByCategory(registry);
    assert.equal(counts.all, 9);
    assert.equal(counts.controls, 2); // Button + Contract Probe
    assert.equal(counts.cards, 1); // Card
    assert.equal(counts['media-showcase'], 1); // Carousel
    assert.equal(counts.sections, 1); // Hero
    assert.equal(counts['navigation-forms'], 1); // Auth Form
    assert.equal(counts['identity-social'], 2); // Brand Identity + Social Dock
    assert.equal(counts['imported-elements'], 1); // Imported Component
    assert.equal(counts.templates, 0);

    // 3. Filtering by category returns only elements in that category
    const controlsOnly = queryRegistryElements(registry, 'controls', '');
    assert.equal(controlsOnly.some((e) => e.id === BUTTON_ELEMENT_ID), true);
    assert.equal(controlsOnly.some((e) => e.id === CARD_ELEMENT_ID), false);

    const mediaOnly = queryRegistryElements(registry, 'media-showcase', '');
    assert.equal(mediaOnly.length, 1);
    assert.equal(mediaOnly[0].id, CAROUSEL_ELEMENT_ID);

    const sectionsOnly = queryRegistryElements(registry, 'sections', '');
    assert.equal(sectionsOnly.length, 1);
    assert.equal(sectionsOnly[0].id, HERO_ELEMENT_ID);

    const navFormsOnly = queryRegistryElements(registry, 'navigation-forms', '');
    assert.equal(navFormsOnly.length, 1);
    assert.equal(navFormsOnly[0].id, AUTH_FORM_ELEMENT_ID);

    const identitySocialOnly = queryRegistryElements(registry, 'identity-social', '');
    assert.equal(identitySocialOnly.length, 2);
    assert.deepEqual(
      identitySocialOnly.map((e) => e.id),
      [BRAND_IDENTITY_ELEMENT_ID, SOCIAL_DOCK_ELEMENT_ID]
    );

    const importedOnly = queryRegistryElements(registry, 'imported-elements', '');
    assert.equal(importedOnly.length, 1);
    assert.equal(importedOnly[0].id, IMPORTED_COMPONENT_ID);
    assert.equal(resolveElementOriginGroup(importedOnly[0]), 'imported');

    // 4. Search by element name or tag
    const searchCarousel = queryRegistryElements(registry, 'all', 'slider');
    assert.equal(searchCarousel.some((e) => e.id === CAROUSEL_ELEMENT_ID), true);

    const searchAuth = queryRegistryElements(registry, 'all', 'login');
    assert.equal(searchAuth.some((e) => e.id === AUTH_FORM_ELEMENT_ID), true);

    const searchSocial = queryRegistryElements(registry, 'all', 'social-dock');
    assert.equal(searchSocial.length, 1);
    assert.equal(searchSocial[0].id, SOCIAL_DOCK_ELEMENT_ID);

    // 5. Deterministic sorting regardless of the order elements are registered in the Registry
    let forwardReg = createEmptyRegistry();
    forwardReg = registerElement(forwardReg, buttonRegistration);
    forwardReg = registerElement(forwardReg, cardRegistration);
    forwardReg = registerElement(forwardReg, carouselRegistration);
    forwardReg = registerElement(forwardReg, heroRegistration);
    forwardReg = registerElement(forwardReg, authFormRegistration);
    forwardReg = registerElement(forwardReg, brandIdentityRegistration);
    forwardReg = registerElement(forwardReg, socialDockRegistration);
    forwardReg = registerElement(forwardReg, importedComponentRegistration);
    forwardReg = registerElement(forwardReg, contractProbeRegistration);

    let reverseReg = createEmptyRegistry();
    reverseReg = registerElement(reverseReg, contractProbeRegistration);
    reverseReg = registerElement(reverseReg, importedComponentRegistration);
    reverseReg = registerElement(reverseReg, socialDockRegistration);
    reverseReg = registerElement(reverseReg, brandIdentityRegistration);
    reverseReg = registerElement(reverseReg, authFormRegistration);
    reverseReg = registerElement(reverseReg, heroRegistration);
    reverseReg = registerElement(reverseReg, carouselRegistration);
    reverseReg = registerElement(reverseReg, cardRegistration);
    reverseReg = registerElement(reverseReg, buttonRegistration);

    const forwardIds = listRegisteredElements(forwardReg).map((e) => e.id);
    const reverseIds = listRegisteredElements(reverseReg).map((e) => e.id);
    assert.deepEqual(
      forwardIds,
      reverseIds,
      'Element ordering must be 100% deterministic and independent of registration order'
    );
    assert.equal(resolveElementPrimaryCategory(listRegisteredElements(forwardReg)[0]), 'controls');
  });

  it('20. اختبار عنصر Button الإنتاجي: استقلال النص والأيقونة والعرض والارتفاع، استقلال hover عن default، حالة التعطيل، وتوليد الكود في الوضعين', () => {
    let state = createInitialStudioState();
    const btnId = 'button-instance-1';
    const initialBtn = state.instances[btnId].state;

    const origHeight = initialBtn.dimensions.height;
    const origIconVal = initialBtn.icon.value;
    const origDefaultBg = initialBtn.button?.defaultStyle.backgroundColor;

    // 1. Modify button text -> icon, width, height, and styles remain untouched
    state = updateInstanceContentField(state, btnId, 'actionLabel', {
      value: 'انطلق للمشروع الآن',
      fontSize: 18,
    });
    assert.equal(state.instances[btnId].state.content.actionLabel.value, 'انطلق للمشروع الآن');
    assert.equal(state.instances[btnId].state.icon.value, origIconVal);
    assert.equal(state.instances[btnId].state.dimensions.height, origHeight);

    // 2. Modify width -> height stays unchanged; modify height -> width stays unchanged
    state = updateInstanceDimensions(state, btnId, { width: 310, widthUnit: 'px' });
    assert.equal(state.instances[btnId].state.dimensions.width, 310);
    assert.equal(state.instances[btnId].state.dimensions.height, origHeight);

    state = updateInstanceDimensions(state, btnId, { height: 64, heightUnit: 'px' });
    assert.equal(state.instances[btnId].state.dimensions.height, 64);
    assert.equal(state.instances[btnId].state.dimensions.width, 310);

    // 3. Modify icon -> text and dimensions remain untouched
    state = updateInstanceIcon(state, btnId, {
      source: 'emoji',
      value: '🚀',
      size: 22,
      rotate: 15,
    });
    assert.equal(state.instances[btnId].state.icon.value, '🚀');
    assert.equal(state.instances[btnId].state.content.actionLabel.value, 'انطلق للمشروع الآن');
    assert.equal(state.instances[btnId].state.dimensions.width, 310);

    // 4. Modify hoverStyle -> defaultStyle remains 100% untouched!
    state = updateInstanceButtonStateStyle(state, btnId, 'hoverStyle', {
      backgroundColor: '#10b981',
      textColor: '#ffffff',
      glowIntensity: 75,
      translateY: -4,
    });
    assert.equal(
      state.instances[btnId].state.button?.defaultStyle.backgroundColor,
      origDefaultBg,
      'Changing hoverStyle must NEVER mutate defaultStyle'
    );
    assert.equal(state.instances[btnId].state.button?.hoverStyle.backgroundColor, '#10b981');
    assert.equal(state.instances[btnId].state.button?.hoverStyle.glowIntensity, 75);

    // 5. Disabled state
    state = updateInstanceButtonData(state, btnId, {
      disabled: true,
      disabledOpacity: 40,
      surfaceType: 'neon',
    });
    const disabledBundle = buttonModule.generateCode({
      instanceId: btnId,
      scopeId: state.instances[btnId].scopeId,
      state: state.instances[btnId].state,
    });
    assert.equal(disabledBundle.html.includes('disabled'), true);
    assert.equal(disabledBundle.html.includes('aria-disabled="true"'), true);
    assert.equal(disabledBundle.css.includes(':hover:not([disabled])'), true);
    assert.equal(disabledBundle.validationErrors.length, 0);

    // 6. Verify clean export in both visual themes ('emerald-luxury' & 'ivory-pearl')
    const ivoryState = setStudioThemeMode(state, 'ivory-pearl');
    const ivoryBundle = buttonModule.generateCode({
      instanceId: btnId,
      scopeId: ivoryState.instances[btnId].scopeId,
      state: ivoryState.instances[btnId].state,
    });
    assert.equal(ivoryBundle.html.includes('undefined'), false);
    assert.equal(ivoryBundle.css.includes('NaN'), false);
  });

  it('21. اختبار عنصر Carousel الإنتاجي: استقلال الشرائح، استقلال الحقول داخل الشريحة، تبديل الشريحة النشطة دون فقدان المحتوى، وتصدير JS عند الحاجة فقط', () => {
    let state = createInitialStudioState();
    const carouselId = 'carousel-instance-1';

    const slide0TitleBefore =
      state.instances[carouselId].state.carousel?.slides[0].title.value;
    const slide1TitleBefore =
      state.instances[carouselId].state.carousel?.slides[1].title.value;
    const slide0DescBefore =
      state.instances[carouselId].state.carousel?.slides[0].description.value;

    // 1. Modify title of Slide 0 -> Slide 0 description and Slide 1 title remain untouched
    state = updateInstanceCarouselSlideField(state, carouselId, 0, 'title', {
      value: 'عنوان الشريحة الأولى المعدل',
    });
    assert.equal(
      state.instances[carouselId].state.carousel?.slides[0].title.value,
      'عنوان الشريحة الأولى المعدل'
    );
    assert.equal(
      state.instances[carouselId].state.carousel?.slides[0].description.value,
      slide0DescBefore,
      'Sibling fields in the same slide must remain independent'
    );
    assert.equal(
      state.instances[carouselId].state.carousel?.slides[1].title.value,
      slide1TitleBefore,
      'Other slides must remain 100% independent'
    );

    // 2. Switch activeSlideIndex -> does not mutate any slide's content
    state = updateInstanceCarouselData(state, carouselId, { activeSlideIndex: 2 });
    assert.equal(state.instances[carouselId].state.carousel?.activeSlideIndex, 2);
    assert.equal(
      state.instances[carouselId].state.carousel?.slides[0].title.value,
      'عنوان الشريحة الأولى المعدل'
    );

    // 3. Add and remove a slide without corrupting existing slides
    const newSlide = createCarouselSlide(
      'slide-custom-4',
      'الشريحة الرابعة الجديدة',
      'وصف الشريحة الرابعة',
      '04',
      '+100%',
      'تحليل الشريحة الرابعة',
      'معاينة',
      'جديد',
      '#d4af37'
    );
    state = addInstanceCarouselSlide(state, carouselId, newSlide);
    assert.equal(state.instances[carouselId].state.carousel?.slides.length, 4);
    state = removeInstanceCarouselSlide(state, carouselId, 3);
    assert.equal(state.instances[carouselId].state.carousel?.slides.length, 3);

    // 4. Multi-slide carousel exports scoped JS
    const multiSlideBundle = carouselModule.generateCode({
      instanceId: carouselId,
      scopeId: state.instances[carouselId].scopeId,
      state: state.instances[carouselId].state,
    });
    assert.ok(
      multiSlideBundle.js && multiSlideBundle.js.includes('function goTo(index)'),
      'Multi-slide carousel must export scoped navigation JS'
    );

    // 5. Single-slide carousel with autoPlay=false exports NO JS (undefined)
    let singleSlideState = removeInstanceCarouselSlide(state, carouselId, 2);
    singleSlideState = removeInstanceCarouselSlide(singleSlideState, carouselId, 1);
    singleSlideState = updateInstanceCarouselData(singleSlideState, carouselId, {
      autoPlay: false,
    });
    assert.equal(singleSlideState.instances[carouselId].state.carousel?.slides.length, 1);
    const singleSlideBundle = carouselModule.generateCode({
      instanceId: carouselId,
      scopeId: singleSlideState.instances[carouselId].scopeId,
      state: singleSlideState.instances[carouselId].state,
    });
    assert.equal(
      singleSlideBundle.js,
      undefined,
      'Single-slide static carousel must NOT export unnecessary JavaScript'
    );
    assert.equal(singleSlideBundle.validationErrors.length, 0);
  });

  it('22. اختبار عنصر Hero الإنتاجي: استقلال الحقول النصية والأزرار والخلفية، استقلال العرض والارتفاع، والاستجابة على الجوال والتابلت وسطح المكتب', () => {
    let state = createInitialStudioState();
    const heroId = 'hero-instance-1';

    const origDesc = state.instances[heroId].state.content.description.value;
    const origSecondaryBtn =
      state.instances[heroId].state.hero?.secondaryAction.label.value;
    const origHeight = state.instances[heroId].state.dimensions.height;

    // 1. Modify Title -> Description and buttons remain unchanged
    state = updateInstanceContentField(state, heroId, 'title', {
      value: 'واجهة Hero الرئيسية المحدثة',
    });
    assert.equal(
      state.instances[heroId].state.content.title.value,
      'واجهة Hero الرئيسية المحدثة'
    );
    assert.equal(state.instances[heroId].state.content.description.value, origDesc);

    // 2. Modify Primary Action Button -> Secondary Action Button and Title remain unchanged
    state = updateInstanceHeroAction(
      state,
      heroId,
      'primaryAction',
      { backgroundColor: '#10b981', borderRadius: 20 },
      { value: 'ابدأ التجربة الآن' }
    );
    assert.equal(
      state.instances[heroId].state.hero?.primaryAction.label.value,
      'ابدأ التجربة الآن'
    );
    assert.equal(
      state.instances[heroId].state.hero?.secondaryAction.label.value,
      origSecondaryBtn
    );

    // 3. Modify Hero variant & overlay -> content and buttons remain unchanged
    state = updateInstanceHeroData(state, heroId, {
      variant: 'neon',
      overlayOpacity: 60,
      glowIntensity: 55,
    });
    assert.equal(state.instances[heroId].state.hero?.variant, 'neon');
    assert.equal(
      state.instances[heroId].state.content.title.value,
      'واجهة Hero الرئيسية المحدثة'
    );

    // 4. Independent Width & Height
    state = updateInstanceDimensions(state, heroId, { width: 920, widthUnit: 'px' });
    assert.equal(state.instances[heroId].state.dimensions.width, 920);
    assert.equal(state.instances[heroId].state.dimensions.height, origHeight);

    // 5. Generated CSS includes responsive breakpoints (@media (max-width: 768px) and @media (max-width: 480px))
    const bundle = heroModule.generateCode({
      instanceId: heroId,
      scopeId: state.instances[heroId].scopeId,
      state: state.instances[heroId].state,
    });
    assert.equal(bundle.css.includes('@media (max-width: 768px)'), true);
    assert.equal(bundle.css.includes('@media (max-width: 480px)'), true);
    assert.equal(bundle.validationErrors.length, 0);
  });

  it('23. اختبار عنصر Social Dock الإنتاجي: استقلال كل عنصر، إضافة وحذف عنصر دون التأثير على الباقي، والتحقق من الروابط وaria-label', () => {
    let state = createInitialStudioState();
    const dockId = 'social-dock-instance-1';
    const initialItems = state.instances[dockId].state.socialDock?.items || [];
    assert.equal(initialItems.length, 4);

    const secondItemBefore = { ...initialItems[1] };

    // 1. Update first item -> second item remains untouched
    state = updateInstanceSocialDockItem(state, dockId, initialItems[0].id, {
      name: 'منصة X الرسمية',
      color: '#38bdf8',
      size: 54,
    });
    const afterUpdateItems = state.instances[dockId].state.socialDock?.items || [];
    assert.equal(afterUpdateItems[0].name, 'منصة X الرسمية');
    assert.equal(afterUpdateItems[0].size, 54);
    assert.deepEqual(afterUpdateItems[1], secondItemBefore);

    // 2. Add a new social link item -> existing items remain untouched
    state = addInstanceSocialDockItem(state, dockId, {
      id: 'social-telegram',
      name: 'Telegram',
      url: 'https://t.me/besostudio',
      icon: '✈',
      color: '#38bdf8',
      backgroundColor: '#0e2820',
      size: 48,
      order: 5,
      visible: true,
      ariaLabel: 'قناتنا على تيليجرام',
      openInNewTab: true,
    });
    assert.equal(state.instances[dockId].state.socialDock?.items.length, 5);

    // 3. Remove the added item -> count returns to 4 and existing items remain intact
    state = removeInstanceSocialDockItem(state, dockId, 'social-telegram');
    assert.equal(state.instances[dockId].state.socialDock?.items.length, 4);
    assert.equal(state.instances[dockId].state.socialDock?.items[0].name, 'منصة X الرسمية');

    // 4. Validate accessibility (empty ariaLabel or invalid URL triggers validation error)
    const invalidState = updateInstanceSocialDockItem(state, dockId, initialItems[0].id, {
      ariaLabel: '',
      url: 'javascript:alert(1)',
    });
    const validationRes = socialDockModule.validate(invalidState.instances[dockId].state);
    assert.equal(validationRes.valid, false);
    assert.equal(
      validationRes.errors.some((i) => i.code === 'MISSING_SOCIAL_ARIA_LABEL'),
      true
    );
    assert.equal(
      validationRes.errors.some((i) => i.code === 'INVALID_SOCIAL_URL'),
      true
    );
  });

  it('24. اختبار عنصر Brand Identity الإنتاجي: استقلال الشعار النصي والصوري والرمز ولوحة الألوان والخامات وتوليد HTML/CSS نظيف', () => {
    let state = createInitialStudioState();
    const brandId = 'brand-identity-instance-1';
    const origSymbol = state.instances[brandId].state.brandIdentity?.symbolIcon;
    const origSecondaryColor =
      state.instances[brandId].state.brandIdentity?.secondaryBrandColor;

    // 1. Update text logo & primary brand color -> symbol and secondary color stay unchanged
    state = updateInstanceBrandIdentityData(state, brandId, {
      logoText: 'BESO ATELIER V2',
      primaryBrandColor: '#064e3b',
      material: 'metal',
    });
    const brandAfter = state.instances[brandId].state.brandIdentity;
    assert.equal(brandAfter?.logoText, 'BESO ATELIER V2');
    assert.equal(brandAfter?.primaryBrandColor, '#064e3b');
    assert.equal(brandAfter?.material, 'metal');
    assert.equal(brandAfter?.symbolIcon, origSymbol);
    assert.equal(brandAfter?.secondaryBrandColor, origSecondaryColor);

    // 2. Clean HTML/CSS export
    const bundle = brandIdentityModule.generateCode({
      instanceId: brandId,
      scopeId: state.instances[brandId].scopeId,
      state: state.instances[brandId].state,
    });
    assert.equal(bundle.html.includes('BESO ATELIER V2'), true);
    assert.equal(bundle.html.includes('undefined'), false);
    assert.equal(bundle.css.includes('NaN'), false);
    assert.equal(bundle.validationErrors.length, 0);
  });

  it('25. اختبار عنصر Auth Form الإنتاجي: التبديل بين أوضاع النموذج، استقلال الحقول، وصحة HTML/CSS وإمكانية الوصول', () => {
    let state = createInitialStudioState();
    const authId = 'auth-form-instance-1';

    // 1. Default mode is 'login' (shows email + password, hides register-only full_name)
    const loginHtml = authFormModule.generateHtml({
      instanceId: authId,
      scopeId: state.instances[authId].scopeId,
      state: state.instances[authId].state,
    });
    assert.equal(loginHtml.includes('data-auth-mode="login"'), true);
    assert.equal(loginHtml.includes('name="email"'), true);
    assert.equal(loginHtml.includes('name="password"'), true);
    assert.equal(loginHtml.includes('name="full_name"'), false);

    // 2. Switch to 'register' mode -> shows full_name, email, and password
    state = updateInstanceAuthFormData(state, authId, {
      mode: 'register',
      material: 'neon',
    });
    const registerHtml = authFormModule.generateHtml({
      instanceId: authId,
      scopeId: state.instances[authId].scopeId,
      state: state.instances[authId].state,
    });
    assert.equal(registerHtml.includes('data-auth-mode="register"'), true);
    assert.equal(registerHtml.includes('name="full_name"'), true);
    assert.equal(registerHtml.includes('name="email"'), true);
    assert.equal(registerHtml.includes('name="password"'), true);

    // 3. Switch to 'recover' mode -> shows email only
    state = updateInstanceAuthFormData(state, authId, { mode: 'recover' });
    const recoverHtml = authFormModule.generateHtml({
      instanceId: authId,
      scopeId: state.instances[authId].scopeId,
      state: state.instances[authId].state,
    });
    assert.equal(recoverHtml.includes('data-auth-mode="recover"'), true);
    assert.equal(recoverHtml.includes('name="email"'), true);
    assert.equal(recoverHtml.includes('name="password"'), false);

    // 4. Modify one field -> other fields remain untouched
    const passwordLabelBefore =
      state.instances[authId].state.authForm?.fields.find((f) => f.id === 'field-password')
        ?.label;
    state = updateInstanceAuthFormField(state, authId, 'field-email', {
      label: 'البريد المؤسسي المعتمد',
      showError: true,
    });
    const emailFieldAfter = state.instances[authId].state.authForm?.fields.find(
      (f) => f.id === 'field-email'
    );
    const passwordFieldAfter = state.instances[authId].state.authForm?.fields.find(
      (f) => f.id === 'field-password'
    );
    assert.equal(emailFieldAfter?.label, 'البريد المؤسسي المعتمد');
    assert.equal(emailFieldAfter?.showError, true);
    assert.equal(passwordFieldAfter?.label, passwordLabelBefore);

    // 5. Verify accessible HTML output (<label for="...">, aria-invalid="true", role="alert")
    const bundle = authFormModule.generateCode({
      instanceId: authId,
      scopeId: state.instances[authId].scopeId,
      state: state.instances[authId].state,
    });
    assert.equal(bundle.html.includes('aria-invalid="true"'), true);
    assert.equal(bundle.html.includes('role="alert"'), true);
    assert.equal(bundle.validationErrors.length, 0);
  });

  it('26. اختبار نظام مكونات التحكم الموحد (Shared Control System: ControlColor, ControlFile, ControlMaterialGrid, ControlTypographyCard, ControlEffectsSection)', () => {
    // 1. ControlColor: human color name & hex normalization
    assert.equal(resolveHumanColorName('#d4af37').includes('ذهبي ملكي'), true);
    assert.equal(resolveHumanColorName('rgba(212, 175, 55, 0.28)').includes('RGBA'), true);
    assert.equal(normalizeHexForColorInput('#abc'), '#aabbcc');
    assert.equal(normalizeHexForColorInput('#D4AF37'), '#d4af37');
    assert.equal(normalizeHexForColorInput('rgba(0,0,0,0.5)', '#d4af37'), '#d4af37');

    // 2. ControlFile: image upload validation (type & max size)
    const validPng = validateUploadedImageFile({
      name: 'banner.png',
      type: 'image/png',
      size: 420 * 1024,
    });
    assert.equal(validPng.valid, true);
    assert.equal(validPng.errorMessage, null);

    const invalidExe = validateUploadedImageFile({
      name: 'script.exe',
      type: 'application/octet-stream',
      size: 1024,
    });
    assert.equal(invalidExe.valid, false);
    assert.equal(Boolean(invalidExe.errorMessage), true);

    const oversizedImg = validateUploadedImageFile(
      {
        name: 'huge.webp',
        type: 'image/webp',
        size: 8 * 1024 * 1024,
      },
      5 * 1024 * 1024
    );
    assert.equal(oversizedImg.valid, false);
    assert.equal(Boolean(oversizedImg.errorMessage), true);

    // 3. ControlMaterialGrid: all 9 surface materials present with visual swatches
    assert.equal(ALL_SURFACE_MATERIAL_CARDS.length, 9);
    const expectedMaterials = [
      'solid',
      'gradient',
      'glass',
      'metal',
      'ivory',
      'neon',
      'dark',
      'image',
      'pattern',
    ];
    for (const mat of expectedMaterials) {
      assert.equal(
        ALL_SURFACE_MATERIAL_CARDS.some((m) => m.value === mat),
        true,
        `Material card ${mat} must be present in ALL_SURFACE_MATERIAL_CARDS`
      );
    }

    // 4. Verify Card & Carousel image upload persistence when other settings change
    let state = createInitialStudioState();
    const cardId = 'card-instance-1';
    const customDataUri = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    state = updateInstanceSurface(state, cardId, {
      materialType: 'image',
      imageSourceUrl: customDataUri,
    });
    state = updateInstanceContentField(state, cardId, 'title', {
      value: 'عنوان بعد رفع الصورة',
    });
    state = updateInstanceDimensions(state, cardId, { width: 520 });
    assert.equal(
      state.instances[cardId].state.surface.imageSourceUrl,
      customDataUri,
      'Uploaded card image must not be lost when changing text or dimensions'
    );

    const carouselId = 'carousel-instance-1';
    state = updateInstanceCarouselSlideMeta(state, carouselId, 0, {
      imageUrl: customDataUri,
    });
    state = updateInstanceCarouselSlideField(state, carouselId, 0, 'title', {
      value: 'عنوان الشريحة بعد رفع الصورة',
    });
    assert.equal(
      state.instances[carouselId].state.carousel?.slides[0].imageUrl,
      customDataUri,
      'Uploaded carousel slide image must not be lost when editing slide text'
    );

    // 5. Verify CSS & Inspector integration of the 6 button classes and shared controls
    const controlsCss = fs.readFileSync(
      path.resolve(process.cwd(), 'src/styles/controls.css'),
      'utf-8'
    );
    assert.equal(controlsCss.includes('.studio-btn-secondary'), true);
    assert.equal(controlsCss.includes('.studio-btn-reset'), true);
    assert.equal(controlsCss.includes('.studio-btn-upload'), true);
    assert.equal(controlsCss.includes('.studio-btn-danger'), true);
    assert.equal(controlsCss.includes('.studio-category-tab'), true);
    assert.equal(controlsCss.includes('.studio-category-badge'), true);
    assert.equal(controlsCss.includes('.ui-material-grid'), true);
    assert.equal(controlsCss.includes('.ui-effects-live-stage'), true);
    assert.equal(controlsCss.includes('.ui-typography-field-card'), true);
  });
});
