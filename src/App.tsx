/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  MarketOverviewData,
  PriceAlert,
  AiMarketAnalysis,
  AutoTradeAlertSettings,
  GoldPurityType,
  ApiConnectionStatus,
} from './types/gold';
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
import { Bell, BookOpen, AlertCircle } from 'lucide-react';

const PAOTANG_OFFSET_KEY = 'paotang_spread_offset_thb';
const PAOTANG_PURITY_KEY = 'paotang_gold_purity';

export default function App() {
  const [marketData, setMarketData] = useState<MarketOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiConnectionStatus>('SYNCING');
  const [xauApiOk, setXauApiOk] = useState<boolean>(true);
  const [fxApiOk, setFxApiOk] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedPartner, setSelectedPartner] = useState<'mts' | 'ylg' | 'aurora'>('mts');

  // Persistent Gold Purity Toggle: '9999' (Paotang Gold Wallet) | '965' (Thai Gold 96.5%)
  const [goldPurity, setGoldPurity] = useState<GoldPurityType>(() => {
    const saved = localStorage.getItem(PAOTANG_PURITY_KEY);
    return saved === '965' || saved === '9999' ? saved : '9999';
  });

  // Persistent Spread Offset in THB (saved permanently in localStorage)
  const [spreadOffsetThb, setSpreadOffsetThb] = useState<number>(() => {
    const saved = localStorage.getItem(PAOTANG_OFFSET_KEY);
    if (saved !== null) {
      const parsed = Number(saved);
      if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
  });

  const handleChangeGoldPurity = useCallback((purity: GoldPurityType) => {
    setGoldPurity(purity);
    localStorage.setItem(PAOTANG_PURITY_KEY, purity);
  }, []);

  const handleChangeSpreadOffset = useCallback((offset: number) => {
    const safeOffset = Number.isFinite(offset) ? Math.round(offset) : 0;
    setSpreadOffsetThb(safeOffset);
    localStorage.setItem(PAOTANG_OFFSET_KEY, String(safeOffset));
  }, []);

  // Store last known valid numeric prices and latest UI flags in refs for stable 15s polling
  const lastValidRatesRef = useRef<{ xauUsd: number; usdThb: number }>({
    xauUsd: 3770.6,
    usdThb: 33.85,
  });
  const hasMarketDataRef = useRef<boolean>(false);
  const goldPurityRef = useRef<GoldPurityType>(goldPurity);
  const spreadOffsetRef = useRef<number>(spreadOffsetThb);

  useEffect(() => {
    goldPurityRef.current = goldPurity;
  }, [goldPurity]);

  useEffect(() => {
    spreadOffsetRef.current = spreadOffsetThb;
  }, [spreadOffsetThb]);

  useEffect(() => {
    hasMarketDataRef.current = Boolean(marketData);
  }, [marketData]);

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
    return [];
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
          strict98PercentOnly: parsed.strict98PercentOnly ?? true,
          confluenceThreshold: parsed.confluenceThreshold ?? 98,
          instantAnyDayAlert: parsed.instantAnyDayAlert ?? true,
          weeklyScheduleOnly: false,
          notifyOnBuySignal: parsed.notifyOnBuySignal ?? true,
          notifyOnTakeProfit: parsed.notifyOnTakeProfit ?? true,
          notifyOnRsiOversold: parsed.notifyOnRsiOversold ?? false,
          notifyOnGoldenHours: parsed.notifyOnGoldenHours ?? false,
          cooldownMinutes: parsed.cooldownMinutes ?? 360,
        };
      } catch (e) {}
    }
    return {
      enabled: true,
      enableTelegramAlerts: true,
      strict98PercentOnly: true,
      confluenceThreshold: 98,
      instantAnyDayAlert: true,
      weeklyScheduleOnly: false,
      notifyOnBuySignal: true,
      notifyOnTakeProfit: true,
      notifyOnRsiOversold: false,
      notifyOnGoldenHours: false,
      cooldownMinutes: 360,
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
      const threshold = autoSettings.confluenceThreshold ?? 98;
      const isConfluencePassed =
        score >= threshold || (threshold <= 98 && Boolean(plan.factorBreakdown?.isConfluence98Reached));

      // 1. Real-time Prepare-to-Buy Alert whenever Multi-Factor Confluence exceeds threshold (any day, no Monday wait)
      if (autoSettings.notifyOnBuySignal) {
        const isQualified = autoSettings.strict98PercentOnly
          ? isConfluencePassed
          : isConfluencePassed ||
            plan.signal === 'SUPER STRONG BUY (98%+)' ||
            plan.signal === 'STRONG BUY' ||
            plan.signal === 'BUY';

        if (isQualified) {
          const lastBuyTime = parseInt(
            localStorage.getItem('paotang_last_auto_notify_buy') || '0'
          );
          if (now - lastBuyTime > cooldownMs) {
            localStorage.setItem('paotang_last_auto_notify_buy', now.toString());

            const weekly = plan.weeklyStrategy;
            const purityLabel = goldPurityRef.current === '9999' ? '99.99%' : '96.5%';
            const msg = `
🚨 [เตรียมเข้าซื้อทองคำทันที! - คะแนนปัจจัยเกินมาตรฐาน ${score}%]
------------------------------------
🎯 มาตรวัดปัจจัยรอบด้าน: ${score}% (เกินมาตรฐาน ≥ ${threshold}%)
⚡ แผนเข้าซื้อ: แจ้งเตือนเตรียมซื้อทันที (ไม่ต้องรอถึงวันจันทร์)
💰 ราคาทองสปอตโลก: $${spot.toFixed(2)} USD/oz
🪙 ราคาทอง ${purityLabel} (เป๋าตัง): ฿${thaiGold.toLocaleString()} บาท

🎯 จุดยุทธศาสตร์เตรียมเข้าซื้อ & ทำกำไร:
• ช่วงราคาเตรียมซื้อ (Entry): $${plan.spotLevels.entryRange}
• เป้าหมาย TP +5.00%: $${weekly.targetSpotPrice} USD (฿${weekly.targetThaiPrice.toLocaleString()} บาท)
• กำไรคาดการณ์: +$${weekly.gainUsdPerOz} USD/oz (+฿${weekly.gainThaiPerBaht.toLocaleString()} บาท/บาททอง)
• จุดตัดขาดทุน (SL): $${plan.spotLevels.stopLoss}

💡 คำแนะนำแอ็กชันบนแอปเป๋าตัง:
1. เข้าเมนู "ซื้อทอง" พอร์ต USD (MTS / YLG) สเปรดแคบ 0.40$ หรือพอร์ต 99.99%
2. เตรียมเข้าซื้อไม้แรกตามโซน Entry ได้ทันทีวันนี้ ไม่ต้องรอวันจันทร์
3. เมื่อซื้อเสร็จ กด "ขายทอง" > "ตั้งราคา" ล่วงหน้า +5.00% ($${weekly.targetSpotPrice} USD) อายุ 7 วัน ระบบจะขายล็อกกำไรอัตโนมัติ
            `.trim();

            broadcastSignalNotification(msg);
            setTriggeredToast(
              `🚨 คะแนนปัจจัย ${score}% เกินมาตรฐาน (${threshold}%)! เตรียมเข้าซื้อ — ส่งแจ้งเตือนเข้า ${channelLabel} แล้ว`
            );
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

  // Fetch market data every 15s: backend overview + direct live XAU/USD & Frankfurter USD/THB with fallback
  const fetchMarketData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const fetchDirectXau = async (): Promise<number | null> => {
        try {
          const r = await fetch('https://api.gold-api.com/price/XAU', {
            signal: AbortSignal.timeout(5000),
          });
          if (!r.ok) return null;
          const j = await r.json();
          const val = Number(j?.price);
          return Number.isFinite(val) && val > 1000 ? Number(val.toFixed(2)) : null;
        } catch {
          return null;
        }
      };

      const fetchDirectFrankfurterThb = async (): Promise<number | null> => {
        // Primary: Frankfurter v2 real-time rates (CORS-enabled)
        try {
          const r = await fetch('https://api.frankfurter.dev/v2/rates?base=USD&quotes=THB', {
            signal: AbortSignal.timeout(5000),
          });
          if (r.ok) {
            const j = await r.json();
            const raw = Array.isArray(j) ? j[0]?.rate : j?.rates?.THB;
            const val = Number(raw);
            if (Number.isFinite(val) && val > 20) return Number(val.toFixed(3));
          }
        } catch {
          // try Frankfurter v1
        }
        try {
          const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=THB', {
            signal: AbortSignal.timeout(5000),
          });
          if (r.ok) {
            const j = await r.json();
            const val = Number(j?.rates?.THB);
            if (Number.isFinite(val) && val > 20) return Number(val.toFixed(3));
          }
        } catch {
          // fallback handled below
        }
        return null;
      };

      const [overviewRes, liveXau, liveThb] = await Promise.all([
        fetch('/api/market/overview', { signal: AbortSignal.timeout(8000) }),
        fetchDirectXau(),
        fetchDirectFrankfurterThb(),
      ]);

      if (!overviewRes.ok) {
        throw new Error(`HTTP ${overviewRes.status}`);
      }
      const data: MarketOverviewData = await overviewRes.json();
      if (!data.success) {
        throw new Error('ไม่สามารถโหลดข้อมูลตลาดได้');
      }

      const isCustomMode = data.dataSource === 'CUSTOM';
      const backendXau = Number(data.rates?.xauUsd);
      const backendThb = Number(data.rates?.usdThb);

      // Prefer live direct APIs unless user locked custom calibration; fall back safely without NaN
      const resolvedXau = isCustomMode
        ? Number.isFinite(backendXau) && backendXau > 1000
          ? backendXau
          : lastValidRatesRef.current.xauUsd
        : liveXau ??
          (Number.isFinite(backendXau) && backendXau > 1000
            ? backendXau
            : lastValidRatesRef.current.xauUsd);

      const resolvedThb = isCustomMode
        ? Number.isFinite(backendThb) && backendThb > 20
          ? backendThb
          : lastValidRatesRef.current.usdThb
        : liveThb ??
          (Number.isFinite(backendThb) && backendThb > 20
            ? backendThb
            : lastValidRatesRef.current.usdThb);

      lastValidRatesRef.current = { xauUsd: resolvedXau, usdThb: resolvedThb };

      const xauHealthy = isCustomMode || liveXau !== null || (Number.isFinite(backendXau) && backendXau > 1000);
      const fxHealthy = isCustomMode || liveThb !== null || (Number.isFinite(backendThb) && backendThb > 20);
      setXauApiOk(xauHealthy);
      setFxApiOk(fxHealthy);
      setApiStatus(xauHealthy && fxHealthy ? 'LIVE' : 'FALLBACK');
      setLastUpdated(new Date().toISOString());

      const mergedData: MarketOverviewData = {
        ...data,
        rates: {
          ...data.rates,
          xauUsd: resolvedXau,
          usdThb: resolvedThb,
        },
      };

      setMarketData(mergedData);
      setLoadError(null);

      // Compute effective calibrated Thai gold price for alerts trigger checking
      const ozToGram = 31.1035;
      const bahtToGram = 15.244;
      const raw9999 = resolvedXau * resolvedThb * (bahtToGram / ozToGram);
      const baseThai = goldPurityRef.current === '9999' ? raw9999 : raw9999 * 0.965;
      const calibratedThai = Math.max(0, Math.round(baseThai + spreadOffsetRef.current));

      checkAlertTriggers(resolvedXau, calibratedThai);
      checkAutoTradeTriggers({
        ...mergedData,
        thaiGold: {
          ...mergedData.thaiGold,
          associationSell: calibratedThai,
        },
      });
    } catch (err: any) {
      console.error('Failed to fetch market data:', err);
      setXauApiOk(false);
      setFxApiOk(false);
      setApiStatus(hasMarketDataRef.current ? 'FALLBACK' : 'ERROR');
      if (!hasMarketDataRef.current) {
        setLoadError(err?.message || 'เชื่อมต่อ API ตลาดทองคำไม่สำเร็จ');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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

  // Initial load and periodic polling every 15 seconds (XAU/USD + Frankfurter USD/THB)
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000);
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

  // Dynamically recalculate Thai Gold Price (99.99% vs 96.5%), Spread Offset, Entry, TP, and SL
  const effectiveData = useMemo<MarketOverviewData | null>(() => {
    if (!marketData) return null;

    const spot = Number.isFinite(marketData.rates.xauUsd) ? marketData.rates.xauUsd : 3770.6;
    const fx = Number.isFinite(marketData.rates.usdThb) ? marketData.rates.usdThb : 33.85;
    const ozToGram = 31.1035;
    const bahtToGram = 15.244;

    // Exact user-requested formulas per 1 baht-weight
    const rawGold9999 = spot * fx * (bahtToGram / ozToGram);
    const rawGold965 = spot * fx * (bahtToGram / ozToGram) * 0.965;
    const selectedRawPrice = goldPurity === '9999' ? rawGold9999 : rawGold965;

    // Apply persistent Spread Offset (THB) stored in localStorage
    const calibratedSell = Math.max(0, Math.round(selectedRawPrice + spreadOffsetThb));
    const spreadGap = goldPurity === '9999' ? 60 : 100;
    const calibratedBuy = Math.max(0, calibratedSell - spreadGap);

    // Recalculate dynamic Entry, TP1, TP2, TP5 (+5%), and Stop Loss from Offset-adjusted price
    const entryThaiMin = Math.round(calibratedSell * 0.995);
    const entryThaiMax = calibratedSell;
    const tp1Thai = Math.round(calibratedSell * 1.01);
    const tp2Thai = Math.round(calibratedSell * 1.025);
    const tp5Thai = Math.round(calibratedSell * 1.05);
    const stopLossThai = Math.round(calibratedSell * 0.991);
    const gainThaiPerBaht = tp5Thai - calibratedSell;

    // Also reflect spread offset in partner quotes for consistent Profit Calculator & Partner Cards
    const sell965WithOffset = Math.max(0, Math.round(rawGold965 + spreadOffsetThb));

    return {
      ...marketData,
      thaiGold: {
        ...marketData.thaiGold,
        rawPrice: Math.round(selectedRawPrice),
        gold9999Price: Math.round(rawGold9999),
        gold965Price: Math.round(rawGold965),
        spreadOffsetThb,
        purity: goldPurity,
        associationSell: calibratedSell,
        associationBuy: calibratedBuy,
        ornamentSell: calibratedSell + 500,
        ornamentBuy: calibratedBuy - 700,
      },
      partners: {
        ...marketData.partners,
        mts: {
          ...marketData.partners.mts,
          thb965: {
            buy: Math.max(0, sell965WithOffset - 60),
            sell: sell965WithOffset,
            spread: 60,
          },
          usd9999: {
            buy: Number((spot - 0.2).toFixed(2)),
            sell: Number((spot + 0.2).toFixed(2)),
            spread: 0.4,
          },
        },
        ylg: {
          ...marketData.partners.ylg,
          thb965: {
            buy: Math.max(0, sell965WithOffset - 65),
            sell: sell965WithOffset,
            spread: 65,
          },
          usd9999: {
            buy: Number((spot - 0.25).toFixed(2)),
            sell: Number((spot + 0.25).toFixed(2)),
            spread: 0.5,
          },
        },
        aurora: {
          ...marketData.partners.aurora,
          thb965: {
            buy: Math.max(0, sell965WithOffset - 70),
            sell: sell965WithOffset,
            spread: 70,
          },
          thb9999PerGram: {
            buy: Math.max(0, Math.round((rawGold9999 + spreadOffsetThb) / bahtToGram) - 10),
            sell: Math.max(0, Math.round((rawGold9999 + spreadOffsetThb) / bahtToGram) + 10),
            spread: 20,
          },
        },
      },
      speculationPlan: {
        ...marketData.speculationPlan,
        weeklyStrategy: {
          ...marketData.speculationPlan.weeklyStrategy,
          entrySpotPrice: spot,
          entryThaiPrice: calibratedSell,
          targetThaiPrice: tp5Thai,
          gainThaiPerBaht,
        },
        thaiBahtLevels: {
          current: calibratedSell,
          entryRange: `${entryThaiMin.toLocaleString()} - ${entryThaiMax.toLocaleString()} บาท`,
          tp1: tp1Thai,
          tp2: tp2Thai,
          tp5PercentWeekly: tp5Thai,
          stopLoss: stopLossThai,
          expectedGainPerBaht: `+${gainThaiPerBaht.toLocaleString()} บาท (TP +5%) / บาททอง`,
        },
      },
    };
  }, [marketData, goldPurity, spreadOffsetThb]);

  if (isLoading || !effectiveData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-4 px-4">
        {loadError ? (
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full text-center space-y-3 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="font-bold text-base text-white">เชื่อมต่อข้อมูลตลาดทองคำไม่สำเร็จ</p>
            <p className="text-xs text-rose-300 font-mono bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setLoadError(null);
                fetchMarketData();
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
            >
              ลองเชื่อมต่อใหม่อีกครั้ง
            </button>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="font-bold text-lg text-white">กำลังเชื่อมต่อข้อมูลตลาดทองคำเป๋าตัง...</p>
              <p className="text-xs text-slate-500 mt-1">
                ดึงราคา XAU/USD, Frankfurter USD/THB และคำนวณสเปรด MTS, YLG, Aurora
              </p>
            </div>
          </>
        )}
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
        {/* Section 1: Price Overview (XAU/USD, USD/THB, 99.99%/96.5% + Spread Offset) */}
        <section id="overview" className="space-y-4">
          <PriceOverview
            xauUsd={effectiveData.rates.xauUsd}
            usdThb={effectiveData.rates.usdThb}
            change24hUsd={effectiveData.rates.change24hUsd}
            change24hPercent={effectiveData.rates.change24hPercent}
            thaiGold={effectiveData.thaiGold}
            dataSource={effectiveData.dataSource}
            goldPurity={goldPurity}
            onChangeGoldPurity={handleChangeGoldPurity}
            spreadOffsetThb={spreadOffsetThb}
            onChangeSpreadOffsetThb={handleChangeSpreadOffset}
            apiStatus={apiStatus}
            xauApiOk={xauApiOk}
            fxApiOk={fxApiOk}
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onRefreshNow={fetchMarketData}
            onSimulateTick={handleSimulateTick}
            onSyncPrice={handleSyncPrice}
          />
        </section>

        {/* Section 2: Core Multi-Factor Speculation Signal Engine */}
        <section id="signal">
          <SpeculationSignalCard
            plan={effectiveData.speculationPlan}
            currentSpot={effectiveData.rates.xauUsd}
            currentThaiGold={effectiveData.thaiGold.associationSell}
            confluenceThreshold={autoSettings.confluenceThreshold ?? 98}
            onSetQuickAlert={handleQuickAlert}
            onOpenAiAnalysis={handleTriggerAiAnalysis}
          />
        </section>

        {/* Section 3: Paotang Limit Order Planner & Helper (ตั้งราคาล่วงหน้า 7 วัน) */}
        <section id="planner">
          <PaotangOrderPlanner
            currentSpot={effectiveData.rates.xauUsd}
            speculationPlan={effectiveData.speculationPlan}
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
            candles={effectiveData.candles}
            indicators={effectiveData.indicators}
            currentSpot={effectiveData.rates.xauUsd}
            onRefresh={fetchMarketData}
            isLoading={isLoading}
          />

          <TechnicalIndicators
            indicators={effectiveData.indicators}
            currentSpot={effectiveData.rates.xauUsd}
          />
        </section>

        {/* Section 4: 3 Partner Gold Shops on Paotang (MTS, YLG, Aurora) */}
        <section>
          <PartnerCards
            partners={effectiveData.partners}
            selectedPartner={selectedPartner}
            onSelectPartner={setSelectedPartner}
          />
        </section>

        {/* Section 5: Profit Calculator for Paotang */}
        <section id="calculator">
          <ProfitCalculator
            partners={effectiveData.partners}
            currentSpot={effectiveData.rates.xauUsd}
            currentThaiGold={effectiveData.thaiGold.associationSell}
            defaultEntrySpot={effectiveData.rates.xauUsd}
            defaultTpSpot={effectiveData.speculationPlan.spotLevels.tp1}
          />
        </section>

        {/* Section 6: Automated Telegram Alerts Manager */}
        <section id="alerts">
          <TelegramAlertsManager
            currentSpot={effectiveData.rates.xauUsd}
            currentThaiGold={effectiveData.thaiGold.associationSell}
            speculationPlan={effectiveData.speculationPlan}
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
