'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Vehicle {
  id: number;
  type: 'CAR' | 'MOTORBIKE';
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  images?: string[];
  createdAt: string;
  owner: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    whatsapp: string | null;
  };
}

export default function PendingVehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingVehicles();
  }, []);

  const fetchPendingVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/vehicles/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/dashboard');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setVehicles(data.vehicles);
      } else {
        toast.error(data.error || 'Failed to fetch pending vehicles');
      }
    } catch (error) {
      console.error('Error fetching pending vehicles:', error);
      toast.error('An error occurred while fetching pending vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (vehicleId: number) => {
    await handleStatusUpdate(vehicleId, 'APPROVED');
  };

  const handleReject = async (vehicleId: number) => {
    await handleStatusUpdate(vehicleId, 'REJECTED');
  };

  const handleStatusUpdate = async (vehicleId: number, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(vehicleId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Vehicle ${status.toLowerCase()} successfully`);
        // Remove the vehicle from the list
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      } else {
        toast.error(data.error || `Failed to ${status.toLowerCase()} vehicle`);
      }
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing vehicle:`, error);
      toast.error(`An error occurred while ${status.toLowerCase()}ing the vehicle`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Vehicle Approvals</h1>
            <p className="text-gray-600 mt-2">
              Review and approve or reject vehicle submissions from users
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Vehicles</h3>
            <p className="text-gray-600">All vehicle submissions have been reviewed.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {vehicle.images && vehicle.images.length > 0 ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                              src={vehicle.images[0]}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center mr-4">
                              <span className="text-gray-500 text-xs">
                                {vehicle.type === 'CAR' ? '🚗' : '🏍️'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.brand} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.year} • {vehicle.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.owner.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.owner.email}
                          </div>
                          {vehicle.owner.phone && (
                            <div className="text-sm text-gray-500">
                              📞 {vehicle.owner.phone}
                            </div>
                          )}
                          {vehicle.owner.whatsapp && (
                            <div className="text-sm text-gray-500">
                              💬 {vehicle.owner.whatsapp}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ETB {vehicle.pricePerDay.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(vehicle.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(vehicle.id)}
                            disabled={processingId === vehicle.id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {processingId === vehicle.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(vehicle.id)}
                            disabled={processingId === vehicle.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {processingId === vehicle.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 