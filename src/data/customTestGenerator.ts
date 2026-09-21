import { MockTest, Question, Subject, CustomTestConfig } from '../types';
import { bundledMockTests } from './mockTestsService';
import { CHAPTER_DEFINITIONS, CURATED_PYQ_QUESTIONS } from './pyqBank';
import { classifyQuestionIntoChapter } from './pyqService';

export interface PoolQuestion {
  sourceId: string | number;
  sub: Subject;
  sec: 'scq' | 'nat';
  q: string;
  opts?: string[];
  ans: string | number;
  chapterId: string;
  chapterName: string;
  diagramSvg?: string;
}

let cachedPool: PoolQuestion[] | null = null;

/**
 * Initializes and caches the entire normalized question bank from
 * all 6 bundled mock tests and curated JEE PYQs.
 */
export function getQuestionPool(): PoolQuestion[] {
  if (cachedPool && cachedPool.length > 0) {
    return cachedPool;
  }

  const pool: PoolQuestion[] = [];
  const seenQuestionTexts = new Set<string>();

  // 1. Ingest questions from all 6 mock tests (449+ questions with answer keys & diagrams)
  bundledMockTests.forEach((test) => {
    test.questions.forEach((q) => {
      const sub = (
        q.sub.toLowerCase().includes('phys')
          ? 'physics'
          : q.sub.toLowerCase().includes('chem')
          ? 'chemistry'
          : 'math'
      ) as Subject;

      const sec = (q.sec === 'nat' || (!q.opts || q.opts.length === 0)) ? 'nat' : 'scq';
      const ans = test.answerKey?.[q.id] ?? (sec === 'scq' ? '1' : 0);

      const classified = classifyQuestionIntoChapter(q, sub, test.title, test.testNumber);
      const diagramSvg = test.diagrams?.[q.id];

      // Normalize key for deduplication
      const cleanKey = q.q.replace(/<[^>]*>/g, '').trim().slice(0, 80).toLowerCase();
      if (!seenQuestionTexts.has(cleanKey)) {
        seenQuestionTexts.add(cleanKey);
        pool.push({
          sourceId: `mock-${test.id}-q-${q.id}`,
          sub,
          sec,
          q: q.q,
          opts: q.opts ? [...q.opts] : undefined,
          ans,
          chapterId: classified.chapterId,
          chapterName: classified.chapterName,
          diagramSvg,
        });
      }
    });
  });

  // 2. Ingest curated PYQs with explanations
  CURATED_PYQ_QUESTIONS.forEach((pyq) => {
    const cleanKey = pyq.q.replace(/<[^>]*>/g, '').trim().slice(0, 80).toLowerCase();
    if (!seenQuestionTexts.has(cleanKey)) {
      seenQuestionTexts.add(cleanKey);
      pool.push({
        sourceId: pyq.id,
        sub: pyq.sub,
        sec: pyq.sec === 'nat' ? 'nat' : 'scq',
        q: pyq.q,
        opts: pyq.opts ? [...pyq.opts] : undefined,
        ans: pyq.ans,
        chapterId: pyq.chapterId,
        chapterName: pyq.chapterName,
      });
    }
  });

  cachedPool = pool;
  return pool;
}

/**
 * Filter pool questions by subjects, chapters, and question types.
 */
export function filterQuestionPool(
  subjects: Subject[],
  chapterIds?: string[],
  questionTypes: 'both' | 'scq_only' | 'nat_only' = 'both'
): PoolQuestion[] {
  const pool = getQuestionPool();
  const subSet = new Set(subjects);
  const chapterSet = chapterIds && chapterIds.length > 0 ? new Set(chapterIds) : null;

  return pool.filter((q) => {
    if (!subSet.has(q.sub)) return false;
    if (chapterSet && !chapterSet.has(q.chapterId)) return false;
    if (questionTypes === 'scq_only' && q.sec !== 'scq') return false;
    if (questionTypes === 'nat_only' && q.sec !== 'nat') return false;
    return true;
  });
}

/**
 * Get count of matching questions for a given configuration
 */
export function getAvailableQuestionCount(
  subjects: Subject[],
  chapterIds?: string[],
  questionTypes: 'both' | 'scq_only' | 'nat_only' = 'both'
): Record<Subject, number> & { total: number } {
  const matched = filterQuestionPool(subjects, chapterIds, questionTypes);
  const counts: Record<Subject, number> = {
    physics: 0,
    chemistry: 0,
    math: 0,
  };

  matched.forEach((q) => {
    if (counts[q.sub] !== undefined) {
      counts[q.sub]++;
    }
  });

  return {
    ...counts,
    total: matched.length,
  };
}

/**
 * Fisher-Yates array shuffle
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generates an automated title for a custom test based on configuration
 */
export function generateDefaultTestTitle(
  subjects: Subject[],
  chapterIds?: string[],
  totalQuestions = 30
): string {
  const subLabels: Record<Subject, string> = {
    physics: 'Physics',
    chemistry: 'Chemistry',
    math: 'Mathematics',
  };

  if (subjects.length === 1) {
    const subName = subLabels[subjects[0]];
    if (chapterIds && chapterIds.length === 1) {
      // Find chapter name
      const allChapters = Object.values(CHAPTER_DEFINITIONS).flat();
      const ch = allChapters.find((c) => c.id === chapterIds[0]);
      if (ch) return `${ch.name} Test (${totalQuestions} Qs)`;
    }
    if (chapterIds && chapterIds.length > 1 && chapterIds.length <= 3) {
      return `${subName} Topics Test (${totalQuestions} Qs)`;
    }
    return `${subName} Chapter Test (${totalQuestions} Qs)`;
  }

  if (subjects.length === 2) {
    const s1 = subLabels[subjects[0]];
    const s2 = subLabels[subjects[1]];
    return `${s1} + ${s2} Sprint (${totalQuestions} Qs)`;
  }

  if (totalQuestions >= 75) {
    return `Full JEE Main Mock Test (${totalQuestions} Qs)`;
  }
  return `PCM Combined Practice Test (${totalQuestions} Qs)`;
}

