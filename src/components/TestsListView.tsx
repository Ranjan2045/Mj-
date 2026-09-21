import React, { useState, useMemo } from 'react';
import {
  Play,
  FileText,
  ExternalLink,
  Award,
  Search,
  Sparkles,
  Clock,
  HelpCircle,
  BookOpen,
  X,
  Check,
  Tag,
  BookX,
} from 'lucide-react';
import { MockTest, TestResultHistory } from '../types';

interface TestsListViewProps {
  tests: MockTest[];
  attempts: TestResultHistory[];
  onStartTest: (test: MockTest) => void;
  onViewPaper: (test: MockTest) => void;
  onOpenBlogspot: (url?: string) => void;
  onOpenPyq?: () => void;
}

// Curated syllabus topics mapped per mock test
export const TEST_SYLLABUS_TOPICS: Record<string, string[]> = {
  'test-6': [
    'Calculus',
    'Conic Sections (Parabola, Hyperbola, Ellipse)',
    'Vectors & 3D Geometry',
    'Mechanics & Kinematics',
    'Electromagnetism',
    'Optics & Wave Motion',
    'Thermodynamics & Heat',
    'Inorganic Coordination Chemistry',
    'Physical Chemistry & Kinetics',
  ],
  'test-5': [
    'Calculus & Definite Integrals',
    'Coordinate Geometry',
    'Algebra & Complex Numbers',
    'Vectors & 3D Geometry',
    'Newtonian Mechanics & Dynamics',
    'Electrostatics & Magnetism',
    'Wave & Ray Optics',
    'Thermodynamics',
    'Modern Physics & Nuclear Chemistry',
    'Physical Equilibrium & Solutions',
  ],
  'test-4': [
    'Calculus & Differential Equations',
    'Conic Sections',
    'Matrices & Determinants',
    'Vectors & 3D Geometry',
    'Rotational Dynamics & Momentum',
    'Current Electricity & Capacitance',
    'Optics & Wave Optics',
    'Thermodynamics',
    'Organic Chemistry Mechanisms',
    'Coordination Compounds',
    'Chemical Kinetics',
  ],
  'test-3': [
    'Differential & Integral Calculus',
    'Coordinate Geometry',
    'Permutations & Probability',
    'Vectors & 3D',
    'Kinematics & Work-Energy',
    'Thermal Physics & Calorimetry',
    'Electrochemistry & Solutions',
    'Chemical Bonding & Periodic Table',
  ],
  'test-2': [
    'Functions & Limits',
    'Conic Sections',
    'Quadratic Equations & Series',
    'Vectors & 3D Lines/Planes',
    'Gravitation & Circular Motion',
    'Magnetic Effects of Current',
    'Periodic Table & P-Block',
    'Thermodynamics & Equilibrium',
  ],
  'test-1': [
    'Calculus & Tangents',
    'Coordinate Geometry',
    'Complex Numbers & Sequences',
    '3D Geometry & Vectors',
    'Laws of Motion & Friction',
    'Electromagnetism & AC',
    'Geometric Optics',
    'Modern Physics (Photoelectric Effect)',
    'Organic Functional Groups',
    'Atomic Structure & Bonding',
  ],
};

const POPULAR_SYLLABUS_CHIPS = [
  'All',
  'Calculus',
  'Conic Sections',
  'Coordinate Geometry',
  'Mechanics',
  'Electromagnetism',
  'Optics',
  'Thermodynamics',
  'Modern Physics',
  'Organic Chemistry',
  'Inorganic Chemistry',
  'Physical Chemistry',
  'Vectors & 3D',
  'Algebra',
];

