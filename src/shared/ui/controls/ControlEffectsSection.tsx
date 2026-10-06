/**
 * Beso Studio V2 — Shared ControlEffectsSection Component (Requirement 6)
 *
 * Dedicated "المؤثرات" (Effects) section containing:
 * 1. تفعيل أو تعطيل التوهج (Glow Enable/Disable)
 * 2. لون التوهج (Glow Color via ControlColor)
 * 3. شدة التوهج (Glow Intensity 0..100%)
 * 4. حجم التوهج (Glow Size in px)
 * 5. تفعيل أو تعطيل الحركة (Animation Enable/Disable)
 * 6. نوع الحركة (Animation Type: float, pulse, glow-pulse, slide-up, shimmer)
 * 7. المدة (Duration in s)
 * 8. التأخير (Delay in s)
 * 9. سرعة الحركة (Timing Function: ease-in-out, linear, ease-out, cubic-bezier)
 * 10. التكرار (Iteration Count: infinite, 1, 2, 3)
 * 11. اتجاه الحركة (Direction: normal, alternate, reverse, alternate-reverse)
 * 12. معاينة مباشرة (Live Interactive Effects Preview Box)
 */

import React, { useState } from 'react';
import { ControlColor } from './ControlColor';
import { ControlRange } from './ControlRange';
import { ControlResetButton } from './ControlResetButton';
import { ControlSelect } from './ControlSelect';
import { ControlToggle } from './ControlToggle';

export type StudioAnimationType = 'float' | 'pulse' | 'glow-pulse' | 'slide-up' | 'tilt';
export type StudioAnimationTiming =
  | 'ease-in-out'
  | 'linear'
  | 'ease-out'
  | 'cubic-bezier(0.22, 1, 0.36, 1)';
export type StudioAnimationIteration = 'infinite' | '1' | '2' | '3';
export type StudioAnimationDirection = 'normal' | 'alternate' | 'reverse' | 'alternate-reverse';

export interface ControlEffectsSectionProps {
  glowColor: string;
  glowIntensity: number;
  defaultGlowColor?: string;
  defaultGlowIntensity?: number;
  onUpdateGlow: (patch: { glowColor?: string; glowIntensity?: number }) => void;
  onResetGlow?: () => void;
  testId?: string;
}

const ANIMATION_TYPE_OPTIONS = [
  { value: 'float', label: 'طفو انسيابي (Float)' },
  { value: 'pulse', label: 'نبض ناعم (Pulse)' },
  { value: 'glow-pulse', label: 'نبض توهج ضوئي (Glow Pulse)' },
  { value: 'slide-up', label: 'ارتقاء عمودي (Slide Up)' },
  { value: 'tilt', label: 'إمالة ديناميكية (Tilt)' },
];

const ANIMATION_TIMING_OPTIONS = [
  { value: 'ease-in-out', label: 'متوازن ناعم (ease-in-out)' },
  { value: 'linear', label: 'ثابت خطي (linear)' },
  { value: 'ease-out', label: 'تباطؤ تدريجي (ease-out)' },
  { value: 'cubic-bezier(0.22, 1, 0.36, 1)', label: 'استجابة مرنة (Spring Cubic)' },
];

const ANIMATION_ITERATION_OPTIONS = [
  { value: 'infinite', label: 'مستمر بلا توقف (Infinite)' },
  { value: '1', label: 'مرة واحدة (1x)' },
  { value: '2', label: 'مرتان (2x)' },
  { value: '3', label: 'ثلاث مرات (3x)' },
];

const ANIMATION_DIRECTION_OPTIONS = [
  { value: 'alternate', label: 'ذهاب وإياب (Alternate)' },
  { value: 'normal', label: 'اتجاه أمامي (Normal)' },
  { value: 'reverse', label: 'اتجاه عكسي (Reverse)' },
  { value: 'alternate-reverse', label: 'عكسي متناوب (Alternate Reverse)' },
];

