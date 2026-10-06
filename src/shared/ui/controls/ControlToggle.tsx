/**
 * Beso Studio V2 — Shared ControlToggle Component
 * Accessible toggle switch clearly showing active/inactive state in RTL.
 */

import React, { useId } from 'react';
import { ControlResetButton } from './ControlResetButton';

export interface ControlToggleProps {
  label: string;
  checked: boolean;
  onChange: (nextChecked: boolean) => void;
  onReset?: () => void;
  description?: string;
  activeText?: string;
  inactiveText?: string;
  disabled?: boolean;
  isModified?: boolean;
  testId?: string;
}

export const ControlToggle: React.FC<ControlToggleProps> = ({
  label,
  checked,
  onChange,
  onReset,
  description,
  activeText = 'مفعل',
  inactiveText = 'معطل',
  disabled = false,
  isModified = false,
  testId,
}) => {
  const generatedId = useId();

  return (
    <div
      className="ui-control-field ui-control-toggle-card"
      data-checked={checked}
      data-disabled={disabled}
      data-modified={isModified}
      data-testid={testId}
      dir="rtl"
    >
      <div className="ui-control-toggle-row">
        <div className="ui-control-toggle-info">
          <label htmlFor={generatedId} className="ui-control-field__label">
            {label}
          </label>
          {description && <p className="ui-control-field__description">{description}</p>}
        </div>

        <div className="ui-control-toggle-actions">
          <button
            id={generatedId}
            type="button"
            role="switch"
            aria-checked={checked}
            className="ui-control-switch"
            data-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
          >
            <span className="ui-control-switch__track">
              <span className="ui-control-switch__thumb" />
            </span>
            <span className="ui-control-switch__status">
              {checked ? activeText : inactiveText}
            </span>
          </button>

          {onReset && (
            <ControlResetButton
              onClick={onReset}
              label="إعادة"
              disabled={disabled}
              isModified={isModified}
            />
          )}
        </div>
      </div>
    </div>
  );
};
