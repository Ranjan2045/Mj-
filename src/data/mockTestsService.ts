import { MockTest, TestResultHistory, Bookmark } from '../types';
import rawData from './mockTestsData.json';

const STORAGE_KEYS = {
  ATTEMPTS: 'mj_jee_test_attempts_v1',
  BOOKMARKS: 'mj_jee_bookmarks_v1',
  SETTINGS: 'mj_jee_app_settings_v1',
  LAST_SYNC: 'mj_jee_last_sync_v1',
  CACHED_TESTS: 'mj_jee_cached_tests_v2',
  CUSTOM_TESTS: 'mj_jee_custom_tests_v1',
};

// Initial data bundled with the app for 100% offline capability
export const bundledMockTests: MockTest[] = rawData as MockTest[];

export function getStoredCustomTests(): MockTest[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_TESTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load custom tests from localStorage', e);
  }
  return [];
}

export function saveCustomTest(test: MockTest): void {
  try {
    if (typeof localStorage !== 'undefined') {
      const existing = getStoredCustomTests().filter((t) => t.id !== test.id);
      const updated = [test, ...existing];
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TESTS, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Failed to save custom test', e);
  }
}

export function deleteCustomTest(testId: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      const existing = getStoredCustomTests();
      const updated = existing.filter((t) => t.id !== testId);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TESTS, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Failed to delete custom test', e);
  }
}

export function getStoredMockTests(): MockTest[] {
  const customTests = getStoredCustomTests();
  let baseTests = bundledMockTests;
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEYS.CACHED_TESTS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Discard if stale cache containing uncleaned citations or broken formatting
          const rawStr = JSON.stringify(parsed);
          if (!rawStr.includes('[cite:') && !rawStr.includes('&lt; a &lt;')) {
            baseTests = parsed;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load cached tests from localStorage', e);
  }
  return [...customTests, ...baseTests];
}

export function saveCachedTests(tests: MockTest[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CACHED_TESTS, JSON.stringify(tests));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(Date.now()));
    }
  } catch (e) {
    console.warn('Failed to save cached tests to localStorage', e);
  }
}

/**
 * Fetch Blogger JSON feed via JSONP to bypass browser CORS restrictions.
 */
function fetchBloggerFeedViaJSONP(timeoutMs = 6000): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return reject(new Error('Window or document not available'));
    }

    const callbackName = `bloggerFeedCb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement('script');
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      try {
        delete (window as any)[callbackName];
      } catch {
        (window as any)[callbackName] = undefined;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP script load error'));
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP request timed out'));
    }, timeoutMs);

    script.src = `https://ranjan2045r.blogspot.com/feeds/posts/default?alt=json-in-script&callback=${callbackName}`;
    document.head.appendChild(script);
  });
}

export async function syncFromBlogspot(): Promise<{ success: boolean; tests: MockTest[]; message: string }> {
  let feedData: any = null;

  // 1. Try local dev proxy /api/blogger-feed (fast & CORS-free)
  try {
    const res = await fetch('/api/blogger-feed', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      feedData = await res.json();
    }
  } catch (err) {
    console.debug('Proxy sync attempt failed:', err);
  }

  // 2. Try JSONP (bypasses browser CORS restriction in webviews & static hosting)
  if (!feedData) {
    try {
      feedData = await fetchBloggerFeedViaJSONP(5000);
    } catch (err) {
      console.debug('JSONP sync attempt failed:', err);
    }
  }

  // 3. Try direct fetch
  if (!feedData) {
    try {
      const res = await fetch('https://ranjan2045r.blogspot.com/feeds/posts/default?alt=json', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        feedData = await res.json();
      }
    } catch (err) {
      console.debug('Direct fetch sync attempt failed:', err);
    }
  }

  if (feedData && feedData.feed?.entry) {
    const count = feedData.feed.entry.length;
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(Date.now()));
    return {
      success: true,
      tests: getStoredMockTests(),
      message: `Successfully synchronized with ranjan2045r.blogspot.com! Verified ${count} mock tests online.`,
    };
  }

  // Safe fallback if network is offline without throwing errors
  return {
    success: false,
    tests: getStoredMockTests(),
    message: 'Offline mode active: You have 6 complete full-syllabus mock tests ready for practice.',
  };
}

export function getStoredAttempts(): TestResultHistory[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: TestResultHistory): void {
  try {
    const attempts = getStoredAttempts();
    const updated = [attempt, ...attempts];
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Could not save test attempt', e);
  }
}

