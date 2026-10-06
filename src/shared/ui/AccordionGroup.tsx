/**
 * Beso Studio V2 — Accessible Accordion Group Component
 *
 * Implements Requirement 1:
 * - Uses <button type="button" aria-expanded={isOpen} aria-controls={panelId}>
 * - Displays count of modified values per group
 * - Supports group-level reset without affecting other groups
 */

import React from 'react';

export interface AccordionGroupProps {
  groupId: string;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  modifiedCount: number;
  isAdvanced?: boolean;
  onToggle: (groupId: string) => void;
  onResetGroup?: (groupId: string) => void;
  children: React.ReactNode;
}

export const AccordionGroup: React.FC<AccordionGroupProps> = ({
  groupId,
  title,
  subtitle,
  isOpen,
  modifiedCount,
  isAdvanced = false,
  onToggle,
  onResetGroup,
  children,
}) => {
  const buttonId = `accordion-btn-${groupId}`;
  const panelId = `accordion-panel-${groupId}`;

  return (
    <div
      className="studio-accordion-item"
      data-open={isOpen}
      data-advanced={isAdvanced}
      data-group-id={groupId}
    >
      <div className="studio-accordion-header-row">
        <button
          id={buttonId}
          type="button"
          className="studio-accordion-trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(groupId)}
        >
          <span className="studio-accordion-title-wrap">
            <span className="studio-accordion-chevron" aria-hidden="true">
              {isOpen ? '▾' : '◂'}
            </span>
            <span className="studio-accordion-title">{title}</span>
            {subtitle && <span className="studio-accordion-subtitle">· {subtitle}</span>}
          </span>

          <span className="studio-accordion-meta">
            <span
              className="studio-modified-count"
              data-modified={modifiedCount > 0}
              title="عدد القيم المعدلة عن الوضع الافتراضي في هذه المجموعة"
            >
              {modifiedCount > 0 ? `${modifiedCount} معدل` : 'افتراضي (0)'}
            </span>
          </span>
        </button>

        {onResetGroup && modifiedCount > 0 && (
          <button
            type="button"
            className="studio-btn studio-btn-ghost studio-accordion-reset-btn"
            onClick={() => onResetGroup(groupId)}
            title="إعادة ضبط قيم هذه المجموعة فقط دون المساس ببقية المجموعات"
          >
            إعادة ضبط المجموعة
          </button>
        )}
      </div>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="studio-accordion-panel"
      >
        {isOpen && <div className="studio-accordion-body">{children}</div>}
      </div>
    </div>
  );
};
