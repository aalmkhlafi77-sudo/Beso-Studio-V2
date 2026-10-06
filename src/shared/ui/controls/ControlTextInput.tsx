/**
 * Beso Studio V2 — Shared ControlTextInput Component
 * Distinct text/number input field with label, optional description, current value badge,
 * optional unit, and independent reset button.
 */

import React, { useId } from 'react';
import { ControlField } from './ControlField';

export interface ControlTextInputProps {
  label: string;
  value: string | number;
  onChange: (nextValue: string) => void;
  onReset?: () => void;
  description?: string;
  placeholder?: string;
  unit?: string;
  type?: 'text' | 'url' | 'email' | 'search' | 'number';
  dir?: 'rtl' | 'ltr';
  disabled?: boolean;
  isModified?: boolean;
  fullWidth?: boolean;
  testId?: string;
  inputTestId?: string;
}

export const ControlTextInput: React.FC<ControlTextInputProps> = ({
  label,
  value,
  onChange,
  onReset,
  description,
  placeholder,
  unit,
  type = 'text',
  dir = 'rtl',
  disabled = false,
  isModified = false,
  fullWidth = false,
  testId,
  inputTestId,
}) => {
  const generatedId = useId();

  return (
    <ControlField
      id={generatedId}
      label={label}
      description={description}
      currentValue={unit ? value : undefined}
      unit={unit}
      onReset={onReset}
      disabled={disabled}
      isModified={isModified}
      fullWidth={fullWidth}
      testId={testId}
    >
      <div className="ui-control-input-wrap">
        <input
          id={generatedId}
          type={type}
          className="ui-control-input"
          dir={dir}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          data-testid={inputTestId}
          onChange={(e) => onChange(e.target.value)}
        />
        {unit && (
          <span className="ui-control-input-unit" dir="ltr">
            {unit}
          </span>
        )}
      </div>
    </ControlField>
  );
};
