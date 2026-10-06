/**
 * Beso Studio V2 — Element Module Contract & Pure Immutable Registry
 * Strictly satisfies Requirement 3 & 7 and Sections 5 & 7 of the Architectural Reference.
 *
 * Notice:
 * - Zero global mutable state: Registry instances are immutable objects created via pure functions.
 * - Contains metadata and module references only; contains zero centralized generation logic.
 */

import { ControlDefinition } from '../controls/controlTypes';
import { ExportBundle } from '../export/exportBundle';
import { IndependentElementState } from '../state/elementStateTypes';
import { ElementFamily } from '../templates/templateTypes';
import { ValidationResult } from '../validation/validator';

export type ElementRegistryStatus = 'stable' | 'experimental' | 'deprecated' | 'hidden';

/**
 * Mandatory 9 Library Categories + 'all' filter
 */
export type LibraryCategoryId =
  | 'controls'
  | 'cards'
  | 'media-showcase'
  | 'sections'
  | 'backgrounds-effects'
  | 'navigation-forms'
  | 'identity-social'
  | 'imported-elements'
  | 'templates';

export type LibraryCategoryFilterId = 'all' | LibraryCategoryId;

export type ElementOriginGroup = 'native' | 'imported' | 'template';

export interface LibraryCategoryDefinition {
  id: LibraryCategoryId;
  order: number;
  labelAr: string;
  labelEn: string;
  examplesText: string;
  originGroup: ElementOriginGroup;
}

export const LIBRARY_CATEGORIES: readonly LibraryCategoryDefinition[] = Object.freeze([
  {
    id: 'controls',
    order: 1,
    labelAr: '1. عناصر التحكم',
    labelEn: 'Controls',
    examplesText: 'Button، Toggle، Switch، Icon Button',
    originGroup: 'native',
  },
  {
    id: 'cards',
    order: 2,
    labelAr: '2. البطاقات',
    labelEn: 'Cards',
    examplesText: 'Card، Pricing Card، Media Card، Brand Card',
    originGroup: 'native',
  },
  {
    id: 'media-showcase',
    order: 3,
    labelAr: '3. الصور والعروض',
    labelEn: 'Media & Showcases',
    examplesText: 'Carousel، Slider، Gallery، Image Switcher',
    originGroup: 'native',
  },
  {
    id: 'sections',
    order: 4,
    labelAr: '4. الأقسام',
    labelEn: 'Sections',
    examplesText: 'Hero، Promo Section، Stats Section، Content Section',
    originGroup: 'native',
  },
  {
    id: 'backgrounds-effects',
    order: 5,
    labelAr: '5. الخلفيات والمؤثرات',
    labelEn: 'Backgrounds & Effects',
    examplesText: 'Gradient، Glass، Metal، Neon، Particles، Aurora',
    originGroup: 'native',
  },
  {
    id: 'navigation-forms',
    order: 6,
    labelAr: '6. التنقل والنماذج',
    labelEn: 'Navigation & Forms',
    examplesText: 'Navigation، Tabs، Login، Register، Contact Form',
    originGroup: 'native',
  },
  {
    id: 'identity-social',
    order: 7,
    labelAr: '7. الهوية والتواصل',
    labelEn: 'Identity & Social',
    examplesText: 'Brand Identity، Social Dock، Social Buttons',
    originGroup: 'native',
  },
  {
    id: 'imported-elements',
    order: 8,
    labelAr: '8. العناصر المستوردة',
    labelEn: 'Imported Elements',
    examplesText: 'Imported HTML/CSS Components',
    originGroup: 'imported',
  },
  {
    id: 'templates',
    order: 9,
    labelAr: '9. القوالب',
    labelEn: 'Templates',
    examplesText: 'Login Template، Product Template، Hero Template',
    originGroup: 'template',
  },
]);

export interface ElementMetadata {
  label: string;
  description: string;
  family: ElementFamily;
  category?: LibraryCategoryId;
  tags?: string[];
  originGroup?: ElementOriginGroup;
  sortOrder?: number;
  categories: string[];
  status: ElementRegistryStatus;
  author?: string;
  isProductionReady: boolean;
}

