import React, { useState, useEffect } from 'react';
import { AppTab, MockTest, TestResultHistory, Bookmark, AppSettings } from './types';
import {
  getStoredMockTests,
  getStoredAttempts,
  getStoredBookmarks,
  syncFromBlogspot,
} from './data/mockTestsService';
import { AndroidFrame } from './components/AndroidFrame';
import { AndroidAppBar } from './components/AndroidAppBar';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { TestsListView } from './components/TestsListView';
import { CbtExamView } from './components/CbtExamView';
import { QuestionPaperView } from './components/QuestionPaperView';
import { SavedAndAnalyticsView } from './components/SavedAndAnalyticsView';
import { PyqChapterWiseView } from './components/PyqChapterWiseView';
import { BlogSyncView } from './components/BlogSyncView';
import { PWAInstallModal } from './components/PWAInstallModal';
import { BlogWebviewModal } from './components/BlogWebviewModal';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('tests');
  const [tests, setTests] = useState<MockTest[]>(() => getStoredMockTests());
  const [activeTest, setActiveTest] = useState<MockTest>(() => {
    const list = getStoredMockTests();
    return list[0];
  });
  const [attempts, setAttempts] = useState<TestResultHistory[]>(() => getStoredAttempts());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getStoredBookmarks());
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [blogModalUrl, setBlogModalUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => ({
    vibration: true,
    autoSaveResponses: true,
    instantExplanation: false,
    deviceFrame: true,
    fontSize: 'normal',
    darkMode: true,
  }));
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const isOnline = useOnlineStatus();

  // Register service worker for offline Android PWA support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.debug('Service Worker Registration:', err);
      });
    }
  }, []);

  const refreshData = () => {
    setAttempts(getStoredAttempts());
    setBookmarks(getStoredBookmarks());
    setTests(getStoredMockTests());
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const res = await syncFromBlogspot();
    setIsSyncing(false);
    setSyncMessage(res.message);
    if (res.success) {
      setTests(res.tests);
    }
    setTimeout(() => {
      setSyncMessage(null);
    }, 6000);
  };

  const handleStartTest = (test: MockTest) => {
    setActiveTest(test);
    setActiveTab('cbt');
  };

  const handleViewPaper = (test: MockTest) => {
    setActiveTest(test);
    setActiveTab('paper');
  };

  const handleOpenBlogspot = (url?: string) => {
    window.open(url || 'https://ranjan2045r.blogspot.com', '_blank');
  };

  return (
    <AndroidFrame
      isFrameEnabled={settings.deviceFrame}
      onToggleFrame={() => setSettings((s) => ({ ...s, deviceFrame: !s.deviceFrame }))}
      appName="MJ JEE Mock Tests"
    >
      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-3 py-1 text-[11px] font-bold flex items-center justify-center gap-1.5 z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode: You can practice all 6 mock tests offline.</span>
        </div>
      )}

      {/* Top App Bar (hidden inside active CBT Exam to maximize exam focus) */}
      {activeTab !== 'cbt' && (
        <AndroidAppBar
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onSync={handleSync}
          isSyncing={isSyncing}
          activeTestTitle={
            activeTab === 'paper'
              ? activeTest.title
              : activeTab === 'pyq'
              ? 'Chapter-wise PYQ Bank'
              : undefined
          }
          onOpenBlogspot={() => handleOpenBlogspot()}
        />
      )}

      {/* Main Tab Screen Area */}
      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-slate-950">
        {activeTab === 'tests' && (
          <TestsListView
            tests={tests}
            attempts={attempts}
            onStartTest={handleStartTest}
            onViewPaper={handleViewPaper}
            onOpenBlogspot={(url?: string) => {
              if (url) setBlogModalUrl(url);
              else setBlogModalUrl('https://ranjan2045r.blogspot.com');
            }}
            onOpenPyq={() => setActiveTab('pyq')}
          />
        )}

        {activeTab === 'pyq' && (
          <PyqChapterWiseView
            onRefreshBookmarks={refreshData}
            onOpenBlogspot={() => handleOpenBlogspot()}
          />
        )}

        {activeTab === 'cbt' && (
          <CbtExamView
            test={activeTest}
            onExit={() => {
              refreshData();
              setActiveTab('tests');
            }}
            onBookmarkChanged={refreshData}
          />
        )}

        {activeTab === 'paper' && (
          <QuestionPaperView
            tests={tests}
            selectedTest={activeTest}
            onSelectTest={setActiveTest}
            onBookmarkChanged={refreshData}
          />
        )}

        {activeTab === 'saved' && (
          <SavedAndAnalyticsView
            bookmarks={bookmarks}
            attempts={attempts}
            onRefreshBookmarks={refreshData}
            onClearHistory={() => {
              localStorage.removeItem('mj_jee_test_attempts_v1');
              refreshData();
            }}
          />
        )}

        {activeTab === 'app' && (
          <BlogSyncView
            tests={tests}
            isSyncing={isSyncing}
            onSync={handleSync}
            syncMessage={syncMessage}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            settings={settings}
            onUpdateSettings={(newS) => setSettings((prev) => ({ ...prev, ...newS }))}
          />
        )}
      </main>

      {/* Android Bottom Navigation Bar (hidden inside active CBT Exam to prevent accidental exits) */}
      {activeTab !== 'cbt' && (
        <AndroidBottomNav
          activeTab={activeTab}
          onSelectTab={(tab: AppTab) => {
            refreshData();
            setActiveTab(tab);
          }}
          savedCount={bookmarks.length}
        />
      )}

      {/* PWA / Android Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Blog Webview Modal */}
      <BlogWebviewModal
        url={blogModalUrl}
        onClose={() => setBlogModalUrl(null)}
      />
    </AndroidFrame>
  );
}

