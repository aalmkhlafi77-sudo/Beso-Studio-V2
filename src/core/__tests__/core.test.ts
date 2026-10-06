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
import { describe, it } from 'node:test';
import { DEFAULT_ADMIN_CONFIG } from '../../admin/configSchema';
import {
  CONTRACT_PROBE_DEFAULT_STATE,
  CONTRACT_PROBE_ID,
  contractProbeModule,
} from '../../elements/contract-probe/contractProbeModule';
import { resolveAdSlotRenderDecision } from '../../shared/ui/AdSlot';
import { getElementModule, listRegisteredElements } from '../registry/elementRegistry';
import {
  collapseAllInspectorGroupsInSection,
  createInitialStudioState,
  createPhaseOneRegistry,
  expandAllInspectorGroupsInSection,
  resetEntireInstanceState,
  resetInstanceAccordionGroup,
  resetInstanceCategorySection,
  resetInstanceContentField,
  resetInstanceDimensionField,
  resetStudioWorkspaceLayout,
  resizeStudioPreviewHeight,
  resizeStudioWorkspaceColumns,
  setFullscreenDrawerTab,
  setStudioPreviewMode,
  toggleInspectorAccordionGroup,
  updateInstanceContentField,
  updateInstanceDimensions,
  updateInstanceIcon,
} from '../state/studioStore';
import {
  countAccordionGroupModifications,
  countSectionModifications,
  WORKSPACE_LAYOUT_BOUNDS,
} from '../state/workspaceLayoutStore';

describe('Beso Studio V2 — Core & Workspace Contract Tests', () => {
  it('1. اختبار تسجيل العنصر (Element Registration Test)', () => {
    const registry = createPhaseOneRegistry();
    const allElements = listRegisteredElements(registry);

    assert.equal(allElements.length, 1);
    assert.equal(allElements[0].id, CONTRACT_PROBE_ID);
    assert.equal(allElements[0].status, 'experimental');

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
    const id = state0.activeInstanceId;

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
});
