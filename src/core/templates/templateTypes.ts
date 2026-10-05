/**
 * Beso Studio V2 — Composition Template & Slot Contracts
 * Defines the slot rules so future templates (Phase 3) compose elements via public contracts
 * without copying internal element logic or CSS.
 */

export type ElementFamily =
  | 'controls'
  | 'content'
  | 'media'
  | 'sections'
  | 'backgrounds'
  | 'imported'
  | 'probe';

export interface TemplateSlotRule {
  id: string;
  label: string;
  accepts: string[];
  required?: boolean;
}

export interface CompositionTemplateContract {
  id: string;
  label: string;
  description: string;
  slots: Record<string, TemplateSlotRule>;
}
