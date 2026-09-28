import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ArchitectureModal } from './components/common/ArchitectureModal';

import { HomePage } from './pages/HomePage';
import { LostItemsPage } from './pages/LostItemsPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { ReportLostPage } from './pages/ReportLostPage';
import { ReportFoundPage } from './pages/ReportFoundPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { MyClaimsPage } from './pages/MyClaimsPage';
import { PossibleMatchesPage } from './pages/PossibleMatchesPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminItemsPage } from './pages/AdminItemsPage';
import { AdminClaimsPage } from './pages/AdminClaimsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';

function MainApp() {
  const { login } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  const handleQuickLogin = async (email, password) => {
    try {
      await login(email, password);
      setCurrentView('home');
    } catch (err) {
      alert('Quick login failed: ' + err.message);
    }
  };

  const handleViewDetails = (id) => {
    setSelectedItemId(id);
    setCurrentView('item-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openArchModal={() => setIsArchModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
            openArchModal={() => setIsArchModalOpen(true)}
          />
        )}

        {currentView === 'lost-items' && (
          <LostItemsPage
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
          />
        )}

        {currentView === 'found-items' && (
          <FoundItemsPage
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
          />
        )}

        {currentView === 'item-details' && (
          <ItemDetailsPage
            itemId={selectedItemId}
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
          />
        )}

        {currentView === 'report-lost' && (
          <ReportLostPage
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
          />
        )}

        {currentView === 'report-found' && (
          <ReportFoundPage
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
          />
        )}

        {currentView === 'my-reports' && (
          <MyReportsPage
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
          />
        )}

        {currentView === 'my-claims' && (
          <MyClaimsPage
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
          />
        )}

        {currentView === 'matches' && (
          <PossibleMatchesPage
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage setCurrentView={setCurrentView} />
        )}

        {currentView === 'login' && (
          <LoginPage
            setCurrentView={setCurrentView}
            openArchModal={() => setIsArchModalOpen(true)}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage setCurrentView={setCurrentView} />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboardPage
            setCurrentView={setCurrentView}
            openArchModal={() => setIsArchModalOpen(true)}
          />
        )}

        {currentView === 'admin-items' && (
          <AdminItemsPage
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
          />
        )}

        {currentView === 'admin-claims' && (
          <AdminClaimsPage
            setCurrentView={setCurrentView}
            setSelectedItemId={handleViewDetails}
          />
        )}

        {currentView === 'admin-users' && (
          <AdminUsersPage />
        )}
      </main>

      {/* University Footer */}
      <Footer openArchModal={() => setIsArchModalOpen(true)} />

      {/* Viva / Architecture Inspector Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
        onQuickLogin={handleQuickLogin}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
