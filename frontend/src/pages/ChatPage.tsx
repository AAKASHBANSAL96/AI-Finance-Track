import { FormEvent, useState } from 'react';
import { sendChatPrompt } from '../services/chat';

const ChatPage = () => {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (event: FormEvent) => {
    event.preventDefault();
    if (!prompt) return;
    setLoading(true);
    const reply = await sendChatPrompt(prompt);
    setAnswer(reply);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Financial AI Assistant</h1>
        <p className="mt-2 text-sm text-slate-500">Ask questions about your spending, savings, subscriptions, and budget recommendations.</p>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <form onSubmit={handleAsk} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Question</span>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="mt-2 w-full" />
          </label>
          <button type="submit" disabled={loading} className="rounded-md bg-slate-900 px-5 py-3 text-white hover:bg-slate-800">
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>
      </div>
      {answer && (
        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-lg font-semibold">Response</h2>
          <p className="mt-4 whitespace-pre-line text-slate-100">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
