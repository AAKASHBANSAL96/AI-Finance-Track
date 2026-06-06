import { FormEvent, useState } from 'react';
import { uploadStatement } from '../services/statement';

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return setError('Select a PDF document first.');
    try {
      setError('');
      setMessage('Uploading and processing statement...');
      await uploadStatement(file);
      setMessage('Upload successful. Review transactions after the import completes.');
    } catch (err) {
      setError('Upload failed. Please try again with a valid PDF.');
      setMessage('');
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-3xl font-semibold">Upload Bank Statement</h1>
      <p className="mb-4 text-sm text-slate-500">Upload PDF statement files from any bank. The platform extracts transactions locally and protects sensitive data.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Statement PDF</span>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <button type="submit" className="rounded-md bg-slate-900 px-5 py-3 text-white hover:bg-slate-800">
          Upload Statement
        </button>
      </form>
      {message && <p className="mt-4 rounded-md bg-emerald-100 p-3 text-emerald-800">{message}</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-3 text-red-700">{error}</p>}
    </div>
  );
};

export default UploadPage;
