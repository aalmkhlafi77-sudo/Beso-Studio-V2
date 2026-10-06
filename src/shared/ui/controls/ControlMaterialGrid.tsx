/**
 * Beso Studio V2 — Shared ControlMaterialGrid Component (Requirement 7)
 *
 * Displays surface materials as visual selection cards with live miniature previews:
 * - Solid
 * - Gradient
 * - Glass
 * - Metal
 * - Ivory
 * - Neon
 * - Dark
 * - Image
 * - Pattern
 *
 * Never relies on a text-only dropdown alone.
 */

import React from 'react';
import { CardMaterialType } from '../../../core/state/elementStateTypes';
import { ControlField } from './ControlField';

export interface MaterialCardOption<T extends string = CardMaterialType> {
  value: T;
  labelAr: string;
  labelEn: string;
  shortDesc: string;
}

export const ALL_SURFACE_MATERIAL_CARDS: ReadonlyArray<MaterialCardOption<CardMaterialType>> = [
  {
    value: 'solid',
    labelAr: 'لون مصمت',
    labelEn: 'Solid',
    shortDesc: 'خلفية موحدة بلون أساسي صريح',
  },
  {
    value: 'gradient',
    labelAr: 'تدرج لوني',
    labelEn: 'Gradient',
    shortDesc: 'مزج انسيابي بين اللونين الأساسي والثانوي',
  },
  {
    value: 'glass',
    labelAr: 'زجاج ضبابي',
    labelEn: 'Glass',
    shortDesc: 'شفافية بلورية مع ضبابية الخلفية',
  },
  {
    value: 'metal',
    labelAr: 'معدن مصقول',
    labelEn: 'Metal',
    shortDesc: 'انعكاس معدني متدرج متعدد الطبقات',
  },
  {
    value: 'ivory',
    labelAr: 'عاجي لؤلؤي',
    labelEn: 'Ivory',
    shortDesc: 'سطح عاجي دافئ ناعم الإضاءة',
  },
  {
    value: 'neon',
    labelAr: 'نيون متوهج',
    labelEn: 'Neon',
    shortDesc: 'إطار مضيء وهالة توهج عالية التباين',
  },
  {
    value: 'dark',
    labelAr: 'داكن فاخر',
    labelEn: 'Dark',
    shortDesc: 'عمق ليلي فحمي بلمسة ذهبية هادئة',
  },
  {
    value: 'image',
    labelAr: 'خلفية مصورة',
    labelEn: 'Image',
    shortDesc: 'صورة خلفية مخصصة مع طبقة تظليل',
  },
  {
    value: 'pattern',
    labelAr: 'نقش هندسي',
    labelEn: 'Pattern',
    shortDesc: 'زخرفة هندسية متكررة فوق اللون الأساسي',
  },
];

export interface ControlMaterialGridProps<T extends string = CardMaterialType> {
  label?: string;
  value: T;
  options?: ReadonlyArray<MaterialCardOption<T>>;
  onChange: (nextMaterial: T) => void;
  onReset?: () => void;
  isModified?: boolean;
  testId?: string;
}

export function ControlMaterialGrid<T extends string = CardMaterialType>({
  label = 'نوع الخامة البصرية (Surface Material)',
  value,
  options = ALL_SURFACE_MATERIAL_CARDS as unknown as ReadonlyArray<MaterialCardOption<T>>,
  onChange,
  onReset,
  isModified = false,
  testId = 'control-material-grid',
}: ControlMaterialGridProps<T>) {
  const activeOption = options.find((o) => o.value === value);

  return (
    <ControlField
      label={label}
      description="اختر الخامة مباشرة من البطاقات المرئية أدناه لمعاينتها وتطبيقها فورًا."
      currentValue={activeOption ? `${activeOption.labelAr} (${activeOption.labelEn})` : value}
      onReset={onReset}
      isModified={isModified}
      fullWidth
      testId={testId}
    >
      <div
        className="ui-material-grid"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((mat) => {
          const isSelected = mat.value === value;
          return (
            <button
              key={mat.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className="ui-material-card"
              data-selected={isSelected}
              data-material={mat.value}
              data-testid={`material-card-${mat.value}`}
              onClick={() => onChange(mat.value)}
            >
              {/* Miniature Visual Swatch Preview of the Material */}
              <div
                className={`ui-material-card__swatch ui-material-card__swatch--${mat.value}`}
                aria-hidden="true"
              >
                <span className="ui-material-card__swatch-badge">{mat.labelEn}</span>
              </div>

              <div className="ui-material-card__info">
                <div className="ui-material-card__title-row">
                  <strong className="ui-material-card__title">{mat.labelAr}</strong>
                  {isSelected && (
                    <span className="ui-material-card__active-dot" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
                <span className="ui-material-card__desc">{mat.shortDesc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </ControlField>
  );
}
