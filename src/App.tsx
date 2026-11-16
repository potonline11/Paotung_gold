/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MarketOverviewData, PriceAlert, AiMarketAnalysis, AutoTradeAlertSettings } from './types/gold';
import { Header } from './components/Header';
import { PriceOverview } from './components/PriceOverview';
import { CandlestickChart } from './components/CandlestickChart';
import { SpeculationSignalCard } from './components/SpeculationSignalCard';
import { PartnerCards } from './components/PartnerCards';
import { TechnicalIndicators } from './components/TechnicalIndicators';
import { ProfitCalculator } from './components/ProfitCalculator';
import { PaotangOrderPlanner } from './components/PaotangOrderPlanner';
import { TelegramAlertsManager } from './components/TelegramAlertsManager';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { Bell, ShieldCheck, Zap, BookOpen, AlertCircle } from 'lucide-react';

export default function App() {
  const [marketData, setMarketData] = useState<MarketOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedPartner, setSelectedPartner] = useState<'mts' | 'ylg' | 'aurora'>('mts');

  // Alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('paotang_gold_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'default-entry',
        asset: 'XAU_USD',
        targetType: 'BELOW',
        targetPrice: 3965.0,
        label: 'จุดเข้าช้อนซื้อไม้ 1 (Entry)',
        active: true,
        createdTime: new Date().toISOString(),
      },
      {
        id: 'default-tp1',
        asset: 'XAU_USD',
        targetType: 'ABOVE',
        targetPrice: 4013.93,
        label: 'เป้าทำกำไรระยะสั้น 1-2 วัน (+1.00% บนเป๋าตัง)',
        active: true,
        createdTime: new Date().toISOString(),
      },
    ];
  });

  // Auto-Pilot Trade Alerts Settings
  const [autoSettings, setAutoSettings] = useState<AutoTradeAlertSettings>(() => {
    const saved = localStorage.getItem('paotang_auto_trade_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          enabled: parsed.enabled ?? true,
          enableTelegramAlerts: parsed.enableTelegramAlerts ?? true,
          strict98PercentOnly: parsed.strict98PercentOnly ?? true, // Default STRICT 98%+ to prevent spam
          weeklyScheduleOnly: parsed.weeklyScheduleOnly ?? true,
          notifyOnBuySignal: parsed.notifyOnBuySignal ?? true,
          notifyOnTakeProfit: parsed.notifyOnTakeProfit ?? true,
          notifyOnRsiOversold: parsed.notifyOnRsiOversold ?? false, // Turn off noisy RSI alerts by default
          notifyOnGoldenHours: parsed.notifyOnGoldenHours ?? false, // Turn off noisy hours alerts by default
          cooldownMinutes: parsed.cooldownMinutes ?? 360, // 6 hours default cooldown to prevent repeated alerts
        };
      } catch (e) {}
    }
    return {
      enabled: true,
      enableTelegramAlerts: true,
      strict98PercentOnly: true, // Only alert when confluence >= 98%
      weeklyScheduleOnly: true, // Monday Entry -> Friday Exit plan
      notifyOnBuySignal: true,
      notifyOnTakeProfit: true,
      notifyOnRsiOversold: false,
      notifyOnGoldenHours: false,
      cooldownMinutes: 360, // 6 hours
    };
  });

  const handleUpdateAutoSettings = (newSettings: AutoTradeAlertSettings) => {
    setAutoSettings(newSettings);
    localStorage.setItem('paotang_auto_trade_settings', JSON.stringify(newSettings));
  };

  const [triggeredToast, setTriggeredToast] = useState<string | null>(null);
  const [serverTelegramSecrets, setServerTelegramSecrets] = useState({
    hasEnvBotToken: false,
    hasEnvChatId: false,
    configuredViaSecrets: false,
  });

  // AI Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiMarketAnalysis | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Play audio chime when alert triggers
  const playAlertChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      // AudioContext might be blocked until user gesture
    }
  }, []);

  // Save alerts to local storage
  useEffect(() => {
    localStorage.setItem('paotang_gold_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Broadcast helper: sends alert to configured Telegram Group
  const broadcastSignalNotification = useCallback(
    (message: string) => {
      const botToken = localStorage.getItem('paotang_telegram_bot_token');
      const chatId = localStorage.getItem('paotang_telegram_chat_id');
      const canSendTelegram =
        (autoSettings.enableTelegramAlerts ?? true) &&
        ((Boolean(botToken) && Boolean(chatId)) || serverTelegramSecrets.configuredViaSecrets);

      if (canSendTelegram) {
        fetch('/api/notify/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botToken,
            chatId,
            message,
          }),
        }).catch(() => {});
      }

      return { canSendTelegram };
    },
    [autoSettings.enableTelegramAlerts, serverTelegramSecrets.configuredViaSecrets]
  );

  // Check alert triggers
  const checkAlertTriggers = useCallback(
    (currentSpot: number, currentThaiGold: number) => {
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) => {
          if (!alert.active || alert.triggered) return alert;

          const currentPrice = alert.asset === 'XAU_USD' ? currentSpot : currentThaiGold;
          let isHit = false;

          if (alert.targetType === 'ABOVE' && currentPrice >= alert.targetPrice) {
            isHit = true;
          } else if (alert.targetType === 'BELOW' && currentPrice <= alert.targetPrice) {
            isHit = true;
          }

          if (isHit) {
            const msg = `🚨 สัญญาณแตะเป้าหมาย: ${alert.label} (${
              alert.asset === 'XAU_USD' ? `$${alert.targetPrice}` : `฿${alert.targetPrice}`
            }) ราคาปัจจุบัน: ${alert.asset === 'XAU_USD' ? `$${currentPrice.toFixed(2)}` : `฿${currentPrice}`}`;

            setTriggeredToast(msg);
            playAlertChime();
            broadcastSignalNotification(`🔔 [ทองคำเป๋าตัง - แตะเป้าหมาย!]\n${msg}`);

            return { ...alert, triggered: true };
          }
          return alert;
        })
      );
    },
    [playAlertChime, broadcastSignalNotification]
  );

  // Auto-Pilot Scanner: Automatically triggers when it's time to trade/speculate (Filtered with 98%+ Confluence)
  const checkAutoTradeTriggers = useCallback(
    (data: MarketOverviewData) => {
      if (!autoSettings.enabled) return;

      const tgBotToken = localStorage.getItem('paotang_telegram_bot_token');
      const tgChatId = localStorage.getItem('paotang_telegram_chat_id');
      const hasTelegram =
        (autoSettings.enableTelegramAlerts ?? true) &&
        ((Boolean(tgBotToken) && Boolean(tgChatId)) || serverTelegramSecrets.configuredViaSecrets);

      if (!hasTelegram) return;

      const channelLabel = 'กลุ่ม Telegram';

      const now = Date.now();
      const cooldownMs = (autoSettings.cooldownMinutes || 360) * 60 * 1000;
      const spot = data.rates.xauUsd;
      const thaiGold = data.thaiGold.associationSell;
      const plan = data.speculationPlan;
      const rsi = data.indicators.rsi;
      const score = plan.confidenceScore || 0;
      const is98Confluence = score >= 98 || plan.factorBreakdown?.isConfluence98Reached;

      // 1. High-Confluence Buy / Entry Opportunity (Strict 98%+ Filter)
      if (autoSettings.notifyOnBuySignal) {
        const isQualified = autoSettings.strict98PercentOnly
          ? is98Confluence
          : (plan.signal === 'SUPER STRONG BUY (98%+)' || plan.signal === 'STRONG BUY' || plan.signal === 'BUY');

        if (isQualified) {
          const lastBuyTime = parseInt(
            localStorage.getItem('paotang_last_auto_notify_buy') || '0'
          );
          if (now - lastBuyTime > cooldownMs) {
            localStorage.setItem('paotang_last_auto_notify_buy', now.toString());

            const weekly = plan.weeklyStrategy;
            const msg = `
🚨 [ได้เวลาเข้าซื้อเก็งกำไร! - คะแนนปัจจัยมั่นใจ ${score}%]
------------------------------------
🎯 ระบบประเมิน: จังหวะเข้าซื้อความแม่นยำสูง (Confluence ${score}%)
🗓️ กลยุทธ์สัปดาห์: ${weekly.entryDay} ➔ ${weekly.exitDay}
💰 ราคาทองสปอตโลก: $${spot.toFixed(2)} USD/oz
🪙 ราคาทอง 96.5% (สมาคม): ฿${thaiGold.toLocaleString()} บาท

🎯 จุดยุทธศาสตร์รอบสัปดาห์นี้:
• ช่วงราคาเข้าซื้อ (Entry): $${plan.spotLevels.entryRange}
• เป้าหมาย TP +5.00%: $${weekly.targetSpotPrice} USD (฿${weekly.targetThaiPrice.toLocaleString()} บาท)
• กำไรคาดการณ์: +$${weekly.gainUsdPerOz} USD/oz (+฿${weekly.gainThaiPerBaht.toLocaleString()} บาท/บาททอง)
• จุดตัดขาดทุน (SL): $${plan.spotLevels.stopLoss}

💡 คำแนะนำแอ็กชันบนแอปเป๋าตัง:
1. เข้าเมนู "ซื้อทอง" พอร์ต USD (MTS / YLG) สเปรดแคบ 0.40$
2. ซื้อไม้แรก ณ ราคาตลาดปัจจุบัน
3. เมื่อซื้อเสร็จ ให้กด "ขายทอง" > "ตั้งราคา" ล่วงหน้า +5.00% ($${weekly.targetSpotPrice} USD) กำหนดอายุ 7 วัน ระบบจะขายล็อกกำไรอัตโนมัติ
4. ปิดสถานะขายทำกำไรทั้งหมดภายในวันศุกร์ ไม่ถือข้ามสัปดาห์
            `.trim();

            broadcastSignalNotification(msg);
            setTriggeredToast(`🚨 ตรวจพบจังหวะเข้าซื้อความมั่นใจ ${score}%! ส่งแจ้งเตือนเข้า ${channelLabel} แล้ว`);
            playAlertChime();
            return;
          }
        }
      }

      // 2. Check Take Profit Trigger (+5.00% Weekly Goal or TP1)
      const weeklyTpTarget = plan.weeklyStrategy?.targetSpotPrice || plan.spotLevels.tp5PercentWeekly || plan.spotLevels.tp1;
      if (autoSettings.notifyOnTakeProfit && spot >= (weeklyTpTarget * 0.999)) {
        const lastTpTime = parseInt(
          localStorage.getItem('paotang_last_auto_notify_tp') || '0'
        );
        if (now - lastTpTime > cooldownMs) {
          localStorage.setItem('paotang_last_auto_notify_tp', now.toString());
          const msg = `
🏆 [ได้เวลาขายทำกำไร! - แตะเป้าหมายสัปดาห์นี้ TP +5.00%]
------------------------------------
🚀 สัญญาณระบบ: TAKE PROFIT (ขายล็อกกำไรตามแผน)
💰 Spot XAU แตะเป้า: $${spot.toFixed(2)} USD/oz (เป้าหมาย $${weeklyTpTarget})
🪙 ราคาทอง 96.5%: ฿${thaiGold.toLocaleString()} บาท
💵 ผลตอบแทนเป้าหมาย: +5.00% ต่อสัปดาห์

💡 แนะนำการแอ็กชันบนแอปเป๋าตัง:
• หากตั้งราคาขายล่วงหน้า 7 วันไว้ คำสั่งอาจถูกจับคู่แล้ว
• หากยังไม่ได้ตั้ง แนะนำเปิดแอปเป๋าตัง กด "ขายทอง" ทันที เพื่อล็อกกำไรเข้ากระเป๋าก่อนปิดตลาดวันศุกร์ ไม่ถือข้ามสุดสัปดาห์!
          `.trim();

          broadcastSignalNotification(msg);
          setTriggeredToast(`🏆 ราคาแตะเป้าหมาย TP +5.00%! ส่งแจ้งเตือนเข้า ${channelLabel} แล้ว`);
          playAlertChime();
          return;
        }
      }

      // 3. Optional RSI Oversold Bounce (Only if user explicitly enabled it)
      if (autoSettings.notifyOnRsiOversold && rsi < 32) {
        const lastRsiTime = parseInt(
          localStorage.getItem('paotang_last_auto_notify_rsi') || '0'
        );
        if (now - lastRsiTime > cooldownMs) {
          localStorage.setItem('paotang_last_auto_notify_rsi', now.toString());
          const msg = `⚡ [จังหวะช้อนซื้อด่วน! - RSI Oversold ${rsi.toFixed(1)}]\n💰 Spot XAU: $${spot.toFixed(2)}\n💡 โอกาสดีดตัวสวิงสั้น: ทยอยตั้งรับตามแนวรับ S1`;
          broadcastSignalNotification(msg);
          setTriggeredToast(`⚡ ตรวจพบ RSI Oversold: ส่งแจ้งเตือนเข้า ${channelLabel} แล้ว`);
          playAlertChime();
        }
      }
    },
    [
      autoSettings,
      playAlertChime,
      broadcastSignalNotification,
      serverTelegramSecrets.configuredViaSecrets,
    ]
  );

  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    try {
      const res = await fetch('/api/market/overview');
      const data: MarketOverviewData = await res.json();
      if (data.success) {
        setMarketData(data);
        checkAlertTriggers(data.rates.xauUsd, data.thaiGold.associationSell);
        checkAutoTradeTriggers(data);
      }
    } catch (err) {
      console.error('Failed to fetch market data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [checkAlertTriggers, checkAutoTradeTriggers]);

  // Check Server Environment Variables / Secrets status for Telegram notifications
  useEffect(() => {
    fetch('/api/notify/telegram/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setServerTelegramSecrets({
            hasEnvBotToken: Boolean(data.hasEnvBotToken),
            hasEnvChatId: Boolean(data.hasEnvChatId),
            configuredViaSecrets: Boolean(data.configuredViaSecrets),
          });
        }
      })
      .catch(() => {});
  }, []);

  // Initial load and periodic polling every 4 seconds
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 4000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  // Simulate tick
  const handleSimulateTick = async (direction: 'up' | 'down') => {
    try {
      await fetch('/api/market/simulate-tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, delta: 6.0 }),
      });
      fetchMarketData();
    } catch (err) {
      console.error(err);
    }
  };

  // Sync or Calibrate price with Paotang / Live Financial APIs
  const handleSyncPrice = async (spot: number, usdThb: number, mode?: 'LIVE_API' | 'CUSTOM') => {
    try {
      const res = await fetch('/api/market/sync-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spot, usdThb, mode }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchMarketData();
        setTriggeredToast(data.message || 'ปรับเทียบราคากับเป๋าตังสำเร็จ');
        setTimeout(() => setTriggeredToast(null), 3000);
      }
    } catch (err) {
      console.error('Failed to sync price:', err);
    }
  };

  // Quick alert adder from speculation engine
  const handleQuickAlert = (type: 'ENTRY' | 'TP1' | 'TP2' | 'TP5' | 'SL') => {
    if (!marketData) return;
    const plan = marketData.speculationPlan;
    let newAlert: Omit<PriceAlert, 'id' | 'createdTime'>;

    if (type === 'ENTRY') {
      newAlert = {
        asset: 'XAU_USD',
        targetType: 'BELOW',
        targetPrice: Number((marketData.rates.xauUsd - 4).toFixed(2)),
        label: 'จุดเข้าซื้อไม้ 1 (Entry Target)',
        active: true,
      };
    } else if (type === 'TP1') {
      newAlert = {
        asset: 'XAU_USD',
        targetType: 'ABOVE',
        targetPrice: plan.spotLevels.tp1,
        label: 'เป้าทำกำไรระยะสั้น TP1 (+1.0%)',
        active: true,
      };
    } else if (type === 'TP2') {
      newAlert = {
        asset: 'XAU_USD',
        targetType: 'ABOVE',
        targetPrice: plan.spotLevels.tp2,
        label: 'เป้าทำกำไรสวิงรอบสัปดาห์ TP2 (+2.5%)',
        active: true,
      };
    } else if (type === 'TP5') {
      const tp5Price = plan.weeklyStrategy?.targetSpotPrice || plan.spotLevels.tp5PercentWeekly || Number((marketData.rates.xauUsd * 1.05).toFixed(2));
      newAlert = {
        asset: 'XAU_USD',
        targetType: 'ABOVE',
        targetPrice: tp5Price,
        label: 'เป้าหมายหลักสัปดาห์นี้ TP +5.00% (วันจันทร์-ศุกร์)',
        active: true,
      };
    } else {
      newAlert = {
        asset: 'XAU_USD',
        targetType: 'BELOW',
        targetPrice: plan.spotLevels.stopLoss,
        label: 'จุดตัดขาดทุน Stop Loss (SL)',
        active: true,
      };
    }

    const created: PriceAlert = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      createdTime: new Date().toISOString(),
      triggered: false,
    };
    setAlerts((prev) => [created, ...prev]);
    setTriggeredToast(`เพิ่มการแจ้งเตือน "${newAlert.label}" สำเร็จ`);
    setTimeout(() => setTriggeredToast(null), 3000);
  };

  // Add custom alert
  const handleAddAlert = (alert: Omit<PriceAlert, 'id' | 'createdTime'>) => {
    const created: PriceAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdTime: new Date().toISOString(),
      triggered: false,
    };
    setAlerts((prev) => [created, ...prev]);
    setTriggeredToast(`เพิ่มการแจ้งเตือน "${alert.label}" แล้ว`);
    setTimeout(() => setTriggeredToast(null), 3000);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active, triggered: false } : a))
    );
  };

  // Trigger Gemini AI analysis
  const handleTriggerAiAnalysis = async () => {
    setIsAiModalOpen(true);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spot: marketData?.rates.xauUsd,
          usdThb: marketData?.rates.usdThb,
          rsi: marketData?.indicators.rsi,
          macdHist: marketData?.indicators.macd.histogram,
          signal: marketData?.speculationPlan.signal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysis(data.aiAnalysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading || !marketData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-4">
        <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="font-bold text-lg text-white">กำลังเชื่อมต่อข้อมูลตลาดทองคำเป๋าตัง...</p>
          <p className="text-xs text-slate-500 mt-1">
            ดึงราคา XAU/USD, USD/THB, สมาคมค้าทองคำ และคำนวณสเปรด MTS, YLG, Aurora
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Contract (Wordmark, Nav, Primary Action) */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAiAnalysis={handleTriggerAiAnalysis}
      />

      {/* Floating Trigger Alert Toast */}
      {triggeredToast && (
        <div className="fixed top-20 right-6 z-50 bg-amber-500 text-slate-950 px-4 py-3 rounded-xl shadow-2xl font-semibold text-xs flex items-center gap-2 border border-amber-400 animate-bounce">
          <Bell className="w-4 h-4 fill-current" />
          <span>{triggeredToast}</span>
          <button
            onClick={() => setTriggeredToast(null)}
            className="ml-2 font-bold hover:opacity-75"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Section 1: Price Overview (XAU/USD, USD/THB, GTA) */}
        <section id="overview" className="space-y-4">
          <PriceOverview
            xauUsd={marketData.rates.xauUsd}
            usdThb={marketData.rates.usdThb}
            change24hUsd={marketData.rates.change24hUsd}
            change24hPercent={marketData.rates.change24hPercent}
            thaiGold={marketData.thaiGold}
            dataSource={marketData.dataSource}
            onSimulateTick={handleSimulateTick}
            onSyncPrice={handleSyncPrice}
          />
        </section>

        {/* Section 2: Core 1-Week Speculation Signal Engine */}
        <section id="signal">
          <SpeculationSignalCard
            plan={marketData.speculationPlan}
            currentSpot={marketData.rates.xauUsd}
            currentThaiGold={marketData.thaiGold.associationSell}
            onSetQuickAlert={handleQuickAlert}
            onOpenAiAnalysis={handleTriggerAiAnalysis}
          />
        </section>

        {/* Section 3: Paotang Limit Order Planner & Helper (ตั้งราคาล่วงหน้า 7 วัน) */}
        <section id="planner">
          <PaotangOrderPlanner
            currentSpot={marketData.rates.xauUsd}
            speculationPlan={marketData.speculationPlan}
            onSetAlert={(price, type, label) => {
              handleAddAlert({
                asset: 'XAU_USD',
                targetPrice: price,
                targetType: type,
                label,
                active: true,
              });
            }}
          />
        </section>

        {/* Section 3: Candlestick Chart & Technical Indicators Grid */}
        <section className="space-y-6">
          <CandlestickChart
            candles={marketData.candles}
            indicators={marketData.indicators}
            currentSpot={marketData.rates.xauUsd}
            onRefresh={fetchMarketData}
            isLoading={isLoading}
          />

          <TechnicalIndicators
            indicators={marketData.indicators}
            currentSpot={marketData.rates.xauUsd}
          />
        </section>

        {/* Section 4: 3 Partner Gold Shops on Paotang (MTS, YLG, Aurora) */}
        <section>
          <PartnerCards
            partners={marketData.partners}
            selectedPartner={selectedPartner}
            onSelectPartner={setSelectedPartner}
          />
        </section>

        {/* Section 5: Profit Calculator for Paotang */}
        <section id="calculator">
          <ProfitCalculator
            partners={marketData.partners}
            currentSpot={marketData.rates.xauUsd}
            currentThaiGold={marketData.thaiGold.associationSell}
            defaultEntrySpot={marketData.rates.xauUsd}
            defaultTpSpot={marketData.speculationPlan.spotLevels.tp1}
          />
        </section>

        {/* Section 6: Automated Telegram Alerts Manager */}
        <section id="alerts">
          <TelegramAlertsManager
            currentSpot={marketData.rates.xauUsd}
            currentThaiGold={marketData.thaiGold.associationSell}
            speculationPlan={marketData.speculationPlan}
            alerts={alerts}
            autoSettings={autoSettings}
            serverTelegramSecrets={serverTelegramSecrets}
            onUpdateAutoSettings={handleUpdateAutoSettings}
            onAddAlert={handleAddAlert}
            onRemoveAlert={handleRemoveAlert}
            onToggleAlert={handleToggleAlert}
          />
        </section>

        {/* Section 7: Educational Guide for 1-Week Speculation on Paotang */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              คู่มือเก็งกำไรทองคำเป๋าตัง ภายใน 1 สัปดาห์ (Max Profit Swing Strategy)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-300">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">01. ทำไมต้องขายภายใน 1 สัปดาห์?</span>
              <p>
                การเก็งกำไรระยะสั้น 3-5 วันช่วยตัดความเสี่ยงจากช่องว่างราคา (Gap) ในช่วงวันหยุดสุดสัปดาห์ที่ตลาดโลกปิดทำการ และช่วยหมุนรอบเงินทุนเพื่อสร้างผลตอบแทนทบต้นได้รวดเร็วกว่า
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">02. เทคนิคการเลือกพอร์ตบนเป๋าตัง</span>
              <p>
                หากเน้นความไว แนะนำเปิด <strong>USD Wallet (MTS Gold / YLG)</strong> เพราะสเปรดแคบเพียง $0.40 - $0.50 ต่อออนซ์ ไม่โดนผลกระทบจากค่าเงินบาทแกว่งตัว แต่หากเน้นสะสมเป็นบาททองเพื่อถอนทองแท่ง แนะนำ Aurora หรือ MTS พอร์ตเงินบาท
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-blue-400 block mb-1">03. วินัย Money Management 30/30/40</span>
              <p>
                อย่าทุ่มซื้อหมดในไม้เดียว ให้แบ่งเงินทุน: <strong>ไม้ 1 (30%)</strong> เมื่อเข้าสู่เขตเข้าซื้อ, <strong>ไม้ 2 (30%)</strong> เผื่อราคาย่อตัวทดสอบแนวรับ S1, และ <strong>สำรองเงินสด (40%)</strong> ไว้เสมอ
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* AI Strategist Modal */}
      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysis={aiAnalysis}
        isLoading={isAiLoading}
        onRefresh={handleTriggerAiAnalysis}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Paotang Gold Signal & Alert</span>
            <span>·</span>
            <span>ระบบวิเคราะห์และแจ้งเตือนเก็งกำไรทองคำเป๋าตัง</span>
          </div>
          <div>
            ข้อมูลราคาเพื่อการวิเคราะห์และจำลองกลยุทธ์การเทรดเท่านั้น ควรใช้วิจารณญาณในการลงทุน
          </div>
        </div>
      </footer>
    </div>
  );
}
