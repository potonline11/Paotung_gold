import React from 'react';
import { Indicators } from '../types/gold';
import { Activity, BarChart2, Compass, GitCommit } from 'lucide-react';

interface Props {
  indicators: Indicators;
  currentSpot: number;
}

export const TechnicalIndicators: React.FC<Props> = ({ indicators, currentSpot }) => {
  const rsi = indicators.rsi;
  const getRsiStatus = () => {
    if (rsi < 30) return { label: 'Oversold (ขายมากเกินไป / จุดช้อนซื้อ)', color: 'text-emerald-400', barColor: 'bg-emerald-500' };
    if (rsi > 70) return { label: 'Overbought (ซื้อมากเกินไป / ระวังแรงเทขาย)', color: 'text-rose-400', barColor: 'bg-rose-500' };
    return { label: 'Neutral Zone (โซนสะสมกำลัง)', color: 'text-amber-400', barColor: 'bg-amber-500' };
  };
  const rsiInfo = getRsiStatus();

  const isEmaBullish = indicators.ema.ema20 > indicators.ema.ema50;
  const isMacdBullish = indicators.macd.histogram > 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>อินดิเคเตอร์ทางเทคนิค (Technical Indicators)</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono-numbers">
          กรอบเวลาวิเคราะห์: 4 ชั่วโมง / 1 วัน
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: RSI (14) */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">RSI (Relative Strength 14)</span>
            <span className="text-lg font-bold font-mono-numbers text-white">{rsi.toFixed(1)}</span>
          </div>

          {/* Visual Gauge Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative mb-2">
            {/* Zones: <30 Green, 30-70 Amber, >70 Red */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${rsiInfo.barColor}`}
              style={{ width: `${Math.min(100, Math.max(0, rsi))}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers mb-2">
            <span>0 (Oversold 30)</span>
            <span>50 (Center)</span>
            <span>100 (Overbought 70)</span>
          </div>

          <div className={`text-xs font-medium ${rsiInfo.color}`}>
            สถานะ: {rsiInfo.label}
          </div>
        </div>

        {/* Metric 2: MACD (12, 26, 9) */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">MACD (12, 26, 9)</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                isMacdBullish
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isMacdBullish ? 'Bullish (ตัดขึ้น)' : 'Bearish (ตัดลง)'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono-numbers">
            <div className="bg-slate-900 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">MACD Line</span>
              <span className="text-xs font-bold text-slate-200">{indicators.macd.line.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Signal Line</span>
              <span className="text-xs font-bold text-slate-200">{indicators.macd.signal.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Histogram</span>
              <span
                className={`text-xs font-bold ${
                  indicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {indicators.macd.histogram >= 0 ? '+' : ''}
                {indicators.macd.histogram.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {isMacdBullish
              ? 'โมเมนตัมขาขึ้นมีพลัง สนับสนุนการถือครองทำกำไร 1 สัปดาห์'
              : 'โมเมนตัมชะลอตัว แนะนำรอให้แท่ง Histogram เริ่มยกตัว'}
          </p>
        </div>

        {/* Metric 3: Moving Averages & Bollinger */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">แนวโน้มเส้นค่าเฉลี่ย (EMA & BB)</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                isEmaBullish
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isEmaBullish ? 'Uptrend (แนวโน้มขาขึ้น)' : 'Consolidate (สะสมพลัง)'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono-numbers">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-blue-400">EMA 20 (ระยะสั้น):</span>
              <span className="font-semibold">${indicators.ema.ema20.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-indigo-400">EMA 50 (ระยะกลาง):</span>
              <span className="font-semibold">${indicators.ema.ema50.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-purple-400">Bollinger Upper:</span>
              <span className="font-semibold">${indicators.bollinger.upper.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-purple-400">Bollinger Lower:</span>
              <span className="font-semibold">${indicators.bollinger.lower.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pivot Points Summary Row */}
      <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-numbers">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-sans font-semibold">Pivot Points ประจำสัปดาห์:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-300">
          <div>
            <span className="text-rose-400 font-semibold mr-1">R2 (ต้าน 2):</span>
            <span>${indicators.pivotPoints.r2}</span>
          </div>
          <div>
            <span className="text-rose-400 font-semibold mr-1">R1 (ต้าน 1):</span>
            <span>${indicators.pivotPoints.r1}</span>
          </div>
          <div>
            <span className="text-amber-400 font-semibold mr-1">Pivot:</span>
            <span>${indicators.pivotPoints.pivot}</span>
          </div>
          <div>
            <span className="text-emerald-400 font-semibold mr-1">S1 (รับ 1):</span>
            <span>${indicators.pivotPoints.s1}</span>
          </div>
          <div>
            <span className="text-emerald-400 font-semibold mr-1">S2 (รับ 2):</span>
            <span>${indicators.pivotPoints.s2}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
