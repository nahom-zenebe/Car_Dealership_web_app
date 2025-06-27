import { useEffect, useState } from 'react';

export default function AdminVerificationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/verification/requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      });
  }, []);

  const handleAction = async (id, action) => {
    await fetch(`/api/verification/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setRequests(reqs => reqs.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Verification Requests</h1>
      {loading ? <div>Loading...</div> : requests.length === 0 ? <div>No pending requests.</div> : (
        requests.map(req => (
          <div key={req.id} className="border p-4 mb-4 rounded-lg bg-white shadow">
            <div><b>Name:</b> {req.name}</div>
            <div><b>Address:</b> {req.address}</div>
            <div><b>ID Type:</b> {req.idType}</div>
            <div className="flex gap-4 mt-2">
              <div>
                <div className="text-xs text-gray-500">ID Front</div>
                <img src={req.idFrontUrl} alt="ID Front" className="h-24 rounded" />
              </div>
              <div>
                <div className="text-xs text-gray-500">ID Back</div>
                <img src={req.idBackUrl} alt="ID Back" className="h-24 rounded" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleAction(req.id, 'approve')} className="bg-green-600 text-white px-4 py-2 rounded">Approve</button>
              <button onClick={() => handleAction(req.id, 'deny')} className="bg-red-600 text-white px-4 py-2 rounded">Deny</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 