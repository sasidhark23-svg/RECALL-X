import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import NewIncidentPage from './pages/NewIncidentPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailsPage from './pages/IncidentDetailsPage';
import MemoryPage from './pages/MemoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DemoModePage from './pages/DemoModePage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0B0F17] text-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/new-incident" element={<NewIncidentPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/incidents/:id" element={<IncidentDetailsPage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/demo-mode" element={<DemoModePage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
