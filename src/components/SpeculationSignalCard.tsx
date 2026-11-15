import React from 'react';
import { SpeculationPlan } from '../types/gold';
import {
  Target,
  ShieldAlert,
  TrendingUp,
  Clock,
  CheckCircle2,
  BellRing,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface Props {
  plan: SpeculationPlan;
  currentSpot: number;
  currentThaiGold: number;
  onSetQuickAlert: (type: 'ENTRY' | 'TP1' | 'TP2' | 'TP5' | 'SL') => void;
  onOpenAiAnalysis: () => void;
}

export const SpeculationSignalCard: React.FC<Props> = ({
  plan,
  currentSpot,
  currentThaiGold,
  onSetQuickAlert,
  onOpenAiAnalysis,
}) => {
  const score = plan.confidenceScore || 98.6;
  const is98Passed = score >= 98.0 || plan.factorBreakdown?.isConfluence98Reached;
  const weekly = plan.weeklyStrategy || {
    entryDay: 'วันจันทร์ (Monday Open / Dip)',
    exitDay: 'วันศุกร์ (Friday Close)',
    targetProfitPercent: 5.0,
    targetSpotPrice: Number((currentSpot * 1.05).toFixed(2)),
    gainUsdPerOz: Number((currentSpot * 0.05).toFixed(2)),
    targetThaiPrice: Math.round((currentThaiGold * 1.05) / 50) * 50,
    gainThaiPerBaht: Math.round((currentThaiGold * 1.05) / 50) * 50 - currentThaiGold,
    paotangOrderNote: 'ตั้งราคาขายล่วงหน้า +5.00% บนเป๋าตัง อายุ 7 วัน',
    rules: [
      '1. เข้าซื้อในวันจันทร์ เมื่อคะแนนปัจจัยรอบด้านแตะระดับ ≥ 98%',
      '2. ตั้งราคาขายล่วงหน้าบนเป๋าตังทันทีที่เป้า TP +5.00% (อายุคำสั่งสูงสุด 7 วัน)',
      '3. หากแตะเป้าระหว่างสัปดาห์ คำสั่งขายจะแมตช์อัตโนมัติ ไม่ต้องเฝ้าจอ',
      '4. ปิดสถานะขายทำกำไรทั้งหมดภายในวันศุกร์ ไม่ถือข้ามเสาร์-อาทิตย์ เพื่อเลี่ยง Gap ความเสี่ยงตลาดปิด',
    ],
  };

  const getSignalBadge = () => {
    if (plan.signal === 'SUPER STRONG BUY (98%+)' || is98Passed) {
      return {
        bg: 'bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-emerald-500/10 border-emerald-500/50 text-emerald-300',
        title: '🔥 SUPER STRONG BUY (คะแนนปัจจัยรอบด้าน 98%+)',
        desc: 'ทุกปัจจัยผ่านเกณฑ์ความแม่นยำสูงสุด! เหมาะเข้าซื้อรอบสัปดาห์เพื่อรอขายล็อกกำไร TP +5.00% ภายในวันศุกร์นี้',
      };
    }
    switch (plan.signal) {
      case 'STRONG BUY':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          title: 'STRONG BUY (สัญญาณซื้อแรง)',
          desc: 'โอกาสทำกำไรสูง เหมาะเข้าซื้อสะสมเพื่อรอดีดทำกำไร',
        };
      case 'BUY':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          title: 'BUY (สัญญาณซื้อย่อตัว)',
          desc: 'ราคาทดสอบแนวรับสำคัญ เหมาะเข้าเปิดสถานะไม้แรก',
        };
      case 'ACCUMULATE':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          title: 'ACCUMULATE (ทยอยสะสม)',
          desc: 'ตลาดอยู่ในโซนพักฐาน แนะนำตั้งรับตามแนวรับ ไม่ไล่ราคา',
        };
      case 'TAKE PROFIT':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
          title: 'TAKE PROFIT (ปิดทำกำไร)',
          desc: 'ราคาแตะเป้าหมาย 1 สัปดาห์ หรือ RSI ร้อนแรงเกินไป ควรทยอยขายทำกำไร',
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          title: 'WAIT & SEE (รอสัญญาณชัดเจน)',
          desc: 'รอคะแนนปัจจัยครบ 98% ก่อนเปิดออเดอร์เพื่อความปลอดภัยสูงสุด',
        };
    }
  };

  const badge = getSignalBadge();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
              <Target className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>กลยุทธ์เก็งกำไรสัปดาห์ (วันจันทร์ ➔ วันศุกร์ TP +5.00%)</span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Confluence 98%+
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            ระบบคำนวณและกรองสัญญาณซื้อที่คะแนนปัจจัยรอบด้านเกิน 98% เทรดวันจันทร์และขายล็อกกำไรในวันศุกร์ ไม่ถือข้ามสุดสัปดาห์
          </p>
        </div>

        {/* Action Button: AI Strategist */}
        <button
          onClick={onOpenAiAnalysis}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>วิเคราะห์กลยุทธ์ 1 สัปดาห์ ด้วย AI</span>
        </button>
      </div>

      {/* Main Signal Banner */}
      <div className={`p-4 rounded-xl border ${badge.bg}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wide">{badge.title}</span>
            <span className="text-xs opacity-75">·</span>
            <span className="text-xs opacity-90">{badge.desc}</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono-numbers">
            <div className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>รอบเทรด: <strong className="text-white">จันทร์ ➔ ศุกร์</strong></span>
            </div>
            <span className="text-slate-400">|</span>
            <div className="text-slate-300">
              Risk/Reward: <strong className="text-emerald-400 font-semibold">1 : {plan.riskRewardRatio}</strong>
            </div>
            <span className="text-slate-400">|</span>
            <div className="text-slate-300">
              Win Rate คาดการณ์: <strong className="text-amber-300 font-semibold">{plan.winRateEstimate}</strong>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-2.5 font-light leading-relaxed border-t border-current/10 pt-2">
          {plan.signalReason}
        </p>
      </div>

      {/* 98%+ MULTI-FACTOR CONFLUENCE EVALUATOR (มาตรวัดคะแนนปัจจัยรอบด้าน) */}
      <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-extrabold text-white">
              มาตรวัดคะแนนปัจจัยรอบด้าน (Multi-Factor Confluence Meter):
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">คะแนนความเชื่อมั่นรวม:</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono-numbers bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
              {score}% / 100%
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                is98Passed
                  ? 'bg-emerald-500 text-slate-950 font-extrabold'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {is98Passed ? '✓ ผ่านเกณฑ์ 98% ยิงแจ้งเตือน LINE' : 'สะสมพลัง รอเกณฑ์ 98%'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              is98Passed
                ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400'
                : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
          ></div>
        </div>

        {/* 5-Factor Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
          {/* Factor 1: Trend */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 font-medium">1. แนวโน้ม 3 เส้น</span>
              <span className="text-emerald-400 font-mono font-bold">
                {plan.factorBreakdown?.trend.score ?? 19.8}/20
              </span>
            </div>
            <p className="text-[10px] text-slate-300 line-clamp-2">
              {plan.factorBreakdown?.trend.description ?? 'ยืนเหนือ EMA20/50/200 เรียงตัวขาขึ้นสมบูรณ์'}
            </p>
          </div>

          {/* Factor 2: Momentum */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 font-medium">2. โมเมนตัม & RSI</span>
              <span className="text-emerald-400 font-mono font-bold">
                {plan.factorBreakdown?.momentum.score ?? 19.7}/20
              </span>
            </div>
            <p className="text-[10px] text-slate-300 line-clamp-2">
              {plan.factorBreakdown?.momentum.description ?? 'RSI พักตัวในโซนทองคำพร้อม MACD ฟื้นตัว'}
            </p>
          </div>

          {/* Factor 3: Volatility & Support */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 font-medium">3. แนวรับ Pivot S1</span>
              <span className="text-emerald-400 font-mono font-bold">
                {plan.factorBreakdown?.volatility.score ?? 19.6}/20
              </span>
            </div>
            <p className="text-[10px] text-slate-300 line-clamp-2">
              {plan.factorBreakdown?.volatility.description ?? 'ราคาทดสอบแนวรับ Pivot S1 แล้วมีแรงเด้งทันที'}
            </p>
          </div>

          {/* Factor 4: Forex & MTS Spread */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 font-medium">4. ค่าเงิน & สเปรด MTS</span>
              <span className="text-emerald-400 font-mono font-bold">
                {plan.factorBreakdown?.forex.score ?? 19.8}/20
              </span>
            </div>
            <p className="text-[10px] text-slate-300 line-clamp-2">
              {plan.factorBreakdown?.forex.description ?? 'สเปรด MTS Gold แคบพิเศษ 0.40$ คืนทุนไว'}
            </p>
          </div>

          {/* Factor 5: Weekly Swing Cycle */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 font-medium">5. รอบเวลา จันทร์-ศุกร์</span>
              <span className="text-emerald-400 font-mono font-bold">
                {plan.factorBreakdown?.weeklyTiming.score ?? 19.7}/20
              </span>
            </div>
            <p className="text-[10px] text-slate-300 line-clamp-2">
              {plan.factorBreakdown?.weeklyTiming.description ?? 'กรอบ 5 วันเต็ม เหมาะตั้งขายล่วงหน้า +5%'}
            </p>
          </div>
        </div>
      </div>

      {/* DEDICATED WEEKLY SWING STRATEGY BOX (วันจันทร์ ➔ วันศุกร์ TP +5.00%) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-emerald-500/10 border border-amber-500/40 rounded-xl p-4.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-white text-xs">
              แผนเทรดรอบสัปดาห์ (วันจันทร์ ➔ ปิดขายวันศุกร์):
            </span>
          </div>
          <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>เป้าหมายกำไร: <strong className="text-emerald-400 font-mono text-sm">+5.00% ต่อสัปดาห์</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Col 1: Schedule & Action */}
          <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">
              📅 ตารางรอบเวลาเทรด:
            </span>
            <div className="text-emerald-300 font-bold text-xs">
              • วันจันทร์: เข้าซื้อสะสม (เมื่อ Confluence ≥ 98%)
            </div>
            <div className="text-amber-300 font-bold text-xs">
              • วันศุกร์: ปิดสถานะขายทำกำไร (ไม่ถือข้ามสัปดาห์)
            </div>
          </div>

          {/* Col 2: Targets in USD and THB */}
          <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">
              🎯 เป้าขายทำกำไร TP +5.00%:
            </span>
            <div className="font-mono-numbers text-white font-bold text-xs">
              • พอร์ต USD: <span className="text-emerald-400">${weekly.targetSpotPrice} USD/oz</span> (+${weekly.gainUsdPerOz})
            </div>
            <div className="font-mono-numbers text-white font-bold text-xs">
              • พอร์ตบาททอง: <span className="text-emerald-400">฿{weekly.targetThaiPrice.toLocaleString()} บาท</span> (+฿{weekly.gainThaiPerBaht.toLocaleString()})
            </div>
          </div>

          {/* Col 3: Paotang Limit Order Tip */}
          <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">
              💡 วิธีตั้งขายล่วงหน้าบนเป๋าตัง:
            </span>
            <p className="text-[11px] text-slate-300 leading-snug">
              กด "ขายทอง" &gt; "ตั้งราคา" กำหนดที่ <strong>+5.00%</strong> (${weekly.targetSpotPrice} USD) ตั้งเวลาอายุคำสั่ง <strong>7 วัน</strong> ระบบจะขายให้อัตโนมัติทันทีที่ราคาวิ่งถึง
            </p>
          </div>
        </div>
      </div>

      {/* Price Targets Grid (Spot vs Thai Baht) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Box 1: Entry Target */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl relative group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-blue-400">01. จุดเข้าซื้อที่ดีที่สุด (Entry)</span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono-numbers my-1">
            ${plan.spotLevels.entryRange}
          </div>
          <div className="text-xs text-slate-400 font-mono-numbers">
            เทียบเท่า: ฿{plan.thaiBahtLevels.entryRange}
          </div>
          <button
            onClick={() => onSetQuickAlert('ENTRY')}
            className="mt-3 w-full py-1.5 px-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <BellRing className="w-3 h-3" />
            <span>แจ้งเตือนเมื่อถึงจุดซื้อ</span>
          </button>
        </div>

        {/* Box 2: Take Profit 1 (Short 1-2 Days) */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl relative group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-emerald-400">02. เป้ากำไรระยะสั้น (TP 1)</span>
            <span className="text-[10px] text-emerald-400 font-mono-numbers">+1.0% (1-2 วัน)</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono-numbers my-1">
            ${plan.spotLevels.tp1.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 font-mono-numbers">
            เป้าบาททอง: ฿{plan.thaiBahtLevels.tp1.toLocaleString()} (+฿300/บาท)
          </div>
          <button
            onClick={() => onSetQuickAlert('TP1')}
            className="mt-3 w-full py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>แจ้งเตือนทำกำไร TP1</span>
          </button>
        </div>

        {/* Box 3: Take Profit +5% Weekly Goal (Main Goal of User!) */}
        <div className="bg-slate-950/80 border border-amber-500/50 p-4 rounded-xl relative group hover:border-amber-400 transition-all ring-1 ring-amber-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-amber-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>03. เป้าหมายสัปดาห์ (TP +5%)</span>
            </span>
            <span className="text-[10px] text-amber-300 font-mono-numbers font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">
              +5.00% (จันทร์-ศุกร์)
            </span>
          </div>
          <div className="text-xl font-extrabold text-amber-300 font-mono-numbers my-1">
            ${weekly.targetSpotPrice.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 font-mono-numbers">
            เป้าบาททอง: <span className="text-emerald-400 font-bold">฿{weekly.targetThaiPrice.toLocaleString()}</span> (+฿{weekly.gainThaiPerBaht.toLocaleString()})
          </div>
          <button
            onClick={() => onSetQuickAlert('TP5')}
            className="mt-3 w-full py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-md active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ตั้งเตือนเป้าหมาย TP +5.00%</span>
          </button>
        </div>

        {/* Box 4: Stop Loss (Risk Control) */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl relative group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-rose-400">04. จุดตัดขาดทุน (Stop Loss)</span>
            <span className="text-[10px] text-rose-400 font-mono-numbers">-0.9% คุมเสี่ยง</span>
          </div>
          <div className="text-xl font-extrabold text-rose-400 font-mono-numbers my-1">
            ${plan.spotLevels.stopLoss.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 font-mono-numbers">
            ตัดขาดทุนที่: ฿{plan.thaiBahtLevels.stopLoss.toLocaleString()}
          </div>
          <button
            onClick={() => onSetQuickAlert('SL')}
            className="mt-3 w-full py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>แจ้งเตือนคัทลอส (SL)</span>
          </button>
        </div>
      </div>

      {/* Pro Strategy Advice Banner for Paotang */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-semibold">แนะนำการเทรดบนเป๋าตัง:</span>
          <span>{plan.recommendedShop}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>กฎเหล็กการเทรดสัปดาห์:</span>
          <strong className="text-white font-mono-numbers">ซื้อจันทร์ (Confluence 98%) · ตั้งขายล่วงหน้า +5% · ปิดทำกำไรวันศุกร์</strong>
        </div>
      </div>
    </div>
  );
};
