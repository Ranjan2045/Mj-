import React, { useState, useMemo, useEffect } from 'react';
import {
  Subject,
  PYQQuestion,
  PYQChapter,
  Bookmark as BookmarkType,
} from '../types';
import {
  getChapterWisePYQs,
  syncPYQsFromWebsite,
  getLastPYQSyncTime,
  getPYQProgress,
  savePYQAnswer,
  getSubjectStats,
} from '../data/pyqService';
import { MathView } from './MathView';
import { toggleBookmark, isQuestionBookmarked } from '../data/mockTestsService';
import {
  Atom,
  FlaskConical,
  Compass,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Filter,
  Layers,
  Award,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface PyqChapterWiseViewProps {
  onRefreshBookmarks: () => void;
  onOpenBlogspot?: () => void;
}

export const PyqChapterWiseView: React.FC<PyqChapterWiseViewProps> = ({
  onRefreshBookmarks,
  onOpenBlogspot,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>('physics');
  const [expandedChapterIds, setExpandedChapterIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'scq' | 'nat'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(() => getLastPYQSyncTime());
  const [progress, setProgress] = useState(() => getPYQProgress());
  const [showSolutionMap, setShowSolutionMap] = useState<Record<string, boolean>>({});
  const [natInputs, setNatInputs] = useState<Record<string, string>>({});

  // Fetch chapters for the current subject
  const chapters = useMemo(() => {
    return getChapterWisePYQs(selectedSubject);
  }, [selectedSubject]);

  // Expand first chapter by default when subject changes
  useEffect(() => {
    if (chapters.length > 0) {
      setExpandedChapterIds({ [chapters[0].id]: true });
    }
  }, [selectedSubject, chapters]);

  // Subject statistics
  const stats = useMemo(() => {
    return getSubjectStats(selectedSubject);
  }, [selectedSubject, progress]);

  // Handle Blogspot PYQ sync
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const result = await syncPYQsFromWebsite();
    setIsSyncing(false);
    setSyncFeedback(result.message);
    setLastSyncTime(result.lastSyncTime);
    setTimeout(() => {
      setSyncFeedback(null);
    }, 7000);
  };

  // Toggle chapter accordion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapterIds((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Toggle all chapters
  const toggleAllChapters = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    chapters.forEach((c) => {
      next[c.id] = expand;
    });
    setExpandedChapterIds(next);
  };

  // Answer SCQ question
  const handleOptionSelect = (q: PYQQuestion, optionIndex: number) => {
    const isCorrect = Number(q.ans) === optionIndex;
    savePYQAnswer(q.id, optionIndex, isCorrect);
    setProgress(getPYQProgress());
  };

  // Answer NAT question
  const handleNatSubmit = (q: PYQQuestion) => {
    const inputVal = natInputs[q.id]?.trim();
    if (!inputVal) return;

    const parsedInput = parseFloat(inputVal);
    const parsedAns = parseFloat(String(q.ans));

    // Allow tolerance for floating rounding
    const isCorrect = !isNaN(parsedInput) && !isNaN(parsedAns) && Math.abs(parsedInput - parsedAns) <= 0.05;

    savePYQAnswer(q.id, inputVal, isCorrect);
    setProgress(getPYQProgress());
  };

  // Bookmark toggle
  const handleBookmarkToggle = (q: PYQQuestion) => {
    const numericId = parseInt(q.id.replace(/\D/g, '').slice(-5) || '1', 10);
    const bookmarkObj: BookmarkType = {
      id: `bm_pyq_${q.id}`,
      testId: `pyq_${q.chapterId}`,
      testTitle: `${q.chapterName} (PYQ)`,
      question: {
        id: numericId,
        sub: q.sub,
        sec: q.sec,
        q: q.q,
        opts: q.opts,
        num: q.sec === 'nat' ? q.ans : undefined,
      },
      addedAt: Date.now(),
      notes: `${q.year} — ${q.chapterName}`,
    };
    toggleBookmark(bookmarkObj);
    onRefreshBookmarks();
  };

  const subjectTheme = {
    physics: {
      accent: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      activeTab: 'bg-sky-600 text-white shadow-md shadow-sky-600/30',
      pill: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
      bar: 'bg-sky-500',
      icon: Atom,
      title: 'Physics',
    },
    chemistry: {
      accent: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      activeTab: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
      pill: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      bar: 'bg-emerald-500',
      icon: FlaskConical,
      title: 'Chemistry',
    },
    math: {
      accent: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      activeTab: 'bg-amber-600 text-white shadow-md shadow-amber-600/30',
      pill: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      bar: 'bg-amber-500',
      icon: Compass,
      title: 'Mathematics',
    },
  }[selectedSubject];

  const CurrentSubjectIcon = subjectTheme.icon;

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 pb-20 bg-slate-950">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-4 shadow-xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl ${subjectTheme.bg} ${subjectTheme.border} border flex items-center justify-center ${subjectTheme.accent} flex-shrink-0 shadow-inner`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Chapter-wise JEE PYQs
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  2024–2020
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Arranged by official NTA JEE Main chapters with step-by-step solutions
              </p>
            </div>
          </div>

          {/* Sync from Website Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="btn-sync-pyqs"
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync from Website'}</span>
            </button>
            {onOpenBlogspot && (
              <button
                type="button"
                onClick={onOpenBlogspot}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                title="Visit ranjan2045r.blogspot.com"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Sync Feedback Alert */}
        {syncFeedback && (
          <div className="rounded-xl bg-sky-950/70 border border-sky-700/50 p-2.5 text-xs text-sky-200 flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="leading-snug">{syncFeedback}</span>
          </div>
        )}

        {/* Subject Switcher Tabs */}
        <div id="pyq-subject-selector" className="grid grid-cols-3 gap-2 pt-1">
          <button
            id="tab-subject-physics"
            type="button"
            onClick={() => setSelectedSubject('physics')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              selectedSubject === 'physics'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 border border-sky-400/40'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Atom className="w-4 h-4" />
            <span>Physics</span>
          </button>

          <button
            id="tab-subject-chemistry"
            type="button"
            onClick={() => setSelectedSubject('chemistry')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              selectedSubject === 'chemistry'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Chemistry</span>
          </button>

          <button
            id="tab-subject-math"
            type="button"
            onClick={() => setSelectedSubject('math')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              selectedSubject === 'math'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 border border-amber-400/40'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Mathematics</span>
          </button>
        </div>

        {/* Subject Stats Strip */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">Chapters</span>
            <span className="text-sm font-bold font-mono text-white">{stats.chaptersCount}</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">Total PYQs</span>
            <span className="text-sm font-bold font-mono text-sky-400">{stats.totalQuestions}</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">Practiced</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{stats.answeredCount}</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">Accuracy</span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {stats.answeredCount > 0
                ? `${Math.round((stats.correctCount / stats.answeredCount) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-pyq-search"
              type="text"
              placeholder={`Search ${subjectTheme.title} PYQs (e.g. projectile, integration)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggleAllChapters(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 transition"
              title="Expand all chapters"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={() => toggleAllChapters(false)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 transition"
              title="Collapse all chapters"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Type:
          </span>
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition flex-shrink-0 ${
              selectedType === 'all'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('scq')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition flex-shrink-0 ${
              selectedType === 'scq'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Single Choice (SCQ)
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('nat')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition flex-shrink-0 ${
              selectedType === 'nat'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Numerical (NAT)
          </button>

          <span className="text-[11px] text-slate-400 flex items-center gap-1 flex-shrink-0 ml-2 mr-1">
            Diff:
          </span>
          {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition flex-shrink-0 ${
                selectedDifficulty === diff
                  ? 'bg-slate-200 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {diff === 'all' ? 'All' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters Accordion List */}
      <div className="space-y-3">
        {chapters.map((chapter, chIdx) => {
          // Filter questions within chapter
          const filteredQuestions = chapter.questions.filter((q) => {
            if (selectedType !== 'all' && q.sec !== selectedType) return false;
            if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
            if (searchQuery.trim()) {
              const query = searchQuery.toLowerCase();
              const inQ = q.q.toLowerCase().includes(query);
              const inOpts = q.opts?.some((o) => o.toLowerCase().includes(query));
              const inYear = q.year.toLowerCase().includes(query);
              if (!inQ && !inOpts && !inYear) return false;
            }
            return true;
          });

          // Chapter progress stats
          const answeredInChapter = chapter.questions.filter((q) => progress[q.id]).length;
          const isExpanded = !!expandedChapterIds[chapter.id];

          return (
            <div
              key={chapter.id}
              id={`chapter-${chapter.id}`}
              className="rounded-2xl bg-slate-900/90 border border-slate-800/90 overflow-hidden shadow-md transition-all"
            >
              {/* Chapter Header Button */}
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700/80 text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center flex-shrink-0">
                    {chIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                      {chapter.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{chapter.questions.length} Questions</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">
                        {answeredInChapter}/{chapter.questions.length} Solved
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {answeredInChapter > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono hidden sm:inline-block">
                      {Math.round((answeredInChapter / chapter.questions.length) * 100)}%
                    </span>
                  )}
                  <div className="w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Chapter Questions */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 p-3 sm:p-4 space-y-4 bg-slate-950/50">
                  {chapter.description && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                      Topics covered: {chapter.description}
                    </p>
                  )}

                  {filteredQuestions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No questions match the current filter or search query.
                    </div>
                  ) : (
                    filteredQuestions.map((q, qIndex) => {
                      const userAns = progress[q.id];
                      const isAnswered = !!userAns;
                      const isCorrect = userAns?.isCorrect;
                      const numericId = parseInt(q.id.replace(/\D/g, '').slice(-5) || '1', 10);
                      const isBookmarked = isQuestionBookmarked(`pyq_${q.chapterId}`, numericId);
                      const isSolutionOpen = !!showSolutionMap[q.id];

                      return (
                        <div
                          key={q.id}
                          id={`pyq-card-${q.id}`}
                          className={`rounded-xl border p-3.5 sm:p-4 space-y-3 transition-all ${
                            isAnswered
                              ? isCorrect
                                ? 'bg-emerald-950/20 border-emerald-800/40'
                                : 'bg-rose-950/20 border-rose-800/40'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80'
                          }`}
                        >
                          {/* Question Meta Strip */}
                          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                                Q{qIndex + 1}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                                {q.year}
                              </span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {q.sec === 'scq' ? 'Single Choice' : 'Numerical (NAT)'}
                              </span>
                              {q.difficulty && (
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    q.difficulty === 'Easy'
                                      ? 'bg-emerald-500/10 text-emerald-400'
                                      : q.difficulty === 'Hard'
                                      ? 'bg-rose-500/10 text-rose-400'
                                      : 'bg-amber-500/10 text-amber-400'
                                  }`}
                                >
                                  {q.difficulty}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Bookmark Button */}
                              <button
                                type="button"
                                onClick={() => handleBookmarkToggle(q)}
                                className={`p-1.5 rounded-lg border transition ${
                                  isBookmarked
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                                title={isBookmarked ? 'Bookmarked' : 'Save Question'}
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Question Statement */}
                          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                            <MathView content={q.q} />
                          </div>

                          {/* Options / NAT Input */}
                          {q.sec === 'scq' && q.opts && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.opts.map((opt, optIdx) => {
                                const optLetter = String.fromCharCode(65 + optIdx);
                                const isSelected = userAns?.selectedAnswer === optIdx;
                                const isThisCorrect = Number(q.ans) === optIdx;

                                let optStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700';

                                if (isAnswered) {
                                  if (isThisCorrect) {
                                    optStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-semibold';
                                  } else if (isSelected && !isThisCorrect) {
                                    optStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
                                  } else {
                                    optStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-60';
                                  }
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleOptionSelect(q, optIdx)}
                                    className={`p-2.5 rounded-xl border text-left text-xs flex items-start gap-2.5 transition-all ${optStyle}`}
                                  >
                                    <span
                                      className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                                        isAnswered && isThisCorrect
                                          ? 'bg-emerald-500 text-slate-950'
                                          : isAnswered && isSelected && !isThisCorrect
                                          ? 'bg-rose-500 text-white'
                                          : 'bg-slate-800 text-slate-300'
                                      }`}
                                    >
                                      {optLetter}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <MathView content={opt} />
                                    </div>
                                    {isAnswered && isThisCorrect && (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    {isAnswered && isSelected && !isThisCorrect && (
                                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {q.sec === 'nat' && (
                            <div className="pt-1 space-y-2">
                              <div className="flex items-center gap-2 max-w-sm">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Enter numerical value..."
                                  value={natInputs[q.id] ?? (userAns ? String(userAns.selectedAnswer) : '')}
                                  onChange={(e) =>
                                    setNatInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                                  }
                                  disabled={isAnswered}
                                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleNatSubmit(q)}
                                  disabled={isAnswered}
                                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                                >
                                  Submit
                                </button>
                              </div>

                              {isAnswered && (
                                <div
                                  className={`p-2 rounded-lg text-xs font-mono flex items-center gap-2 ${
                                    isCorrect
                                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                                      : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-400" />
                                  )}
                                  <span>
                                    Correct Value:{' '}
                                    <strong className="text-white font-bold">{String(q.ans)}</strong>
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Solution Accordion Toggle */}
                          <div className="pt-1 flex items-center justify-between border-t border-slate-800/60 text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                setShowSolutionMap((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                              }
                              className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold py-1 transition"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>{isSolutionOpen ? 'Hide Solution' : 'Show Step-by-Step Solution'}</span>
                            </button>

                            <span className="text-[10px] text-slate-500">
                              Source: {q.source}
                            </span>
                          </div>

                          {/* Solution Body */}
                          {isSolutionOpen && (
                            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800/80 space-y-2 text-xs animate-fadeIn">
                              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                                <Award className="w-3.5 h-3.5" />
                                <span>Explanation & Conceptual Steps:</span>
                              </div>
                              <div className="text-slate-300 leading-relaxed font-sans">
                                <MathView content={q.explanation || 'Refer to standard JEE syllabus formulas for this chapter.'} />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
