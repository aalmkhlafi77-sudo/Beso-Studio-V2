/**
 * Beso Studio V2 — ExportBundle Contract & React-Independent Builder
 * Strictly combines Section 5 & 15 of the Architectural Reference and Requirement 9.
 *
 * Output contains:
 * - html
 * - css
 * - js (optional JavaScript)
 * - metadata
 * - validationErrors
 * - assets (optional)
 * - warnings
 *
 * Completely independent of React or Tailwind runtime.
 */

import { AssetReference } from '../assets/assetTypes';
import { ValidationIssue, validateGeneratedCodeOutput } from '../validation/validator';

export interface ExportWarning {
  code: string;
  message: string;
}

export interface ExportMetadata {
  elementId: string;
  elementType: string;
  version: number;
  instanceId: string;
  scopeSelector: string;
  generatedAtIso: string;
  rtl: boolean;
  standalone: true;
}

export interface ExportBundle {
  html: string;
  css: string;
  js?: string;
  metadata: ExportMetadata;
  validationErrors: ValidationIssue[];
  assets?: AssetReference[];
  warnings: ExportWarning[];
}

export interface BuildExportBundleParams {
  elementId: string;
  elementType: string;
  version: number;
  instanceId: string;
  scopeSelector: string;
  html: string;
  css: string;
  js?: string;
  stateValidationErrors?: ValidationIssue[];
  assets?: AssetReference[];
  warnings?: ExportWarning[];
}

export function createExportBundle(params: BuildExportBundleParams): ExportBundle {
  const codeOutputIssues = validateGeneratedCodeOutput(
    params.html,
    params.css,
    params.scopeSelector
  );

  const allErrors = [...(params.stateValidationErrors || []), ...codeOutputIssues];

  return {
    html: params.html,
    css: params.css,
    ...(params.js ? { js: params.js } : {}),
    metadata: {
      elementId: params.elementId,
      elementType: params.elementType,
      version: params.version,
      instanceId: params.instanceId,
      scopeSelector: params.scopeSelector,
      generatedAtIso: new Date().toISOString(),
      rtl: true,
      standalone: true,
    },
    validationErrors: allErrors,
    assets: params.assets || [],
    warnings: params.warnings || [],
  };
}

/**
 * Generates a self-contained HTML5 document combining the exported HTML, CSS, and optional JS
 * for direct copy/download without any external framework dependencies.
 */
export function buildStandaloneHtmlDocument(bundle: ExportBundle): string {
  const jsTag = bundle.js ? `\n  <script>\n${bundle.js}\n  </script>` : '';
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Beso Studio Export — ${bundle.metadata.elementType}</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      background: #0b1915;
      font-family: 'Cairo', system-ui, sans-serif;
    }
${bundle.css}
  </style>
</head>
<body>
${bundle.html}${jsTag}
</body>
</html>`;
}
