/**
 * Beso Studio V2 — Shared ControlResetButton Component
 * Calm, distinct reset button (`studio-btn-reset`) that resets only the target field/group
 * without affecting sibling properties.
 */

import React from 'react';

export interface ControlResetButtonProps {
  onClick: () => void;
  label?: string;
  title?: string;
  disabled?: boolean;
  isModified?: boolean;
  testId?: string;
}

export const ControlResetButton: React.FC<ControlResetButtonProps> = ({
  onClick,
  label = 'إعادة ضبط',
  title = 'إعادة ضبط هذا الحقل فقط إلى قيمته الافتراضية',
  disabled = false,
  isModified = false,
  testId,
}) => {
  return (
    <button
      type="button"
      className="studio-btn studio-btn-reset"
      data-modified={isModified}
      disabled={disabled}
      title={title}
      data-testid={testId}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span className="studio-btn-reset__icon" aria-hidden="true">
        ↺
      </span>
      <span className="studio-btn-reset__text">{label}</span>
    </button>
  );
};
