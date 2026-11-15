import React from 'react';
import { PartnerQuote } from '../types/gold';
import { ShieldCheck, Zap, Award, ExternalLink } from 'lucide-react';

interface Props {
  partners: {
    mts: PartnerQuote;
    ylg: PartnerQuote;
    aurora: PartnerQuote;
  };
  onSelectPartner?: (partnerKey: 'mts' | 'ylg' | 'aurora') => void;
  selectedPartner?: 'mts' | 'ylg' | 'aurora';
}

export const PartnerCards: React.FC<Props> = ({
  partners,
  onSelectPartner,
  selectedPartner = 'mts',
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>กระดาน 3 ร้านทองพันธมิตรบนเป๋าตัง</span>
            <span className="text-xs font-normal text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              เปรียบเทียบสเปรด (Spread Comparison)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            สเปรดที่แคบกว่าช่วยให้นักเก็งกำไรระยะสั้น 1 สัปดาห์ คืนทุนและเริ่มทำกำไรได้รวดเร็วที่สุด
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MTS Gold */}
        <div
          onClick={() => onSelectPartner?.('mts')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedPartner === 'mts'
              ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="font-bold text-slate-100 text-sm">{partners.mts.name}</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              สเปรด USD แคบสุด 0.40$
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* USD Wallet 99.99% */}
            {partners.mts.usd9999 && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px]">
                  <span>Gold Wallet (USD 99.99%)</span>
                  <span className="text-amber-400 font-mono-numbers">Spread: ${partners.mts.usd9999.spread}</span>
                </div>
                <div className="flex items-center justify-between font-mono-numbers font-semibold">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">ซื้อ (Buy)</span>
                    <span className="text-white">${partners.mts.usd9999.buy.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-normal">ขาย (Sell)</span>
                    <span className="text-emerald-400">${partners.mts.usd9999.sell.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* THB Wallet 96.5% */}
            {partners.mts.thb965 && (
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">ทอง 96.5% บาทละ:</span>
                <span className="font-mono-numbers text-slate-200">
                  ฿{partners.mts.thb965.sell.toLocaleString()} (ส่วนต่าง {partners.mts.thb965.spread}฿)
                </span>
              </div>
            )}
          </div>

          <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{partners.mts.popularFor}</span>
          </p>
        </div>

        {/* YLG Bullion */}
        <div
          onClick={() => onSelectPartner?.('ylg')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedPartner === 'ylg'
              ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="font-bold text-slate-100 text-sm">{partners.ylg.name}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
              สเปรด USD 0.50$
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {partners.ylg.usd9999 && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px]">
                  <span>Gold Wallet (USD 99.99%)</span>
                  <span className="text-amber-400 font-mono-numbers">Spread: ${partners.ylg.usd9999.spread}</span>
                </div>
                <div className="flex items-center justify-between font-mono-numbers font-semibold">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">ซื้อ (Buy)</span>
                    <span className="text-white">${partners.ylg.usd9999.buy.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-normal">ขาย (Sell)</span>
                    <span className="text-emerald-400">${partners.ylg.usd9999.sell.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {partners.ylg.thb965 && (
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">ทอง 96.5% บาทละ:</span>
                <span className="font-mono-numbers text-slate-200">
                  ฿{partners.ylg.thb965.sell.toLocaleString()} (ส่วนต่าง {partners.ylg.thb965.spread}฿)
                </span>
              </div>
            )}
          </div>

          <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{partners.ylg.popularFor}</span>
          </p>
        </div>

        {/* Aurora */}
        <div
          onClick={() => onSelectPartner?.('aurora')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedPartner === 'aurora'
              ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="font-bold text-slate-100 text-sm">{partners.aurora.name}</span>
            </div>
            <span className="text-[11px] font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
              ถอนทองสาขา 200+
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {partners.aurora.thb965 && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px]">
                  <span>Gold Wallet (THB 96.5%)</span>
                  <span className="text-amber-400 font-mono-numbers">Spread: ฿{partners.aurora.thb965.spread}</span>
                </div>
                <div className="flex items-center justify-between font-mono-numbers font-semibold">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">ซื้อ (Buy)</span>
                    <span className="text-white">฿{partners.aurora.thb965.buy.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-normal">ขาย (Sell)</span>
                    <span className="text-emerald-400">฿{partners.aurora.thb965.sell.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {partners.aurora.thb9999PerGram && (
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">99.99% ต่อกรัม:</span>
                <span className="font-mono-numbers text-slate-200">
                  ฿{partners.aurora.thb9999PerGram.sell.toLocaleString()} (ส่วนต่าง {partners.aurora.thb9999PerGram.spread}฿)
                </span>
              </div>
            )}
          </div>

          <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{partners.aurora.popularFor}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
