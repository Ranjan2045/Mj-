import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Grid,
  X,
  Award,
  HelpCircle,
  Check,
  TrendingUp,
} from 'lucide-react';
import { MockTest, Question, Subject, TestResultHistory } from '../types';
import { MathView } from './MathView';
import { formatSecondsToTime, toggleBookmark, isQuestionBookmarked, saveAttempt } from '../data/mockTestsService';

interface CbtExamViewProps {
  test: MockTest;
  onExit: () => void;
  onBookmarkChanged?: () => void;
}

export const CbtExamView: React.FC<CbtExamViewProps> = ({
  test,
  onExit,
  onBookmarkChanged,
}) => {
  // Calculate total test duration (defaults to standard JEE Main 180 mins = 10800 seconds)
  const totalDurationSecs = (test.durationMinutes ? test.durationMinutes * 60 : 10800);

  // Map subject questions
  const subjectQuestions = useMemo(() => {
    return {
      physics: questions.filter((q) => q.sub.toLowerCase().includes('phys')),
      chemistry: questions.filter((q) => q.sub.toLowerCase().includes('chem')),
      math: questions.filter((q) => q.sub.toLowerCase().includes('math')),
    };
  }, [questions]);

  // Available subjects that actually contain questions in this test
  const availableSubjects = useMemo(() => {
    return (['physics', 'chemistry', 'math'] as Subject[]).filter(
      (s) => subjectQuestions[s].length > 0
    );
  }, [subjectQuestions]);

  // Current question index in test.questions array (0 to questions.length - 1)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active subject tab filter ('physics', 'chemistry', 'math')
  const [activeSubject, setActiveSubject] = useState<Subject>(() => {
    const firstSub = test.questions[0]?.sub.toLowerCase();
    if (firstSub?.includes('chem')) return 'chemistry';
    if (firstSub?.includes('math')) return 'math';
    return 'physics';
  });

  // Answers map: { [questionId]: answerValue }
  const [answers, setAnswers] = useState<Record<number, string | number>>({});

  // Marked for review map: { [questionId]: boolean }
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});

  // Visited map: { [questionId]: boolean }
  const [visited, setVisited] = useState<Record<number, boolean>>({ [test.questions[0]?.id || 1]: true });

  // Timer
  const [timeLeft, setTimeLeft] = useState(totalDurationSecs);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Reset exam state when test changes
  useEffect(() => {
    const dur = test.durationMinutes ? test.durationMinutes * 60 : 10800;
    setTimeLeft(dur);
    setCurrentIndex(0);
    setAnswers({});
    setMarkedForReview({});
    setVisited({ [test.questions[0]?.id || 1]: true });
    setIsSubmitted(false);
    setIsTimerRunning(true);
    setTestResult(null);

    const firstSub = test.questions[0]?.sub.toLowerCase();
    if (firstSub?.includes('chem')) setActiveSubject('chemistry');
    else if (firstSub?.includes('math')) setActiveSubject('math');
    else setActiveSubject('physics');
  }, [test.id, test.durationMinutes]);

  // Sync active subject tab with current question
  useEffect(() => {
    if (currentQuestion) {
      const sub = currentQuestion.sub.toLowerCase();
      if (sub.includes('phys') && activeSubject !== 'physics') setActiveSubject('physics');
      if (sub.includes('chem') && activeSubject !== 'chemistry') setActiveSubject('chemistry');
      if (sub.includes('math') && activeSubject !== 'math') setActiveSubject('math');

      setVisited((prev) => ({ ...prev, [currentQuestion.id]: true }));
    }
  }, [currentIndex, currentQuestion]);

  // Countdown timer
  useEffect(() => {
    if (!isTimerRunning || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, isSubmitted]);

  // Handle selecting an answer
  const handleSelectOption = (optIndex: number) => {
    if (!currentQuestion || isSubmitted) return;
    const val = optIndex + 1; // 1-based (A=1, B=2, C=3, D=4)
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
  };

  // Handle numerical input
  const handleNumericalInput = (val: string) => {
    if (!currentQuestion || isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
  };

  // Clear current response
  const handleClearResponse = () => {
    if (!currentQuestion || isSubmitted) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  // Mark for review & Next
  const handleMarkForReviewAndNext = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => ({ ...prev, [currentQuestion.id]: true }));
    handleNext();
  };

  // Save & Next
  const handleSaveAndNext = () => {
    if (!currentQuestion) return;
    // unmark review if saved
    if (markedForReview[currentQuestion.id]) {
      setMarkedForReview((prev) => ({ ...prev, [currentQuestion.id]: false }));
    }
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Jump to specific question
  const handleJumpToQuestion = (qId: number) => {
    const idx = questions.findIndex((q) => q.id === qId);
    if (idx !== -1) {
      setCurrentIndex(idx);
      setShowPalette(false);
    }
  };

  // Select subject tab
  const handleSelectSubjectTab = (subj: Subject) => {
    setActiveSubject(subj);
    const firstOfSubject = subjectQuestions[subj][0];
    if (firstOfSubject) {
      const idx = questions.findIndex((q) => q.id === firstOfSubject.id);
      if (idx !== -1) setCurrentIndex(idx);
    }
  };

  // Calculate Question Status
  const getQuestionStatus = (qId: number): 'answered' | 'not-answered' | 'marked' | 'marked-answered' | 'not-visited' => {
    const isAns = answers[qId] !== undefined && answers[qId] !== '';
    const isRev = markedForReview[qId];
    const isVis = visited[qId];

    if (isAns && isRev) return 'marked-answered';
    if (isRev) return 'marked';
    if (isAns) return 'answered';
    if (isVis) return 'not-answered';
    return 'not-visited';
  };

  // Status counts
  const counts = useMemo(() => {
    let answered = 0;
    let marked = 0;
    let markedAnswered = 0;
    let notAnswered = 0;
    let notVisited = 0;

    questions.forEach((q) => {
      const s = getQuestionStatus(q.id);
      if (s === 'answered') answered++;
      else if (s === 'marked') marked++;
      else if (s === 'marked-answered') markedAnswered++;
      else if (s === 'not-answered') notAnswered++;
      else notVisited++;
    });

    return { answered, marked, markedAnswered, notAnswered, notVisited, total: questions.length };
  }, [questions, answers, markedForReview, visited]);

  // Submit test and compute scores
  const handleSubmitTest = () => {
    setShowSubmitModal(false);
    setIsSubmitted(true);
    setIsTimerRunning(false);

    const ak = test.answerKey || {};
    let correct = 0;
    let incorrect = 0;
    let attempted = 0;

    const subScores = {
      physics: 0,
      chemistry: 0,
      math: 0,
    };

    questions.forEach((q) => {
      const userAns = answers[q.id];
      if (userAns !== undefined && userAns !== '') {
        attempted++;
        const correctAns = ak[q.id];
        const isCorrect =
          correctAns !== undefined &&
          String(userAns).trim().toLowerCase() === String(correctAns).trim().toLowerCase();

        const subKey = q.sub.toLowerCase().includes('phys')
          ? 'physics'
          : q.sub.toLowerCase().includes('chem')
          ? 'chemistry'
          : 'math';

        if (isCorrect) {
          correct++;
          subScores[subKey] += 4;
        } else {
          incorrect++;
          subScores[subKey] -= 1;
        }
      }
    });

    const totalScore = correct * 4 - incorrect * 1;
    const timeTaken = 10800 - timeLeft;

    const result: TestResultHistory = {
      id: `${test.id}-${Date.now()}`,
      testId: test.id,
      testTitle: test.title,
      testNumber: test.testNumber,
      date: Date.now(),
      score: totalScore,
      maxScore: questions.length * 4,
      correct,
      incorrect,
      attempted,
      totalQuestions: questions.length,
      timeTakenSeconds: timeTaken,
      subjectScores: subScores,
    };

    setTestResult(result);
    saveAttempt(result);
  };

  // Bookmarking toggle
  const isBookmarked = currentQuestion ? isQuestionBookmarked(test.id, currentQuestion.id) : false;
  const handleToggleBookmark = () => {
    if (!currentQuestion) return;
    toggleBookmark({
      id: `${test.id}-${currentQuestion.id}`,
      testId: test.id,
      testTitle: test.title,
      question: currentQuestion,
      addedAt: Date.now(),
    });
    if (onBookmarkChanged) onBookmarkChanged();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-100 relative">
      {/* Top Exam Header */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Exit Exam"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-white truncate">{test.title}</h2>
            <span className="text-[10px] text-slate-400">NTA JEE Main CBT Interface</span>
          </div>
        </div>

        {/* Timer & Palette Toggle */}
        <div className="flex items-center gap-2">
          {!isSubmitted ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold ${
                timeLeft < 600
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'bg-slate-800 text-sky-400 border border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatSecondsToTime(timeLeft)}</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              Test Completed
            </div>
          )}

          <button
            onClick={() => setShowPalette(!showPalette)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 transition text-xs font-semibold"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Palette</span>
          </button>
        </div>
      </header>

      {/* Subject Selector Tabs */}
      <div className="flex-shrink-0 bg-slate-900/60 border-b border-slate-800/80 px-2 flex items-center gap-1 text-xs">
        {(['physics', 'chemistry', 'math'] as Subject[]).map((subj) => {
          const qs = subjectQuestions[subj];
          const answeredInSubj = qs.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length;
          const isActive = activeSubject === subj;

          return (
            <button
              key={subj}
              onClick={() => handleSelectSubjectTab(subj)}
              className={`flex-1 py-2 px-1 text-center font-medium capitalize border-b-2 transition relative ${
                isActive
                  ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{subj}</span>
              <span className="text-[10px] ml-1 opacity-70 font-mono">
                ({answeredInSubj}/{qs.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Question & Solution Review Area */}
      {!isSubmitted ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentQuestion ? (
            <div className="space-y-4">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold font-mono">
                    Q. {currentQuestion.id} of {questions.length}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {currentQuestion.sec === 'scq' ? 'MCQ (+4, -1)' : 'Numerical (+4, -1)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleBookmark}
                    className="p-1 rounded text-slate-400 hover:text-amber-400 transition"
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Question Body with MathJax & SVG */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-sm sm:text-base">
                <MathView
                  content={currentQuestion.q}
                  diagramSvg={test.diagrams?.[currentQuestion.id]}
                />
              </div>

              {/* MCQ Options or NAT input */}
              {currentQuestion.sec === 'scq' && currentQuestion.opts && currentQuestion.opts.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Select One Option:
                  </div>
                  {currentQuestion.opts.map((opt, i) => {
                    const optValue = i + 1;
                    const isSelected = answers[currentQuestion.id] === optValue;
                    const letter = String.fromCharCode(65 + i);

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(i)}
                        className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-500 text-white shadow-md shadow-sky-950/50'
                            : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                            isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {letter}
                        </span>
                        <div className="flex-1 text-xs sm:text-sm">
                          <MathView content={opt} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Numerical Answer Type (NAT) Input */
                <div className="space-y-3 pt-2">
                  <div className="text-xs text-slate-400 font-medium">Enter Numerical Answer:</div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Enter integer or decimal value"
                    value={answers[currentQuestion.id] ?? ''}
                    onChange={(e) => handleNumericalInput(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-base font-mono focus:border-sky-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    * For numerical value questions, round off to nearest integer or decimal as requested.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">No question selected</div>
          )}
        </div>
      ) : (
        /* Results & Solutions Review Mode */
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {testResult && (
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-sky-950 border border-sky-800/40 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-7 h-7 text-amber-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Exam Scorecard</h3>
                    <p className="text-xs text-slate-400">{test.title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-sky-400 font-mono">
                    {testResult.score} <span className="text-xs text-slate-400 font-normal">/ {testResult.maxScore}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {Math.max(0, Math.round((testResult.score / testResult.maxScore) * 100))}% Score
                  </div>
                </div>
              </div>

              {/* Stats matrix */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                  <div className="text-base font-bold font-mono">{testResult.correct}</div>
                  <div className="text-[10px] opacity-80">Correct (+{testResult.correct * 4})</div>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300">
                  <div className="text-base font-bold font-mono">{testResult.incorrect}</div>
                  <div className="text-[10px] opacity-80">Incorrect (-{testResult.incorrect * 1})</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300">
                  <div className="text-base font-bold font-mono">{testResult.totalQuestions - testResult.attempted}</div>
                  <div className="text-[10px] opacity-80">Unattempted</div>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject-wise Marks</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Physics:</span>
                    <div className="font-bold text-sky-400">{testResult.subjectScores.physics} M</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Chemistry:</span>
                    <div className="font-bold text-emerald-400">{testResult.subjectScores.chemistry} M</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Maths:</span>
                    <div className="font-bold text-amber-400">{testResult.subjectScores.math} M</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Solutions Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Detailed Question Solutions
              </h4>
              <span className="text-xs text-slate-400">Answer Key Review</span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {(['all', 'incorrect', 'unattempted', 'correct'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReviewFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                    reviewFilter === filter
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Questions list in review mode */}
            <div className="space-y-4">
              {questions
                .filter((q) => {
                  const userAns = answers[q.id];
                  const correctAns = test.answerKey?.[q.id];
                  const isAtt = userAns !== undefined && userAns !== '';
                  const isCorr = isAtt && correctAns !== undefined && String(userAns).trim() === String(correctAns).trim();

                  if (reviewFilter === 'correct') return isCorr;
                  if (reviewFilter === 'incorrect') return isAtt && !isCorr;
                  if (reviewFilter === 'unattempted') return !isAtt;
                  return true;
                })
                .map((q) => {
                  const userAns = answers[q.id];
                  const correctAns = test.answerKey?.[q.id];
                  const isAtt = userAns !== undefined && userAns !== '';
                  const isCorr = isAtt && correctAns !== undefined && String(userAns).trim() === String(correctAns).trim();

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border space-y-3 ${
                        !isAtt
                          ? 'bg-slate-900/60 border-slate-800'
                          : isCorr
                          ? 'bg-emerald-950/20 border-emerald-800/40'
                          : 'bg-rose-950/20 border-rose-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-sky-400 font-mono">
                          Q. {q.id} ({q.sub.toUpperCase()})
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isCorr ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                              <Check className="w-3 h-3" /> Correct (+4)
                            </span>
                          ) : isAtt ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold text-[11px] flex items-center gap-1">
                              <X className="w-3 h-3" /> Incorrect (-1)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                              Not Attempted (0)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-200">
                        <MathView content={q.q} diagramSvg={test.diagrams?.[q.id]} />
                      </div>

                      {q.opts && (
                        <div className="grid grid-cols-1 gap-1.5 text-xs pt-1">
                          {q.opts.map((opt, i) => {
                            const optNum = i + 1;
                            const isUserPick = userAns === optNum;
                            const isCorrectPick = correctAns !== undefined && Number(correctAns) === optNum;

                            return (
                              <div
                                key={i}
                                className={`p-2 rounded-lg border flex items-start gap-2 ${
                                  isCorrectPick
                                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200 font-medium'
                                    : isUserPick
                                    ? 'bg-rose-500/15 border-rose-500 text-rose-200'
                                    : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                                }`}
                              >
                                <span className="font-mono font-bold">{String.fromCharCode(65 + i)}.</span>
                                <div className="flex-1">
                                  <MathView content={opt} />
                                </div>
                                {isCorrectPick && <span className="text-[10px] text-emerald-400 font-bold">✓ Key</span>}
                                {isUserPick && !isCorrectPick && (
                                  <span className="text-[10px] text-rose-400 font-bold">✕ Your choice</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* NAT Answer Key */}
                      {q.sec === 'nat' && (
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex justify-between items-center">
                          <span className="text-slate-400">
                            Your answer: <strong className="text-white">{userAns ?? 'None'}</strong>
                          </span>
                          <span className="text-emerald-400 font-mono font-bold">
                            Correct Key: {correctAns ?? 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions Bar */}
      {!isSubmitted ? (
        <div className="flex-shrink-0 bg-slate-900 border-t border-slate-800 p-2.5 flex items-center justify-between gap-2 z-10 select-none">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs transition"
              title="Previous Question"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleClearResponse}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              Clear
            </button>

            <button
              onClick={handleMarkForReviewAndNext}
              className="px-2.5 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition"
            >
              Review
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndNext}
              className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-900/30 transition flex items-center gap-1"
            >
              <span>Save & Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between z-10">
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
          >
            Back to Tests List
          </button>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setAnswers({});
              setMarkedForReview({});
              setVisited({ [questions[0]?.id || 1]: true });
              setTimeLeft(10800);
              setIsTimerRunning(true);
              setCurrentIndex(0);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Test</span>
          </button>
        </div>
      )}

      {/* Question Palette Drawer (Slide Over) */}
      {showPalette && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs h-full bg-slate-900 border-l border-slate-800 flex flex-col p-4 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-sky-400" />
                <span>Question Palette</span>
              </h3>
              <button
                onClick={() => setShowPalette(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
                <span>Answered ({counts.answered})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-500" />
                <span>Not Answered ({counts.notAnswered})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-purple-500" />
                <span>Review ({counts.marked})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-700" />
                <span>Not Visited ({counts.notVisited})</span>
              </div>
            </div>

            {/* Grid of buttons 1 to 75 grouped by subject */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {(['physics', 'chemistry', 'math'] as Subject[]).map((subj) => {
                const qs = subjectQuestions[subj];
                return (
                  <div key={subj} className="space-y-1.5">
                    <div className="text-xs font-bold text-sky-400 capitalize flex justify-between">
                      <span>{subj}</span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        Q{qs[0]?.id} - Q{qs[qs.length - 1]?.id}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {qs.map((q) => {
                        const s = getQuestionStatus(q.id);
                        const isCurrent = currentQuestion?.id === q.id;

                        let bgClass = 'bg-slate-800 text-slate-400 hover:bg-slate-700';
                        if (s === 'answered') bgClass = 'bg-emerald-600 text-white font-bold';
                        else if (s === 'not-answered') bgClass = 'bg-rose-600 text-white font-bold';
                        else if (s === 'marked') bgClass = 'bg-purple-600 text-white font-bold';
                        else if (s === 'marked-answered')
                          bgClass = 'bg-purple-600 ring-2 ring-emerald-400 text-white font-bold';

                        return (
                          <button
                            key={q.id}
                            onClick={() => handleJumpToQuestion(q.id)}
                            className={`h-8 rounded-lg text-xs transition flex items-center justify-center relative ${bgClass} ${
                              isCurrent ? 'ring-2 ring-white scale-105 shadow-md' : ''
                            }`}
                          >
                            {q.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setShowPalette(false);
                setShowSubmitModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg"
            >
              Submit Exam
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm Submission</h3>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to submit your test? Here is your current attempt summary:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400">Total Questions:</span>{' '}
                <strong className="text-white">{questions.length}</strong>
              </div>
              <div>
                <span className="text-slate-400">Answered:</span>{' '}
                <strong className="text-emerald-400">{counts.answered + counts.markedAnswered}</strong>
              </div>
              <div>
                <span className="text-slate-400">Marked Review:</span>{' '}
                <strong className="text-purple-400">{counts.marked}</strong>
              </div>
              <div>
                <span className="text-slate-400">Unanswered:</span>{' '}
                <strong className="text-rose-400">{counts.notAnswered + counts.notVisited}</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Resume Test
              </button>
              <button
                onClick={handleSubmitTest}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
