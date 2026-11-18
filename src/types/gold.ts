export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Indicators {
  rsi: number;
  macd: {
    line: number;
    signal: number;
    histogram: number;
  };
  ema: {
    ema20: number;
    ema50: number;
    ema200: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  pivotPoints: {
    r2: number;
    r1: number;
    pivot: number;
    s1: number;
    s2: number;
  };
}

export type GoldPurityType = '9999' | '965';
export type ApiConnectionStatus = 'LIVE' | 'SYNCING' | 'FALLBACK' | 'ERROR';

export interface ThaiGoldPrices {
  rawPrice: number;
  gold9999Price?: number;
  gold965Price?: number;
  spreadOffsetThb?: number;
  purity?: GoldPurityType;
  associationSell: number;
  associationBuy: number;
  ornamentSell: number;
  ornamentBuy: number;
}

export interface PartnerQuote {
  name: string;
  brandColor: string;
  type: string;
  thb965?: {
    buy: number;
    sell: number;
    spread: number;
  };
  usd9999?: {
    buy: number;
    sell: number;
    spread: number;
  };
  thb9999PerGram?: {
    buy: number;
    sell: number;
    spread: number;
  };
  popularFor: string;
}

export interface FactorScoreItem {
  name: string;
  score: number;
  maxScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'WAIT';
  description: string;
}

export interface FactorBreakdown {
  trend: FactorScoreItem;
  momentum: FactorScoreItem;
  volatility: FactorScoreItem;
  forex: FactorScoreItem;
  weeklyTiming: FactorScoreItem;
  totalScore: number;
  isConfluence98Reached: boolean;
}

export interface WeeklyStrategyPlan {
  entryDay: string;
  exitDay: string;
  targetProfitPercent: number; // e.g. 5.0 (%)
  entrySpotPrice: number;
  targetSpotPrice: number; // Spot * 1.05
  gainUsdPerOz: number;
  entryThaiPrice: number;
  targetThaiPrice: number; // Thai * 1.05
  gainThaiPerBaht: number;
  paotangOrderNote: string;
  rules: string[];
}

export interface SpeculationPlan {
  signal: 'SUPER STRONG BUY (98%+)' | 'STRONG BUY' | 'BUY' | 'ACCUMULATE' | 'TAKE PROFIT' | 'WAIT';
  signalReason: string;
  timeframe: string;
  targetHoldDays: string;
  riskRewardRatio: number;
  winRateEstimate: string;
  confidenceScore: number; // 0 - 100 (%)
  factorBreakdown: FactorBreakdown;
  weeklyStrategy: WeeklyStrategyPlan;
  spotLevels: {
    current: number;
    entryRange: string;
    tp1: number;
    tp2: number;
    tp5PercentWeekly: number;
    stopLoss: number;
    expectedGainPercent: string;
  };
  thaiBahtLevels: {
    current: number;
    entryRange: string;
    tp1: number;
    tp2: number;
    tp5PercentWeekly: number;
    stopLoss: number;
    expectedGainPerBaht: string;
  };
  recommendedShop: string;
}

export interface MarketOverviewData {
  success: boolean;
  timestamp: string;
  dataSource?: string;
  rates: {
    xauUsd: number;
    usdThb: number;
    change24hUsd: number;
    change24hPercent: number;
  };
  thaiGold: ThaiGoldPrices;
  partners: {
    mts: PartnerQuote;
    ylg: PartnerQuote;
    aurora: PartnerQuote;
  };
  indicators: Indicators;
  speculationPlan: SpeculationPlan;
  candles: Candle[];
}

export interface PriceAlert {
  id: string;
  targetType: 'ABOVE' | 'BELOW';
  targetPrice: number;
  asset: 'XAU_USD' | 'THAI_GOLD_965';
  label: string;
  active: boolean;
  createdTime: string;
  triggered?: boolean;
}

export interface AiMarketAnalysis {
  sentiment: 'BULLISH' | 'BEARISH' | 'SIDEWAY_UP' | 'SIDEWAY_DOWN';
  macroSummary: string;
  weeklyOutlook: string;
  paotangStrategy: string;
  keyLevels: {
    support: string;
    resistance: string;
    stopLoss: string;
  };
  riskWarnings: string;
}

export interface AutoTradeAlertSettings {
  enabled: boolean;
  enableTelegramAlerts?: boolean;
  strict98PercentOnly: boolean; // Alert whenever Multi-Factor Confluence >= confluenceThreshold
  confluenceThreshold?: number; // Standard threshold % (default 98, adjustable e.g. 90/95/98)
  instantAnyDayAlert?: boolean; // Alert immediately on any day without waiting for Monday
  weeklyScheduleOnly?: boolean; // Legacy optional flag (defaults to false)
  notifyOnBuySignal: boolean;
  notifyOnTakeProfit: boolean;
  notifyOnRsiOversold: boolean;
  notifyOnGoldenHours: boolean;
  cooldownMinutes: number;
}

