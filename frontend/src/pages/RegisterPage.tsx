import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth';
import { setAuthToken } from '../services/api';
import { useLocalStorage } from '../hooks/useLocalStorage';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setToken] = useLocalStorage('finance-ai-copilot-token', '');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { token } = await registerUser(name, email, password);
      setToken(token);
      setAuthToken(token);
      // Small delay to ensure token is in localStorage before redirect
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-3xl font-semibold">Create account</h1>
      {error && <p className="mb-4 rounded-md bg-red-100 p-3 text-red-700">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-2 w-full" />
        </label>
        <label className="block">
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full" />
        </label>
        <label className="block">
          <span>Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-2 w-full" />
        </label>
        <button type="submit" disabled={loading} className="w-full rounded-md bg-slate-900 px-4 py-3 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
