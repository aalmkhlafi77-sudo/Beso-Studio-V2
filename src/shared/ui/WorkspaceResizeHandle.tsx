/**
 * Beso Studio V2 — Lightweight Native Workspace Resize Handle
 *
 * Implements Requirement 4:
 * - Vertical handle between Controls column and Preview/Stage column.
 * - Horizontal handle below PreviewStage to resize previewHeight.
 * - Uses native Pointer Events (no external libraries).
 * - Supports keyboard navigation via Arrow keys and Shift+Arrow.
 * - Displays live measurement readout while dragging or focused.
 * - Strictly isolated from element dimensions (never modifies element width/height).
 */

import React, { useRef, useState } from 'react';

export interface WorkspaceResizeHandleProps {
  orientation: 'vertical' | 'horizontal';
  label: string;
  value: number;
  min: number;
  max: number;
  measurementText: string;
  onChange: (nextValue: number) => void;
  onReset?: () => void;
}

export const WorkspaceResizeHandle: React.FC<WorkspaceResizeHandleProps> = ({
  orientation,
  label,
  value,
  min,
  max,
  measurementText,
  onChange,
  onReset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dragStartRef = useRef<{ startCoord: number; startValue: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      startCoord: orientation === 'vertical' ? e.clientX : e.clientY,
      startValue: value,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) {
      return;
    }

    if (orientation === 'vertical') {
      // In RTL layout, the Controls column sits on the right side.
      // Moving pointer to the left (smaller clientX) increases controlsWidth.
      const deltaX = dragStartRef.current.startCoord - e.clientX;
      onChange(dragStartRef.current.startValue + deltaX);
    } else {
      // Horizontal handle: moving pointer down (larger clientY) increases previewHeight.
      const deltaY = e.clientY - dragStartRef.current.startCoord;
      onChange(dragStartRef.current.startValue + deltaY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture already released
      }
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 32 : 10;

    if (orientation === 'vertical') {
      // In RTL: ArrowLeft expands right-side controls column; ArrowRight shrinks it.
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onChange(value + step);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onChange(value - step);
      }
    } else {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onChange(value + step);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onChange(value - step);
      }
    }

    if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  const showReadout = isDragging || isFocused;

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={orientation}
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      data-orientation={orientation}
      data-dragging={isDragging}
      className={`studio-resize-handle studio-resize-handle--${orientation}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={onReset}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
      title={`${label} — اسحب بالماوس أو استخدم الأسهم (مع Shift لخطوة أكبر)`}
    >
      <div className="studio-resize-grip" aria-hidden="true" />
      {showReadout && (
        <div className="studio-resize-readout" role="status" aria-live="polite">
          {measurementText}
        </div>
      )}
    </div>
  );
};
