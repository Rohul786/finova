import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { QuickAddModal } from './components/QuickAddModal';
import { DashboardView } from './views/DashboardView';
import { PersonalFinanceView } from './views/PersonalFinanceView';
import { TransactionsView } from './views/TransactionsView';
import { GoalsView } from './views/GoalsView';
import { RiskAssessmentView } from './views/RiskAssessmentView';
import { AIInvestmentPlannerView } from './views/AIInvestmentPlannerView';
import { SimulatorView } from './views/SimulatorView';
import { WhatIfView } from './views/WhatIfView';
import { AnalyticsView } from './views/AnalyticsView';
import { AICoPilotView } from './views/AICoPilotView';
import { SettingsView } from './views/SettingsView';
import { LoginView } from './views/LoginView';
import { AuthenticateView } from './views/AuthenticateView';

const MainAppContent: React.FC = () => {
  const { activeTab, userProfile } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Strict Authentication Wall: Without login, no user can access any app options
  if (!userProfile.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] text-[#e5e7eb] flex flex-col font-sans selection:bg-amber-500 selection:text-black">
        <LoginView />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'authenticate':
        return <AuthenticateView />;
      case 'personal_finance':
        return <PersonalFinanceView />;
      case 'transactions':
        return <TransactionsView />;
      case 'goals':
        return <GoalsView />;
      case 'risk_assessment':
        return <RiskAssessmentView />;
      case 'ai_planner':
        return <AIInvestmentPlannerView />;
      case 'simulator':
        return <SimulatorView />;
      case 'what_if':
        return <WhatIfView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'ai_copilot':
        return <AICoPilotView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#e5e7eb] flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        isSidebarOpen={isMobileNavOpen}
        onToggleSidebar={() => setIsMobileNavOpen(!isMobileNavOpen)}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={isMobileNavOpen}
          isOpenMobile={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-full overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
