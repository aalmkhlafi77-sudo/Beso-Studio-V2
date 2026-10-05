/**
 * Beso Studio V2 — Application Routes & Workspace Views
 * Client-side view states for the Studio Shell (no reload required).
 */

export type StudioRouteId = 'workspace' | 'contract-verification' | 'architecture-overview';

export interface StudioRouteDefinition {
  id: StudioRouteId;
  label: string;
  description: string;
}

export const STUDIO_ROUTES: StudioRouteDefinition[] = [
  {
    id: 'workspace',
    label: 'مساحة العمل (Workspace)',
    description: 'المكتبة التجريبية، المفتش المستقل، المعاينة المعزولة، وحزمة التصدير.',
  },
  {
    id: 'contract-verification',
    label: 'فحص العقد والاختبارات',
    description: 'تشغيل مصفوفة التحقق من العقد: استقلال النصوص، الأبعاد، الأيقونة، وAdSlot.',
  },
  {
    id: 'architecture-overview',
    label: 'مرجع المرحلة الأولى',
    description: 'ملخص طبقات النواة ومسار الحالة من المفتش إلى المعاينة والتصدير.',
  },
];
