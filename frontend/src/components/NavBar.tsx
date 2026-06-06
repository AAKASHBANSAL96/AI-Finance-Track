import { Link, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface NavBarProps {
  authenticated: boolean;
}

const NavBar = ({ authenticated }: NavBarProps) => {
  const [token, setToken] = useLocalStorage('finance-ai-copilot-token', '');
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken('');
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-semibold text-slate-900">
          Finance AI Copilot
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          {authenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/upload">Upload</Link>
              <Link to="/transactions">Transactions</Link>
              <Link to="/chat">AI Assistant</Link>
              <Link to="/insights">Insights</Link>
              <button onClick={handleLogout} className="rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-800">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-800">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
