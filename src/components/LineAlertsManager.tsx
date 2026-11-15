import React, { useState } from 'react';
import { PriceAlert, SpeculationPlan, AutoTradeAlertSettings } from '../types/gold';
import {
  Send,
  Trash2,
  Smartphone,
  Key,
  User,
  Check,
  ExternalLink,
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  Bot,
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  Lock,
  Copy,
  Users,
  Search,
  RefreshCw,
} from 'lucide-react';

interface ServerLineSecretsStatus {
  hasEnvToken: boolean;
  hasEnvUserId: boolean;
  configuredViaSecrets: boolean;
}

interface ServerTelegramSecretsStatus {
  hasEnvBotToken: boolean;
  hasEnvChatId: boolean;
  configuredViaSecrets: boolean;
}

interface DetectedTelegramChat {
  id: string;
  title: string;
  type: string;
  username?: string;
}

interface Props {
  currentSpot: number;
  currentThaiGold: number;
  speculationPlan: SpeculationPlan;
  alerts: PriceAlert[];
  autoSettings: AutoTradeAlertSettings;
  serverLineSecrets?: ServerLineSecretsStatus;
  serverTelegramSecrets?: ServerTelegramSecretsStatus;
  onUpdateAutoSettings: (newSettings: AutoTradeAlertSettings) => void;
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'createdTime'>) => void;
  onRemoveAlert: (id: string) => void;
  onToggleAlert: (id: string) => void;
  onTriggerTestScenario?: (type: 'BUY' | 'TAKE_PROFIT' | 'GOLDEN_HOURS') => Promise<void>;
}

