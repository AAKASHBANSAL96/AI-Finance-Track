import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { setAuthToken } from './services/api';
import { useLocalStorage } from './hooks/useLocalStorage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import TransactionsPage from './pages/TransactionsPage';
import ChatPage from './pages/ChatPage';
import InsightsPage from './pages/InsightsPage';
import NavBar from './components/NavBar';

function App() {
  const [token] = useLocalStorage('finance-ai-copilot-token', '');
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    setAuthToken(token || null);
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <NavBar authenticated={isAuthenticated} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/upload" element={isAuthenticated ? <UploadPage /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={isAuthenticated ? <TransactionsPage /> : <Navigate to="/login" />} />
          <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />
          <Route path="/insights" element={isAuthenticated ? <InsightsPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