/**
 * Main generator: constructs a fully validated, self-contained MockTest object
 * adhering to the official CBT JEE pattern with questions, answer keys, diagrams, and topics.
 */
export function generateCustomTest(config: CustomTestConfig, customIndex = 1): MockTest {
  const subjects = config.subjects.length > 0 ? config.subjects : (['physics', 'chemistry', 'math'] as Subject[]);
  const targetCount = Math.max(5, Math.min(100, config.totalQuestions || 30));
  const questionTypes = config.questionTypes || 'both';

  // 1. Group matched candidate pool by subject
  const poolBySubject: Record<Subject, PoolQuestion[]> = {
    physics: [],
    chemistry: [],
    math: [],
  };

  const matched = filterQuestionPool(subjects, config.chapterIds, questionTypes);
  matched.forEach((q) => {
    if (poolBySubject[q.sub]) {
      poolBySubject[q.sub].push(q);
    }
  });

  // 2. Allocate question count per subject
  const selectedPoolQuestions: PoolQuestion[] = [];
  const basePerSubject = Math.floor(targetCount / subjects.length);
  let remainder = targetCount % subjects.length;

  subjects.forEach((subj) => {
    const quota = basePerSubject + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;

    let candidates = poolBySubject[subj];
    // Shuffle candidates to ensure fresh variety
    candidates = shuffleArray(candidates);

    if (questionTypes === 'both') {
      // Split into SCQs and NATs if possible (standard JEE ratio: ~80% SCQ, 20% NAT)
      const scqs = candidates.filter((q) => q.sec === 'scq');
      const nats = candidates.filter((q) => q.sec === 'nat');

      const natTarget = Math.max(1, Math.round(quota * 0.2));
      const scqTarget = quota - natTarget;

      const chosenScqs = scqs.slice(0, scqTarget);
      const chosenNats = nats.slice(0, natTarget);

      let subjectChosen = [...chosenScqs, ...chosenNats];

      // If pool didn't have enough SCQ/NAT to fill quota, pull any remaining from candidates
      if (subjectChosen.length < quota) {
        const remaining = candidates.filter((q) => !subjectChosen.includes(q));
        subjectChosen.push(...remaining.slice(0, quota - subjectChosen.length));
      }

      // Keep SCQs first, then NATs as per standard NTA paper layout
      subjectChosen.sort((a, b) => (a.sec === 'scq' && b.sec === 'nat' ? -1 : 1));
      selectedPoolQuestions.push(...subjectChosen);
    } else {
      selectedPoolQuestions.push(...candidates.slice(0, quota));
    }
  });

  // 3. Fallback: if selected questions are fewer than targetCount due to strict chapter filters,
  // backfill from broader pool of the same subjects
  if (selectedPoolQuestions.length < targetCount) {
    const existingIds = new Set(selectedPoolQuestions.map((q) => q.sourceId));
    const backfillPool = shuffleArray(
      getQuestionPool().filter((q) => subjects.includes(q.sub) && !existingIds.has(q.sourceId))
    );
    const needed = targetCount - selectedPoolQuestions.length;
    selectedPoolQuestions.push(...backfillPool.slice(0, needed));
  }

  // 4. Transform into sequentially numbered Question objects (1 to N)
  const finalQuestions: Question[] = [];
  const answerKeyMap: Record<string, string | number> = {};
  const diagramsMap: Record<string, string> = {};
  const syllabusTopicSet = new Set<string>();

  selectedPoolQuestions.forEach((pq, idx) => {
    const qId = idx + 1;
    finalQuestions.push({
      id: qId,
      sub: pq.sub,
      sec: pq.sec,
      q: pq.q,
      opts: pq.opts ? [...pq.opts] : undefined,
    });

    answerKeyMap[qId] = pq.ans;

    if (pq.diagramSvg) {
      diagramsMap[qId] = pq.diagramSvg;
    }

    if (pq.chapterName) {
      syllabusTopicSet.add(pq.chapterName);
    }
  });

  const now = new Date();
  const publishedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const testTitle =
    config.title?.trim() ||
    generateDefaultTestTitle(subjects, config.chapterIds, finalQuestions.length);

  const durationMins = config.durationMinutes || Math.max(15, Math.round(finalQuestions.length * 2.4));

  return {
    id: `custom-test-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    testNumber: customIndex,
    title: testTitle,
    published: publishedDate,
    url: 'https://ranjan2045r.blogspot.com',
    totalQuestions: finalQuestions.length,
    durationMinutes: durationMins,
    questions: finalQuestions,
    answerKey: answerKeyMap,
    diagrams: Object.keys(diagramsMap).length > 0 ? diagramsMap : undefined,
    diagramsCount: Object.keys(diagramsMap).length,
    syllabusTopics: Array.from(syllabusTopicSet).slice(0, 10),
    isCustom: true,
    createdAt: Date.now(),
    customConfig: config,
  };
}
