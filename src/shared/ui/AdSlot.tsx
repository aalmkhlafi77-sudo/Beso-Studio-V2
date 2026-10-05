/**
 * Beso Studio V2 — Experimental AdSlot Component
 *
 * Mandatory Rules:
 * 1. Disabled by default (enabled = false).
 * 2. Holds id, placement, width, height, enabled.
 * 3. Contains zero ad provider scripts or tracking code.
 * 4. Renders a Placeholder in development/preview mode ONLY when enabled.
 * 5. Has zero impact on page layout when disabled (renders null).
 */

import React from 'react';
import { AdFallbackBehavior, AdPlacement } from '../../admin/configSchema';

export interface AdSlotProps {
  id: string;
  placement: AdPlacement;
  width?: number | 'auto';
  height?: number | 'auto';
  enabled?: boolean;
  label?: string;
  fallback?: AdFallbackBehavior;
  isDevelopmentMode?: boolean;
}

export interface AdSlotRenderDecision {
  shouldRender: boolean;
  id: string;
  placement: AdPlacement;
  resolvedWidth: string;
  resolvedHeight: string;
  hasTrackingOrProviderCode: false;
}

/**
 * Pure helper function used by both the UI component and unit tests
 * to verify AdSlot behavior without DOM coupling.
 */
export function resolveAdSlotRenderDecision(props: AdSlotProps): AdSlotRenderDecision {
  const enabled = props.enabled ?? false;
  const isDev = props.isDevelopmentMode ?? true;
  const fallback = props.fallback ?? 'placeholder';

  const shouldRender = Boolean(enabled && isDev && fallback !== 'hidden');

  const resolvedWidth =
    props.width === undefined || props.width === 'auto' ? '100%' : `${props.width}px`;
  const resolvedHeight =
    props.height === undefined || props.height === 'auto' ? 'auto' : `${props.height}px`;

  return {
    shouldRender,
    id: props.id,
    placement: props.placement,
    resolvedWidth,
    resolvedHeight,
    hasTrackingOrProviderCode: false,
  };
}

export const AdSlot: React.FC<AdSlotProps> = (props) => {
  const decision = resolveAdSlotRenderDecision(props);

  // Rule: When disabled, return null so it has zero effect on page layout.
  if (!decision.shouldRender) {
    return null;
  }

  const label = props.label || 'مساحة إعلانية تجريبية (وضع التطوير فقط)';

  return (
    <aside
      className="studio-ad-slot"
      data-ad-slot-id={decision.id}
      data-ad-placement={decision.placement}
      data-ad-enabled="true"
      aria-label={label}
      style={{
        width: decision.resolvedWidth,
        minHeight: decision.resolvedHeight,
      }}
    >
      <div className="studio-metrics-strip">
        <span>إعلان تجريبي (Placeholder)</span>
        <span className="studio-metrics-separator">·</span>
        <span>المعرف: {decision.id}</span>
        <span className="studio-metrics-separator">·</span>
        <span>الموضع: {decision.placement}</span>
        <span className="studio-metrics-separator">·</span>
        <span>
          الأبعاد: {decision.resolvedWidth} × {decision.resolvedHeight}
        </span>
      </div>
      <div style={{ fontSize: '0.72rem' }}>
        {label} — معزول بالكامل ولا يحتوي على أي كود تتبع أو مزود خارجي.
      </div>
    </aside>
  );
};
