/**
 * Beso Studio V2 — Admin Configuration & Advertising Schema
 * Strictly matches Section 14 and Section 14.1 of the Architectural Reference.
 * Advertising and all AdSlots are disabled by default (enabled: false).
 */

export type AdPlacement =
  | 'sidebar'
  | 'between-sections'
  | 'library'
  | 'element-page'
  | 'mobile-bottom'
  | 'custom';

export type AdFormat = 'auto' | 'banner' | 'rectangle' | 'responsive' | 'custom';

export type AdFallbackBehavior = 'hidden' | 'placeholder' | 'direct-campaign';

export interface AdSlotConfig {
  id: string;
  placement: AdPlacement;
  enabled: boolean;
  format: AdFormat;
  width: number | 'auto';
  height: number | 'auto';
  label: string;
  fallback: AdFallbackBehavior;
  providerConfig: Record<string, unknown>;
}

export interface AdvertisingConfig {
  enabled: boolean;
  provider: 'none' | 'adsense' | 'direct' | 'custom';
  consentRequired: boolean;
  slots: AdSlotConfig[];
}

export interface AdminConfig {
  version: number;
  branding: Record<string, unknown>;
  theme: Record<string, unknown>;
  header: Record<string, unknown>;
  catalog: Record<string, unknown>;
  contact: Record<string, unknown>;
  advertising: AdvertisingConfig;
  seo: Record<string, unknown>;
  security: Record<string, unknown>;
}

export const DEFAULT_ADVERTISING_CONFIG: AdvertisingConfig = {
  enabled: false,
  provider: 'none',
  consentRequired: true,
  slots: [
    {
      id: 'sidebar-primary',
      placement: 'sidebar',
      enabled: false,
      format: 'rectangle',
      width: 300,
      height: 120,
      label: 'مساحة إعلانية جانبية (تجريبية)',
      fallback: 'placeholder',
      providerConfig: {},
    },
    {
      id: 'between-sections-banner',
      placement: 'between-sections',
      enabled: false,
      format: 'banner',
      width: 'auto',
      height: 90,
      label: 'مساحة إعلانية بين الأقسام (تجريبية)',
      fallback: 'placeholder',
      providerConfig: {},
    },
  ],
};

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  version: 1,
  branding: {
    studioName: 'Beso Studio V2',
    direction: 'rtl',
  },
  theme: {
    defaultTheme: 'emerald-luxury',
  },
  header: {
    showThemeSwitcher: true,
  },
  catalog: {
    showExperimental: true,
  },
  contact: {},
  advertising: DEFAULT_ADVERTISING_CONFIG,
  seo: {},
  security: {},
};
