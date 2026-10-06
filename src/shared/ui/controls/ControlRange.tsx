/**
 * Beso Studio V2 — Shared ControlRange Component
 * Combines a tactile range slider with a direct numeric input, unit badge,
 * and independent reset button.
 */

import React, { useId } from 'react';
import { ControlField } from './ControlField';

export interface ControlRangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  description?: string;
  onChange: (nextValue: number) => void;
  onReset?: () => void;
  disabled?: boolean;
  isModified?: boolean;
  fullWidth?: boolean;
  testId?: string;
  rangeTestId?: string;
  numberTestId?: string;
}

export const ControlRange: React.FC<ControlRangeProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'px',
  description,
  onChange,
  onReset,
  disabled = false,
  isModified = false,
  fullWidth = false,
  testId,
  rangeTestId,
  numberTestId,
}) => {
  const generatedId = useId();
  const safeValue = Number.isFinite(value) ? value : min;
  const pct =
    max > min ? Math.min(100, Math.max(0, ((safeValue - min) / (max - min)) * 100)) : 0;

  return (
    <ControlField
      id={generatedId}
      label={label}
      description={description}
      currentValue={safeValue}
      unit={unit}
      onReset={onReset}
      disabled={disabled}
      isModified={isModified}
      fullWidth={fullWidth}
      testId={testId}
    >
      <div className="ui-control-range-row">
        <div className="ui-control-range-slider-wrap">
          <input
            id={generatedId}
            type="range"
            className="ui-control-range"
            min={min}
            max={max}
            step={step}
            value={safeValue}
            disabled={disabled}
            data-testid={rangeTestId}
            style={{ '--range-progress': `${pct}%` } as React.CSSProperties}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              if (Number.isFinite(parsed)) {
                onChange(parsed);
              }
            }}
          />
        </div>

        <div className="ui-control-range-number-wrap">
          <input
            type="number"
            className="ui-control-input ui-control-range-number"
            aria-label={`${label} (قيمة رقمية)`}
            min={min}
            max={max}
            step={step}
            value={safeValue}
            disabled={disabled}
            data-testid={numberTestId}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              if (Number.isFinite(parsed)) {
                onChange(parsed);
              }
            }}
          />
          {unit && (
            <span className="ui-control-range-unit" dir="ltr">
              {unit}
            </span>
          )}
        </div>
      </div>
    </ControlField>
  );
};