export const TestsListView: React.FC<TestsListViewProps> = ({
  tests,
  attempts,
  onStartTest,
  onViewPaper,
  onOpenBlogspot,
  onOpenPyq,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Real-time filter by title, test number, syllabus topics, or question keywords
  const filteredTests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const hasTopicFilter = selectedTopic !== 'All';
    const topicTarget = selectedTopic.toLowerCase();

    return tests.filter((test) => {
      const topics = TEST_SYLLABUS_TOPICS[test.id] || test.syllabusTopics || [];

      // 1. Topic chip filter check
      if (hasTopicFilter) {
        const matchesChip = topics.some((t) => t.toLowerCase().includes(topicTarget));
        if (!matchesChip) return false;
      }

      // 2. Real-time text search query check
      if (!query) return true;

      // Check title
      if (test.title.toLowerCase().includes(query)) return true;

      // Check test number (e.g., "6", "mock 6", "test 6", "#6")
      const numStr = String(test.testNumber);
      if (
        query === numStr ||
        `test ${numStr}`.includes(query) ||
        `mock ${numStr}`.includes(query) ||
        `#${numStr}`.includes(query)
      ) {
        return true;
      }

      // Check syllabus topics
      const matchesSyllabus = topics.some((topic) => topic.toLowerCase().includes(query));
      if (matchesSyllabus) return true;

      // Check questions text & options
      if (test.questions && test.questions.length > 0) {
        const matchesQuestion = test.questions.some(
          (qn) =>
            qn.q.toLowerCase().includes(query) ||
            (qn.opts && qn.opts.some((opt) => opt.toLowerCase().includes(query)))
        );
        if (matchesQuestion) return true;
      }

      return false;
    });
  }, [tests, searchQuery, selectedTopic]);

  const getBestScore = (testId: string) => {
    const testAttempts = attempts.filter((a) => a.testId === testId);
    if (testAttempts.length === 0) return null;
    return Math.max(...testAttempts.map((a) => a.score));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedTopic('All');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {/* Hero Card with blog credit */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-900/60 via-slate-900 to-indigo-950/70 border border-sky-500/20 p-4 sm:p-5 shadow-lg">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-[11px] font-semibold text-sky-300">
            <Sparkles className="w-3 h-3 text-sky-400" />
            NTA JEE Main 2026 Format
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            MJ JEE Mock Test Series
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Full-syllabus practice mock question papers with Physics, Chemistry, and Mathematics from{' '}
            <span className="text-sky-300 font-semibold underline decoration-sky-500/40">
              ranjan2045r.blogspot.com
            </span>
            . Includes full NTA CBT exam simulator and solutions.
          </p>

          <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-2">
              <span className="block text-base font-bold text-sky-400">{tests.length}</span>
              <span className="text-[10px] text-slate-400">Full Tests</span>
            </div>
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-2">
              <span className="block text-base font-bold text-emerald-400">449</span>
              <span className="text-[10px] text-slate-400">Questions</span>
            </div>
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-2">
              <span className="block text-base font-bold text-amber-400">300</span>
              <span className="text-[10px] text-slate-400">Marks Each</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter-wise PYQs Quick Access Card */}
      {onOpenPyq && (
        <div
          id="pyq-banner-card"
          className="rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 p-3.5 flex items-center justify-between gap-3 shadow-md hover:border-sky-500/50 transition cursor-pointer"
          onClick={onOpenPyq}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  Chapter-wise JEE PYQ Bank
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  NEW
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Physics, Chemistry & Math arranged by chapter with website sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPyq();
            }}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition"
          >
            Practice PYQs
          </button>
        </div>
      )}

      {/* Real-Time Search Bar Section */}
      <div className="space-y-2.5">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400 pointer-events-none" />
          <input
            id="mock-test-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mock tests by title or syllabus topic (e.g. Calculus, Conics, Optics)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-inner"
            spellCheck={false}
          />
          {searchQuery && (
            <button
              id="clear-search-query-btn"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Syllabus Topic Filter Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Tag className="w-3 h-3 text-sky-400" /> Syllabus Topics:
            </span>
            {(searchQuery || selectedTopic !== 'All') && (
              <button
                id="reset-all-filters-btn"
                onClick={handleClearSearch}
                className="text-sky-400 hover:text-sky-300 font-semibold transition"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {POPULAR_SYLLABUS_CHIPS.map((chip) => {
              const isActive = selectedTopic === chip;
              return (
                <button
                  key={chip}
                  id={`topic-chip-${chip.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => {
                    if (isActive && chip !== 'All') {
                      setSelectedTopic('All');
                    } else {
                      setSelectedTopic(chip);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition flex items-center gap-1 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-900/40 border border-sky-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  {isActive && chip !== 'All' && <Check className="w-3 h-3 stroke-[3]" />}
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Test List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Available Mock Tests ({filteredTests.length})
          </h3>
          {(searchQuery || selectedTopic !== 'All') ? (
            <span className="text-[11px] text-sky-400 font-medium">
              {filteredTests.length} of {tests.length} tests matching
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Offline Ready</span>
          )}
        </div>

        {filteredTests.length === 0 ? (
          /* Empty Search Results State */
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 text-center space-y-3 shadow-inner">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
              <BookX className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">No Mock Tests Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                No mock tests match {searchQuery ? `"${searchQuery}"` : ''}{' '}
                {selectedTopic !== 'All' ? `under topic "${selectedTopic}"` : ''}.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-1.5">
              <button
                id="empty-clear-filter-btn"
                onClick={handleClearSearch}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-900/30"
              >
                Clear Search & Show All Tests
              </button>
            </div>
          </div>
        ) : (
          filteredTests.map((test) => {
            const bestScore = getBestScore(test.id);
            const topics = TEST_SYLLABUS_TOPICS[test.id] || test.syllabusTopics || [];
            const query = searchQuery.trim().toLowerCase();

            return (
              <div
                key={test.id}
                id={`mock-test-card-${test.id}`}
                className="rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 p-4 transition shadow-md hover:shadow-sky-950/20 space-y-3"
              >
                {/* Test Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-sky-600/20 text-sky-400 font-bold text-[11px] border border-sky-500/30">
                        Mock #{test.testNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">Full Syllabus</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1 leading-snug">{test.title}</h4>
                  </div>

                  {bestScore !== null && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                      <Award className="w-3.5 h-3.5" />
                      <span>Best: {bestScore}/300</span>
                    </div>
                  )}
                </div>

                {/* Badges / Specs */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    <HelpCircle className="w-3 h-3 text-sky-400" />
                    {test.totalQuestions || 75} Questions
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    <Clock className="w-3 h-3 text-amber-400" />
                    180 Mins
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    +4 / −1 Marking
                  </span>
                </div>

                {/* Subject Breakdown Badges */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center font-medium">
                  <div className="p-1 rounded bg-blue-950/40 border border-blue-900/40 text-blue-300">
                    Physics (25)
                  </div>
                  <div className="p-1 rounded bg-emerald-950/40 border border-emerald-900/40 text-emerald-300">
                    Chemistry (25)
                  </div>
                  <div className="p-1 rounded bg-purple-950/40 border border-purple-900/40 text-purple-300">
                    Maths (25)
                  </div>
                </div>

                {/* Syllabus Topics Tag Cloud */}
                {topics.length > 0 && (
                  <div className="pt-0.5 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Syllabus Topics Covered:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {topics.map((t, idx) => {
                        const isMatched =
                          Boolean(query) && t.toLowerCase().includes(query);
                        const isChipMatched =
                          selectedTopic !== 'All' &&
                          t.toLowerCase().includes(selectedTopic.toLowerCase());

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedTopic(t.split('(')[0].split('&')[0].trim());
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded-md border transition text-left ${
                              isMatched || isChipMatched
                                ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-semibold'
                                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    id={`start-cbt-exam-btn-${test.id}`}
                    onClick={() => onStartTest(test)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-900/30 transition transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start CBT Exam
                  </button>

                  <button
                    id={`view-question-paper-btn-${test.id}`}
                    onClick={() => onViewPaper(test)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Question Paper
                  </button>
                </div>

                {/* Footer link to original blog post */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>Direct Blog Source:</span>
                  <button
                    id={`open-blog-source-btn-${test.id}`}
                    onClick={() => onOpenBlogspot(test.url)}
                    className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 text-[11px] transition"
                  >
                    <span>ranjan2045r.blogspot.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

