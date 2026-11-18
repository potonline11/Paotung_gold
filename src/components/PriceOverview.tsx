import React, { useState, useEffect } from 'react';
import {
  ThaiGoldPrices,
  GoldPurityType,
  ApiConnectionStatus,
} from '../types/gold';
import {
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
  RotateCcw,
  Clock,
  Wifi,
  WifiOff,
  Save,
} from 'lucide-react';

interface Props {
  xauUsd: number;
  usdThb: number;
  change24hUsd: number;
  change24hPercent: number;
  thaiGold: ThaiGoldPrices;
  dataSource?: string;
  goldPurity: GoldPurityType;
  onChangeGoldPurity: (purity: GoldPurityType) => void;
  spreadOffsetThb: number;
  onChangeSpreadOffsetThb: (offset: number) => void;
  apiStatus: ApiConnectionStatus;
  xauApiOk: boolean;
  fxApiOk: boolean;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefreshNow: () => void | Promise<void>;
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
  goldPurity,
  onChangeGoldPurity,
  spreadOffsetThb,
  onChangeSpreadOffsetThb,
  apiStatus,
  xauApiOk,
  fxApiOk,
  lastUpdated,
  isRefreshing,
  onRefreshNow,
  onSimulateTick,
  onSyncPrice,
}) => {
  const isPositive = change24hUsd >= 0;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customSpot, setCustomSpot] = useState<number>(xauUsd);
  const [customThb, setCustomThb] = useState<number>(usdThb);
  const [offsetInput, setOffsetInput] = useState<string>(String(spreadOffsetThb));
  const [paotangScreenPrice, setPaotangScreenPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    setOffsetInput(String(spreadOffsetThb));
  }, [spreadOffsetThb]);

  const rawCalculatedPrice =
    thaiGold.rawPrice ??
    Math.round(
      xauUsd * usdThb * (15.244 / 31.1035) * (goldPurity === '965' ? 0.965 : 1)
    );

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  const handleOffsetInputChange = (val: string) => {
    setOffsetInput(val);
    if (val === '' || val === '-' || val === '+') return;
    const parsed = Number(val);
    if (Number.isFinite(parsed)) {
      onChangeSpreadOffsetThb(Math.round(parsed));
    }
  };

  const handleOffsetBlur = () => {
    const parsed = Number(offsetInput);
    if (!Number.isFinite(parsed)) {
      setOffsetInput(String(spreadOffsetThb));
    } else {
      const rounded = Math.round(parsed);
      setOffsetInput(String(rounded));
      onChangeSpreadOffsetThb(rounded);
    }
  };

  const handleCalculateOffsetFromScreen = () => {
    const target = Number(paotangScreenPrice);
    if (!Number.isFinite(target) || target <= 0) return;
    const calculatedOffset = Math.round(target - rawCalculatedPrice);
    onChangeSpreadOffsetThb(calculatedOffset);
    setOffsetInput(String(calculatedOffset));
    setSyncStatus(
      `คำนวณและบันทึก Offset ${calculatedOffset >= 0 ? '+' : ''}${calculatedOffset} บาท ลง localStorage สำเร็จ`
    );
    setTimeout(() => setSyncStatus(null), 2500);
  };

  const handleFetchLiveApi = async () => {
    setIsSubmitting(true);
    setSyncStatus('กำลังดึงราคาตลาดโลก XAU/USD & Frankfurter USD/THB สด...');
    try {
      await onRefreshNow();
      if (onSyncPrice) {
        await onSyncPrice(0, 0, 'LIVE_API');
      }
      setSyncStatus('อัปเดตราคาตลาดโลกและอัตราแลกเปลี่ยนล่าสุดสำเร็จ!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSyncStatus(null);
      }, 1000);
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
      setSyncStatus('บันทึกราคาอ้างอิงชั่วคราวสำเร็จ!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSyncStatus(null);
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = () => {
    if (isRefreshing || apiStatus === 'SYNCING') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
          <RefreshCw className="w-3 h-3 animate-spin" />
          กำลังอัปเดต 15s...
        </span>
      );
    }
    if (apiStatus === 'LIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
          <Wifi className="w-3 h-3 text-emerald-400" />
          Live Real-Time (ทุก 15 วินาที)
        </span>
      );
    }
    if (apiStatus === 'FALLBACK') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
          <WifiOff className="w-3 h-3 text-amber-400" />
          บาง API ล่าช้า (คงค่าล่าสุดที่ถูกต้อง)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-300 bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/30">
        <WifiOff className="w-3 h-3 text-rose-400" />
        เชื่อมต่อขัดข้อง (ใช้ค่าล่าสุด)
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Real-time Connection Status, Last Updated & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
          <span
            className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${
              apiStatus === 'LIVE'
                ? 'bg-emerald-400 animate-pulse'
                : apiStatus === 'ERROR'
                ? 'bg-rose-400'
                : 'bg-amber-400'
            }`}
          ></span>
          <span className="font-semibold text-slate-100">
            กระดานเรียลไทม์เป๋าตัง (MTS · YLG · Aurora)
          </span>
          {renderStatusBadge()}

          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono-numbers bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
            <Clock className="w-3 h-3 text-slate-400" />
            อัปเดตล่าสุด: {formattedLastUpdated}
          </span>

          <span className="hidden xl:inline-flex items-center gap-2 text-[11px] text-slate-400 font-mono-numbers">
            <span className={xauApiOk ? 'text-emerald-400' : 'text-amber-400'}>
              XAU: {xauApiOk ? 'Gold-API' : 'Cache'}
            </span>
            <span>·</span>
            <span className={fxApiOk ? 'text-emerald-400' : 'text-amber-400'}>
              FX: {fxApiOk ? 'Frankfurter' : 'Cache'}
            </span>
          </span>
        </div>

        {/* Action Buttons: Refresh, Calibrate & Simulation */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onRefreshNow()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-200 border border-slate-700 rounded-lg font-medium transition-colors"
            title="ดึงราคาทองคำ XAU/USD และ Frankfurter USD/THB ล่าสุดทันที"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>อัปเดตทันที</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCustomSpot(xauUsd);
              setCustomThb(usdThb);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg font-medium transition-all"
            title="ปรับ Spread Offset ให้ตรงกับหน้าจอแอปเป๋าตัง"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              Offset: {spreadOffsetThb >= 0 ? '+' : ''}
              {spreadOffsetThb} ฿
            </span>
          </button>

          {onSimulateTick && (
            <div className="flex items-center gap-1 text-xs pl-1 border-l border-slate-800">
              <button
                type="button"
                onClick={() => onSimulateTick('down')}
                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-mono-numbers transition-colors text-[11px]"
                title="ลดราคาทองคำ -$5 เพื่อทดสอบแจ้งเตือนจุดเข้าซื้อ"
              >
                -$5
              </button>
              <button
                type="button"
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

      {/* Gold Purity Toggle & Persistent Spread Offset Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 bg-slate-900/75 border border-slate-800 rounded-xl">
        {/* Toggle: Gold 99.99% vs Gold 96.5% */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 mr-1">ประเภททองคำ:</span>
          <div className="inline-flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => onChangeGoldPurity('9999')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                goldPurity === '9999'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ทอง 99.99% (เป๋าตัง Gold Wallet)
            </button>
            <button
              type="button"
              onClick={() => onChangeGoldPurity('965')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                goldPurity === '965'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ทอง 96.5% (ทองไทย)
            </button>
          </div>
        </div>

        {/* Inline Persistent Spread Offset Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            ปรับให้ตรงกับเป๋าตัง (Offset):
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onChangeSpreadOffsetThb(spreadOffsetThb - 50)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-mono-numbers"
            >
              -50
            </button>
            <button
              type="button"
              onClick={() => onChangeSpreadOffsetThb(spreadOffsetThb - 10)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-mono-numbers"
            >
              -10
            </button>

            <div className="relative w-24">
              <input
                type="number"
                step="1"
                value={offsetInput}
                onChange={(e) => handleOffsetInputChange(e.target.value)}
                onBlur={handleOffsetBlur}
                aria-label="ส่วนต่างราคา Offset เป็นบาท"
                className="w-full bg-slate-950 border border-amber-500/40 rounded-md pl-2 pr-6 py-1 text-center text-amber-300 font-mono-numbers font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="absolute right-2 top-1 text-[11px] text-slate-500">฿</span>
            </div>

            <button
              type="button"
              onClick={() => onChangeSpreadOffsetThb(spreadOffsetThb + 10)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-mono-numbers"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => onChangeSpreadOffsetThb(spreadOffsetThb + 50)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-mono-numbers"
            >
              +50
            </button>
            {spreadOffsetThb !== 0 && (
              <button
                type="button"
                onClick={() => onChangeSpreadOffsetThb(0)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                title="รีเซ็ต Offset เป็น 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-[11px] text-emerald-400/90 font-medium">
            จำค่าถาวร · ปรับ Entry/TP/SL อัตโนมัติ
          </span>
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
            <span>
              {dataSource === 'CUSTOM_PAOTANG' ? 'โหมดอ้างอิงเฉพาะจุด' : 'อ้างอิง Gold-API สด (15s)'}
            </span>
            <span className="text-amber-400 font-mono-numbers font-semibold">
              MTS Spot: ${xauUsd.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Card 2: USD/THB Exchange Rate (Frankfurter Live) */}
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
              ฿{usdThb.toFixed(3)}
            </div>
            <div className="text-xs text-slate-400 font-mono-numbers">บาท / ดอลลาร์</div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              {usdThb > 34 ? 'บาทอ่อน (หนุนราคาทองในประเทศ)' : 'บาทแข็ง (กดดันราคาทอง)'}
            </span>
            <span className="text-emerald-400 font-mono-numbers">Frankfurter FX (15s)</span>
          </div>
        </div>

        {/* Card 3: Active Gold Purity (99.99% Paotang Gold Wallet or 96.5% Thai Gold) + Spread Offset */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {goldPurity === '9999'
                ? 'ทอง 99.99% (เป๋าตัง Gold Wallet)'
                : 'ทอง 96.5% (ทองไทย / สมาคม)'}
            </span>
            <span className="text-amber-400/90 font-mono-numbers text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {spreadOffsetThb !== 0
                ? `Offset ${spreadOffsetThb > 0 ? '+' : ''}${spreadOffsetThb} ฿`
                : 'สูตร Spot × FX'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">
                {goldPurity === '9999' ? 'ราคาซื้อ/ขายอ้างอิง (บาทละ)' : 'ขายออก (บาทละ)'}
              </span>
              <span className="text-xl font-bold text-amber-400 font-mono-numbers">
                ฿{thaiGold.associationSell.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">รับซื้อคืน (บาทละ)</span>
              <span className="text-xl font-bold text-slate-200 font-mono-numbers">
                ฿{thaiGold.associationBuy.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between gap-2">
            <span>ฐานคำนวณ: ฿{rawCalculatedPrice.toLocaleString()}</span>
            <span className="font-mono-numbers text-slate-300">
              {goldPurity === '9999'
                ? `เทียบ 96.5%: ฿${(thaiGold.gold965Price ?? Math.round(rawCalculatedPrice * 0.965)).toLocaleString()}`
                : `เทียบ 99.99%: ฿${(thaiGold.gold9999Price ?? Math.round(rawCalculatedPrice / 0.965)).toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Spread Offset Calculator & Reference Sync */}
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
                    ปรับเทียบให้ตรงกับเป๋าตัง (Spread Offset)
                  </h3>
                  <p className="text-xs text-slate-400">
                    บันทึกส่วนต่างเป็นบาทลง localStorage ถาวร และอัปเดต Entry/TP/SL อัตโนมัติ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {syncStatus && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncStatus}</span>
              </div>
            )}

            {/* Helper: Compute Offset from actual Paotang screen price */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">
                  วิธีง่ายที่สุด: เทียบกับราคาจริงบนหน้าจอแอปเป๋าตัง
                </span>
                <span className="text-slate-400 font-mono-numbers">
                  ({goldPurity === '9999' ? '99.99%' : '96.5%'})
                </span>
              </div>
              <p className="text-slate-400">
                ราคาสูตรปัจจุบัน:{' '}
                <strong className="text-white font-mono-numbers">
                  ฿{rawCalculatedPrice.toLocaleString()}
                </strong>{' '}
                + Offset ปัจจุบัน:{' '}
                <strong className="text-amber-300 font-mono-numbers">
                  {spreadOffsetThb >= 0 ? '+' : ''}
                  {spreadOffsetThb} ฿
                </strong>{' '}
                = ฿{Math.round(rawCalculatedPrice + spreadOffsetThb).toLocaleString()}
              </p>

              <div className="flex gap-2">
                <input
                  type="number"
                  step="1"
                  placeholder="กรอกราคาบาทละที่เห็นในแอปเป๋าตัง (เช่น 53250)"
                  value={paotangScreenPrice}
                  onChange={(e) => setPaotangScreenPrice(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-numbers text-sm focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleCalculateOffsetFromScreen}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl whitespace-nowrap transition-colors"
                >
                  คำนวณ Offset
                </button>
              </div>
            </div>

            {/* Quick Live Sync & Reset Offset */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handleFetchLiveApi}
                disabled={isSubmitting}
                className="p-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 rounded-xl text-left transition-colors"
              >
                <span className="block font-bold text-emerald-300 mb-0.5">
                  ดึงราคาตลาดโลกสดทันที
                </span>
                <span className="text-[11px] text-slate-300">
                  Gold-API (XAU/USD) & Frankfurter (USD/THB)
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onChangeSpreadOffsetThb(0);
                  setOffsetInput('0');
                  setSyncStatus('รีเซ็ต Spread Offset เป็น 0 บาทแล้ว');
                }}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors"
              >
                <span className="block font-bold text-slate-200 mb-0.5">
                  รีเซ็ต Spread Offset = 0
                </span>
                <span className="text-[11px] text-slate-400">
                  กลับไปใช้ราคาสูตร Spot × FX ล้วน
                </span>
              </button>
            </div>

            {/* Custom Reference Override Form */}
            <form
              onSubmit={handleApplyCustom}
              className="space-y-3 pt-3 border-t border-slate-800 text-xs"
            >
              <label className="font-semibold text-slate-300 block">
                หรือกำหนดค่าอ้างอิง XAU/USD และ USD/THB ชั่วคราว:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">ราคาทองโลก (XAU/USD):</label>
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
                  <label className="text-slate-400 block mb-1">อัตราแลกเปลี่ยน (USD/THB):</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
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
                  ปิดหน้าต่าง
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>ปรับใช้ Spot & FX</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
