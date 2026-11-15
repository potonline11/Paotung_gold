import React, { useState } from 'react';
import { Candle, Indicators } from '../types/gold';
import { BarChart3, TrendingUp, Layers, RefreshCw } from 'lucide-react';

interface Props {
  candles: Candle[];
  indicators: Indicators;
  currentSpot: number;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const CandlestickChart: React.FC<Props> = ({
  candles,
  indicators,
  currentSpot,
  onRefresh,
  isLoading,
}) => {
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [timeframe, setTimeframe] = useState<'15M' | '1H' | '4H' | '1D'>('4H');
  const [showEMA, setShowEMA] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showPivots, setShowPivots] = useState(true);

  if (!candles || candles.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400 text-sm">
        กำลังโหลดข้อมูลกราฟราคา...
      </div>
    );
  }

  // Dimensions
  const width = 860;
  const height = 340;
  const padding = { top: 20, right: 65, bottom: 35, left: 15 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Min and Max prices for scale
  const allLows = candles.map((c) => c.low);
  const allHighs = candles.map((c) => c.high);
  if (showBollinger) {
    allHighs.push(indicators.bollinger.upper);
    allLows.push(indicators.bollinger.lower);
  }
  if (showPivots) {
    allHighs.push(indicators.pivotPoints.r1);
    allLows.push(indicators.pivotPoints.s1);
  }

  const minPrice = Math.min(...allLows) - 3;
  const maxPrice = Math.max(...allHighs) + 3;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  const candleWidth = Math.max(4, chartWidth / candles.length - 4);

  // Price grid lines
  const gridSteps = 5;
  const gridPrices = Array.from({ length: gridSteps + 1 }, (_, i) => {
    return minPrice + (priceRange / gridSteps) * i;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-200">XAU/USD Spot Gold</span>
            <span className="text-xs text-slate-400 font-mono-numbers">${currentSpot.toFixed(2)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['15M', '1H', '4H', '1D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  timeframe === tf
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              showEMA
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            EMA (20/50)
          </button>
          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              showBollinger
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            Bollinger
          </button>
          <button
            onClick={() => setShowPivots(!showPivots)}
            className={`px-2.5 py-1 rounded-md border transition-all ${
              showPivots
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            แนวรับ/ต้าน
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="รีเฟรชข้อมูลราคา"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Hover Info Kicker */}
      <div className="h-6 flex items-center justify-between text-xs text-slate-400 mb-2 font-mono-numbers">
        {hoveredCandle ? (
          <div className="flex flex-wrap items-center gap-3">
            <span>
              O: <strong className="text-slate-200">${hoveredCandle.open.toFixed(2)}</strong>
            </span>
            <span>
              H: <strong className="text-slate-200">${hoveredCandle.high.toFixed(2)}</strong>
            </span>
            <span>
              L: <strong className="text-slate-200">${hoveredCandle.low.toFixed(2)}</strong>
            </span>
            <span>
              C:{' '}
              <strong
                className={
                  hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-400' : 'text-rose-400'
                }
              >
                ${hoveredCandle.close.toFixed(2)}
              </strong>
            </span>
            <span>
              Vol: <strong className="text-slate-300">{hoveredCandle.volume.toLocaleString()}</strong>
            </span>
          </div>
        ) : (
          <div className="text-slate-400 flex items-center gap-2">
            <span>เลื่อนเมาส์บนแท่งเทียนเพื่อดูรายละเอียดราคา OHLCV</span>
            <span className="text-slate-400">·</span>
            <span>สเปรดตลาดเป๋าตังเฉลี่ย ~0.40$ (MTS) / ~0.50$ (YLG)</span>
          </div>
        )}
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines & Price Labels */}
          {gridPrices.map((price, idx) => {
            const y = getY(price);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
                <text
                  x={width - padding.right + 8}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  ${price.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Support / Resistance Pivot Lines */}
          {showPivots && (
            <>
              {/* Resistance R1 */}
              <g>
                <line
                  x1={padding.left}
                  y1={getY(indicators.pivotPoints.r1)}
                  x2={width - padding.right}
                  y2={getY(indicators.pivotPoints.r1)}
                  stroke="#f43f5e"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={width - padding.right + 8}
                  y={getY(indicators.pivotPoints.r1) - 3}
                  fill="#f43f5e"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  R1: ${indicators.pivotPoints.r1.toFixed(1)}
                </text>
              </g>

              {/* Support S1 */}
              <g>
                <line
                  x1={padding.left}
                  y1={getY(indicators.pivotPoints.s1)}
                  x2={width - padding.right}
                  y2={getY(indicators.pivotPoints.s1)}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={width - padding.right + 8}
                  y={getY(indicators.pivotPoints.s1) + 10}
                  fill="#10b981"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  S1: ${indicators.pivotPoints.s1.toFixed(1)}
                </text>
              </g>
            </>
          )}

          {/* Current Live Price Line */}
          <line
            x1={padding.left}
            y1={getY(currentSpot)}
            x2={width - padding.right}
            y2={getY(currentSpot)}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />

          {/* Candlesticks */}
          {candles.map((c, i) => {
            const x = padding.left + i * (chartWidth / candles.length) + (chartWidth / candles.length - candleWidth) / 2;
            const isBullish = c.close >= c.open;
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const topBody = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));
            const color = isBullish ? '#10b981' : '#f43f5e';
            const centerX = x + candleWidth / 2;

            return (
              <g
                key={i}
                className="cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={() => setHoveredCandle(c)}
              >
                {/* Wick High to Low */}
                <line
                  x1={centerX}
                  y1={highY}
                  x2={centerX}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1"
                />
                {/* Candle Body */}
                <rect
                  x={x}
                  y={topBody}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isBullish ? '#10b981' : '#f43f5e'}
                  rx="1"
                />
              </g>
            );
          })}

          {/* EMA 20 Line Overlay */}
          {showEMA && (
            <path
              d={candles
                .map((c, i) => {
                  const x = padding.left + i * (chartWidth / candles.length) + candleWidth / 2;
                  // Approximate smooth EMA 20
                  const y = getY(indicators.ema.ema20 + (c.close - indicators.ema.ema20) * 0.4);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.8"
            />
          )}

          {/* EMA 50 Line Overlay */}
          {showEMA && (
            <path
              d={candles
                .map((c, i) => {
                  const x = padding.left + i * (chartWidth / candles.length) + candleWidth / 2;
                  const y = getY(indicators.ema.ema50 + (c.close - indicators.ema.ema50) * 0.2);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#818cf8"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.7"
            />
          )}

          {/* Time axis labels */}
          {candles
            .filter((_, i) => i % Math.ceil(candles.length / 5) === 0)
            .map((c, i) => {
              const candleIdx = candles.indexOf(c);
              const x = padding.left + candleIdx * (chartWidth / candles.length);
              const dateStr = new Date(c.time).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 10}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {dateStr}
                </text>
              );
            })}
        </svg>
      </div>

      {/* Legend & Quick Indicator Values */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-400"></span>
            <span>EMA(20): <span className="font-mono-numbers text-slate-200">${indicators.ema.ema20}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-indigo-400"></span>
            <span>EMA(50): <span className="font-mono-numbers text-slate-200">${indicators.ema.ema50}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400"></span>
            <span>แนวรับ S1: <span className="font-mono-numbers text-emerald-400">${indicators.pivotPoints.s1}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-400"></span>
            <span>แนวต้าน R1: <span className="font-mono-numbers text-rose-400">${indicators.pivotPoints.r1}</span></span>
          </div>
        </div>

        <div className="text-slate-400">
          อัปเดตอัตโนมัติทุก 5 วินาที
        </div>
      </div>
    </div>
  );
};
