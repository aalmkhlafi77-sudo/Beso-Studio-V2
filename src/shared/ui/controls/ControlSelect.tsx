/**
 * Beso Studio V2 — Shared ControlSelect Component
 * Distinct dropdown select control with custom chevron indicator, current value readout,
 * and independent reset button.
 */

import React, { useId } from 'react';
import { ControlField } from './ControlField';

export interface ControlSelectOption {
  value: string | number;
  label: string;
}

export interface ControlSelectProps {
  label: string;
  value: string | number;
  options: ReadonlyArray<ControlSelectOption>;
  onChange: (nextValue: string) => void;
  onReset?: () => void;
  description?: string;
  unit?: string;
  disabled?: boolean;
  isModified?: boolean;
  fullWidth?: boolean;
  testId?: string;
  selectTestId?: string;
}

export const ControlSelect: React.FC<ControlSelectProps> = ({
  label,
  value,
  options,
  onChange,
  onReset,
  description,
  unit,
  disabled = false,
  isModified = false,
  fullWidth = false,
  testId,
  selectTestId,
}) => {
  const generatedId = useId();
  const activeOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <ControlField
      id={generatedId}
      label={label}
      description={description}
      currentValue={activeOption ? activeOption.label : String(value)}
      unit={unit}
      onReset={onReset}
      disabled={disabled}
      isModified={isModified}
      fullWidth={fullWidth}
      testId={testId}
    >
      <div className="ui-control-select-wrap">
        <select
          id={generatedId}
          className="ui-control-select"
          value={value}
          disabled={disabled}
          data-testid={selectTestId}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="ui-control-select-chevron" aria-hidden="true">
          ▾
        </span>
      </div>
    </ControlField>
  );
};
