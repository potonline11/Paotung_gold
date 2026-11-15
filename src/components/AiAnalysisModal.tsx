import React, { useState } from 'react';
import { AiMarketAnalysis } from '../types/gold';
import { Sparkles, X, Copy, Check, RefreshCw, ShieldAlert, TrendingUp, Compass, Award } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  analysis: AiMarketAnalysis | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const AiAnalysisModal: React.FC<Props> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!analysis) return;
    const text = `
🤖 สรุปกลยุทธ์เก็งกำไรทองคำเป๋าตัง 1 สัปดาห์ (AI Gemini Analyst)
- แนวโน้ม: ${analysis.sentiment}
- สรุปภาพรวม: ${analysis.macroSummary}
- คาดการณ์ 7 วัน: ${analysis.weeklyOutlook}
- กลยุทธ์เป๋าตัง: ${analysis.paotangStrategy}
- แนวรับ: ${analysis.keyLevels.support}
- แนวต้าน: ${analysis.keyLevels.resistance}
- จุดตัดขาดทุน: ${analysis.keyLevels.stopLoss}
- ข้อควรระวัง: ${analysis.riskWarnings}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI Market Strategist (Gemini 3.8 Flash)</span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono-numbers">
                  Model: gemini-3.8-flash
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                วิเคราะห์เชิงลึกสำหรับนักเทรดทองคำแอปเป๋าตัง เพื่อทำกำไรสูงสุดใน 1 สัปดาห์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="วิเคราะห์ใหม่"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-300 font-medium">กำลังประมวลผลข้อมูลตลาดและคำนวณกลยุทธ์ผ่าน Gemini AI...</p>
              <p className="text-xs text-slate-500">
                วิเคราะห์ราคาทองโลก, ค่าเงินบาท, สเปรดร้านค้า MTS/YLG/Aurora และอินดิเคเตอร์ RSI/MACD
              </p>
            </div>
          ) : analysis ? (
            <>
              {/* Sentiment Pill & Macro Summary */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">ภาพรวมแนวโน้มสัปดาห์นี้:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {analysis.sentiment} (ตลาดมีแนวโน้มขาขึ้น)
                  </span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {analysis.macroSummary}
                </p>
              </div>

              {/* Weekly Outlook */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>คาดการณ์ทิศทางราคาทองคำใน 7 วันข้างหน้า:</span>
                </h4>
                <p className="text-slate-300 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  {analysis.weeklyOutlook}
                </p>
              </div>

              {/* Paotang Strategy Box */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>กลยุทธ์เทรดบนแอปเป๋าตัง (การเลือกพอร์ต & การแบ่งไม้):</span>
                </h4>
                <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-4 rounded-xl border border-amber-500/20 text-xs text-slate-200 leading-relaxed">
                  {analysis.paotangStrategy}
                </div>
              </div>

              {/* Strategic Key Levels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono-numbers">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-emerald-400 font-bold block mb-1">
                    🟢 แนวรับสำคัญ (Support)
                  </span>
                  <span className="text-xs text-slate-300 font-sans">
                    {analysis.keyLevels.support}
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-amber-400 font-bold block mb-1">
                    🎯 แนวต้านเป้าหมาย (Resistance)
                  </span>
                  <span className="text-xs text-slate-300 font-sans">
                    {analysis.keyLevels.resistance}
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-rose-400 font-bold block mb-1">
                    🛑 จุดตัดขาดทุน (Stop Loss)
                  </span>
                  <span className="text-xs text-slate-300 font-sans">
                    {analysis.keyLevels.stopLoss}
                  </span>
                </div>
              </div>

              {/* Risk Warnings */}
              <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">ข้อควรระวังสำคัญสำหรับพอร์ตเป๋าตัง:</span>
                  <p className="text-rose-200/90 leading-relaxed">{analysis.riskWarnings}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              ไม่พบข้อมูลบทวิเคราะห์ กดปุ่มวิเคราะห์ใหม่เพื่อเรียกข้อมูล
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            onClick={handleCopy}
            disabled={!analysis}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'คัดลอกบทวิเคราะห์แล้ว' : 'คัดลอกบทวิเคราะห์'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  );
};
