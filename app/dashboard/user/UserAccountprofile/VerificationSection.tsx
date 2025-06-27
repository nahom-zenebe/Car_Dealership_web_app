import { useEffect, useState } from 'react';
import VerificationRequestForm from './VerificationRequestForm';

export default function VerificationSection({ user }: { user: any }) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/verification/status?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setStatus(data.status));
  }, [user?.id]); // Only check on mount or user id change

  if (status === 'pending') {
    return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Your verification request is pending review.</div>;
  }

  // Show the verification button/form only if not pending
  return <VerificationRequestForm user={user} />;
} 