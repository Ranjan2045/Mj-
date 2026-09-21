import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Layers, Award } from 'lucide-react';
import { TestResultHistory } from '../types';

interface ScoreProgressChartProps {
  attempts: TestResultHistory[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        id="chart-tooltip"
        className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 z-50 min-w-[190px]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
          <span className="font-bold text-white font-mono">Attempt #{data.attemptNumber}</span>
          <span className="text-[10px] text-slate-400">{data.date}</span>
        </div>
        <div className="text-[11px] font-medium text-slate-300 truncate max-w-[210px]" title={data.testTitle}>
          {data.testTitle}
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
          <span className="text-slate-400">Total Score:</span>
          <span className="font-bold font-mono text-sky-400 text-sm">
            {data.score} <span className="text-[10px] text-slate-500 font-normal">/ {data.maxScore}</span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[10px] pt-1">
          <div className="bg-sky-950/50 border border-sky-800/50 rounded p-1 text-center">
            <span className="text-slate-400 block text-[9px]">Physics</span>
            <span className="font-bold text-sky-300">{data.physics}</span>
          </div>
          <div className="bg-emerald-950/50 border border-emerald-800/50 rounded p-1 text-center">
            <span className="text-slate-400 block text-[9px]">Chemistry</span>
            <span className="font-bold text-emerald-300">{data.chemistry}</span>
          </div>
          <div className="bg-amber-950/50 border border-amber-800/50 rounded p-1 text-center">
            <span className="text-slate-400 block text-[9px]">Maths</span>
            <span className="font-bold text-amber-300">{data.math}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ScoreProgressChart: React.FC<ScoreProgressChartProps> = ({ attempts }) => {
  const [chartMode, setChartMode] = useState<'total' | 'subjects'>('total');

  const chartData = useMemo(() => {
    const sorted = [...attempts].sort((a, b) => a.date - b.date);
    return sorted.map((att, idx) => {
      const dateObj = new Date(att.date);
      const dateLabel = dateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      return {
        attemptNumber: idx + 1,
        label: `#${idx + 1}`,
        date: dateLabel,
        testTitle: att.testTitle,
        score: att.score,
        maxScore: att.maxScore || 300,
        physics: att.subjectScores?.physics ?? 0,
        chemistry: att.subjectScores?.chemistry ?? 0,
        math: att.subjectScores?.math ?? 0,
      };
    });
  }, [attempts]);

  if (attempts.length === 0) {
    return null;
  }

  // Calculate score difference between first and latest attempt
  const firstScore = chartData[0]?.score ?? 0;
  const latestScore = chartData[chartData.length - 1]?.score ?? 0;
  const scoreDiff = latestScore - firstScore;

  return (
    <div
      id="score-progress-chart-card"
      className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-4 space-y-3.5 shadow-lg"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Score Progress Trajectory</span>
              {chartData.length > 1 && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                    scoreDiff >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {scoreDiff >= 0 ? `+${scoreDiff} pts` : `${scoreDiff} pts`}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Visualizing performance across {chartData.length}{' '}
              {chartData.length === 1 ? 'exam attempt' : 'chronological attempts'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle Button */}
        <div
          id="chart-mode-toggle"
          className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto text-xs"
        >
          <button
            id="btn-chart-mode-total"
            type="button"
            onClick={() => setChartMode('total')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              chartMode === 'total'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Total Score
          </button>
          <button
            id="btn-chart-mode-subjects"
            type="button"
            onClick={() => setChartMode('subjects')}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
              chartMode === 'subjects'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Subjects</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div id="recharts-line-container" className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
          >
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.35} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#475569' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#475569' }}
              domain={chartMode === 'total' ? [0, 300] : [0, 100]}
              ticks={
                chartMode === 'total'
                  ? [0, 60, 120, 180, 240, 300]
                  : [0, 20, 40, 60, 80, 100]
              }
            />
            <Tooltip content={<CustomTooltip />} />
            {chartMode === 'subjects' && (
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
                iconType="circle"
              />
            )}

            {chartMode === 'total' ? (
              <>
                {/* 180 score reference line for JEE 99th percentile target benchmark */}
                <ReferenceLine
                  y={180}
                  stroke="#38bdf8"
                  strokeDasharray="4 4"
                  opacity={0.4}
                  label={{
                    value: '99%ile Target (180)',
                    fill: '#38bdf8',
                    fontSize: 9,
                    position: 'insideTopLeft',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Total Score"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{
                    fill: '#0284c7',
                    stroke: '#38bdf8',
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: '#38bdf8',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                    r: 6,
                  }}
                />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="physics"
                  name="Physics"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{
                    fill: '#2563eb',
                    stroke: '#60a5fa',
                    strokeWidth: 2,
                    r: 3.5,
                  }}
                  activeDot={{
                    fill: '#60a5fa',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                    r: 5,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="chemistry"
                  name="Chemistry"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{
                    fill: '#059669',
                    stroke: '#34d399',
                    strokeWidth: 2,
                    r: 3.5,
                  }}
                  activeDot={{
                    fill: '#34d399',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                    r: 5,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="math"
                  name="Mathematics"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={{
                    fill: '#d97706',
                    stroke: '#fbbf24',
                    strokeWidth: 2,
                    r: 3.5,
                  }}
                  activeDot={{
                    fill: '#fbbf24',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                    r: 5,
                  }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info / Trend Note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {chartMode === 'total'
              ? `Target: 180+ marks for 99+ Percentile`
              : `Each subject is scored out of 100 marks`}
          </span>
        </div>
        <span className="font-mono text-slate-500">
          Latest: <strong className="text-white">{latestScore}</strong>/300
        </span>
      </div>
    </div>
  );
};