export interface ElementCapabilities {
  responsive: boolean;
  usesImages: boolean;
  usesJavaScript: boolean;
  supportsSlots: boolean;
}

export interface RenderInput<TState = IndependentElementState> {
  instanceId: string;
  scopeId: string;
  state: TState;
}

export interface PreviewResult {
  instanceId: string;
  scopeId: string;
  html: string;
  css: string;
  dimensionsSummary: {
    widthCss: string;
    heightCss: string;
  };
}

/**
 * Unified ElementModule Contract (Requirement 3 + Architectural Doc Section 5)
 */
export interface ElementModule<TState = IndependentElementState> {
  id: string;
  type: string;
  version: number;
  family: ElementFamily;
  label: string;
  description: string;
  metadata: ElementMetadata;
  capabilities: ElementCapabilities;

  defaultState: TState;
  controlSchema: ControlDefinition[];

  sanitizeState(state: unknown): TState;
  validate(state: TState): ValidationResult;

  generateHtml(input: RenderInput<TState>): string;
  generateCss(input: RenderInput<TState>): string;
  renderPreview(input: RenderInput<TState>): PreviewResult;
  generateCode(input: RenderInput<TState>): ExportBundle;
}

export interface RegisteredElementEntry<TState = IndependentElementState> {
  id: string;
  family: ElementFamily;
  category?: LibraryCategoryId;
  tags?: string[];
  originGroup?: ElementOriginGroup;
  sortOrder?: number;
  categories: string[];
  status: ElementRegistryStatus;
  module: ElementModule<TState>;
}

export interface ElementRegistry {
  readonly entries: Readonly<Record<string, RegisteredElementEntry>>;
}

export function createEmptyRegistry(): ElementRegistry {
  return Object.freeze({
    entries: Object.freeze({}),
  });
}

/**
 * Resolves the primary LibraryCategoryId from an entry's metadata without hardcoding in AppShell.
 */
export function resolveElementPrimaryCategory(entry: RegisteredElementEntry): LibraryCategoryId {
  if (entry.category) {
    return entry.category;
  }
  if (entry.module.metadata.category) {
    return entry.module.metadata.category;
  }

  // Fallback mapping based on family/categories metadata for legacy/unmodified modules (e.g. Card)
  if (entry.id === 'card' || entry.categories.includes('cards')) {
    return 'cards';
  }
  if (entry.family === 'imported' || entry.categories.includes('imported')) {
    return 'imported-elements';
  }
  if (entry.family === 'controls' || entry.family === 'probe') {
    return 'controls';
  }
  if (entry.family === 'media') {
    return 'media-showcase';
  }
  if (entry.family === 'sections') {
    return 'sections';
  }
  if (entry.family === 'backgrounds') {
    return 'backgrounds-effects';
  }
  return 'controls';
}

export function resolveElementOriginGroup(entry: RegisteredElementEntry): ElementOriginGroup {
  if (entry.originGroup) {
    return entry.originGroup;
  }
  if (entry.module.metadata.originGroup) {
    return entry.module.metadata.originGroup;
  }
  const cat = resolveElementPrimaryCategory(entry);
  if (cat === 'imported-elements') {
    return 'imported';
  }
  if (cat === 'templates') {
    return 'template';
  }
  return 'native';
}

export function resolveElementTags(entry: RegisteredElementEntry): string[] {
  const raw = entry.tags || entry.module.metadata.tags || entry.categories || [];
  return Array.from(new Set(raw));
}

/**
 * Deterministic sorting of elements independent of the order they were added to the Registry.
 */
