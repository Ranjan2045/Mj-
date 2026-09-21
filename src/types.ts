/**
 * Type definitions for MJ JEE Mock Tests (ranjan2045r.blogspot.com)
 */

export type Subject = 'physics' | 'chemistry' | 'math';

export type QuestionSection = 'scq' | 'nat';

export interface Question {
  id: number;
  sub: Subject | string;
  sec: QuestionSection | string;
  q: string;
  opts?: string[];
  num?: string | number;
}

export interface CustomTestConfig {
  title?: string;
  subjects: Subject[];
  chapterIds?: string[];
  totalQuestions: number;
  durationMinutes: number;
  questionTypes: 'both' | 'scq_only' | 'nat_only';
  randomSeed?: number;
}

export interface MockTest {
  id: string;
  testNumber: number;
  title: string;
  published: string;
  url: string;
  totalQuestions: number;
  questions: Question[];
  answerKey: Record<string, string | number>;
  diagramsCount?: number;
  diagrams?: Record<string, string>;
  syllabusTopics?: string[];
  durationMinutes?: number;
  isCustom?: boolean;
  createdAt?: number;
  customConfig?: CustomTestConfig;
}

export interface TestResponseState {
  answers: Record<number, string | number>;
  markedForReview: Record<number, boolean>;
  visited: Record<number, boolean>;
  timeSpentPerQuestion: Record<number, number>;
  startedAt: number;
  timeLeftSeconds: number;
  isSubmitted: boolean;
  score?: number;
  correctCount?: number;
  incorrectCount?: number;
  attemptedCount?: number;
  subjectScores?: {
    physics: { score: number; attempted: number; correct: number; total: number };
    chemistry: { score: number; attempted: number; correct: number; total: number };
    math: { score: number; attempted: number; correct: number; total: number };
  };
}

export interface Bookmark {
  id: string;
  testId: string;
  testTitle: string;
  question: Question;
  addedAt: number;
  notes?: string;
}

export interface TestResultHistory {
  id: string;
  testId: string;
  testTitle: string;
  testNumber: number;
  date: number;
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  attempted: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  subjectScores: {
    physics: number;
    chemistry: number;
    math: number;
  };
}

export type AppTab = 'tests' | 'pyq' | 'cbt' | 'paper' | 'saved' | 'app';

export interface PYQQuestion {
  id: string;
  sub: Subject;
  chapterId: string;
  chapterName: string;
  year: string; // e.g. "JEE Main 2024 (Jan 27 Shift 1)"
  sec: QuestionSection | string;
  q: string;
  opts?: string[];
  ans: string | number;
  explanation?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  source: string;
}

export interface PYQChapter {
  id: string;
  name: string;
  sub: Subject;
  description?: string;
  iconName?: string;
  questions: PYQQuestion[];
}

export interface PYQProgress {
  answeredQuestions: Record<string, {
    selectedAnswer: string | number;
    isCorrect: boolean;
    timestamp: number;
  }>;
}

export interface AppSettings {
  vibration: boolean;
  autoSaveResponses: boolean;
  instantExplanation: boolean;
  deviceFrame: boolean;
  fontSize: 'normal' | 'large';
  darkMode: boolean;
}
