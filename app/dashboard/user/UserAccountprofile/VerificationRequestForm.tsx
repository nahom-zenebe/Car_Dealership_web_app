import { useState } from 'react';
import axios from 'axios';

export default function VerificationRequestForm({ user }) {
  const [form, setForm] = useState({ name: user?.name || '', address: '', idType: '', idFront: '', idBack: '' });
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileUpload = async (e, field) => {
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'YOUR_CLOUDINARY_PRESET');
    const res = await axios.post('https://api.cloudinary.com/v1_1/YOUR_CLOUDINARY_CLOUD_NAME/image/upload', formData);
    setForm(f => ({ ...f, [field]: res.data.secure_url }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/verification/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSubmitted(true);
  };

  if (submitted) return <div className="p-4 text-green-700">Verification request submitted!</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" required className="border p-2 rounded w-full" />
      <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" required className="border p-2 rounded w-full" />
      <input value={form.idType} onChange={e => setForm(f => ({ ...f, idType: e.target.value }))} placeholder="ID Type" required className="border p-2 rounded w-full" />
      <div>
        <label>ID Front:</label>
        <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'idFront')} required className="block mt-1" />
        {form.idFront && <img src={form.idFront} alt="ID Front" className="h-16 mt-2" />}
      </div>
      <div>
        <label>ID Back:</label>
        <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'idBack')} required className="block mt-1" />
        {form.idBack && <img src={form.idBack} alt="ID Back" className="h-16 mt-2" />}
      </div>
      <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded">Submit Verification</button>
    </form>
  );
} 