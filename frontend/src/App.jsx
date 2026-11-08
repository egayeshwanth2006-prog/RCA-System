import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import NotificationBanner from './components/NotificationBanner';

import DashboardPage from './pages/DashboardPage';
import NewInvestigationPage from './pages/NewInvestigationPage';
import RcaWorkspacePage from './pages/RcaWorkspacePage';
import CapaManagementPage from './pages/CapaManagementPage';
import ReviewSavePage from './pages/ReviewSavePage';
import InvestigationsListPage from './pages/InvestigationsListPage';
import InvestigationDetailPage from './pages/InvestigationDetailPage';
import SettingsPage from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navbar */}
          <Navbar />

          {/* Dismissible Notification Banner */}
          <NotificationBanner />

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto px-6 py-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/new-investigation" element={<NewInvestigationPage />} />
              <Route path="/rca-workspace" element={<RcaWorkspacePage />} />
              <Route path="/capa-management" element={<CapaManagementPage />} />
              <Route path="/review-save" element={<ReviewSavePage />} />
              <Route path="/investigations" element={<InvestigationsListPage />} />
              <Route path="/investigations/:id" element={<InvestigationDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
