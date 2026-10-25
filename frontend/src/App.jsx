import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicPortfolio from './pages/PublicPortfolio';
import AdminPage from './pages/AdminPage';
import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<PublicPortfolio />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
