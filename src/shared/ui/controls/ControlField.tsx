/**
 * Beso Studio V2 — Shared ControlField Wrapper Component
 * Provides a distinct visual container for any Inspector control with:
 * - Clear label
 * - Optional description
 * - Current value readout + unit badge
 * - Independent reset button
 * - Full RTL support
 */

import React from 'react';
import { ControlResetButton } from './ControlResetButton';

export interface ControlFieldProps {
  id?: string;
  label: string;
  description?: string;
  currentValue?: string | number;
  unit?: string;
  onReset?: () => void;
  resetLabel?: string;
  resetTitle?: string;
  disabled?: boolean;
  isModified?: boolean;
  fullWidth?: boolean;
  testId?: string;
  children: React.ReactNode;
}

export const ControlField: React.FC<ControlFieldProps> = ({
  id,
  label,
  description,
  currentValue,
  unit,
  onReset,
  resetLabel = 'إعادة',
  resetTitle,
  disabled = false,
  isModified = false,
  fullWidth = false,
  testId,
  children,
}) => {
  const hasValueReadout = currentValue !== undefined && currentValue !== '';

  return (
    <div
      className="ui-control-field"
      data-disabled={disabled}
      data-modified={isModified}
      data-full-width={fullWidth}
      data-testid={testId}
      dir="rtl"
    >
      <div className="ui-control-field__header">
        <div className="ui-control-field__title-group">
          {id ? (
            <label htmlFor={id} className="ui-control-field__label">
              {label}
            </label>
          ) : (
            <span className="ui-control-field__label">{label}</span>
          )}
          {hasValueReadout && (
            <span className="ui-control-field__value-badge" dir="ltr">
              {currentValue}
              {unit ? ` ${unit}` : ''}
            </span>
          )}
        </div>

        {onReset && (
          <ControlResetButton
            onClick={onReset}
            label={resetLabel}
            title={resetTitle || `إعادة ضبط "${label}" إلى القيمة الافتراضية`}
            disabled={disabled}
            isModified={isModified}
          />
        )}
      </div>

      {description && <p className="ui-control-field__description">{description}</p>}

      <div className="ui-control-field__body">{children}</div>
    </div>
  );
};
