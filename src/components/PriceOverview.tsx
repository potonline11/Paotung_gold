import React, { useState } from 'react';
import { ThaiGoldPrices } from '../types/gold';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Coins,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Check,
  X,
  Smartphone,
} from 'lucide-react';

interface Props {
  xauUsd: number;
  usdThb: number;
  change24hUsd: number;
  change24hPercent: number;
  thaiGold: ThaiGoldPrices;
  dataSource?: string;
  onSimulateTick?: (direction: 'up' | 'down') => void;
  onSyncPrice?: (spot: number, usdThb: number, mode?: 'LIVE_API' | 'CUSTOM') => Promise<void>;
}

export const PriceOverview: React.FC<Props> = ({
  xauUsd,
  usdThb,
  change24hUsd,
  change24hPercent,
  thaiGold,
  dataSource,
  onSimulateTick,
  onSyncPrice,
}) => {
  const isPositive = change24hUsd >= 0;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customSpot, setCustomSpot] = useState<number>(xauUsd);
  const [customThb, setCustomThb] = useState<number>(usdThb);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleApplyPaotangMts = async () => {
    // Exact price from user's Paotang MTS screen ($3,974.19)
    if (!onSyncPrice) return;
    setIsSubmitting(true);
    setSyncStatus('กำลังปรับเทียบกับกระดานเป๋าตัง MTS...');
    try {
      await onSyncPrice(3974.19, 33.72, 'CUSTOM');
      setCustomSpot(3974.19);
      setCustomThb(33.72);
      setSyncStatus('ปรับเทียบราคากับเป๋าตัง MTS ($3,974.19) สำเร็จ!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSyncStatus(null);
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchLiveApi = async () => {
    if (!onSyncPrice) return;
    setIsSubmitting(true);
    setSyncStatus('กำลังดึงราคาตลาดโลกสดจาก Financial APIs...');
    try {
      await onSyncPrice(0, 0, 'LIVE_API');
      setSyncStatus('ดึงราคาตลาดโลกสดสำเร็จ!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSyncStatus(null);
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSyncPrice) return;
    setIsSubmitting(true);
    try {
      await onSyncPrice(customSpot, customThb, 'CUSTOM');
      setSyncStatus('บันทึกราคาอ้างอิงเป๋าตังสำเร็จ!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSyncStatus(null);
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Quick Simulation trigger & Calibrate button */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-slate-100">กระดานเรียลไทม์เป๋าตัง (MTS · YLG · Aurora)</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-mono-numbers text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {dataSource === 'LIVE_MARKET'
              ? 'ดึงราคาตลาดโลกสด (Live Gold-API XAU/USD)'
              : `ปรับเทียบราคาเป๋าตัง ($${xauUsd.toFixed(2)})`}
          </span>
        </div>

        {/* Action Buttons: Calibrate & Simulation */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setCustomSpot(xauUsd);
              setCustomThb(usdThb);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg font-medium transition-all"
            title="ปรับเทียบราคากับหน้าจอแอปเป๋าตัง"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>ปรับเทียบราคากับเป๋าตัง</span>
          </button>

          {onSimulateTick && (
            <div className="flex items-center gap-1 text-xs pl-1 border-l border-slate-800">
              <button
                onClick={() => onSimulateTick('down')}
                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-mono-numbers transition-colors text-[11px]"
                title="ลดราคาทองคำ -$5 เพื่อทดสอบแจ้งเตือนจุดเข้าซื้อ"
              >
                -$5
              </button>
              <button
                onClick={() => onSimulateTick('up')}
                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono-numbers transition-colors text-[11px]"
                title="เพิ่มราคาทองคำ +$5 เพื่อทดสอบแจ้งเตือนทำกำไร TP"
              >
                +$5
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3 Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: XAU/USD Spot Gold */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              ทองคำโลก (Spot Gold)
            </span>
            <span className="font-mono-numbers text-slate-400">XAU/USD</span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="text-3xl font-extrabold tracking-tight text-white font-mono-numbers">
              ${xauUsd.toFixed(2)}
            </div>
            <div
              className={`flex items-center text-xs font-semibold font-mono-numbers ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-0.5" />
              )}
              {isPositive ? '+' : ''}
              {change24hUsd.toFixed(2)} ({isPositive ? '+' : ''}
              {change24hPercent.toFixed(2)}%)
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>ฐานเป๋าตัง USD Wallet (99.99%)</span>
            <span className="text-amber-400 font-mono-numbers font-semibold">
              MTS: ${(xauUsd).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Card 2: USD/THB Exchange Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              ค่าเงินบาท (Exchange Rate)
            </span>
            <span className="font-mono-numbers text-slate-400">USD/THB</span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="text-3xl font-extrabold tracking-tight text-white font-mono-numbers">
              ฿{usdThb.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 font-mono-numbers">บาท / ดอลลาร์</div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>ผลกระทบ: {usdThb > 34 ? 'บาทอ่อน (หนุนราคาทองในประเทศ)' : 'บาทแข็ง (กดดันราคาทอง)'}</span>
            <span className="text-slate-400 font-mono-numbers">BOT Reference</span>
          </div>
        </div>

        {/* Card 3: สมาคมค้าทองคำ 96.5% */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              สมาคมค้าทองคำ (GTA) 96.5%
            </span>
            <span className="text-amber-400/80 font-medium">คำนวณตามสูตร</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">ขายออก (บาทละ)</span>
              <span className="text-xl font-bold text-amber-400 font-mono-numbers">
                ฿{thaiGold.associationSell.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">รับซื้อ (บาทละ)</span>
              <span className="text-xl font-bold text-slate-200 font-mono-numbers">
                ฿{thaiGold.associationBuy.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>ส่วนต่างสมาคม 100 บาท</span>
            <span>ทองรูปพรรณขายออก: ฿{thaiGold.ornamentSell.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Modal: Calibrate / Sync Price with Paotang */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    ปรับเทียบราคากับหน้าจอแอปเป๋าตัง (Calibrate)
                  </h3>
                  <p className="text-xs text-slate-400">
                    ตั้งราคาให้ตรงกับหน้าร้านทอง MTS, YLG บนแอปเป๋าตังของคุณแบบ 100%
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {syncStatus && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>{syncStatus}</span>
              </div>
            )}

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                เลือกปรับเทียบแบบด่วน (Quick Presets):
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Preset 1: User's exact MTS Paotang screen */}
                <button
                  type="button"
                  onClick={handleApplyPaotangMts}
                  disabled={isSubmitting}
                  className="p-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl text-left transition-colors"
                >
                  <span className="block font-bold text-amber-300 mb-0.5">
                    MTS แม่ทองสุก (เป๋าตัง)
                  </span>
                  <span className="text-white font-mono-numbers font-extrabold text-sm block">
                    $3,974.19 USD
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ตามหน้าจอคำสั่งขาย 12 พ.ย. 69
                  </span>
                </button>

                {/* Preset 2: Live Market API */}
                <button
                  type="button"
                  onClick={handleFetchLiveApi}
                  disabled={isSubmitting}
                  className="p-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 rounded-xl text-left transition-colors"
                >
                  <span className="block font-bold text-emerald-300 mb-0.5">
                    ดึงราคาตลาดโลกสด
                  </span>
                  <span className="text-white font-mono-numbers font-extrabold text-sm block">
                    Auto Live Sync
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Live Spot XAU/USD & ER-API
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleApplyCustom} className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <label className="font-semibold text-slate-300 block">
                หรือกรอกราคาที่ปรากฏบนหน้าจอเป๋าตังของคุณเอง:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">
                    ราคาทองโลก (XAU/USD / MTS 99.99%):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={customSpot}
                      onChange={(e) => setCustomSpot(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers font-bold text-sm focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-500 font-mono-numbers">
                      USD
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    อัตราแลกเปลี่ยน (USD/THB):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={customThb}
                      onChange={(e) => setCustomThb(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers font-bold text-sm focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-500 font-mono-numbers">
                      THB
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกและปรับใช้</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
