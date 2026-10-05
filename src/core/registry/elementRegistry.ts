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

export interface ElementMetadata {
  label: string;
  description: string;
  family: ElementFamily;
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
 * Pure function that returns a new immutable ElementRegistry with the added entry.
 */
export function registerElement(
  registry: ElementRegistry,
  entry: RegisteredElementEntry
): ElementRegistry {
  if (!entry.id || !entry.module || entry.id !== entry.module.id) {
    throw new Error('Invalid element registration: id mismatch or missing module.');
  }

  const nextEntries: Record<string, RegisteredElementEntry> = {
    ...registry.entries,
    [entry.id]: Object.freeze({ ...entry }),
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
  const all = Object.values(registry.entries);
  if (!filterStatus) {
    return all;
  }
  return all.filter((item) => item.status === filterStatus);
}
