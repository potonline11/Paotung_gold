import React, { useState, useEffect } from 'react';
import { SpeculationPlan } from '../types/gold';
import {
  Tag,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Bell,
  Check,
  Info,
  Calendar,
  DollarSign,
  HelpCircle,
  Smartphone,
} from 'lucide-react';

interface Props {
  currentSpot: number;
  speculationPlan: SpeculationPlan;
  onSetAlert: (price: number, type: 'ABOVE' | 'BELOW', label: string) => void;
}

export const PaotangOrderPlanner: React.FC<Props> = ({
  currentSpot,
  speculationPlan,
  onSetAlert,
}) => {
  // Order Type: 'SELL' (คำสั่งขายทอง) vs 'BUY' (คำสั่งซื้อทอง)
  const [orderType, setOrderType] = useState<'SELL' | 'BUY'>('SELL');

  // Percent shift (-5% to +5%)
  const [percentShift, setPercentShift] = useState<number>(1.0); // +1.00% default for sell, -1.00% default for buy
  const [weightOz, setWeightOz] = useState<number>(0.05);
  const [isAlertAdded, setIsAlertAdded] = useState(false);
  const [showHowToModal, setShowHowToModal] = useState(false);

  // When orderType switches, update default percent
  const handleSwitchOrderType = (type: 'SELL' | 'BUY') => {
    setOrderType(type);
    if (type === 'SELL') {
      setPercentShift(1.0);
    } else {
      setPercentShift(-0.97);
    }
  };

  // Target price calculation
  // For SELL: Spot * (1 + percentShift/100) (e.g. 3974.19 * 1.01 = 4013.93)
  // For BUY: Spot * (1 + percentShift/100) (e.g. 3972.81 * (1 - 0.0097) = 3934.40)
  const calculatedPrice = Number((currentSpot * (1 + percentShift / 100)).toFixed(2));
  const totalValueUsd = Number((calculatedPrice * weightOz).toFixed(2));

  // Profit/Gain comparison relative to current spot
  const diffPerOz = calculatedPrice - currentSpot;
  const totalDiffUsd = diffPerOz * weightOz;

  const handleAddOrderAlert = () => {
    const label =
      orderType === 'SELL'
        ? `เป้าหมายตั้งขายเป๋าตัง (+${percentShift.toFixed(2)}%)`
        : `เป้าหมายตั้งซื้อเป๋าตัง (${percentShift.toFixed(2)}%)`;

    onSetAlert(calculatedPrice, orderType === 'SELL' ? 'ABOVE' : 'BELOW', label);
    setIsAlertAdded(true);
    setTimeout(() => setIsAlertAdded(false), 2500);
  };

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
            <Tag className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>เครื่องมือช่วยตั้งราคาบนเป๋าตัง (Paotang Limit Order Planner)</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                ตั้งได้นานถึง 7 วัน
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              จำลองและคำนวณราคาขาย (Sell Limit) และราคาซื้อ (Buy Limit) ตามรูปแบบแอปเป๋าตังจริง
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHowToModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>วิธีกำหนดราคาขายบนเป๋าตัง</span>
        </button>
      </div>

      {/* Mode Switch: คำสั่งขายทอง vs คำสั่งซื้อทอง */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Order Setup (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Order Type Tabs */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => handleSwitchOrderType('SELL')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                orderType === 'SELL'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>คำสั่งขายทอง (ตั้งราคาขายสูงกว่าตลาด)</span>
            </button>
            <button
              onClick={() => handleSwitchOrderType('BUY')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                orderType === 'BUY'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>คำสั่งซื้อทอง (ตั้งราคาซื้อต่ำกว่าตลาด)</span>
            </button>
          </div>

          {/* Current Market Price Banner */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-slate-300 font-semibold">MTS แม่ทองสุก (ทอง 99.99%):</span>
            </div>
            <div className="font-mono text-white text-sm font-extrabold">
              ${currentSpot.toFixed(2)} <span className="text-xs font-normal text-slate-400">USD/OZ</span>
            </div>
          </div>

          {/* Percentage Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                {orderType === 'SELL'
                  ? 'ราคาที่ต้องการขาย (สูงกว่าตลาดได้ไม่เกิน +5%):'
                  : 'ราคาที่ต้องการซื้อ (ต่ำกว่าตลาดได้ไม่เกิน -5%):'}
              </span>
              <span className="text-slate-400 text-[11px]">
                {orderType === 'SELL' ? 'เน้นขายทำกำไร' : 'เน้นช้อนซื้อย่อตัว'}
              </span>
            </div>

            {/* Quick Presets (1% to 5%) */}
            <div className="grid grid-cols-5 gap-2 text-xs font-mono">
              {orderType === 'SELL'
                ? [1, 2, 3, 4, 5].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPercentShift(pct)}
                      className={`py-2 rounded-xl border text-center font-bold transition-all relative ${
                        Math.abs(percentShift - pct) < 0.05
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                          : pct === 5
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:border-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>+{pct}%</div>
                      {pct === 5 && (
                        <span className="text-[8px] bg-amber-500 text-slate-950 px-1 rounded font-sans font-extrabold block mt-0.5 leading-tight">
                          เป้าสัปดาห์
                        </span>
                      )}
                    </button>
                  ))
                : [-1, -2, -3, -4, -5].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPercentShift(pct)}
                      className={`py-2 rounded-xl border text-center font-bold transition-all ${
                        Math.abs(percentShift - pct) < 0.05
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
            </div>

            {/* Custom Percent or Price Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">
                  ปรับเปอร์เซ็นต์ส่วนต่าง (%):
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-slate-400 font-bold text-sm">
                    {orderType === 'SELL' ? '+' : ''}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min={orderType === 'SELL' ? 0.01 : -5}
                    max={orderType === 'SELL' ? 5 : -0.01}
                    value={percentShift}
                    onChange={(e) => setPercentShift(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-slate-400 text-xs">%</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">
                  ราคาที่คำนวณได้ (นำไปกรอกในเป๋าตัง):
                </label>
                <div className="text-lg font-extrabold text-amber-400 font-mono py-1">
                  ${calculatedPrice.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gold Weight Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-200">
                น้ำหนักทองที่ต้องการ{orderType === 'SELL' ? 'ขาย' : 'ซื้อ'} (OZ):
              </label>
              <span className="text-slate-400 text-[11px]">
                ขั้นต่ำ 0.05 OZ และไม่เกิน 300.00 OZ ต่อครั้ง
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="grid grid-cols-4 gap-1.5 flex-1">
                {[0.05, 0.1, 0.5, 1.0].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeightOz(w)}
                    className={`py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                      weightOz === w
                        ? 'bg-slate-800 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {w} OZ
                  </button>
                ))}
              </div>

              <div className="w-28 relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.05"
                  max="300"
                  value={weightOz}
                  onChange={(e) => setWeightOz(parseFloat(e.target.value) || 0.05)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs font-bold text-right pr-7"
                />
                <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono">
                  OZ
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddOrderAlert}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                orderType === 'SELL'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isAlertAdded ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              <span>
                {isAlertAdded
                  ? 'เพิ่มเข้าการแจ้งเตือน LINE เรียบร้อยแล้ว!'
                  : `ตั้งแจ้งเตือนเมื่อราคาแตะ $${calculatedPrice.toFixed(2)} ทันที`}
              </span>
            </button>
          </div>
        </div>

        {/* Right Side: Smartphone Paotang Order Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>ตัวอย่างหน้าจอคำสั่งบนเป๋าตังจริง</span>
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                {orderType === 'SELL' ? 'คำสั่งขายทอง' : 'คำสั่งซื้อทอง'}
              </span>
            </div>

            {/* Simulated Paotang Screen Card */}
            <div className="bg-[#2B2D31] rounded-2xl p-4 border border-slate-700/60 font-sans space-y-3 shadow-lg">
              {/* Top Card Title */}
              <div className="bg-[#D4A359]/20 border border-[#D4A359]/30 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#D4A359] flex items-center justify-center text-slate-950 font-black text-[10px]">
                    MTS
                  </div>
                  <span className="text-white text-xs font-bold">MTS แม่ทองสุก ทอง 99.99%</span>
                </div>
                <span className="text-[#D4A359] text-xs font-mono font-bold">
                  ${currentSpot.toFixed(2)}
                </span>
              </div>

              {/* Order Target Display */}
              <div className="bg-[#1E1F22] p-3 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-[11px] text-slate-400 block">
                  {orderType === 'SELL' ? 'ราคาที่ต้องการขาย' : 'ราคาที่ต้องการซื้อ'}
                </span>
                <div className="flex items-baseline justify-between font-mono">
                  <span
                    className={`text-xs font-bold ${
                      orderType === 'SELL' ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {percentShift >= 0 ? `+${percentShift.toFixed(2)}%` : `${percentShift.toFixed(2)}%`}
                  </span>
                  <span className="text-lg font-extrabold text-white">
                    ${calculatedPrice.toFixed(2)} <span className="text-xs text-slate-400">USD</span>
                  </span>
                </div>
              </div>

              {/* Weight & Total Value */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>น้ำหนักทอง:</span>
                  <span className="text-white font-mono font-semibold">{weightOz} OZ</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ช่วงเวลาคำสั่งมีผล:</span>
                  <span className="text-amber-400 font-semibold">ล่วงหน้านานถึง 7 วัน</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                  <span className="text-slate-300 font-bold">มูลค่ารวม (USD):</span>
                  <span className="text-xl font-extrabold text-white font-mono">
                    ${totalValueUsd.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Profit note */}
              <div className="bg-[#1E1F22]/80 p-2 rounded-lg text-[11px] text-slate-300 flex items-center justify-between">
                <span>{orderType === 'SELL' ? 'กำไรเพิ่มจากราคาตลาด:' : 'ประหยัดจากราคาตลาด:'}</span>
                <span
                  className={`font-mono font-bold ${
                    orderType === 'SELL' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {orderType === 'SELL'
                    ? `+$${Math.abs(totalDiffUsd).toFixed(2)} USD`
                    : `-$${Math.abs(totalDiffUsd).toFixed(2)} USD`}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
            💡 <strong>วิธีนำไปใช้ในแอปเป๋าตัง:</strong> เข้าเมนู{' '}
            <strong className="text-white">{orderType === 'SELL' ? 'ขายทอง' : 'ซื้อทอง'}</strong> &gt;
            เลือกแท็บ <strong className="text-amber-300">"ตั้งราคา"</strong> &gt; กดเลือก{' '}
            <strong className="text-white">
              {percentShift >= 0 ? `+${percentShift.toFixed(0)}%` : `${percentShift.toFixed(0)}%`}
            </strong>{' '}
            หรือระบุราคา <strong className="text-amber-300 font-mono">${calculatedPrice.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Modal: How to set Selling Price on Paotang App */}
      {showHowToModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    วิธีกำหนดราคาขายบนแอปเป๋าตังจริง
                  </h3>
                  <p className="text-xs text-slate-400">คำอธิบายขั้นตอนการตั้งราคาขายทำกำไรล่วงหน้า</p>
                </div>
              </div>
              <button
                onClick={() => setShowHowToModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-200">
                <strong>📌 ข้อสำคัญ:</strong> ในภาพที่คุณส่งมาล่าสุด เป็นหน้าจอ{' '}
                <strong className="text-white">"คำสั่งซื้อทอง"</strong> จึงมีเฉพาะปุ่มลดราคา (-1% ถึง -5%)
                สำหรับการช้อนซื้อเท่านั้น!
              </div>

              <div className="space-y-2">
                <span className="font-bold text-white block">
                  หากต้องการตั้ง "ราคาขาย" (Sell Limit) บนเป๋าตัง ต้องทำดังนี้:
                </span>
                <ol className="list-decimal list-inside space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <li>
                    ต้องมีทองคำอยู่ในพอร์ต Gold Wallet ของคุณก่อน (หากยังไม่มีทอง จะกดขายไม่ได้)
                  </li>
                  <li>
                    ในหน้า Gold Wallet ให้กดปุ่ม <strong>"ขายทอง" (คำสั่งขายทอง)</strong> สีทอง
                  </li>
                  <li>
                    ด้านบนสุดจะมี 2 แท็บ: <strong>"ราคาตลาด"</strong> และ{' '}
                    <strong className="text-amber-400">"ตั้งราคา"</strong> ให้กดเลือกแท็บ{' '}
                    <strong className="text-amber-400">"ตั้งราคา"</strong>
                  </li>
                  <li>
                    ระบบจะมีปุ่มเปอร์เซ็นต์ให้กดตั้งราคาขายสูงกว่าราคาตลาด:{' '}
                    <span className="text-emerald-400 font-bold">+1%, +2%, +3%, +4%, +5%</span>
                  </li>
                  <li>
                    ตัวอย่างเช่น ราคาทอง $3,974.19 หากกด <strong>+1.00%</strong> ราคาขายจะตั้งไว้ที่{' '}
                    <strong>4,013.93 USD</strong>
                  </li>
                  <li>
                    คำสั่งตั้งราคาจะมีผลนานถึง <strong>7 วัน</strong> (หากราคาแตะถึง ระบบเป๋าตังจะทำการขายทำกำไรให้คุณอัตโนมัติ)
                  </li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHowToModal(false)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
