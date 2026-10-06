/**
 * Beso Studio V2 — Shared ControlFile Component for Image Upload (Requirement 4)
 *
 * Includes:
 * - Distinct upload button (`.studio-btn-upload`)
 * - Drag and drop zone (`onDragOver`, `onDragLeave`, `onDrop`)
 * - Live image preview thumbnail
 * - Replace image button (`استبدال الصورة`)
 * - Delete image button (`.studio-btn-danger` — `حذف الصورة`)
 * - Optional external image URL input
 * - Validation error message for unsupported file type or oversized file
 * - Zero image loss when other element settings change
 */

import React, { useId, useRef, useState } from 'react';
import { ControlField } from './ControlField';

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'image/avif',
];

export interface ControlFileProps {
  label: string;
  value: string;
  onChange: (nextImageUrl: string) => void;
  onReset?: () => void;
  defaultPreviewUrl?: string;
  description?: string;
  maxSizeBytes?: number;
  disabled?: boolean;
  isModified?: boolean;
  fullWidth?: boolean;
  testId?: string;
}

export function validateUploadedImageFile(
  file: { name: string; type: string; size: number },
  maxSizeBytes = 5 * 1024 * 1024
): { valid: boolean; errorMessage: string | null } {
  const isImageMime =
    ALLOWED_IMAGE_MIME_TYPES.includes(file.type) || file.type.startsWith('image/');
  if (!isImageMime) {
    return {
      valid: false,
      errorMessage: `نوع الملف "${file.name}" غير مدعوم. يرجى اختيار صورة بصيغة PNG أو JPG أو WebP أو SVG.`,
    };
  }
  if (file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      errorMessage: `حجم الصورة كبير جدًا (${(file.size / (1024 * 1024)).toFixed(2)}MB). الحد الأقصى المسموح به هو ${maxMb}MB.`,
    };
  }
  return { valid: true, errorMessage: null };
}

export const ControlFile: React.FC<ControlFileProps> = ({
  label,
  value,
  onChange,
  onReset,
  defaultPreviewUrl = '',
  description,
  maxSizeBytes = 5 * 1024 * 1024,
  disabled = false,
  isModified = false,
  fullWidth = true,
  testId,
}) => {
  const generatedId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const hasCustomImage = Boolean(value && value.trim().length > 0);
  const previewSrc = hasCustomImage ? value : defaultPreviewUrl;

  const processSelectedFile = (file: File) => {
    const check = validateUploadedImageFile(file, maxSizeBytes);
    if (!check.valid) {
      setErrorMessage(check.errorMessage);
      return;
    }

    setErrorMessage(null);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMessage('تعذر قراءة ملف الصورة. يرجى المحاولة مرة أخرى.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleClearImage = () => {
    setErrorMessage(null);
    setUploadedFileName(null);
    onChange('');
  };

  return (
    <ControlField
      id={generatedId}
      label={label}
      description={description}
      currentValue={
        hasCustomImage
          ? uploadedFileName || (value.startsWith('data:image/') ? 'صورة مرفوعة' : 'رابط خارجي')
          : 'افتراضي'
      }
      onReset={onReset}
      disabled={disabled}
      isModified={isModified}
      fullWidth={fullWidth}
      testId={testId}
    >
      <div className="ui-control-file">
        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          className="ui-control-file__hidden-input"
          disabled={disabled}
          data-testid={testId ? `${testId}-file-input` : undefined}
          onChange={handleFileInputChange}
        />

        {/* Drag & Drop Zone + Preview */}
        <div
          className="ui-control-file__dropzone"
          data-dragging={isDragging}
          data-has-image={hasCustomImage}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
        >
          {previewSrc ? (
            <div className="ui-control-file__preview-box">
              <img
                src={previewSrc}
                alt={label}
                className="ui-control-file__preview-img"
                referrerPolicy="no-referrer"
              />
              <div className="ui-control-file__preview-meta">
                <span className="ui-control-file__status-badge">
                  {hasCustomImage ? 'صورة مخصصة نشطة' : 'معاينة الصورة الافتراضية'}
                </span>
                <span className="ui-control-file__hint">
                  اسحب صورة جديدة إلى هنا أو استخدم أزرار الاستبدال والحذف أدناه
                </span>
              </div>
            </div>
          ) : (
            <div className="ui-control-file__empty-prompt">
              <span className="ui-control-file__upload-icon" aria-hidden="true">
                ⬆
              </span>
              <span>اسحب وأفلت ملف الصورة هنا (PNG, JPG, WebP, SVG)</span>
            </div>
          )}

          {/* Action Buttons: Upload / Replace / Delete */}
          <div className="ui-control-file__actions">
            <button
              type="button"
              className="studio-btn studio-btn-upload"
              disabled={disabled}
              data-testid={testId ? `${testId}-upload-btn` : undefined}
              onClick={() => fileInputRef.current?.click()}
            >
              <span aria-hidden="true">⬆</span>
              <span>{hasCustomImage ? 'استبدال الصورة' : 'رفع صورة من الجهاز'}</span>
            </button>

            {hasCustomImage && (
              <button
                type="button"
                className="studio-btn studio-btn-danger"
                disabled={disabled}
                data-testid={testId ? `${testId}-delete-btn` : undefined}
                onClick={handleClearImage}
              >
                <span aria-hidden="true">✕</span>
                <span>حذف الصورة</span>
              </button>
            )}
          </div>
        </div>

        {/* Validation Error Message */}
        {errorMessage && (
          <div
            className="ui-control-file__error"
            role="alert"
            data-testid={testId ? `${testId}-error` : undefined}
          >
            <strong>تنبيه ملف غير صالح: </strong>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Optional External Image URL Input */}
        <div className="ui-control-file__url-row">
          <label htmlFor={generatedId} className="ui-control-file__url-label">
            رابط صورة خارجي أو Data URI (اختياري):
          </label>
          <input
            id={generatedId}
            type="text"
            className="ui-control-input"
            dir="ltr"
            placeholder="https://example.com/image.webp أو data:image/svg+xml..."
            value={value}
            disabled={disabled}
            data-testid={testId ? `${testId}-url-input` : undefined}
            onChange={(e) => {
              setErrorMessage(null);
              onChange(e.target.value);
            }}
          />
        </div>
      </div>
    </ControlField>
  );
};
