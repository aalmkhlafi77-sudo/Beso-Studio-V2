/**
 * Beso Studio V2 — Phase 1 Core Contract Test Suite
 *
 * Covers the 6 mandatory test specifications:
 * 1. Element registration in Registry (Contract Probe only, immutable registry).
 * 2. Independence of all 7 text fields (title, description, number, percentage, analysis, actionLabel, badge)
 *    + single-field reset independence.
 * 3. Independence of Width and Height (changing width never alters height, changing height never alters width).
 * 4. Independence of Icon from text, colors, and dimensions.
 * 5. Default disabling of AdSlot and zero layout rendering when disabled.
 * 6. HTML and CSS generation without `undefined` or `NaN` and with isolated scope selector.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_ADMIN_CONFIG } from '../../admin/configSchema';
import {
  CONTRACT_PROBE_ID,
  contractProbeModule,
} from '../../elements/contract-probe/contractProbeModule';
import { resolveAdSlotRenderDecision } from '../../shared/ui/AdSlot';
import { getElementModule, listRegisteredElements } from '../registry/elementRegistry';
import {
  createInitialStudioState,
  createPhaseOneRegistry,
  resetInstanceContentField,
  resetInstanceDimensionField,
  updateInstanceContentField,
  updateInstanceDimensions,
  updateInstanceIcon,
} from '../state/studioStore';

describe('Beso Studio V2 — Phase 1 Core Contract Tests', () => {
  it('1. اختبار تسجيل العنصر (Element Registration Test)', () => {
    const registry = createPhaseOneRegistry();
    const allElements = listRegisteredElements(registry);

    // Only Contract Probe is registered in Phase 1
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

    // Modify ONLY title
    const state1 = updateInstanceContentField(state0, id, 'title', {
      value: 'عنوان جديد مستقل تمامًا',
      color: '#ffcc00',
    });

    const updatedContent1 = state1.instances[id].state.content;
    assert.equal(updatedContent1.title.value, 'عنوان جديد مستقل تمامًا');
    assert.equal(updatedContent1.title.color, '#ffcc00');

    // Verify description, number, percentage, analysis, actionLabel, badge are 100% untouched
    assert.deepEqual(updatedContent1.description, initialContent.description);
    assert.deepEqual(updatedContent1.number, initialContent.number);
    assert.deepEqual(updatedContent1.percentage, initialContent.percentage);
    assert.deepEqual(updatedContent1.analysis, initialContent.analysis);
    assert.deepEqual(updatedContent1.actionLabel, initialContent.actionLabel);
    assert.deepEqual(updatedContent1.badge, initialContent.badge);

    // Modify number and verify percentage & analysis do NOT change
    const state2 = updateInstanceContentField(state1, id, 'number', {
      value: '77,500',
    });
    assert.equal(state2.instances[id].state.content.number.value, '77,500');
    assert.deepEqual(state2.instances[id].state.content.percentage, initialContent.percentage);
    assert.deepEqual(state2.instances[id].state.content.analysis, initialContent.analysis);

    // Reset ONLY title and verify number keeps its modified value ('77,500')
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

    // Change width ONLY -> height must remain identical
    const stateWidthChanged = updateInstanceDimensions(state0, id, { width: 680 });
    assert.equal(stateWidthChanged.instances[id].state.dimensions.width, 680);
    assert.equal(stateWidthChanged.instances[id].state.dimensions.height, initialHeight);

    // Change height ONLY -> width must remain 680
    const stateHeightChanged = updateInstanceDimensions(stateWidthChanged, id, { height: 520 });
    assert.equal(stateHeightChanged.instances[id].state.dimensions.width, 680);
    assert.equal(stateHeightChanged.instances[id].state.dimensions.height, 520);

    // Reset width ONLY -> width returns to initialWidth while height stays 520
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

    // Text fields and dimensions must remain completely unchanged
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

    // Even when props omit `enabled`, AdSlot defaults to disabled
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

    // Ensure non-empty output
    assert.ok(html.length > 0);
    assert.ok(css.length > 0);

    // Ensure Preview and ExportBundle use identical HTML & CSS output
    assert.equal(preview.html, bundle.html);
    assert.equal(preview.css, bundle.css);

    // Ensure zero `undefined` or `NaN` in HTML or CSS
    assert.equal(/\bundefined\b/.test(bundle.html), false, 'HTML must not contain undefined');
    assert.equal(/\bNaN\b/.test(bundle.html), false, 'HTML must not contain NaN');
    assert.equal(/\bundefined\b/.test(bundle.css), false, 'CSS must not contain undefined');
    assert.equal(/\bNaN\b/.test(bundle.css), false, 'CSS must not contain NaN');

    // Ensure isolated CSS scope
    assert.equal(bundle.css.includes(`[data-element-scope="${activeInstance.scopeId}"]`), true);
    assert.equal(bundle.validationErrors.length, 0);
  });
});
