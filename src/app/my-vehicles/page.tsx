'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaEdit, FaSave, FaTimes, FaCar, FaMotorcycle, FaPlus } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import PriceDisplay from '@/components/PriceDisplay';
import ConfirmationModal from '@/components/ConfirmationModal';
import Link from 'next/link';

interface Vehicle {
  id: number;
  type: 'CAR' | 'MOTORBIKE';
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  image?: string;
  available: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  images?: string[];
}

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vehicle>>({});
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchMyVehicles();
  }, [router]);

  const fetchMyVehicles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vehicles/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
      } else {
        toast.error('Failed to fetch your vehicles');
      }
    } catch (e) {
      toast.error('Error fetching vehicles');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (vehicle: Vehicle) => {
    setEditId(vehicle.id);
    setEditForm({ ...vehicle });
    setEditImages(vehicle.images || []);
    setEditImageFiles([]);
    setEditImagePreviews([]);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const handleEditImageRemove = (idx: number) => {
    setEditImages((imgs) => imgs.filter((_, i) => i !== idx));
  };

  const handleEditImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (editImages.length + files.length > 4) {
      toast.error('You can only have up to 4 images.');
      return;
    }
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'bikerent_unsigned');
        
        const res = await fetch('https://api.cloudinary.com/v1_1/do394twgw/image/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await res.json();
        if (res.ok && data.secure_url) {
          setEditImages((imgs) => [...imgs, data.secure_url]);
        } else {
          console.error('Upload failed:', data);
          toast.error(`Image upload failed: ${data.error?.message || data.error || 'Unknown error'}`);
        }
      }
    } catch (err) {
      toast.error('Image upload error');
    }
  };

  const saveEdit = async () => {
    if (!editId) return;
    if (editImages.length < 2) {
      toast.error('At least 2 images are required.');
      return;
    }
    if (editImages.length > 4) {
      toast.error('You can only have up to 4 images.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicles/${editId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          brand: editForm.brand,
          model: editForm.model,
          year: Number(editForm.year),
          pricePerDay: Number(editForm.pricePerDay),
          images: editImages,
          available: editForm.available,
        }),
      });
      if (res.ok) {
        toast.success('Vehicle updated');
        setEditId(null);
        fetchMyVehicles();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update vehicle');
      }
    } catch (e) {
      toast.error('Error updating vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    setVehicleToDelete(vehicles.find(v => v.id === vehicleId) || null);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicles/${vehicleToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        toast.success('Vehicle deleted successfully');
        setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete.id));
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete vehicle');
      }
    } catch (e) {
      toast.error('Error deleting vehicle');
    } finally {
      setVehicleToDelete(null);
      setShowConfirmation(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your vehicles...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#374151',
            color: '#fff',
            fontWeight: '500',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Vehicles</h1>
            <p className="text-gray-600">Manage your vehicle listings</p>
          </div>
          <Link
            href="/vehicles/create"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Add New Vehicle
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first vehicle for rental</p>
            <Link
              href="/vehicles/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Your First Vehicle
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="flex-shrink-0">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <div className="relative">
                        <img src={vehicle.images[0]} alt={vehicle.model} className="w-24 h-24 object-cover rounded-lg" />
                        {vehicle.images.length > 1 && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                            +{vehicle.images.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-lg">
                        {vehicle.type === 'CAR' ? <FaCar className="text-3xl text-gray-400" /> : <FaMotorcycle className="text-3xl text-gray-400" />}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 w-full">
                    {editId === vehicle.id ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                              Brand *
                            </label>
                            <input
                              id="brand"
                              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                              name="brand"
                              value={editForm.brand || ''}
                              onChange={handleEditChange}
                              placeholder="e.g., Toyota, Honda"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                              Model *
                            </label>
                            <input
                              id="model"
                              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                              name="model"
                              value={editForm.model || ''}
                              onChange={handleEditChange}
                              placeholder="e.g., Camry, Civic"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                              Year *
                            </label>
                            <input
                              id="year"
                              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                              name="year"
                              type="number"
                              value={editForm.year || ''}
                              onChange={handleEditChange}
                              min="1900"
                              max={new Date().getFullYear() + 1}
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700 mb-2">
                              Price per Day (ETB) *
                            </label>
                            <input
                              id="pricePerDay"
                              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                              name="pricePerDay"
                              type="number"
                              value={editForm.pricePerDay || ''}
                              onChange={handleEditChange}
                              min="1"
                              step="0.01"
                              placeholder="e.g., 50.00"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                            Vehicle Images * (2-4 images required)
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {editImages.map((img, idx) => (
                              <div key={idx} className="relative">
                                <img src={img} alt={`Image ${idx + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                                <button
                                  onClick={() => handleEditImageRemove(idx)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                                {idx === 0 && (
                                  <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                                    Main
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                          {editImages.length < 4 && (
                            <input
                              id="images"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleEditImageAdd}
                              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                            />
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            Upload 2-4 high-quality images of your vehicle. First image will be the main display image.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4 pt-4">
                          <button
                            onClick={saveEdit}
                            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            <FaSave className="w-4 h-4 inline mr-2" />
                            Save Changes
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                          >
                            <FaTimes className="w-4 h-4 inline mr-2" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</h3>
                            <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              vehicle.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              vehicle.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {vehicle.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              vehicle.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {vehicle.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <PriceDisplay etbPrice={vehicle.pricePerDay} size="medium" />
                            <span className="text-gray-700 ml-1 font-medium">/day</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(vehicle)}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              <FaEdit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showConfirmation && vehicleToDelete && (
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setVehicleToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Confirm Vehicle Deletion"
          message={`Are you sure you want to delete the vehicle "${vehicleToDelete.brand} ${vehicleToDelete.model}"? This action cannot be undone.`}
          confirmText="Delete Vehicle"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </DashboardLayout>
  );
} 