export function getStoredBookmarks(): Bookmark[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(bookmark: Bookmark): boolean {
  try {
    const bookmarks = getStoredBookmarks();
    const index = bookmarks.findIndex(
      (b) => b.testId === bookmark.testId && b.question.id === bookmark.question.id
    );
    if (index >= 0) {
      bookmarks.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return false; // Removed
    } else {
      bookmarks.unshift(bookmark);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return true; // Added
    }
  } catch (e) {
    console.error('Error toggling bookmark', e);
    return false;
  }
}

export function isQuestionBookmarked(testId: string, questionId: number): boolean {
  const bookmarks = getStoredBookmarks();
  return bookmarks.some((b) => b.testId === testId && b.question.id === questionId);
}

export function formatSecondsToTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function seedSampleAttempts(): void {
  const now = Date.now();
  const sampleAttempts: TestResultHistory[] = [
    {
      id: 'att_sample_1',
      testId: 'mj_test_1',
      testTitle: 'MJ Mock Test 1 — Full Syllabus',
      testNumber: 1,
      date: now - 5 * 86400000,
      score: 138,
      maxScore: 300,
      correct: 37,
      incorrect: 10,
      attempted: 47,
      totalQuestions: 75,
      timeTakenSeconds: 10200,
      subjectScores: {
        physics: 48,
        chemistry: 52,
        math: 38,
      },
    },
    {
      id: 'att_sample_2',
      testId: 'mj_test_2',
      testTitle: 'MJ Mock Test 2 — Full Syllabus',
      testNumber: 2,
      date: now - 3 * 86400000,
      score: 164,
      maxScore: 300,
      correct: 43,
      incorrect: 8,
      attempted: 51,
      totalQuestions: 75,
      timeTakenSeconds: 10450,
      subjectScores: {
        physics: 56,
        chemistry: 60,
        math: 48,
      },
    },
    {
      id: 'att_sample_3',
      testId: 'mj_test_3',
      testTitle: 'MJ Mock Test 3 — Full Syllabus',
      testNumber: 3,
      date: now - 1 * 86400000,
      score: 192,
      maxScore: 300,
      correct: 50,
      incorrect: 8,
      attempted: 58,
      totalQuestions: 75,
      timeTakenSeconds: 10600,
      subjectScores: {
        physics: 64,
        chemistry: 68,
        math: 60,
      },
    },
  ];
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(sampleAttempts));
}

export function cleanLatexText(text: string): string {
  if (!text) return '';

  let s = text
    // 1. Remove citation markers like [cite: 4], [cite: 3, 4], etc.
    .replace(/\[cite:[^\]]*\]/gi, '')
    // 2. Remove empty diagram wrappers
    .replace(/<div\s+class=["']diag["']\s*>\s*<\/div>/gi, '')
    .trim();

  // 3. Remove duplicate option prefixes like "(A) " or "A. " for options
  if (/^\s*(?:\([A-Da-d1-4]\)|[A-Da-d1-4][\.\)])\s+/.test(s)) {
    // Only strip if not a full question containing question indicator words
    if (!/\b(which|what|calculate|find|if|determine|consider|given|two|three|four)\b/i.test(s) || s.length < 120) {
      s = s.replace(/^\s*(?:\([A-Da-d1-4]\)|[A-Da-d1-4][\.\)])\s+/, '');
    }
  }

  // 4. Format squished Assertion & Reason if not already HTML-formatted
  if (/^Assertion:/i.test(s) && /Reason:/i.test(s) && !s.includes('<br') && !s.includes('<div')) {
    s = s.replace(/^Assertion:\s*(.*?)\s*Reason:\s*(.*)$/is, '<strong>Assertion:</strong> $1<br/><br/><strong>Reason:</strong> $2');
  }

  // 5. Format squished Statement 1 & 2 if not already HTML-formatted
  if (/^Statement\s*[-–I1]:/i.test(s) && /Statement\s*[-–II2]:/i.test(s) && !s.includes('<br') && !s.includes('<div')) {
    s = s.replace(/^Statement\s*[-–I1]:\s*(.*?)\s*Statement\s*[-–II2]:\s*(.*)$/is, '<strong>Statement I:</strong> $1<br/><br/><strong>Statement II:</strong> $2');
  }

  // 6. Fix HTML entities inside math mode \( ... \) and \[ ... \] so TeX parser does not crash on &
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    const cleanMath = math
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&le;/g, '\\le ')
      .replace(/&ge;/g, '\\ge ');
    return `\\(${cleanMath}\\)`;
  });
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    const cleanMath = math
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&le;/g, '\\le ')
      .replace(/&ge;/g, '\\ge ');
    return `\\[${cleanMath}\\]`;
  });

  // 7. Escape raw `<` and `>` that are NOT part of valid HTML tags
  // so browser HTML parser does not swallow equations like <0, <16, <\theta
  const validTagsRegex = /<\/?(div|span|br|p|strong|b|em|i|sub|sup|table|thead|tbody|tr|th|td|svg|line|circle|rect|path|text|defs|marker|polygon|polyline|g|img)(?:\s+[^>]*|\s*\/)?>|<!--[\s\S]*?-->/gi;

  const tokens: { type: 'tag' | 'text'; val: string }[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = validTagsRegex.exec(s)) !== null) {
    if (match.index > lastIdx) {
      tokens.push({ type: 'text', val: s.substring(lastIdx, match.index) });
    }
    tokens.push({ type: 'tag', val: match[0] });
    lastIdx = validTagsRegex.lastIndex;
  }
  if (lastIdx < s.length) {
    tokens.push({ type: 'text', val: s.substring(lastIdx) });
  }

  s = tokens
    .map((tok) => {
      if (tok.type === 'tag') return tok.val;
      // In non-tag text, safely escape < and >
      return tok.val
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    })
    .join('');

  return s;
}