export function sortRegisteredElementsDeterministically(
  entries: RegisteredElementEntry[]
): RegisteredElementEntry[] {
  const categoryOrderMap = new Map<LibraryCategoryId, number>(
    LIBRARY_CATEGORIES.map((c) => [c.id, c.order])
  );

  return [...entries].sort((a, b) => {
    const catA = resolveElementPrimaryCategory(a);
    const catB = resolveElementPrimaryCategory(b);
    const catOrderA = categoryOrderMap.get(catA) ?? 99;
    const catOrderB = categoryOrderMap.get(catB) ?? 99;
    if (catOrderA !== catOrderB) {
      return catOrderA - catOrderB;
    }

    const sortA = a.sortOrder ?? a.module.metadata.sortOrder ?? 50;
    const sortB = b.sortOrder ?? b.module.metadata.sortOrder ?? 50;
    if (sortA !== sortB) {
      return sortA - sortB;
    }

    return a.id.localeCompare(b.id, 'en');
  });
}

/**
 * Pure function that returns a new immutable ElementRegistry with the added entry.
 */
export function registerElement(
  registry: ElementRegistry,
  entry: RegisteredElementEntry
): ElementRegistry {
  if (!entry.id || !entry.module || entry.id !== entry.module.id) {
    throw new Error('Invalid element registration: id mismatch or missing module.');
  }

  const normalizedEntry: RegisteredElementEntry = {
    ...entry,
    category: resolveElementPrimaryCategory(entry),
    originGroup: resolveElementOriginGroup(entry),
    tags: resolveElementTags(entry),
  };

  const nextEntries: Record<string, RegisteredElementEntry> = {
    ...registry.entries,
    [entry.id]: Object.freeze(normalizedEntry),
  };

  return Object.freeze({
    entries: Object.freeze(nextEntries),
  });
}

export function getElementEntry(
  registry: ElementRegistry,
  elementId: string
): RegisteredElementEntry | undefined {
  return registry.entries[elementId];
}

export function getElementModule(
  registry: ElementRegistry,
  elementId: string
): ElementModule | undefined {
  return registry.entries[elementId]?.module;
}

export function listRegisteredElements(
  registry: ElementRegistry,
  filterStatus?: ElementRegistryStatus
): RegisteredElementEntry[] {
  const all = sortRegisteredElementsDeterministically(Object.values(registry.entries));
  if (!filterStatus) {
    return all;
  }
  return all.filter((item) => item.status === filterStatus);
}

/**
 * Pure helper to filter registered elements by category ('all' or specific category) and search query.
 */
export function queryRegistryElements(
  registry: ElementRegistry,
  categoryFilter: LibraryCategoryFilterId = 'all',
  searchQuery = ''
): RegisteredElementEntry[] {
  const sorted = listRegisteredElements(registry).filter((e) => e.status !== 'hidden');
  const byCategory =
    categoryFilter === 'all'
      ? sorted
      : sorted.filter((entry) => resolveElementPrimaryCategory(entry) === categoryFilter);

  const q = searchQuery.trim().toLowerCase();
  if (!q) {
    return byCategory;
  }

  return byCategory.filter((entry) => {
    const labelMatch = entry.module.label.toLowerCase().includes(q);
    const idMatch = entry.id.toLowerCase().includes(q);
    const descMatch = entry.module.description.toLowerCase().includes(q);
    const tags = resolveElementTags(entry);
    const tagMatch = tags.some((t) => t.toLowerCase().includes(q));
    return labelMatch || idMatch || descMatch || tagMatch;
  });
}

/**
 * Pure helper that computes element counts for 'all' and each of the 9 mandatory Library categories.
 */
export function countElementsByCategory(
  registry: ElementRegistry
): Record<LibraryCategoryFilterId, number> {
  const visible = listRegisteredElements(registry).filter((e) => e.status !== 'hidden');
  const counts: Record<LibraryCategoryFilterId, number> = {
    all: visible.length,
    controls: 0,
    cards: 0,
    'media-showcase': 0,
    sections: 0,
    'backgrounds-effects': 0,
    'navigation-forms': 0,
    'identity-social': 0,
    'imported-elements': 0,
    templates: 0,
  };

  for (const entry of visible) {
    const cat = resolveElementPrimaryCategory(entry);
    counts[cat] = (counts[cat] || 0) + 1;
  }

  return counts;
}
