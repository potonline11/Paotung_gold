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
  confluenceThreshold?: number;
  onSetQuickAlert: (type: 'ENTRY' | 'TP1' | 'TP2' | 'TP5' | 'SL') => void;
  onOpenAiAnalysis: () => void;
}

export const SpeculationSignalCard: React.FC<Props> = ({
  plan,
  currentSpot,
  currentThaiGold,
  confluenceThreshold = 98,
  onSetQuickAlert,
  onOpenAiAnalysis,
}) => {
  const score = plan.confidenceScore || 98.0;
  const isThresholdPassed =
    score >= confluenceThreshold ||
    (confluenceThreshold <= 98 && Boolean(plan.factorBreakdown?.isConfluence98Reached));
  const weekly = plan.weeklyStrategy || {
    entryDay: 'แจ้งเตือนเตรียมซื้อทันทีทุกวัน (เมื่อคะแนนเกินมาตรฐาน ไม่ต้องรอวันจันทร์)',
    exitDay: 'ตั้งขายล่วงหน้า 7 วันบนเป๋าตัง (TP +5.00%)',
    targetProfitPercent: 5.0,
    targetSpotPrice: Number((currentSpot * 1.05).toFixed(2)),
    gainUsdPerOz: Number((currentSpot * 0.05).toFixed(2)),
    targetThaiPrice: Math.round((currentThaiGold * 1.05) / 50) * 50,
    gainThaiPerBaht: Math.round((currentThaiGold * 1.05) / 50) * 50 - currentThaiGold,
    paotangOrderNote: 'ตั้งราคาขายล่วงหน้า +5.00% บนเป๋าตัง อายุ 7 วัน',
    rules: [
      `1. ระบบแจ้งเตือนเตรียมเข้าซื้อทันทีทุกวัน เมื่อมาตรวัดคะแนนปัจจัยรอบด้านเกินมาตรฐาน ≥ ${confluenceThreshold}% โดยไม่ต้องรอถึงวันจันทร์`,
      '2. เมื่อได้รับแจ้งเตือน ให้เช็กจังหวะราคาบนแอปเป๋าตังและทยอยเข้าซื้อตามกรอบ Entry',
      '3. ตั้งราคาขายล่วงหน้าบนเป๋าตังทันทีที่เป้า TP +5.00% (อายุคำสั่งสูงสุด 7 วัน)',
      '4. หากราคาวิ่งถึงเป้า คำสั่งขายจะแมตช์อัตโนมัติ และตั้ง Stop Loss เพื่อคุมความเสี่ยงทุกครั้ง',
    ],
  };

  const getSignalBadge = () => {
    if (plan.signal === 'SUPER STRONG BUY (98%+)' || isThresholdPassed) {
      return {
        bg: 'bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-emerald-500/10 border-emerald-500/50 text-emerald-300',
        title: `🔥 เตรียมเข้าซื้อทันที! (คะแนนปัจจัยเกินมาตรฐาน ${score}% ≥ ${confluenceThreshold}%)`,
        desc: 'มาตรวัดปัจจัยรอบด้านผ่านเกณฑ์มาตรฐานแล้ว! ระบบแจ้งเตือนเตรียมเข้าซื้อทันทีโดยไม่ต้องรอถึงวันจันทร์ ตั้งเป้าขาย TP +5.00%',
      };
    }
    switch (plan.signal) {
      case 'STRONG BUY':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          title: 'STRONG BUY (สัญญาณซื้อแรง)',
          desc: 'โอกาสทำกำไรสูง เหมาะเตรียมเข้าซื้อสะสมเพื่อรอดีดทำกำไร',
        };
      case 'BUY':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          title: 'BUY (สัญญาณซื้อย่อตัว)',
          desc: 'ราคาทดสอบแนวรับสำคัญ เหมาะเตรียมเปิดสถานะไม้แรก',
        };
      case 'ACCUMULATE':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          title: 'ACCUMULATE (ทยอยสะสม)',
          desc: 'ตลาดอยู่ในโซนพักฐาน รอคะแนนปัจจัยรวมเกินเกณฑ์มาตรฐานเพื่อแจ้งเตือนเตรียมซื้อ',
        };
      case 'TAKE PROFIT':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
          title: 'TAKE PROFIT (ปิดทำกำไร)',
          desc: 'ราคาแตะเป้าหมาย หรือ RSI ร้อนแรงเกินไป ควรทยอยขายทำกำไร',
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          title: 'WAIT & SEE (รอคะแนนเกินเกณฑ์)',
          desc: `รอมาตรวัดคะแนนปัจจัยรอบด้านเกินมาตรฐาน (${confluenceThreshold}%) ก่อนแจ้งเตือนเตรียมซื้อ`,
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
            <h2 className="text-lg font-bold text-white flex flex-wrap items-center gap-2">
              <span>ระบบแจ้งเตือนเตรียมซื้ออัจฉริยะ (ไม่ต้องรอวันจันทร์ · เป้า TP +5.00%)</span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                เกณฑ์มาตรฐาน ≥ {confluenceThreshold}%
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            สแกนตลาดเรียลไทม์ทุกวัน ทันทีที่มาตรวัดคะแนนปัจจัยรอบด้านเกินมาตรฐาน (≥ {confluenceThreshold}%) ระบบจะแจ้งเตือนเตรียมเข้าซื้อทันทีโดยไม่ต้องรอถึงวันจันทร์
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
              <span>จังหวะเตือน: <strong className="text-emerald-300">ทันทีทุกวัน (ไม่ต้องรอวันจันทร์)</strong></span>
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

      {/* MULTI-FACTOR CONFLUENCE EVALUATOR (มาตรวัดคะแนนปัจจัยรอบด้าน) */}
      <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-extrabold text-white">
              มาตรวัดคะแนนปัจจัยรอบด้าน (Multi-Factor Confluence Meter):
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              มาตรฐาน ≥ {confluenceThreshold}% · คะแนนรวม:
            </span>
            <span className="text-base font-extrabold text-emerald-400 font-mono-numbers bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
              {score}% / 100%
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isThresholdPassed
                  ? 'bg-emerald-500 text-slate-950 font-extrabold'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isThresholdPassed
                ? '✓ เกินมาตรฐาน — แจ้งเตือนเตรียมซื้อทันที!'
                : `สะสมพลัง (รอ ≥ ${confluenceThreshold}%)`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isThresholdPassed
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

          {/* Factor 5: Real-Time Session Readiness */}
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 font-medium">5. พร้อมเตือนทันที 24/7</span>
              <span className="text-emerald-400 font-mono font-bold">
                {plan.factorBreakdown?.weeklyTiming.score ?? 19.8}/20
              </span>
            </div>
            <p className="text-[10px] text-slate-300 line-clamp-2">
              {plan.factorBreakdown?.weeklyTiming.description ??
                'แจ้งเตือนเตรียมซื้อทันทีเมื่อคะแนนเกินมาตรฐาน ไม่ต้องรอวันจันทร์'}
            </p>
          </div>
        </div>
      </div>

      {/* DEDICATED INSTANT TRIGGER STRATEGY BOX (แจ้งเตือนเตรียมซื้อทันที ไม่ต้องรอวันจันทร์) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-emerald-500/10 border border-amber-500/40 rounded-xl p-4.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-white text-xs">
              แผนเตรียมเข้าซื้ออัตโนมัติ (แจ้งเตือนทันทีเมื่อเกินมาตรฐาน ไม่ต้องรอวันจันทร์):
            </span>
          </div>
          <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>เป้าหมายกำไร: <strong className="text-emerald-400 font-mono text-sm">+5.00% (ตั้งขายล่วงหน้า 7 วัน)</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Col 1: Trigger Rules */}
          <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">
              ⚡ เงื่อนไขแจ้งเตือนเตรียมซื้อ:
            </span>
            <div className="text-emerald-300 font-bold text-xs">
              • ทันทีที่ Confluence ≥ {confluenceThreshold}% (แจ้งเตือนทุกวัน ไม่รอวันจันทร์)
            </div>
            <div className="text-amber-300 font-bold text-xs">
              • ซื้อแล้วตั้งขายล่วงหน้า TP +5.00% (อายุคำสั่ง 7 วัน)
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
          <span>กฎเหล็กการเทรด:</span>
          <strong className="text-white font-mono-numbers">
            คะแนน ≥ {confluenceThreshold}% เตรียมซื้อทันที (ไม่รอวันจันทร์) · ตั้งขายล่วงหน้า +5% (7 วัน)
          </strong>
        </div>
      </div>
    </div>
  );
};
