'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import PaymentModal from '@/components/PaymentModal';
import SubscriptionModal from '@/components/SubscriptionModal';
import PaymentChoiceModal from '@/components/PaymentChoiceModal';

export default function CreateVehiclePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [listingLimitInfo, setListingLimitInfo] = useState<{ current: number; allowed: number } | null>(null);
  const [formData, setFormData] = useState({
    type: 'CAR',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    pricePerDay: '',
    images: [] as string[],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const checkVerification = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (response.ok && data.user) {
          if (!data.user.isVerified) {
            toast.error('Account verification required to list vehicles');
            router.push('/verify');
            return;
          }
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error checking verification:', error);
        router.push('/login');
        return;
      } finally {
        setIsCheckingVerification(false);
      }
    };

    checkVerification();
  }, [router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).slice(0, 4) : [];
    setImageFiles(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
    if (files.length > 0) {
      setIsLoading(true);
      try {
        const uploadedUrls: string[] = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'bikerent_unsigned'); // Use your custom preset
          
          const res = await fetch('https://api.cloudinary.com/v1_1/do394twgw/image/upload', {
            method: 'POST',
            body: formData,
          });
          
          const data = await res.json();
          if (res.ok && data.secure_url) {
            uploadedUrls.push(data.secure_url);
          } else {
            console.error('Upload failed:', data);
            toast.error(`Image upload failed: ${data.error?.message || data.error || 'Unknown error'}`);
          }
        }
        setFormData(prev => ({ ...prev, images: uploadedUrls }));
      } catch (err) {
        toast.error('Image upload error');
      } finally {
        setIsLoading(false);
      }
    } else {
      setFormData(prev => ({ ...prev, images: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate image count
    if (formData.images.length < 2) {
      toast.error('At least 2 images are required');
      return;
    }
    if (formData.images.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }
    
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to create a vehicle');
        router.push('/login');
        return;
      }

      const requestData = {
        ...formData,
        year: parseInt(formData.year.toString()),
        pricePerDay: parseFloat(formData.pricePerDay),
      };

      const response = await fetch('/api/vehicles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Vehicle created successfully! It will be reviewed by an admin.');
        router.push('/dashboard');
      } else if (data.requiresPayment) {
        setListingLimitInfo({ current: data.current, allowed: data.allowed });
        if (data.allowsSubscription) {
          setShowChoiceModal(true);
        } else {
          setShowPaymentModal(true);
        }
      } else {
        toast.error(data.error || 'Failed to create vehicle');
      }
    } catch (error) {
      toast.error('An error occurred while creating the vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
      
      {showPaymentModal && listingLimitInfo && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            toast.success('Payment submitted! You will be able to add more vehicles once approved.');
          }}
          currentListings={listingLimitInfo.current}
          allowedListings={listingLimitInfo.allowed}
        />
      )}
      
      {showSubscriptionModal && listingLimitInfo && (
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={() => {
            toast.success('Subscription submitted! You will have unlimited listings once approved.');
          }}
          currentListings={listingLimitInfo.current}
          allowedListings={listingLimitInfo.allowed}
        />
      )}
      
      {showChoiceModal && listingLimitInfo && (
        <PaymentChoiceModal
          isOpen={showChoiceModal}
          onClose={() => setShowChoiceModal(false)}
          onChoosePayment={() => {
            setShowChoiceModal(false);
            setShowPaymentModal(true);
          }}
          onChooseSubscription={() => {
            setShowChoiceModal(false);
            setShowSubscriptionModal(true);
          }}
          currentListings={listingLimitInfo.current}
          allowedListings={listingLimitInfo.allowed}
        />
      )}
      
      {isCheckingVerification ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking verification status...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Vehicle</h1>
            <p className="text-gray-600">Create a new vehicle listing for rental</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="CAR">Car</option>
                    <option value="MOTORBIKE">Motorbike</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Toyota, Honda, Yamaha"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Corolla, Civic, MT-15"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    placeholder="e.g., 2020"
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Day (ETB) *
                </label>
                <input
                  type="number"
                  id="pricePerDay"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g., 1500"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Images *
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload multiple images (JPG, PNG, WebP). First image will be the main display image.
                </p>
              </div>

              {imagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Previews
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-300"
                        />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Vehicle...' : 'Create Vehicle'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/my-vehicles')}
                  className="w-full sm:w-auto border border-gray-300 text-gray-700 px-4 py-3 rounded-md font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 