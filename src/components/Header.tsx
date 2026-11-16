import React from 'react';
import { Sparkles, Coins } from 'lucide-react';

interface Props {
  onOpenAiAnalysis: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<Props> = ({ onOpenAiAnalysis, activeTab, onSelectTab }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs">
            ฿
          </span>
          <span>Paotang Gold Signal</span>
        </a>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('overview')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-200 ${
              activeTab === 'overview' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            กระดานราคา & กราฟ
          </button>
          <button
            onClick={() => onSelectTab('signal')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-200 ${
              activeTab === 'signal' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            สัญญาณเก็งกำไร 1 สัปดาห์
          </button>
          <button
            onClick={() => onSelectTab('planner')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-200 ${
              activeTab === 'planner' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            ตั้งราคาเป๋าตัง 7 วัน
          </button>
          <button
            onClick={() => onSelectTab('calculator')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-200 ${
              activeTab === 'calculator' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            คำนวณกำไรเป๋าตัง
          </button>
          <button
            onClick={() => onSelectTab('alerts')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-200 ${
              activeTab === 'alerts' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            แจ้งเตือน Telegram
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAiAnalysis}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>AI วิเคราะห์กลยุทธ์</span>
          </button>
        </div>
      </div>
    </header>
  );
};
