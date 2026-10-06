/**
 * Beso Studio V2 — Shared ControlTypographyCard Component (Requirement 5)
 *
 * Dedicated, self-contained editor card for a SINGLE EditableText field so that
 * Title, Description, Number, Percentage, Analysis, ActionLabel, and Badge
 * are NEVER lumped into one confusing shared group.
 *
 * Provides for each text field:
 * 1. إظهار أو إخفاء (visible toggle)
 * 2. النص (value text/textarea)
 * 3. حجم الخط (fontSize range + px)
 * 4. وزن الخط (fontWeight select)
 * 5. نوع الخط (fontFamily select)
 * 6. ارتفاع السطر (lineHeight range)
 * 7. تباعد الحروف (letterSpacing range + px)
 * 8. المحاذاة (align segmented buttons)
 * 9. لون النص (color ControlColor)
 * 10. إعادة ضبط الحقل فقط (ControlResetButton)
 */

import React from 'react';
import { CONTENT_FIELD_LABELS } from '../../../core/controls/controlTypes';
import {
  ContentFieldKey,
  EditableText,
  TextAlignment,
} from '../../../core/state/elementStateTypes';
import { countModifiedInEditableText } from '../../../core/state/workspaceLayoutStore';
import {
  AVAILABLE_FONTS,
  FONT_WEIGHT_OPTIONS,
  TEXT_ALIGNMENT_OPTIONS,
} from '../../typography/typographyTokens';
import { ControlColor } from './ControlColor';
import { ControlRange } from './ControlRange';
import { ControlResetButton } from './ControlResetButton';
import { ControlSelect } from './ControlSelect';
import { ControlTextarea } from './ControlTextarea';
import { ControlTextInput } from './ControlTextInput';
import { ControlToggle } from './ControlToggle';

export interface ControlTypographyCardProps {
  fieldKey: ContentFieldKey;
  customTitle?: string;
  field: EditableText;
  defaultField: EditableText;
  multiline?: boolean;
  onUpdate: (patch: Partial<EditableText>) => void;
  onResetField: () => void;
  testIdPrefix?: string;
}

const FONT_SELECT_OPTIONS = AVAILABLE_FONTS.map((f) => ({
  value: f.cssValue,
  label: f.label,
}));

const WEIGHT_SELECT_OPTIONS = FONT_WEIGHT_OPTIONS.map((w) => ({
  value: typeof w === 'number' ? w : (w as { value: number }).value,
  label: typeof w === 'number' ? `${w}` : (w as { label: string }).label,
}));

