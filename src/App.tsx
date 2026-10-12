import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { SportsClubProvider } from './context/SportsClubContext';
import { Navbar } from './components/common/Navbar';
import { MobileNav } from './components/common/MobileNav';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LiveMatchModal } from './components/tournaments/LiveMatchModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SportsPage } from './pages/SportsPage';
import { EventsPage } from './pages/EventsPage';
import { TournamentsPage } from './pages/TournamentsPage';
import { TournamentDetailPage } from './pages/TournamentDetailPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { NewsPage } from './pages/NewsPage';
import { GalleryPage } from './pages/GalleryPage';
import { SelectionTrialsPage } from './pages/SelectionTrialsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { QrScannerPage } from './pages/QrScannerPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Helper to scroll window to top on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Public Student / Campus Layout
const PublicLayout: React.FC = () => {
  const [activeMatchModalId, setActiveMatchModalId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#070A0F] text-[#F5F7FA]">
      <ScrollToTop />

      {/* Main Floating Rounded Header */}
      <Navbar />

      {/* Routes Viewport */}
      <main className="flex-grow pt-2">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sports" element={<SportsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/trials" element={<SelectionTrialsPage />} />
          
          {/* Protected Athlete Profile & Student Portal */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="member">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="member">
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Public Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Match Center Modal */}
      <LiveMatchModal
        matchId={activeMatchModalId}
        onClose={() => setActiveMatchModalId(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SportsClubProvider>
            <Routes>
              {/* Dedicated Login Portal */}
              <Route path="/login" element={<LoginPage />} />

              {/* Dedicated Live QR Scanner Route */}
              <Route
                path="/admin/scan"
                element={
                  <ProtectedRoute requiredRole={['admin', 'coach']}>
                    <QrScannerPage />
                  </ProtectedRoute>
                }
              />

              {/* Dedicated Admin Portal - completely isolated from PublicLayout */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole={['admin', 'coach']}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Public Student & Athletic Portal */}
              <Route path="/*" element={<PublicLayout />} />
            </Routes>
          </SportsClubProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
