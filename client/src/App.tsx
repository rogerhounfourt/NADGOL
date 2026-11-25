import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import ErrorBoundary from "./components/ErrorBoundary";
import IntroScreen from "./components/IntroScreen";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import MobileNav from "./components/MobileNav";
import { FullScreenLoading, Loading } from "./components/PageState";
import Login from "./pages/Login";
import SemVinculo from "./pages/SemVinculo";
import TrocarSenha from "./pages/TrocarSenha";
import { canAccess, SECOES_CONECTADAS } from "./lib/permissions";

const PublicEnrollment = lazy(() => import("./pages/PublicEnrollment"));

// Cada tela é baixada só quando é aberta (carregamento inicial bem menor)
const PAGE_MAP: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  dashboard: lazy(() => import("./pages/Dashboard")),
  athletes: lazy(() => import("./pages/Athletes")),
  classes: lazy(() => import("./pages/Classes")),
  attendance: lazy(() => import("./pages/Attendance")),
  performance: lazy(() => import("./pages/Performance")),
  competitions: lazy(() => import("./pages/Competitions")),
  financial: lazy(() => import("./pages/Financial")),
  evolution: lazy(() => import("./pages/Evolution")),
  ranking: lazy(() => import("./pages/Ranking")),
  nadscore: lazy(() => import("./pages/NadScore")),
  journey: lazy(() => import("./pages/AthleteJourney")),
  scout: lazy(() => import("./pages/NadgolScout")),
  intelligence: lazy(() => import("./pages/NadgolIntelligence")),
  mentality: lazy(() => import("./pages/MentalityDiscipline")),
  radar: lazy(() => import("./pages/TalentRadar")),
  tactical: lazy(() => import("./pages/TacticalBoard")),
  daily: lazy(() => import("./pages/DailyPerformance")),
  mindgame: lazy(() => import("./pages/MindGame")),
  profile: lazy(() => import("./pages/AthleteProfile")),
  notifications: lazy(() => import("./pages/Notifications")),
  chat: lazy(() => import("./pages/Chat")),
  access: lazy(() => import("./pages/Access")),
  settings: lazy(() => import("./pages/Settings")),
  preenrollment: lazy(() => import("./pages/PreEnrollment")),
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, gcTime: 10 * 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});

function AppContent() {
  const { currentUser, isAuthenticated, loading, demo, precisaTrocarSenha, semVinculo, showIntro, setShowIntro, activeSection, setActiveSection, sidebarOpen } = useApp();
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

  // Guarda de rota: URL desconhecida ou fora do perfil volta para o dashboard
  const permitido = !!currentUser && !!PAGE_MAP[activeSection] && canAccess(currentUser.role, activeSection);
  useEffect(() => {
    if (currentUser && !permitido && activeSection !== 'dashboard') setActiveSection('dashboard');
  }, [currentUser, permitido, activeSection, setActiveSection]);

  if (!demo && precisaTrocarSenha) return <TrocarSenha />;
  if (loading) return <FullScreenLoading />;
  if (semVinculo) return <SemVinculo />;
  if (!isAuthenticated) return <Login />;

  if (showIntro && !introComplete) {
    return (
      <IntroScreen
        role={currentUser!.role}
        name={currentUser!.name}
        onComplete={() => { setIntroComplete(true); setShowIntro(false); }}
      />
    );
  }

  const PageComponent = permitido ? PAGE_MAP[activeSection] : PAGE_MAP.dashboard;
  const sidebarWidth = isDesktop ? (sidebarOpen ? 240 : 64) : 0;
  const dadosDeExemplo = !demo && !SECOES_CONECTADAS.has(permitido ? activeSection : 'dashboard');

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
        {dadosDeExemplo && (
          <div role="note" style={{ padding: '8px 24px', background: 'rgba(234,179,8,0.08)', borderBottom: '1px solid rgba(234,179,8,0.25)', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#EAB308', letterSpacing: '0.5px' }}>
            Esta tela ainda mostra dados de exemplo. A ligação com os dados reais da escolinha está em construção.
          </div>
        )}
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: isDesktop ? '0' : '104px' }}>
          <ErrorBoundary key={activeSection}>
            <Suspense fallback={<div style={{ padding: '24px' }}><Loading /></div>}>
              <PageComponent />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

/** Detecta se estamos no subdomínio público de cadastro */
function isCadastroSubdomain(): boolean {
  const host = window.location.hostname;
  return host.startsWith('cadastro.');
}

function App() {
  const isCadastro = isCadastroSubdomain();

  if (isCadastro) {
    return (
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark">
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Suspense fallback={<FullScreenLoading />}>
                <PublicEnrollment />
              </Suspense>
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <AppContent />
            </TooltipProvider>
          </AppProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