export const ControlTypographyCard: React.FC<ControlTypographyCardProps> = ({
  fieldKey,
  customTitle,
  field,
  defaultField,
  multiline = fieldKey === 'description' || fieldKey === 'analysis',
  onUpdate,
  onResetField,
  testIdPrefix = 'field',
}) => {
  const titleLabel = customTitle || CONTENT_FIELD_LABELS[fieldKey];
  const modifiedCount = countModifiedInEditableText(field, defaultField);

  return (
    <div
      className="ui-typography-field-card"
      data-field-key={fieldKey}
      data-modified={modifiedCount > 0}
      data-visible={field.visible}
      data-testid={`${testIdPrefix}-card-${fieldKey}`}
      dir="rtl"
    >
      {/* Card Header: Field Name + Modified Badge + Independent Reset Button */}
      <div className="ui-typography-field-card__header">
        <div className="ui-typography-field-card__title-group">
          <span className="ui-typography-field-card__badge">{fieldKey}</span>
          <h4 className="ui-typography-field-card__title">{titleLabel}</h4>
          {modifiedCount > 0 && (
            <span className="studio-modified-count" data-modified="true">
              {modifiedCount} معدل
            </span>
          )}
        </div>

        <ControlResetButton
          onClick={onResetField}
          label="إعادة ضبط الحقل فقط"
          title={`إعادة ضبط "${titleLabel}" فقط دون المساس ببقية الحقول`}
          isModified={modifiedCount > 0}
          testId={`reset-field-${fieldKey}`}
        />
      </div>

      <div className="ui-typography-field-card__body">
        {/* 1. Visibility Toggle */}
        <ControlToggle
          label={`إظهار ${titleLabel}`}
          checked={field.visible}
          onChange={(nextVisible) => onUpdate({ visible: nextVisible })}
          activeText="ظاهر في المعاينة"
          inactiveText="مخفي"
          isModified={field.visible !== defaultField.visible}
          testId={`${testIdPrefix}-visible-${fieldKey}`}
        />

        {/* 2. Text Content Value */}
        {multiline ? (
          <ControlTextarea
            label={`محتوى ${titleLabel}`}
            value={field.value}
            rows={2}
            disabled={!field.visible}
            isModified={field.value !== defaultField.value}
            onChange={(nextVal) => onUpdate({ value: nextVal })}
            onReset={() => onUpdate({ value: defaultField.value })}
            textareaTestId={`input-value-${fieldKey}`}
          />
        ) : (
          <ControlTextInput
            label={`نص ${titleLabel}`}
            value={field.value}
            disabled={!field.visible}
            isModified={field.value !== defaultField.value}
            onChange={(nextVal) => onUpdate({ value: nextVal })}
            onReset={() => onUpdate({ value: defaultField.value })}
            inputTestId={`input-value-${fieldKey}`}
          />
        )}

        {/* 3. Text Color (Real ControlColor Picker) */}
        <ControlColor
          label={`لون ${titleLabel}`}
          value={field.color}
          disabled={!field.visible}
          isModified={field.color !== defaultField.color}
          onChange={(nextColor) => onUpdate({ color: nextColor })}
          onReset={() => onUpdate({ color: defaultField.color })}
          testId={`color-control-${fieldKey}`}
          colorInputTestId={`color-picker-${fieldKey}`}
          hexInputTestId={`color-hex-${fieldKey}`}
        />

        {/* 4. Font Family & Font Weight */}
        <div className="ui-control-grid-2">
          <ControlSelect
            label="نوع الخط (Font Family)"
            value={field.fontFamily}
            options={FONT_SELECT_OPTIONS}
            disabled={!field.visible}
            isModified={field.fontFamily !== defaultField.fontFamily}
            onChange={(nextFont) => onUpdate({ fontFamily: nextFont })}
            onReset={() => onUpdate({ fontFamily: defaultField.fontFamily })}
            selectTestId={`font-family-${fieldKey}`}
          />

          <ControlSelect
            label="وزن الخط (Font Weight)"
            value={field.fontWeight}
            options={WEIGHT_SELECT_OPTIONS}
            disabled={!field.visible}
            isModified={field.fontWeight !== defaultField.fontWeight}
            onChange={(nextWeight) => onUpdate({ fontWeight: Number(nextWeight) })}
            onReset={() => onUpdate({ fontWeight: defaultField.fontWeight })}
            selectTestId={`font-weight-${fieldKey}`}
          />
        </div>

        {/* 5. Font Size & Line Height */}
        <div className="ui-control-grid-2">
          <ControlRange
            label="حجم الخط (Font Size)"
            value={field.fontSize}
            min={10}
            max={72}
            step={1}
            unit="px"
            disabled={!field.visible}
            isModified={field.fontSize !== defaultField.fontSize}
            onChange={(nextSize) => onUpdate({ fontSize: nextSize })}
            onReset={() => onUpdate({ fontSize: defaultField.fontSize })}
            rangeTestId={`font-size-range-${fieldKey}`}
            numberTestId={`font-size-number-${fieldKey}`}
          />

          <ControlRange
            label="ارتفاع السطر (Line Height)"
            value={field.lineHeight}
            min={1}
            max={2.4}
            step={0.05}
            unit=""
            disabled={!field.visible}
            isModified={field.lineHeight !== defaultField.lineHeight}
            onChange={(nextLh) => onUpdate({ lineHeight: Number(nextLh.toFixed(2)) })}
            onReset={() => onUpdate({ lineHeight: defaultField.lineHeight })}
          />
        </div>

        {/* 6. Letter Spacing & Text Alignment */}
        <div className="ui-control-grid-2">
          <ControlRange
            label="تباعد الحروف (Letter Spacing)"
            value={field.letterSpacing}
            min={-2}
            max={12}
            step={0.5}
            unit="px"
            disabled={!field.visible}
            isModified={field.letterSpacing !== defaultField.letterSpacing}
            onChange={(nextLs) => onUpdate({ letterSpacing: nextLs })}
            onReset={() => onUpdate({ letterSpacing: defaultField.letterSpacing })}
          />

          <div
            className="ui-control-field"
            data-disabled={!field.visible}
            data-modified={field.align !== defaultField.align}
          >
            <div className="ui-control-field__header">
              <div className="ui-control-field__title-group">
                <span className="ui-control-field__label">المحاذاة (Alignment)</span>
                <span className="ui-control-field__value-badge">{field.align}</span>
              </div>
              <ControlResetButton
                onClick={() => onUpdate({ align: defaultField.align })}
                label="إعادة"
                disabled={!field.visible}
                isModified={field.align !== defaultField.align}
              />
            </div>
            <div className="ui-control-segmented" role="group" aria-label={`محاذاة ${titleLabel}`}>
              {TEXT_ALIGNMENT_OPTIONS.map((alignOpt) => (
                <button
                  key={alignOpt.value}
                  type="button"
                  className="ui-control-segmented__btn"
                  data-active={field.align === alignOpt.value}
                  disabled={!field.visible}
                  onClick={() => onUpdate({ align: alignOpt.value as TextAlignment })}
                >
                  {alignOpt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
