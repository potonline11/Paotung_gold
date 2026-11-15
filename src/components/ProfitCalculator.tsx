import React, { useState } from 'react';
import { PartnerQuote } from '../types/gold';
import { Calculator, ArrowRight, DollarSign, Wallet, Percent, TrendingUp } from 'lucide-react';

interface Props {
  partners: {
    mts: PartnerQuote;
    ylg: PartnerQuote;
    aurora: PartnerQuote;
  };
  currentSpot: number;
  currentThaiGold: number;
  defaultEntrySpot?: number;
  defaultTpSpot?: number;
}

export const ProfitCalculator: React.FC<Props> = ({
  partners,
  currentSpot,
  currentThaiGold,
  defaultEntrySpot,
  defaultTpSpot,
}) => {
  const [walletType, setWalletType] = useState<'USD' | 'THB'>('THB');
  const [partner, setPartner] = useState<'mts' | 'ylg' | 'aurora'>('mts');
  const [capitalThb, setCapitalThb] = useState<number>(50000);
  const [capitalUsd, setCapitalUsd] = useState<number>(2000);

  // Price inputs
  const [entryPrice, setEntryPrice] = useState<number>(
    walletType === 'THB' ? currentThaiGold : defaultEntrySpot || currentSpot
  );
  const [exitPrice, setExitPrice] = useState<number>(
    walletType === 'THB' ? currentThaiGold + 450 : defaultTpSpot || (currentSpot + 25)
  );

  // Update when parent market data updates
  React.useEffect(() => {
    if (walletType === 'THB') {
      setEntryPrice(currentThaiGold);
      setExitPrice(currentThaiGold + 650);
    } else {
      setEntryPrice(currentSpot);
      setExitPrice(Number((currentSpot * 1.01).toFixed(2))); // +1.0% matching Paotang target
    }
  }, [currentSpot, currentThaiGold, walletType]);

  // Update defaults when switching wallet type
  const handleWalletTypeChange = (type: 'USD' | 'THB') => {
    setWalletType(type);
    if (type === 'THB') {
      setEntryPrice(currentThaiGold);
      setExitPrice(currentThaiGold + 650);
    } else {
      setEntryPrice(currentSpot);
      setExitPrice(Number((currentSpot * 1.01).toFixed(2)));
    }
  };

  // Calculations
  const selectedQuote = partners[partner];
  let goldQuantity = 0;
  let spreadCost = 0;
  let grossProfit = 0;
  let netProfit = 0;
  let roi = 0;

  if (walletType === 'THB') {
    const buyPrice = entryPrice;
    goldQuantity = capitalThb / buyPrice; // in baht weight
    const rawGainPerBaht = exitPrice - buyPrice;
    // Spread cost
    const spread = selectedQuote.thb965?.spread || 60;
    grossProfit = rawGainPerBaht * goldQuantity;
    spreadCost = spread * goldQuantity;
    netProfit = (exitPrice - (buyPrice + spread)) * goldQuantity;
    roi = (netProfit / capitalThb) * 100;
  } else {
    // USD Wallet
    const buyPrice = entryPrice;
    goldQuantity = capitalUsd / buyPrice; // in oz
    const rawGainPerOz = exitPrice - buyPrice;
    const spread = selectedQuote.usd9999?.spread || 0.40;
    grossProfit = rawGainPerOz * goldQuantity;
    spreadCost = spread * goldQuantity;
    netProfit = (exitPrice - (buyPrice + spread)) * goldQuantity;
    roi = (netProfit / capitalUsd) * 100;
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
            <Calculator className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white">เครื่องคำนวณกำไรเป๋าตัง (Paotang Profit Estimator)</h3>
            <p className="text-xs text-slate-400">คำนวณกำไรสุทธิหลังหักสเปรดร้านทองสำหรับการเก็งกำไร 1 สัปดาห์</p>
          </div>
        </div>

        {/* Currency Wallet Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleWalletTypeChange('THB')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              walletType === 'THB'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            พอร์ตเงินบาท (THB Wallet 96.5%)
          </button>
          <button
            onClick={() => handleWalletTypeChange('USD')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              walletType === 'USD'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            พอร์ตดอลลาร์ (USD Wallet 99.99%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Inputs */}
        <div className="lg:col-span-7 space-y-4 text-xs">
          {/* Shop Selector */}
          <div>
            <label className="text-slate-300 font-medium block mb-1.5">เลือกร้านทองพันธมิตรบนเป๋าตัง:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPartner('mts')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  partner === 'mts'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                MTS Gold (สเปรด 0.40$ / 60฿)
              </button>
              <button
                onClick={() => setPartner('ylg')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  partner === 'ylg'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                YLG Bullion (สเปรด 0.50$ / 65฿)
              </button>
              <button
                onClick={() => setPartner('aurora')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  partner === 'aurora'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Aurora (สเปรด 70฿ / 200 สาขา)
              </button>
            </div>
          </div>

          {/* Capital Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-medium">
                เงินลงทุนในเป๋าตัง ({walletType === 'THB' ? 'บาท' : 'USD'}):
              </label>
              {walletType === 'THB' ? (
                <div className="flex gap-1">
                  {[20000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCapitalThb(amt)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono-numbers"
                    >
                      ฿{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-1">
                  {[1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCapitalUsd(amt)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono-numbers"
                    >
                      ${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                value={walletType === 'THB' ? capitalThb : capitalUsd}
                onChange={(e) =>
                  walletType === 'THB'
                    ? setCapitalThb(parseFloat(e.target.value) || 0)
                    : setCapitalUsd(parseFloat(e.target.value) || 0)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono-numbers font-semibold focus:outline-none focus:border-amber-500 text-sm"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 text-xs">
                {walletType === 'THB' ? 'บาท (THB)' : 'ดอลลาร์ (USD)'}
              </span>
            </div>
          </div>

          {/* Entry & Exit Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                ราคาเข้าซื้อ (Buy / Entry):
              </label>
              <input
                type="number"
                step={walletType === 'THB' ? '50' : '0.1'}
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-numbers font-semibold focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                ราคาเป้าหมายขาย (Sell / Target):
              </label>
              <input
                type="number"
                step={walletType === 'THB' ? '50' : '0.1'}
                value={exitPrice}
                onChange={(e) => setExitPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono-numbers font-semibold focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right column: Results Card */}
        <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">
              ประมาณการผลตอบแทนสุทธิ (1 สัปดาห์)
            </span>

            <div className="my-2">
              <div className="text-3xl font-extrabold font-mono-numbers text-emerald-400">
                {netProfit >= 0 ? '+' : ''}
                {walletType === 'THB'
                  ? `฿${Math.round(netProfit).toLocaleString()}`
                  : `$${netProfit.toFixed(2)}`}
              </div>
              <div className="text-xs font-semibold text-emerald-400/90 font-mono-numbers mt-0.5">
                กำไรสุทธิ {roi >= 0 ? '+' : ''}
                {roi.toFixed(2)}% ของเงินลงทุน
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono-numbers">
              <div className="flex justify-between text-slate-400">
                <span>ปริมาณทองคำที่ได้:</span>
                <span className="text-white font-semibold">
                  {walletType === 'THB'
                    ? `${goldQuantity.toFixed(4)} บาททอง`
                    : `${goldQuantity.toFixed(4)} ออนซ์ (oz)`}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>กำไรก่อนหักสเปรด:</span>
                <span className="text-slate-200">
                  {walletType === 'THB'
                    ? `฿${Math.round(grossProfit).toLocaleString()}`
                    : `$${grossProfit.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ค่าสเปรดร้านทอง ({selectedQuote.name.split(' ')[0]}):</span>
                <span className="text-rose-400">
                  -{walletType === 'THB'
                    ? `฿${Math.round(spreadCost).toLocaleString()}`
                    : `$${spreadCost.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            💡 คำแนะนำ: หากขายภายใน 3-5 วัน แนะนำตั้งจุด TP1 เพื่อล็อกกำไรก่อนความผันผวนของเสาร์-อาทิตย์
          </div>
        </div>
      </div>
    </div>
  );
};
