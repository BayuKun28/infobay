import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicPortfolio from './pages/PublicPortfolio';
import AdminPage from './pages/AdminPage';
import ResumePage from './pages/ResumePage';
import ErrorBoundary from './components/common/ErrorBoundary';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<PublicPortfolio />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/cv" element={<ResumePage />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