export const LineAlertsManager: React.FC<Props> = ({
  currentSpot,
  currentThaiGold,
  speculationPlan,
  alerts,
  autoSettings,
  serverLineSecrets,
  serverTelegramSecrets,
  onUpdateAutoSettings,
  onAddAlert,
  onRemoveAlert,
  onToggleAlert,
}) => {
  // Channel tab in settings & preview
  const [activeChannelTab, setActiveChannelTab] = useState<'TELEGRAM' | 'LINE'>('TELEGRAM');

  // LINE OA state
  const [channelAccessToken, setChannelAccessToken] = useState<string>(
    () =>
      localStorage.getItem('paotang_line_channel_token') ||
      localStorage.getItem('paotang_line_token') ||
      ''
  );
  const [userId, setUserId] = useState<string>(
    () => localStorage.getItem('paotang_line_user_id') || ''
  );
  const [showToken, setShowToken] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Telegram Bot state
  const [telegramBotToken, setTelegramBotToken] = useState<string>(
    () => localStorage.getItem('paotang_telegram_bot_token') || ''
  );
  const [telegramChatId, setTelegramChatId] = useState<string>(
    () => localStorage.getItem('paotang_telegram_chat_id') || ''
  );
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [isTelegramSaved, setIsTelegramSaved] = useState(false);
  const [detectingChats, setDetectingChats] = useState(false);
  const [detectedChats, setDetectedChats] = useState<DetectedTelegramChat[]>([]);
  const [detectNotice, setDetectNotice] = useState<string | null>(null);

  const [showGuide, setShowGuide] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleCopyKeyName = (keyName: string) => {
    navigator.clipboard?.writeText(keyName).catch(() => {});
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Save LINE credentials to localStorage
  const handleSaveCredentials = () => {
    localStorage.setItem('paotang_line_channel_token', channelAccessToken.trim());
    localStorage.setItem('paotang_line_user_id', userId.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Save Telegram credentials to localStorage
  const handleSaveTelegramCredentials = () => {
    localStorage.setItem('paotang_telegram_bot_token', telegramBotToken.trim());
    localStorage.setItem('paotang_telegram_chat_id', telegramChatId.trim());
    setIsTelegramSaved(true);
    setTimeout(() => setIsTelegramSaved(false), 2500);
  };

  // Auto-detect Telegram groups via getUpdates
  const handleDetectTelegramChats = async () => {
    setDetectingChats(true);
    setDetectNotice(null);
    try {
      const res = await fetch('/api/notify/telegram/detect-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramBotToken.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDetectedChats(data.chats || []);
        setDetectNotice(data.message);
      } else {
        setDetectNotice(`❌ ${data.error || 'ไม่สามารถค้นหากลุ่ม Telegram ได้'}`);
      }
    } catch (err: any) {
      setDetectNotice(`❌ เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ: ${err.message}`);
    } finally {
      setDetectingChats(false);
    }
  };

  const buildFormattedMessage = (scenario?: 'BUY' | 'TAKE_PROFIT' | 'GOLDEN_HOURS') => {
    const score = speculationPlan.confidenceScore || 98.6;
    const weekly = speculationPlan.weeklyStrategy || {
      entryDay: 'วันจันทร์ (Monday Open / Dip)',
      exitDay: 'วันศุกร์ (Friday Close)',
      targetProfitPercent: 5.0,
      targetSpotPrice: Number((currentSpot * 1.05).toFixed(2)),
      gainUsdPerOz: Number((currentSpot * 0.05).toFixed(2)),
      targetThaiPrice: Math.round((currentThaiGold * 1.05) / 50) * 50,
      gainThaiPerBaht: Math.round((currentThaiGold * 1.05) / 50) * 50 - currentThaiGold,
    };

    if (scenario === 'BUY') {
      return `
🚨 [ได้เวลาเข้าซื้อเก็งกำไร! - คะแนนปัจจัยมั่นใจ ${score}%]
------------------------------------
🎯 ระบบประเมิน: จังหวะเข้าซื้อความแม่นยำสูง (Confluence ${score}%)
🗓️ กลยุทธ์สัปดาห์: ${weekly.entryDay} ➔ ${weekly.exitDay}
💰 ราคาทองสปอตโลก: $${currentSpot.toFixed(2)} USD/oz
🪙 ราคาทอง 96.5% (สมาคม): ฿${currentThaiGold.toLocaleString()} บาท

🎯 จุดยุทธศาสตร์รอบสัปดาห์นี้:
• ช่วงราคาเข้าซื้อ (Entry): $${speculationPlan.spotLevels.entryRange}
• เป้าหมาย TP +5.00%: $${weekly.targetSpotPrice} USD (฿${weekly.targetThaiPrice.toLocaleString()} บาท)
• กำไรคาดการณ์: +$${weekly.gainUsdPerOz} USD/oz (+฿${weekly.gainThaiPerBaht.toLocaleString()} บาท/บาททอง)
• จุดตัดขาดทุน (SL): $${speculationPlan.spotLevels.stopLoss}

💡 คำแนะนำแอ็กชันบนแอปเป๋าตัง:
1. เข้าเมนู "ซื้อทอง" พอร์ต USD (MTS / YLG) สเปรดแคบ 0.40$
2. เข้าซื้อไม้แรก ณ ราคาตลาดปัจจุบัน
3. เมื่อซื้อเสร็จ ให้กด "ขายทอง" > "ตั้งราคา" ล่วงหน้า +5.00% ($${weekly.targetSpotPrice} USD) กำหนดอายุ 7 วัน ระบบจะขายล็อกกำไรอัตโนมัติ
4. ปิดสถานะขายทำกำไรทั้งหมดภายในวันศุกร์ ไม่ถือข้ามสัปดาห์
      `.trim();
    }

    if (scenario === 'TAKE_PROFIT') {
      return `
🏆 [ได้เวลาขายทำกำไรทองคำ! - แตะเป้าหมายสัปดาห์นี้ TP +5.00%]
------------------------------------
🚀 สัญญาณระบบ: TAKE PROFIT (ขายล็อกกำไรตามแผนสัปดาห์)
💰 ราคาทองสปอตโลก: $${weekly.targetSpotPrice} USD/oz (แตะเป้า TP +5.00%)
🪙 ราคาทอง 96.5%: ฿${weekly.targetThaiPrice.toLocaleString()} บาท
💵 ผลตอบแทนรอบสัปดาห์: +5.00% (+฿${weekly.gainThaiPerBaht.toLocaleString()} บาท/บาททอง)

💡 แนะนำการแอ็กชันบนแอปเป๋าตัง:
• หากตั้งราคาขายล่วงหน้า 7 วันไว้ คำสั่งอาจถูกจับคู่แล้ว
• หากยังไม่ได้ตั้ง แนะนำเปิดแอปเป๋าตัง กด "ขายทอง" ทันที เพื่อล็อกกำไรเข้ากระเป๋าก่อนปิดตลาดวันศุกร์ ไม่ถือข้ามสุดสัปดาห์!
      `.trim();
    }

    if (scenario === 'GOLDEN_HOURS') {
      return `
⏰ [ได้เวลาช่วงเวลานาทีทอง! - ตลาดสหรัฐฯ เปิดทำการ]
------------------------------------
⚡ ช่วงเวลาทองคำ: 19:30 - 22:30 น. (US Session Golden Hours)
🔥 สภาพคล่องทองคำโลกพุ่งสูง ผันผวนแรง เหมาะทำกำไรเร็วสุด
💰 ราคาทองปัจจุบัน: $${currentSpot.toFixed(2)} USD/oz
🪙 ราคาทอง 96.5%: ฿${currentThaiGold.toLocaleString()} บาท
🎯 เป้าหมายสัปดาห์ TP +5%: $${weekly.targetSpotPrice} USD

💡 คำแนะนำสำหรับเป๋าตัง:
• ติดตามราคาอย่างใกล้ชิด ร้านทอง MTS / YLG บนเป๋าตังเปิดให้เทรดได้ถึง 02:00 น.
      `.trim();
    }

    return `
🔔 [Paotang Gold Signal - สรุปสถานะปัจจุบัน]
------------------------------------
🎯 คะแนนปัจจัยรอบด้าน: ${score}% (${score >= 98 ? 'พร้อมเข้าซื้อ' : 'รอสัญญาณ'})
📈 สัญญาณ: ${speculationPlan.signal}
💰 ราคาทองโลก (XAU/USD): $${currentSpot.toFixed(2)}
🪙 ราคาทองสมาคม: ฿${currentThaiGold.toLocaleString()} บาท
🎯 เข้าซื้อ: $${speculationPlan.spotLevels.entryRange}
🚀 เป้าสัปดาห์ TP +5%: $${weekly.targetSpotPrice} USD (฿${weekly.targetThaiPrice.toLocaleString()})
🛑 จุดคัท SL: $${speculationPlan.spotLevels.stopLoss}
💡 คำแนะนำ: ${speculationPlan.recommendedShop}
    `.trim();
  };

  // Send Push Message to LINE OA and/or Telegram Group
  const handleSendPushMessage = async (
    scenario?: 'BUY' | 'TAKE_PROFIT' | 'GOLDEN_HOURS',
    targetOverride?: 'LINE' | 'TELEGRAM' | 'ENABLED'
  ) => {
    setSendingTest(true);
    setTestResult(null);

    const formattedMessage = buildFormattedMessage(scenario);
    const modeTarget = targetOverride || 'ENABLED';

    const sendLine =
      modeTarget === 'LINE' ||
      (modeTarget === 'ENABLED' && (autoSettings.enableLineAlerts ?? true));
    const sendTelegram =
      modeTarget === 'TELEGRAM' ||
      (modeTarget === 'ENABLED' && (autoSettings.enableTelegramAlerts ?? true));

    const results: string[] = [];
    let hasError = false;

    try {
      if (sendLine) {
        const hasLocalLineCreds = Boolean(channelAccessToken.trim() && userId.trim());
        const shouldSendRealOrExplicitLine =
          hasLocalLineCreds || serverLineSecrets?.configuredViaSecrets || modeTarget === 'LINE';

        if (shouldSendRealOrExplicitLine) {
          const res = await fetch('/api/notify/line', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelAccessToken: channelAccessToken.trim(),
              userId: userId.trim(),
              message: formattedMessage,
              mock: !hasLocalLineCreds && !serverLineSecrets?.configuredViaSecrets,
            }),
          });
          const data = await res.json();
          if (data.success) {
            const sourceTag =
              data.source === 'AI_STUDIO_SECRETS' ? ' (Secrets)' : '';
            results.push(
              data.mode === 'REAL'
                ? `✅ LINE OA: ส่งสำเร็จแล้ว!${sourceTag}`
                : `✅ LINE OA: ทดสอบจำลองสำเร็จ`
            );
          } else {
            hasError = true;
            results.push(`❌ LINE OA: ${data.error || 'เกิดข้อผิดพลาด'}`);
          }
        }
      }

      if (sendTelegram) {
        const hasLocalTgCreds = Boolean(telegramBotToken.trim() && telegramChatId.trim());
        const shouldSendRealOrExplicitTg =
          hasLocalTgCreds || serverTelegramSecrets?.configuredViaSecrets || modeTarget === 'TELEGRAM';

        if (shouldSendRealOrExplicitTg) {
          const res = await fetch('/api/notify/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              botToken: telegramBotToken.trim(),
              chatId: telegramChatId.trim(),
              message: formattedMessage,
              mock: !hasLocalTgCreds && !serverTelegramSecrets?.configuredViaSecrets,
            }),
          });
          const data = await res.json();
          if (data.success) {
            const sourceTag =
              data.source === 'AI_STUDIO_SECRETS' ? ' (Secrets)' : '';
            results.push(
              data.mode === 'REAL'
                ? `✅ Telegram Group: ส่งเข้ากลุ่ม "${data.chatTitle}" สำเร็จ!${sourceTag}`
                : `✅ Telegram Group: ทดสอบจำลองสำเร็จ`
            );
          } else {
            hasError = true;
            results.push(`❌ Telegram Group: ${data.error || 'เกิดข้อผิดพลาด'}`);
          }
        }
      }

      if (results.length === 0) {
        setTestResult({
          success: false,
          msg: '⚠️ กรุณาเปิดใช้งานอย่างน้อย 1 ช่องทาง (LINE OA หรือ กลุ่ม Telegram) ด้านบนก่อนทดสอบส่ง',
        });
      } else {
        setTestResult({
          success: !hasError,
          msg: results.join('  |  '),
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: `❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์: ${err.message}`,
      });
    } finally {
      setSendingTest(false);
    }
  };

  const isLineReady = Boolean(
    (channelAccessToken.trim() && userId.trim()) || serverLineSecrets?.configuredViaSecrets
  );
  const isTelegramReady = Boolean(
    (telegramBotToken.trim() && telegramChatId.trim()) || serverTelegramSecrets?.configuredViaSecrets
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Bot className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white flex flex-wrap items-center gap-2">
              <span>ระบบแจ้งเตือนอัตโนมัติ (LINE OA & กลุ่ม Telegram)</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                Auto-Pilot Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              ส่งสัญญาณซื้อความมั่นใจ ≥ 98%, แจ้งเตือน TP +5.00% และเป้าหมายราคาเข้า LINE OA และกลุ่ม Telegram อัตโนมัติพร้อมกัน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>วิธีตั้งค่า LINE & Telegram</span>
          </button>
        </div>
      </div>

      {/* AUTO-PILOT CONTROL PANEL */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-slate-950 to-sky-500/10 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400 relative"></span>
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">
                ระบบเฝ้าระวังอัตโนมัติ (Auto-Pilot Multi-Channel Broadcaster)
              </span>
              <span className="text-xs text-slate-400">
                {autoSettings.enabled
                  ? 'กำลังสแกนจังหวะเทรดตลอดเวลา และยิงสัญญาณเข้าทุกช่องทางที่เปิดใช้งานทันทีที่เงื่อนไขผ่าน'
                  : 'ปิดการสแกนอัตโนมัติชั่วคราว'}
              </span>
            </div>
          </div>

          {/* Master Toggle Switch */}
          <button
            onClick={() =>
              onUpdateAutoSettings({
                ...autoSettings,
                enabled: !autoSettings.enabled,
              })
            }
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              autoSettings.enabled
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{autoSettings.enabled ? 'เปิดเฝ้าระวังอัตโนมัติ (ON)' : 'ปิดชั่วคราว (OFF)'}</span>
          </button>
        </div>

        {/* Channel Routing Toggles (LINE OA + Telegram Group) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={autoSettings.enableLineAlerts ?? true}
                onChange={(e) =>
                  onUpdateAutoSettings({
                    ...autoSettings,
                    enableLineAlerts: e.target.checked,
                  })
                }
                className="rounded text-emerald-500 focus:ring-0"
              />
              <div>
                <span className="font-bold text-slate-100 block">🟢 ส่งแจ้งเตือนเข้า LINE OA</span>
                <span className="text-[11px] text-slate-400">
                  ส่งเข้าแชทส่วนตัว LINE Messaging API
                </span>
              </div>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                isLineReady
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isLineReady ? 'เชื่อมต่อแล้ว' : 'ยังไม่ตั้งค่า'}
            </span>
          </label>

          <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 cursor-pointer hover:border-sky-500/40 transition-colors">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={autoSettings.enableTelegramAlerts ?? true}
                onChange={(e) =>
                  onUpdateAutoSettings({
                    ...autoSettings,
                    enableTelegramAlerts: e.target.checked,
                  })
                }
                className="rounded text-sky-500 focus:ring-0"
              />
              <div>
                <span className="font-bold text-slate-100 block">
                  ✈️ ส่งแจ้งเตือนเข้ากลุ่ม Telegram
                </span>
                <span className="text-[11px] text-slate-400">
                  ส่งสัญญาณอัตโนมัติเข้า Telegram Group Bot
                </span>
              </div>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                isTelegramReady
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isTelegramReady ? 'เชื่อมต่อแล้ว' : 'รอใส่ Token/Group ID'}
            </span>
          </label>
        </div>

        {/* Anti-Spam & 98% Confluence Feature Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSettings.strict98PercentOnly}
              onChange={(e) =>
                onUpdateAutoSettings({
                  ...autoSettings,
                  strict98PercentOnly: e.target.checked,
                })
              }
              className="mt-0.5 rounded text-amber-500 focus:ring-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                  <span>กรองแจ้งเตือนเฉพาะเมื่อคะแนนปัจจัยรอบด้าน ≥ 98% เท่านั้น</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  แนะนำ: ลดความถี่ & สัญญาณแม่นยำสูงสุด
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                แก้ปัญหาแจ้งเตือนเข้าถี่เกินไป! ระบบจะตรวจเช็กความสอดคล้อง 5 ปัจจัย (แนวโน้ม 3 เส้น EMA, โมเมนตัม RSI, แนวรับ Pivot S1, ค่าเงินบาท/สเปรด MTS, และรอบเวลาเทรด) หากคะแนนรวมไม่ถึง 98% จะไม่มีการยิงแจ้งเตือนรบกวนเด็ดขาด
              </p>
            </div>
          </label>

          {/* Cooldown & Schedule Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-500/20 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 font-medium">ระยะห่างการแจ้งเตือน (Cooldown):</span>
              <select
                value={autoSettings.cooldownMinutes}
                onChange={(e) =>
                  onUpdateAutoSettings({
                    ...autoSettings,
                    cooldownMinutes: Number(e.target.value),
                  })
                }
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value={60}>60 นาที (1 ชั่วโมง)</option>
                <option value={240}>240 นาที (4 ชั่วโมง)</option>
                <option value={360}>360 นาที (6 ชั่วโมง - แนะนำสำหรับรอบเทรด)</option>
                <option value={720}>720 นาที (12 ชั่วโมง)</option>
                <option value={1440}>1,440 นาที (24 ชั่วโมง / วันละ 1 ครั้ง)</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={autoSettings.weeklyScheduleOnly}
                onChange={(e) =>
                  onUpdateAutoSettings({
                    ...autoSettings,
                    weeklyScheduleOnly: e.target.checked,
                  })
                }
                className="rounded text-emerald-500 focus:ring-0"
              />
              <span className="text-[11px] font-medium text-emerald-300">
                เน้นรอบเทรด วันจันทร์ ➔ ปิดขายวันศุกร์ (TP +5.00%)
              </span>
            </label>
          </div>
        </div>

        {/* Trigger Condition Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={autoSettings.notifyOnBuySignal}
              onChange={(e) =>
                onUpdateAutoSettings({
                  ...autoSettings,
                  notifyOnBuySignal: e.target.checked,
                })
              }
              className="mt-0.5 rounded text-emerald-500 focus:ring-0"
            />
            <div>
              <span className="font-bold text-slate-200 block">
                🟢 แจ้งเตือนเมื่อ "ได้เวลาเข้าซื้อ" (Buy Signal {autoSettings.strict98PercentOnly ? '≥ 98%' : ''})
              </span>
              <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                {autoSettings.strict98PercentOnly
                  ? 'จะแจ้งเตือนเมื่อคะแนนปัจจัย 5 ด้านผ่านเกณฑ์ ≥ 98% เท่านั้น เพื่อความชัวร์ในการทำกำไร'
                  : `เตือนเมื่อแตะช่วง Entry (${speculationPlan.spotLevels.entryRange}) หรือเกิดสัญญาณซื้อ`}
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={autoSettings.notifyOnTakeProfit}
              onChange={(e) =>
                onUpdateAutoSettings({
                  ...autoSettings,
                  notifyOnTakeProfit: e.target.checked,
                })
              }
              className="mt-0.5 rounded text-amber-500 focus:ring-0"
            />
            <div>
              <span className="font-bold text-slate-200 block">
                🏆 แจ้งเตือนเมื่อ "ได้เวลาขายทำกำไร" (Take Profit TP +5.00%)
              </span>
              <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                เตือนเมื่อราคาขึ้นแตะเป้า TP +5.00% (${speculationPlan.weeklyStrategy?.targetSpotPrice || speculationPlan.spotLevels.tp5PercentWeekly}) เพื่อขายล็อกกำไรก่อนวันศุกร์
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={autoSettings.notifyOnRsiOversold}
              onChange={(e) =>
                onUpdateAutoSettings({
                  ...autoSettings,
                  notifyOnRsiOversold: e.target.checked,
                })
              }
              className="mt-0.5 rounded text-blue-500 focus:ring-0"
            />
            <div>
              <span className="font-bold text-slate-200 block">
                ⚡ แจ้งเตือน "จังหวะช้อนซื้อด่วน" (RSI Oversold &lt; 32)
              </span>
              <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                เตือนเมื่อราคาทองถูกเทขายลึกเกินไป เกิดโอกาสดีดตัวกลับแรง (ปิดไว้เป็นค่าเริ่มต้นเพื่อลดความถี่)
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={autoSettings.notifyOnGoldenHours}
              onChange={(e) =>
                onUpdateAutoSettings({
                  ...autoSettings,
                  notifyOnGoldenHours: e.target.checked,
                })
              }
              className="mt-0.5 rounded text-purple-500 focus:ring-0"
            />
            <div>
              <span className="font-bold text-slate-200 block">
                ⏰ แจ้งเตือน "ช่วงเวลานาทีทอง" (Golden Trading Hours)
              </span>
              <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                เตือนเมื่อเข้าสู่ตลาดค่ำสหรัฐฯ (19:30 - 22:30 น.) สภาพคล่องสูง ราคาวิ่งแรงที่สุดในรอบวัน
              </span>
            </div>
          </label>
        </div>

        {/* Quick Test Triggers (ส่งเข้าทุกช่องทางที่เปิดใช้งานพร้อมกัน) */}
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-semibold block mb-2">
            ทดสอบจำลองส่งสัญญาณไปยังช่องทางที่เปิดใช้งาน (LINE OA / Telegram Group):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleSendPushMessage('BUY', 'ENABLED')}
              disabled={sendingTest}
              className="py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>🎯 ทดสอบเตือน: สัญญาณซื้อ 98%+ (TP +5%)</span>
            </button>

            <button
              onClick={() => handleSendPushMessage('TAKE_PROFIT', 'ENABLED')}
              disabled={sendingTest}
              className="py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>🏆 ทดสอบเตือน: ได้เวลาขาย TP +5.00%</span>
            </button>

            <button
              onClick={() => handleSendPushMessage('GOLDEN_HOURS', 'ENABLED')}
              disabled={sendingTest}
              className="py-2.5 px-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>⏰ ทดสอบเตือน: นาทีทอง 19:30 น.</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide Accordion (Both Telegram & LINE) */}
      {showGuide && (
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 text-xs text-slate-300 space-y-4">
          <div className="flex items-center justify-between font-bold text-amber-400 border-b border-slate-800 pb-2">
            <span>คู่มือตั้งค่า Telegram Group Bot & LINE Messaging API:</span>
            <button
              onClick={() => setShowGuide(false)}
              className="text-slate-400 hover:text-white"
            >
              ปิดคำแนะนำ ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telegram Guide */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-sky-500/30 space-y-2">
              <h4 className="font-bold text-sky-300">✈️ วิธีตั้งค่ากลุ่ม Telegram (3 ขั้นตอน):</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                <li>
                  เปิดแอป Telegram ค้นหาบอท{' '}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 underline inline-flex items-center gap-0.5"
                  >
                    @BotFather <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  แล้วพิมพ์ <code className="text-amber-300">/newbot</code> เพื่อสร้างบอทและรับ{' '}
                  <strong>Bot Token</strong>
                </li>
                <li>
                  <strong>ดึงบอทเข้ากลุ่ม Telegram</strong> ของคุณ (Add Member) แล้วพิมพ์ข้อความทักทายในกลุ่ม เช่น{' '}
                  <code className="text-amber-300">/start</code> หรือ <code className="text-amber-300">hello</code>
                </li>
                <li>
                  นำ Bot Token มาวางด้านล่างแล้วกดปุ่ม <strong>"ค้นหากลุ่มอัตโนมัติ"</strong> ระบบจะดึง{' '}
                  <strong>Group Chat ID</strong> (เช่น <code className="text-sky-300">-1001234567890</code>) มาให้เลือกทันที
                </li>
              </ol>
            </div>

            {/* LINE Guide */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-emerald-500/30 space-y-2">
              <h4 className="font-bold text-emerald-300">🟢 วิธีตั้งค่า LINE Messaging API (3 ขั้นตอน):</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                <li>
                  เข้าสู่ระบบ{' '}
                  <a
                    href="https://developers.line.biz/console/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 underline inline-flex items-center gap-0.5"
                  >
                    LINE Developers Console <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  และเลือก Channel ประเภท <strong>Messaging API</strong>
                </li>
                <li>
                  <strong>Channel Access Token</strong>: แท็บ <strong>Messaging API</strong> &gt;{' '}
                  <strong>Channel access token (long-lived)</strong> &gt; กด <strong>Issue</strong>
                </li>
                <li>
                  <strong>User ID</strong>: แท็บ <strong>Basic settings</strong> &gt; <strong>Your user ID</strong> (ขึ้นต้นด้วย U) และอย่าลืม Add Friend บอทก่อน
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span className="font-medium">{testResult.msg}</span>
          <button
            onClick={() => setTestResult(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Channel Config (Telegram / LINE) & Price Alerts List (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Channel Configuration Tabs */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveChannelTab('TELEGRAM')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeChannelTab === 'TELEGRAM'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>✈️ ตั้งค่ากลุ่ม Telegram</span>
                {isTelegramReady && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeChannelTab === 'TELEGRAM' ? 'bg-slate-950' : 'bg-sky-400'
                    }`}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveChannelTab('LINE')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeChannelTab === 'LINE'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>🟢 ตั้งค่า LINE OA</span>
                {isLineReady && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeChannelTab === 'LINE' ? 'bg-slate-950' : 'bg-emerald-400'
                    }`}
                  />
                )}
              </button>
            </div>

            {activeChannelTab === 'TELEGRAM' ? (
              <div className="space-y-3.5">
                {/* Telegram AI Studio Secrets Panel */}
                <div className="bg-slate-900/90 border border-sky-500/30 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-sky-400" />
                      <span>AI Studio Secrets (สำหรับกลุ่ม Telegram)</span>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        serverTelegramSecrets?.configuredViaSecrets
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {serverTelegramSecrets?.configuredViaSecrets
                        ? '✓ เชื่อมต่อจาก Secrets แล้ว'
                        : 'เพิ่มในเมนู Secrets ได้'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    สามารถเพิ่มตัวแปรในเมนู <strong className="text-slate-200">Settings ➔ Secrets</strong> ของ AI Studio เพื่อให้เซิร์ฟเวอร์ส่งเข้ากลุ่ม Telegram อัตโนมัติ หรือกรอกทดสอบในช่องด้านล่าง:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="flex items-center justify-between bg-slate-950 px-2.5 py-2 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            serverTelegramSecrets?.hasEnvBotToken ? 'bg-sky-400' : 'bg-slate-600'
                          }`}
                        />
                        <span className="text-sky-300 truncate">TELEGRAM_BOT_TOKEN</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyKeyName('TELEGRAM_BOT_TOKEN')}
                        className="text-slate-400 hover:text-white ml-2 shrink-0 flex items-center gap-1 text-[10px] font-sans"
                      >
                        {copiedKey === 'TELEGRAM_BOT_TOKEN' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === 'TELEGRAM_BOT_TOKEN' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-slate-950 px-2.5 py-2 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            serverTelegramSecrets?.hasEnvChatId ? 'bg-sky-400' : 'bg-slate-600'
                          }`}
                        />
                        <span className="text-amber-300 truncate">TELEGRAM_CHAT_ID</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyKeyName('TELEGRAM_CHAT_ID')}
                        className="text-slate-400 hover:text-white ml-2 shrink-0 flex items-center gap-1 text-[10px] font-sans"
                      >
                        {copiedKey === 'TELEGRAM_CHAT_ID' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === 'TELEGRAM_CHAT_ID' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Telegram Bot Token */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-sky-400" />
                      <span>Telegram Bot Token (จาก @BotFather):</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTelegramToken(!showTelegramToken)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {showTelegramToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showTelegramToken ? 'ซ่อน' : 'แสดง'}</span>
                    </button>
                  </div>
                  <input
                    type={showTelegramToken ? 'text' : 'password'}
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    placeholder={
                      serverTelegramSecrets?.hasEnvBotToken
                        ? '✓ กำลังใช้ TELEGRAM_BOT_TOKEN จาก AI Studio Secrets (เว้นว่างไว้ได้)'
                        : 'ตัวอย่าง: 7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                {/* Telegram Group Chat ID + Auto-Detect */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Telegram Group Chat ID:</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectTelegramChats}
                      disabled={detectingChats}
                      className="text-[11px] bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
                    >
                      {detectingChats ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Search className="w-3 h-3" />
                      )}
                      <span>ค้นหา Group Chat ID อัตโนมัติ</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder={
                      serverTelegramSecrets?.hasEnvChatId
                        ? '✓ กำลังใช้ TELEGRAM_CHAT_ID จาก AI Studio Secrets (เว้นว่างไว้ได้)'
                        : 'ตัวอย่าง Group ID: -1001234567890 (ต้องมีเครื่องหมายลบ - นำหน้า)'
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />

                  {detectNotice && (
                    <p className="text-[11px] text-sky-300 mt-1.5">{detectNotice}</p>
                  )}

                  {detectedChats.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {detectedChats.map((chat) => (
                        <button
                          key={chat.id}
                          type="button"
                          onClick={() => {
                            setTelegramChatId(chat.id);
                            setDetectNotice(`✓ เลือกกลุ่ม "${chat.title}" (${chat.id}) แล้ว`);
                          }}
                          className="text-[11px] bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border border-sky-500/30 px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5"
                        >
                          <span className="font-sans font-semibold">{chat.title}</span>
                          <span className="text-sky-400">({chat.id})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save & Test Telegram */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleSaveTelegramCredentials}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    {isTelegramSaved ? <Check className="w-3.5 h-3.5 text-sky-400" /> : null}
                    <span>{isTelegramSaved ? 'บันทึกเรียบร้อยแล้ว' : 'บันทึกค่า Telegram (Save)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendPushMessage('BUY', 'TELEGRAM')}
                    disabled={sendingTest}
                    className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ทดสอบส่งสัญญาณเข้ากลุ่ม Telegram</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* LINE AI Studio Secrets / Environment Variables Box */}
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Studio Secrets / Environment Variables (LINE OA)</span>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        serverLineSecrets?.configuredViaSecrets
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {serverLineSecrets?.configuredViaSecrets
                        ? '✓ เชื่อมต่อจาก Secrets แล้ว'
                        : 'พร้อมให้เพิ่มในเมนู Secrets'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ตั้งค่าตัวแปรในเมนู <strong className="text-slate-200">Settings ➔ Secrets / Environment Variables</strong> ของโปรเจกต์ใน AI Studio เพื่อเก็บ Token อย่างปลอดภัยบนเซิร์ฟเวอร์:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="flex items-center justify-between bg-slate-950 px-2.5 py-2 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            serverLineSecrets?.hasEnvToken ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                        />
                        <span className="text-emerald-300 truncate">LINE_CHANNEL_ACCESS_TOKEN</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyKeyName('LINE_CHANNEL_ACCESS_TOKEN')}
                        className="text-slate-400 hover:text-white ml-2 shrink-0 flex items-center gap-1 text-[10px] font-sans"
                        title="คัดลอกชื่อตัวแปร"
                      >
                        {copiedKey === 'LINE_CHANNEL_ACCESS_TOKEN' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === 'LINE_CHANNEL_ACCESS_TOKEN' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-slate-950 px-2.5 py-2 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            serverLineSecrets?.hasEnvUserId ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                        />
                        <span className="text-amber-300 truncate">LINE_USER_ID</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyKeyName('LINE_USER_ID')}
                        className="text-slate-400 hover:text-white ml-2 shrink-0 flex items-center gap-1 text-[10px] font-sans"
                        title="คัดลอกชื่อตัวแปร"
                      >
                        {copiedKey === 'LINE_USER_ID' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === 'LINE_USER_ID' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Field 1: Channel Access Token */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-emerald-400" />
                      <span>Channel Access Token (กรอกทับเฉพาะเครื่องนี้ - Optional):</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showToken ? 'ซ่อน' : 'แสดง'}</span>
                    </button>
                  </div>
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={channelAccessToken}
                    onChange={(e) => setChannelAccessToken(e.target.value)}
                    placeholder={
                      serverLineSecrets?.hasEnvToken
                        ? '✓ กำลังใช้ LINE_CHANNEL_ACCESS_TOKEN จาก AI Studio Secrets (เว้นว่างไว้ได้)'
                        : 'วาง Channel Access Token จาก LINE Developers Console'
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Field 2: User ID */}
                <div>
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-1.5">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Your LINE User ID (กรอกทับเฉพาะเครื่องนี้ - Optional):</span>
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={
                      serverLineSecrets?.hasEnvUserId
                        ? '✓ กำลังใช้ LINE_USER_ID จาก AI Studio Secrets (เว้นว่างไว้ได้)'
                        : 'ตัวอย่าง: U1234567890abcdef1234567890abcdef'
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    รหัสเฉพาะของคุณในแท็บ Basic settings (ไม่ใช่ LINE ID ที่ใช้แอดเพื่อน)
                  </p>
                </div>

                {/* Save Buttons & Test LINE */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    <span>{isSaved ? 'บันทึกเรียบร้อยแล้ว' : 'บันทึกค่าในเบราว์เซอร์ (Save)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendPushMessage(undefined, 'LINE')}
                    disabled={sendingTest}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ทดสอบส่งข้อความเข้า LINE OA</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Target Presets from Speculation Plan */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              เป้าหมายราคาเฉพาะสำหรับแจ้งเตือน (ส่งเข้าทั้ง LINE & กลุ่ม Telegram):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <button
                onClick={() =>
                  onAddAlert({
                    asset: 'XAU_USD',
                    targetPrice: Number((currentSpot * 0.995).toFixed(2)),
                    targetType: 'BELOW',
                    label: 'จุดเข้าซื้อไม้ 1 (Entry)',
                    active: true,
                  })
                }
                className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-left transition-colors"
              >
                <span className="block text-[10px] text-blue-400 font-sans">เข้าซื้อ</span>
                <span className="font-bold">${(currentSpot * 0.995).toFixed(1)}</span>
              </button>

              <button
                onClick={() =>
                  onAddAlert({
                    asset: 'XAU_USD',
                    targetPrice: speculationPlan.spotLevels.tp1,
                    targetType: 'ABOVE',
                    label: 'เป้าทำกำไร TP 1 (+1.00%)',
                    active: true,
                  })
                }
                className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-left transition-colors"
              >
                <span className="block text-[10px] text-emerald-400 font-sans">เป้า TP 1</span>
                <span className="font-bold">${speculationPlan.spotLevels.tp1}</span>
              </button>

              <button
                onClick={() =>
                  onAddAlert({
                    asset: 'XAU_USD',
                    targetPrice: speculationPlan.spotLevels.tp5PercentWeekly || speculationPlan.spotLevels.tp2,
                    targetType: 'ABOVE',
                    label: 'เป้าสัปดาห์ TP +5.00%',
                    active: true,
                  })
                }
                className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-left transition-colors"
              >
                <span className="block text-[10px] text-amber-400 font-sans">เป้า TP +5%</span>
                <span className="font-bold">
                  ${speculationPlan.spotLevels.tp5PercentWeekly || speculationPlan.spotLevels.tp2}
                </span>
              </button>

              <button
                onClick={() =>
                  onAddAlert({
                    asset: 'XAU_USD',
                    targetPrice: speculationPlan.spotLevels.stopLoss,
                    targetType: 'BELOW',
                    label: 'ตัดขาดทุน (Stop Loss)',
                    active: true,
                  })
                }
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-left transition-colors"
              >
                <span className="block text-[10px] text-rose-400 font-sans">คัทลอส SL</span>
                <span className="font-bold">${speculationPlan.spotLevels.stopLoss}</span>
              </button>
            </div>
          </div>

          {/* Active Alerts List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                รายการเป้าหมายราคาที่ตั้งไว้ ({alerts.length}):
              </label>
            </div>

            {alerts.length === 0 ? (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                ยังไม่มีการตั้งแจ้งเตือน กดปุ่มลัดด้านบนเพื่อเพิ่มเป้าหมายได้ทันที
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      alert.triggered
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : alert.active
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleAlert(alert.id)}
                        className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                          alert.active
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                            : 'border-slate-600'
                        }`}
                      >
                        {alert.active ? '✓' : ''}
                      </button>
                      <div>
                        <span className="font-medium text-slate-200 block">{alert.label}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {alert.targetType === 'ABOVE' ? 'แตะหรือสูงกว่า' : 'แตะหรือต่ำกว่า'}{' '}
                          {alert.asset === 'XAU_USD'
                            ? `$${alert.targetPrice}`
                            : `฿${alert.targetPrice.toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.triggered && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-medium">
                          แตะเป้าแล้ว!
                        </span>
                      )}
                      <button
                        onClick={() => onRemoveAlert(alert.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="ลบการแจ้งเตือน"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Live Smartphone Preview (Telegram Group / LINE OA) (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Smartphone
                className={`w-4 h-4 ${
                  activeChannelTab === 'TELEGRAM' ? 'text-sky-400' : 'text-emerald-400'
                }`}
              />
              <span>
                {activeChannelTab === 'TELEGRAM'
                  ? 'ตัวอย่างข้อความในกลุ่ม Telegram'
                  : 'ตัวอย่างข้อความแชท LINE OA'}
              </span>
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                activeChannelTab === 'TELEGRAM'
                  ? 'text-sky-400 bg-sky-500/10'
                  : 'text-emerald-400 bg-emerald-500/10'
              }`}
            >
              {activeChannelTab === 'TELEGRAM' ? 'Telegram Bot Preview' : 'LINE Push Preview'}
            </span>
          </div>

          {activeChannelTab === 'TELEGRAM' ? (
            /* Telegram Group Frame */
            <div className="bg-[#0E1621] rounded-2xl p-3 shadow-2xl border border-slate-800 font-sans">
              {/* Telegram Top Bar */}
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    ✈️
                  </div>
                  <div>
                    <span className="text-white text-xs font-bold block leading-tight">
                      Paotang Gold Signal Group
                    </span>
                    <span className="text-[10px] text-sky-400 block">
                      Bot Alert Connected · {isTelegramReady ? 'Online' : 'Standby'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Telegram Bot Message Bubble */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-[11px] font-black shrink-0 mt-1">
                  ฿
                </div>

                <div className="bg-[#182533] text-slate-100 rounded-2xl rounded-tl-sm p-3.5 text-xs leading-relaxed space-y-2 shadow-md border border-slate-700/50 max-w-[92%]">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/70 pb-1.5">
                    <span className="font-bold text-sky-300 text-[12px]">
                      Paotang Gold Signal Bot <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded ml-1">BOT</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded font-bold">
                      มั่นใจ {speculationPlan.confidenceScore || 98.6}%
                    </span>
                  </div>

                  <div className="font-bold text-amber-300 text-[12px]">
                    🚨 [ได้เวลาเข้าซื้อเก็งกำไร!]
                  </div>

                  <div className="text-[11px] text-slate-300">
                    🗓️ กลยุทธ์สัปดาห์: <strong className="text-white">วันจันทร์ ➔ วันศุกร์</strong>
                  </div>

                  <div className="bg-[#0E1621]/90 p-2.5 rounded-lg border border-slate-700/60 space-y-1 text-[11px] font-mono">
                    <div>💰 Spot XAU: <strong className="text-white">${currentSpot.toFixed(2)}</strong></div>
                    <div>🪙 ทอง 96.5%: <strong className="text-white">฿{currentThaiGold.toLocaleString()}</strong></div>
                    <div>🎯 จุดเข้าซื้อ: <strong className="text-sky-300">${speculationPlan.spotLevels.entryRange}</strong></div>
                    <div className="text-emerald-400 font-bold">
                      🚀 เป้า TP +5.00%: <strong>${speculationPlan.weeklyStrategy?.targetSpotPrice || speculationPlan.spotLevels.tp5PercentWeekly}</strong>
                    </div>
                    <div className="text-emerald-300 text-[10px]">
                      (ทองไทย: ฿{speculationPlan.weeklyStrategy?.targetThaiPrice?.toLocaleString() || speculationPlan.thaiBahtLevels.tp5PercentWeekly?.toLocaleString()} บาท)
                    </div>
                    <div className="text-rose-300">🛑 จุดคัท SL: <strong>${speculationPlan.spotLevels.stopLoss}</strong></div>
                  </div>

                  <div className="text-[10px] text-slate-300 pt-1 leading-snug border-t border-slate-700/60 space-y-1">
                    <div>💡 ซื้อไม้แรกบนเป๋าตัง แล้วตั้งราคาขายล่วงหน้า 7 วัน +5.00% เพื่อปิดทำกำไรภายในวันศุกร์</div>
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-400 mt-1.5 font-mono">
                ✓✓ Broadcasted to Group
              </div>
            </div>
          ) : (
            /* LINE OA Chat Frame */
            <div className="bg-[#7288A2] rounded-2xl p-3 shadow-2xl border border-slate-700/60 font-sans">
              {/* LINE OA Chat Top Bar */}
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow ring-2 ring-white/50">
                    ฿
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-white text-xs font-bold block leading-none">
                        Paotang Gold Signal
                      </span>
                      <span className="text-[9px] bg-emerald-700 text-white px-1 rounded font-semibold">
                        OA
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-200 block font-light">
                      Official Account
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-white/80 font-mono">
                  {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Chat Bubble Message */}
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1">
                  ฿
                </div>

                <div className="bg-white text-slate-900 rounded-2xl rounded-tl-sm p-3.5 text-xs leading-relaxed space-y-1.5 shadow-md max-w-[92%]">
                  <div className="font-bold text-emerald-800 flex items-center justify-between text-[13px] border-b border-slate-100 pb-1">
                    <span>🚨 ได้เวลาเข้าซื้อเก็งกำไร!</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded font-bold">
                      มั่นใจ {speculationPlan.confidenceScore || 98.6}%
                    </span>
                  </div>

                  <div className="font-semibold text-slate-800 text-[11px]">
                    🗓️ กลยุทธ์รอบสัปดาห์: <span className="text-emerald-700 font-bold">วันจันทร์ ➔ วันศุกร์</span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5 text-[11px] font-mono">
                    <div>💰 Spot XAU: <strong>${currentSpot.toFixed(2)}</strong></div>
                    <div>🪙 ทอง 96.5%: <strong>฿{currentThaiGold.toLocaleString()}</strong></div>
                    <div>🎯 จุดเข้าซื้อ: <strong>${speculationPlan.spotLevels.entryRange}</strong></div>
                    <div className="text-emerald-700 font-bold">
                      🚀 เป้าหมายสัปดาห์ TP +5.00%: <strong>${speculationPlan.weeklyStrategy?.targetSpotPrice || speculationPlan.spotLevels.tp5PercentWeekly}</strong>
                    </div>
                    <div className="text-emerald-600 text-[10px]">
                      (เป้าทองไทย: ฿{speculationPlan.weeklyStrategy?.targetThaiPrice?.toLocaleString() || speculationPlan.thaiBahtLevels.tp5PercentWeekly?.toLocaleString()} บาท)
                    </div>
                    <div>🛑 จุดตัดขาดทุน SL: <strong>${speculationPlan.spotLevels.stopLoss}</strong></div>
                  </div>

                  <div className="text-[10px] text-slate-600 pt-1 leading-tight border-t border-slate-100 space-y-1">
                    <div>💡 <strong>วิธีเทรดเป๋าตัง:</strong> ซื้อไม้แรก ณ ราคาตลาด แล้วกด "ขายทอง" &gt; "ตั้งราคา" +5.00% (${speculationPlan.weeklyStrategy?.targetSpotPrice || speculationPlan.spotLevels.tp5PercentWeekly} USD) ตั้งอายุ 7 วัน ระบบจะแมตช์ขายล็อกกำไรอัตโนมัติ</div>
                    <div className="text-amber-800 font-medium">⚠️ ปิดขายทำกำไรทั้งหมดภายในวันศุกร์ ไม่ถือข้ามเสาร์-อาทิตย์</div>
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] text-white/70 mt-1 font-mono">
                อ่านแล้ว
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
