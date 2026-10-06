/**
 * Beso Studio V2 — Shared ControlSection Component
 * Wraps a logical section of controls with a clear heading, subtitle, modified count badge,
 * and section-level reset button.
 */

import React from 'react';
import { ControlResetButton } from './ControlResetButton';

export interface ControlSectionProps {
  title: string;
  subtitle?: string;
  modifiedCount?: number;
  onResetSection?: () => void;
  resetLabel?: string;
  testId?: string;
  children: React.ReactNode;
}

export const ControlSection: React.FC<ControlSectionProps> = ({
  title,
  subtitle,
  modifiedCount = 0,
  onResetSection,
  resetLabel = 'إعادة ضبط القسم',
  testId,
  children,
}) => {
  return (
    <section className="ui-control-section" data-testid={testId} dir="rtl">
      <div className="ui-control-section__header">
        <div className="ui-control-section__titles">
          <div className="ui-control-section__title-row">
            <h3 className="ui-control-section__title">{title}</h3>
            {modifiedCount > 0 && (
              <span className="studio-modified-count" data-modified="true">
                {modifiedCount} معدل
              </span>
            )}
          </div>
          {subtitle && <p className="ui-control-section__subtitle">{subtitle}</p>}
        </div>

        {onResetSection && (
          <ControlResetButton
            onClick={onResetSection}
            label={resetLabel}
            isModified={modifiedCount > 0}
          />
        )}
      </div>

      <div className="ui-control-section__body">{children}</div>
    </section>
  );
};
