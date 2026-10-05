/**
 * Beso Studio V2 — Declarative Control Schema Types
 * Each element module declares its control schema so the Inspector does not hardcode
 * per-element logic in a monolithic editor.
 */

import {
  ContentFieldKey,
  EditableIcon,
  EditableText,
  IndependentDimensions,
  DeclaredSurfaceTokens,
} from '../state/elementStateTypes';

export type ControlSectionId = 'content' | 'icon' | 'dimensions' | 'appearance';

export type ControlFieldType =
  | 'editable-text'
  | 'icon-config'
  | 'dimension-config'
  | 'color'
  | 'range'
  | 'select'
  | 'boolean'
  | 'text';

export interface ControlDefinition {
  id: string;
  type: ControlFieldType;
  section: ControlSectionId;
  label: string;
  description?: string;
  targetKey:
    | ContentFieldKey
    | keyof EditableIcon
    | keyof IndependentDimensions
    | keyof DeclaredSurfaceTokens;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ value: string; label: string }>;
}

export const CONTENT_FIELD_LABELS: Record<ContentFieldKey, string> = {
  title: 'العنوان الرئيسي (title)',
  description: 'الوصف التفصيلي (description)',
  number: 'الرقم المستقل (number)',
  percentage: 'النسبة المستقلة (percentage)',
  analysis: 'النص التحليلي (analysis)',
  actionLabel: 'نص زر الإجراء (actionLabel)',
  badge: 'نص الوسم (badge)',
};

export const EDITABLE_TEXT_PROPERTY_LABELS: Record<keyof EditableText, string> = {
  value: 'النص الظاهر',
  visible: 'إظهار الحقل',
  color: 'لون النص',
  fontFamily: 'عائلة الخط',
  fontSize: 'حجم الخط (px)',
  fontWeight: 'وزن الخط',
  lineHeight: 'ارتفاع السطر',
  letterSpacing: 'تباعد الأحرف (px)',
  align: 'محاذاة النص',
};
