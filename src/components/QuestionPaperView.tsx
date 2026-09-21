import React, { useState } from 'react';
import { Printer, Eye, EyeOff, Bookmark, BookmarkCheck, Search, Filter, BookOpen } from 'lucide-react';
import { MockTest, Question, Subject } from '../types';
import { MathView } from './MathView';
import { toggleBookmark, isQuestionBookmarked } from '../data/mockTestsService';

interface QuestionPaperViewProps {
  tests: MockTest[];
  selectedTest: MockTest;
  onSelectTest: (test: MockTest) => void;
  onBookmarkChanged?: () => void;
}

export const QuestionPaperView: React.FC<QuestionPaperViewProps> = ({
  tests,
  selectedTest,
  onSelectTest,
  onBookmarkChanged,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<'all' | Subject>('all');
  const [showAnswerKeys, setShowAnswerKeys] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const questions = selectedTest.questions;

  const filteredQuestions = questions.filter((q) => {
    const matchesSubj =
      selectedSubject === 'all' || q.sub.toLowerCase().includes(selectedSubject);
    const matchesSearch =
      searchQuery === '' ||
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `q ${q.id}`.includes(searchQuery.toLowerCase());
    return matchesSubj && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
      {/* Top Header & Test Switcher */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Question Paper Booklet
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
              {selectedTest.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAnswerKeys(!showAnswerKeys)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                showAnswerKeys
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Toggle Answer Keys"
            >
              {showAnswerKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showAnswerKeys ? 'Hide Keys' : 'Show Keys'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Print Question Paper"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Test Selector Dropdown/Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px] flex-shrink-0">Switch:</span>
          {tests.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTest(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 transition ${
                t.id === selectedTest.id
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              Mock #{t.testNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search within question paper..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1 text-xs">
          {(['all', 'physics', 'chemistry', 'math'] as const).map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`flex-1 py-1.5 rounded-lg capitalize font-medium transition text-center ${
                selectedSubject === subj
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isBookmarked = isQuestionBookmarked(selectedTest.id, q.id);
          const answerKey = selectedTest.answerKey?.[q.id];

          return (
            <div
              key={q.id}
              className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 shadow-sm hover:border-slate-700 transition"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sky-400 font-mono">Q. {q.id}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase text-[10px] font-semibold">
                    {q.sub}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {q.sec === 'scq' ? 'MCQ (+4, -1)' : 'Numerical (+4, -1)'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    toggleBookmark({
                      id: `${selectedTest.id}-${q.id}`,
                      testId: selectedTest.id,
                      testTitle: selectedTest.title,
                      question: q,
                      addedAt: Date.now(),
                    });
                    if (onBookmarkChanged) onBookmarkChanged();
                  }}
                  className="p-1 rounded text-slate-400 hover:text-amber-400 transition"
                  title={isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Question Statement */}
              <div className="text-xs sm:text-sm text-slate-200">
                <MathView content={q.q} diagramSvg={selectedTest.diagrams?.[q.id]} />
              </div>

              {/* Options */}
              {q.opts && q.opts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {q.opts.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const optNum = i + 1;
                    const isKey = showAnswerKeys && answerKey !== undefined && Number(answerKey) === optNum;

                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                          isKey
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200 font-semibold'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <span className="font-mono font-bold text-sky-400">{letter}.</span>
                        <div className="flex-1">
                          <MathView content={opt} />
                        </div>
                        {isKey && <span className="text-[10px] text-emerald-400 font-bold">✓ Answer Key</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Answer Key disclosure for NAT */}
              {showAnswerKeys && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs flex items-center justify-between text-emerald-300">
                  <span>Official Answer Key:</span>
                  <span className="font-mono font-bold text-sm">
                    {answerKey !== undefined ? answerKey : 'Pending verification'}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            No questions match the filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