export const ControlEffectsSection: React.FC<ControlEffectsSectionProps> = ({
  glowColor,
  glowIntensity,
  defaultGlowColor = '#d4af37',
  defaultGlowIntensity = 18,
  onUpdateGlow,
  onResetGlow,
  testId = 'effects-section',
}) => {
  const [lastNonZeroGlow, setLastNonZeroGlow] = useState<number>(
    glowIntensity > 0 ? glowIntensity : 28
  );
  const [glowSizePx, setGlowSizePx] = useState<number>(32);

  // Motion & Animation controls
  const [animationEnabled, setAnimationEnabled] = useState<boolean>(false);
  const [animationType, setAnimationType] = useState<StudioAnimationType>('float');
  const [animationDurationSec, setAnimationDurationSec] = useState<number>(2.4);
  const [animationDelaySec, setAnimationDelaySec] = useState<number>(0);
  const [animationTiming, setAnimationTiming] = useState<StudioAnimationTiming>('ease-in-out');
  const [animationIteration, setAnimationIteration] =
    useState<StudioAnimationIteration>('infinite');
  const [animationDirection, setAnimationDirection] =
    useState<StudioAnimationDirection>('alternate');

  const isGlowEnabled = glowIntensity > 0;

  const handleToggleGlow = (enabled: boolean) => {
    if (enabled) {
      const nextIntensity = lastNonZeroGlow > 0 ? lastNonZeroGlow : 28;
      onUpdateGlow({ glowIntensity: nextIntensity });
    } else {
      if (glowIntensity > 0) {
        setLastNonZeroGlow(glowIntensity);
      }
      onUpdateGlow({ glowIntensity: 0 });
    }
  };

  const handleResetAllEffects = () => {
    setGlowSizePx(32);
    setAnimationEnabled(false);
    setAnimationType('float');
    setAnimationDurationSec(2.4);
    setAnimationDelaySec(0);
    setAnimationTiming('ease-in-out');
    setAnimationIteration('infinite');
    setAnimationDirection('alternate');
    if (onResetGlow) {
      onResetGlow();
    } else {
      onUpdateGlow({
        glowColor: defaultGlowColor,
        glowIntensity: defaultGlowIntensity,
      });
    }
  };

  const computedGlowBoxShadow = isGlowEnabled
    ? `0 0 ${glowSizePx}px ${Math.round((glowIntensity / 100) * 14)}px ${glowColor}`
    : 'none';

  const keyframeName = `beso-fx-${animationType}`;
  const computedAnimationCss = animationEnabled
    ? `${keyframeName} ${animationDurationSec}s ${animationTiming} ${animationDelaySec}s ${animationIteration} ${animationDirection}`
    : 'none';

  return (
    <div className="ui-effects-panel" data-testid={testId} dir="rtl">
      <div className="ui-effects-panel__header">
        <div>
          <h4 className="ui-effects-panel__title">قسم المؤثرات البصرية (التوهج والحركة)</h4>
          <p className="ui-effects-panel__subtitle">
            تحكم مستقل في تفعيل التوهج الضوئي ولونه وشدته وحجمه، مع إعدادات الحركة والمعاينة المباشرة.
          </p>
        </div>
        <ControlResetButton
          onClick={handleResetAllEffects}
          label="إعادة ضبط المؤثرات"
          testId={`${testId}-reset-all`}
        />
      </div>

      {/* Sub-block 1: Glow Settings */}
      <div className="ui-effects-subcard">
        <div className="ui-effects-subcard__title">01. إعدادات التوهج الضوئي (Glow Controls)</div>

        <ControlToggle
          label="تفعيل التوهج الضوئي (Enable Glow)"
          description="إضاءة محيطية ناعمة حول إطار العنصر."
          checked={isGlowEnabled}
          onChange={handleToggleGlow}
          activeText="التوهج مفعل"
          inactiveText="التوهج معطل"
          testId={`${testId}-glow-toggle`}
        />

        <div className="ui-control-grid-2">
          <ControlColor
            label="لون التوهج (Glow Color)"
            value={glowColor}
            disabled={!isGlowEnabled}
            isModified={glowColor !== defaultGlowColor}
            onChange={(nextColor) => onUpdateGlow({ glowColor: nextColor })}
            onReset={() => onUpdateGlow({ glowColor: defaultGlowColor })}
            testId={`${testId}-glow-color`}
          />

          <ControlRange
            label="شدة التوهج (Glow Intensity)"
            value={glowIntensity}
            min={0}
            max={100}
            step={1}
            unit="%"
            isModified={glowIntensity !== defaultGlowIntensity}
            onChange={(nextVal) => {
              if (nextVal > 0) setLastNonZeroGlow(nextVal);
              onUpdateGlow({ glowIntensity: nextVal });
            }}
            onReset={() => onUpdateGlow({ glowIntensity: defaultGlowIntensity })}
            testId={`${testId}-glow-intensity`}
          />
        </div>

        <ControlRange
          label="حجم انتشار التوهج (Glow Size / Radius)"
          value={glowSizePx}
          min={8}
          max={96}
          step={2}
          unit="px"
          disabled={!isGlowEnabled}
          isModified={glowSizePx !== 32}
          onChange={setGlowSizePx}
          onReset={() => setGlowSizePx(32)}
          testId={`${testId}-glow-size`}
        />
      </div>

      {/* Sub-block 2: Motion & Animation Settings */}
      <div className="ui-effects-subcard">
        <div className="ui-effects-subcard__title">02. إعدادات الحركة التفاعلية (Animation Controls)</div>

        <ControlToggle
          label="تفعيل الحركة (Enable Animation)"
          description="تشغيل تأثير حركي انسيابي مع معاينة فورية."
          checked={animationEnabled}
          onChange={setAnimationEnabled}
          activeText="الحركة مفعلة"
          inactiveText="الحركة معطلة"
          testId={`${testId}-animation-toggle`}
        />

        <div className="ui-control-grid-2">
          <ControlSelect
            label="نوع الحركة (Animation Type)"
            value={animationType}
            options={ANIMATION_TYPE_OPTIONS}
            disabled={!animationEnabled}
            onChange={(val) => setAnimationType(val as StudioAnimationType)}
            onReset={() => setAnimationType('float')}
            testId={`${testId}-animation-type`}
          />

          <ControlSelect
            label="سرعة واستجابة الحركة (Timing)"
            value={animationTiming}
            options={ANIMATION_TIMING_OPTIONS}
            disabled={!animationEnabled}
            onChange={(val) => setAnimationTiming(val as StudioAnimationTiming)}
            onReset={() => setAnimationTiming('ease-in-out')}
            testId={`${testId}-animation-timing`}
          />
        </div>

        <div className="ui-control-grid-2">
          <ControlRange
            label="مدة الحركة (Duration)"
            value={animationDurationSec}
            min={0.4}
            max={8}
            step={0.2}
            unit="s"
            disabled={!animationEnabled}
            onChange={setAnimationDurationSec}
            onReset={() => setAnimationDurationSec(2.4)}
            testId={`${testId}-animation-duration`}
          />

          <ControlRange
            label="تأخير البدء (Delay)"
            value={animationDelaySec}
            min={0}
            max={5}
            step={0.2}
            unit="s"
            disabled={!animationEnabled}
            onChange={setAnimationDelaySec}
            onReset={() => setAnimationDelaySec(0)}
            testId={`${testId}-animation-delay`}
          />
        </div>

        <div className="ui-control-grid-2">
          <ControlSelect
            label="عدد مرات التكرار (Iteration)"
            value={animationIteration}
            options={ANIMATION_ITERATION_OPTIONS}
            disabled={!animationEnabled}
            onChange={(val) => setAnimationIteration(val as StudioAnimationIteration)}
            onReset={() => setAnimationIteration('infinite')}
            testId={`${testId}-animation-iteration`}
          />

          <ControlSelect
            label="اتجاه الحركة (Direction)"
            value={animationDirection}
            options={ANIMATION_DIRECTION_OPTIONS}
            disabled={!animationEnabled}
            onChange={(val) => setAnimationDirection(val as StudioAnimationDirection)}
            onReset={() => setAnimationDirection('alternate')}
            testId={`${testId}-animation-direction`}
          />
        </div>
      </div>

      {/* Sub-block 3: Live Direct Preview of Glow & Animation */}
      <div className="ui-effects-live-stage" data-testid={`${testId}-live-preview`}>
        <div className="ui-effects-live-stage__header">
          <strong>معاينة مباشرة للتوهج والحركة (Live Effects Preview)</strong>
          <span className="studio-panel-meta">
            {isGlowEnabled ? `توهج: ${glowIntensity}% (${glowSizePx}px)` : 'بدون توهج'} ·{' '}
            {animationEnabled ? `حركة: ${animationType} (${animationDurationSec}s)` : 'ثابت'}
          </span>
        </div>

        <div className="ui-effects-live-stage__canvas">
          <div
            className="ui-effects-live-stage__sample"
            data-animation-active={animationEnabled}
            data-animation-type={animationType}
            style={{
              boxShadow: computedGlowBoxShadow,
              borderColor: isGlowEnabled ? glowColor : undefined,
              animation: computedAnimationCss,
            }}
          >
            <span className="ui-effects-live-stage__sample-icon" aria-hidden="true">
              ✦
            </span>
            <div className="ui-effects-live-stage__sample-text">
              <strong>عينة معاينة المؤثرات الحية</strong>
              <span>تطبق إعدادات التوهج والحركة المختارة أعلاه مباشرة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
