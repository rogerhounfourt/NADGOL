import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import ErrorBoundary from "./components/ErrorBoundary";
import IntroScreen from "./components/IntroScreen";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import MobileNav from "./components/MobileNav";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Athletes from "./pages/Athletes";
import Classes from "./pages/Classes";
import Attendance from "./pages/Attendance";
import Performance from "./pages/Performance";
import Competitions from "./pages/Competitions";
import Financial from "./pages/Financial";
import Evolution from "./pages/Evolution";
import Ranking from "./pages/Ranking";
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import { useEffect, useState } from "react";

const PAGE_MAP: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  athletes: Athletes,
  classes: Classes,
  attendance: Attendance,
  performance: Performance,
  competitions: Competitions,
  financial: Financial,
  evolution: Evolution,
  ranking: Ranking,
  notifications: Notifications,
  chat: Chat,
  settings: Settings,
};

function AppContent() {
  const { currentUser, isAuthenticated, showIntro, setShowIntro, activeSection, sidebarOpen } = useApp();
  const [introComplete, setIntroComplete] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (!showIntro) setIntroComplete(false);
  }, [showIntro]);

  if (!isAuthenticated) {
    return <Login />;
  }

  if (showIntro && !introComplete) {
    return (
      <IntroScreen
        role={currentUser!.role}
        name={currentUser!.name}
        onComplete={() => { setIntroComplete(true); setShowIntro(false); }}
      />
    );
  }

  const PageComponent = PAGE_MAP[activeSection] || Dashboard;
  const sidebarWidth = isDesktop ? (sidebarOpen ? 240 : 64) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080808' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: `${sidebarWidth}px`,
        transition: 'margin-left 250ms cubic-bezier(0.23, 1, 0.32, 1)',
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        minWidth: 0,
      }}>
        <TopHeader />
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: isDesktop ? '0' : '72px' }}>
          <PageComponent />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
