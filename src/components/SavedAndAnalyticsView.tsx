import React, { useState } from 'react';
import { Bookmark, Award, Trash2, Calendar, Clock, CheckCircle2, ChevronRight, BarChart3, BookOpen, TrendingUp } from 'lucide-react';
import { Bookmark as BookmarkType, TestResultHistory } from '../types';
import { MathView } from './MathView';
import { toggleBookmark, formatSecondsToTime, seedSampleAttempts } from '../data/mockTestsService';
import { ScoreProgressChart } from './ScoreProgressChart';

interface SavedAndAnalyticsViewProps {
  bookmarks: BookmarkType[];
  attempts: TestResultHistory[];
  onRefreshBookmarks: () => void;
  onClearHistory: () => void;
}

export const SavedAndAnalyticsView: React.FC<SavedAndAnalyticsViewProps> = ({
  bookmarks,
  attempts,
  onRefreshBookmarks,
  onClearHistory,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [selectedSubjFilter, setSelectedSubjFilter] = useState<'all' | 'physics' | 'chemistry' | 'math'>('all');

  const filteredBookmarks = bookmarks.filter((b) => {
    if (selectedSubjFilter === 'all') return true;
    return b.question.sub.toLowerCase().includes(selectedSubjFilter);
  });

  // Calculate high-level performance stats
  const totalAttempts = attempts.length;
  const averageScore =
    totalAttempts > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.score, 0) / totalAttempts)
      : 0;
  const bestScore = totalAttempts > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
      {/* Top Switcher: Bookmarks vs Analytics */}
      <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
        <button
          onClick={() => setActiveSubTab('bookmarks')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'bookmarks'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Questions ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'history'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Test Analytics ({attempts.length})</span>
        </button>
      </div>

      {/* Bookmarks Section */}
      {activeSubTab === 'bookmarks' ? (
        <div className="space-y-3">
          {/* Subject Filter */}
          <div className="flex items-center gap-1 text-xs">
            {(['all', 'physics', 'chemistry', 'math'] as const).map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubjFilter(subj)}
                className={`flex-1 py-1.5 rounded-lg capitalize font-medium transition ${
                  selectedSubjFilter === subj
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Bookmarked Questions List */}
          {filteredBookmarks.length > 0 ? (
            <div className="space-y-3">
              {filteredBookmarks.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                    <div>
                      <span className="font-bold text-sky-400 font-mono">Q. {b.question.id}</span>
                      <span className="ml-2 text-slate-400">{b.testTitle}</span>
                    </div>

                    <button
                      onClick={() => {
                        toggleBookmark(b);
                        onRefreshBookmarks();
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-200">
                    <MathView content={b.question.q} />
                  </div>

                  {b.question.opts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs pt-1">
                      {b.question.opts.map((opt, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-300 flex items-start gap-2"
                        >
                          <span className="font-mono font-bold text-sky-400">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          <div className="flex-1">
                            <MathView content={opt} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800 p-6 space-y-2">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">No Bookmarked Questions</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                While taking CBT tests or reading question papers, tap the bookmark icon on any challenging question to save it here for rapid revision.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Analytics & History Section */
        <div className="space-y-4">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-lg font-bold text-white font-mono">{totalAttempts}</div>
              <div className="text-[10px] text-slate-400 uppercase">Tests Taken</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-lg font-bold text-sky-400 font-mono">{averageScore}</div>
              <div className="text-[10px] text-slate-400 uppercase">Avg Score</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-lg font-bold text-emerald-400 font-mono">{bestScore}</div>
              <div className="text-[10px] text-slate-400 uppercase">Best Score</div>
            </div>
          </div>

          {/* Recharts Score Progress Line Chart */}
          {attempts.length > 0 && (
            <ScoreProgressChart attempts={attempts} />
          )}

          {/* Past Attempts List */}
          {attempts.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Recent Exam Attempts</span>
                <button
                  onClick={onClearHistory}
                  className="text-rose-400 hover:text-rose-300 transition"
                >
                  Clear History
                </button>
              </div>

              {attempts.map((a) => {
                const dateStr = new Date(a.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const percentage = Math.max(0, Math.round((a.score / a.maxScore) * 100));

                return (
                  <div
                    key={a.id}
                    className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{dateStr}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatSecondsToTime(a.timeTakenSeconds)}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{a.testTitle}</h4>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-sky-400 font-mono">
                          {a.score} <span className="text-xs text-slate-400 font-normal">/ {a.maxScore}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400">{percentage}% accuracy</span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[11px]">
                      <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Physics</span>
                        <span className="font-bold text-sky-300">{a.subjectScores.physics} M</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Chemistry</span>
                        <span className="font-bold text-emerald-300">{a.subjectScores.chemistry} M</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Maths</span>
                        <span className="font-bold text-amber-300">{a.subjectScores.math} M</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800 p-6 space-y-3">
              <BarChart3 className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">No Test Attempts Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Complete any JEE Mock Test in the CBT Exam tab to view your score reports, subject performance, and time analytics.
              </p>
              <button
                id="btn-seed-sample-attempts"
                type="button"
                onClick={() => {
                  seedSampleAttempts();
                  onRefreshBookmarks();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/20 text-sky-300 border border-sky-500/30 text-xs font-semibold hover:bg-sky-600/30 transition shadow-sm"
              >
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Load Sample Progress Data</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
