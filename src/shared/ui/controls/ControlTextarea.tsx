/**
 * Beso Studio V2 — Shared ControlTextarea Component
 * Multi-line text input clearly distinguished from static labels.
 */

import React, { useId } from 'react';
import { ControlField } from './ControlField';

export interface ControlTextareaProps {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  onReset?: () => void;
  description?: string;
  placeholder?: string;
  rows?: number;
  dir?: 'rtl' | 'ltr';
  disabled?: boolean;
  isModified?: boolean;
  fullWidth?: boolean;
  testId?: string;
  textareaTestId?: string;
}

export const ControlTextarea: React.FC<ControlTextareaProps> = ({
  label,
  value,
  onChange,
  onReset,
  description,
  placeholder,
  rows = 3,
  dir = 'rtl',
  disabled = false,
  isModified = false,
  fullWidth = true,
  testId,
  textareaTestId,
}) => {
  const generatedId = useId();

  return (
    <ControlField
      id={generatedId}
      label={label}
      description={description}
      currentValue={`${value.length} حرف`}
      onReset={onReset}
      disabled={disabled}
      isModified={isModified}
      fullWidth={fullWidth}
      testId={testId}
    >
      <textarea
        id={generatedId}
        className="ui-control-textarea"
        rows={rows}
        dir={dir}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        data-testid={textareaTestId}
        onChange={(e) => onChange(e.target.value)}
      />
    </ControlField>
  );
};
