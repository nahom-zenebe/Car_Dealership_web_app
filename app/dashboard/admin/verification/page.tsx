'use client';

import { useState, useEffect } from 'react';
import { FiUserCheck, FiUserX, FiClock, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface VerificationRequest {
  id: string;
  userId: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  createdAt: string;
  updatedAt?: string;
  user: {
    name: string;
    email: string;
    phone: string;
    profilePhotoUrl?: string;
  };
}

export default function VerificationDashboard() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [decisionLoading, setDecisionLoading] = useState<string | null>(null);

  const fetchVerificationRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/verifications', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load verification requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const handleDecision = async (id: string, approved: boolean) => {
    setDecisionLoading(id);
    try {
      const response = await fetch(
        approved ? '/api/verification/approve' : '/api/verification/deny',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to submit decision');
      }
      await fetchVerificationRequests();
      toast.success(`Verification ${approved ? 'approved' : 'denied'} successfully`);
    } catch (error) {
      console.error('Decision error:', error);
      toast.error('Failed to submit decision');
    } finally {
      setDecisionLoading(null);
    }
  };

  const filteredRequests = requests.filter((request: any) =>
    (request.user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (request.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
          <p className="text-gray-600 mt-2">Review and manage user verification requests</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or address..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No matching requests found' : 'No pending verification requests'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((request: any) => (
                <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {request.user.profilePhotoUrl ? (
                        <Image
                          src={request.user.profilePhotoUrl}
                          alt={request.user.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-lg font-medium">
                          {request.user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{request.user.name}</h3>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <FiClock className="mr-1" /> Pending
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Address:</span> {request.address}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Requested:</span> {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-4">
                        <div>
                          <div className="text-xs text-gray-500">ID Front</div>
                          {request.idFrontUrl && (
                            <img src={request.idFrontUrl} alt="ID Front" className="h-24 rounded" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">ID Back</div>
                          {request.idBackUrl && (
                            <img src={request.idBackUrl} alt="ID Back" className="h-24 rounded" />
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={() => handleDecision(request.id, true)}
                          disabled={decisionLoading === request.id}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <FiUserCheck className="mr-2" />
                          {decisionLoading === request.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDecision(request.id, false)}
                          disabled={decisionLoading === request.id}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <FiUserX className="mr-2" />
                          {decisionLoading === request.id ? 'Denying...' : 'Deny'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}