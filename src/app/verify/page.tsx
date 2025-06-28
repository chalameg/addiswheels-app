'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';

export default function VerifyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data to check verification status
    fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        setUser(data.user);
        if (data.user.isVerified) {
          router.push('/dashboard');
        }
      }
    })
    .catch(err => {
      console.error('Error fetching user data:', err);
    });
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (JPG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setDocumentFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentType || !documentFile) {
      toast.error('Please select document type and upload a file');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to submit verification');
        router.push('/login');
        return;
      }

      // Upload document to Cloudinary
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('upload_preset', 'bikerent_unsigned');
      
      const uploadRes = await fetch('https://api.cloudinary.com/v1_1/do394twgw/image/upload', {
        method: 'POST',
        body: formData,
      });
      
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.error?.message || 'Upload failed');
      }

      // Submit verification request
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentType,
          documentUrl: uploadData.secure_url
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Verification document submitted successfully! It will be reviewed by our team.');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Failed to submit verification');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('An error occurred while submitting verification');
    } finally {
      setIsLoading(false);
    }
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
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Verification Required</h1>
          <p className="text-gray-600">To list vehicles on AddisWheels, we need to verify your identity. Please upload a valid government-issued ID.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="">Select document type</option>
                <option value="NATIONAL_ID">National ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="KEBELE_ID">Kebele ID</option>
              </select>
            </div>

            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document *
              </label>
              <input
                type="file"
                id="document"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Accepted formats: JPG, PNG, GIF. Maximum size: 5MB
              </p>
            </div>

            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Preview
                </label>
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  <img 
                    src={previewUrl} 
                    alt="Document preview" 
                    className="max-w-full h-auto max-h-64 mx-auto rounded-md"
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your document will be securely stored and only used for verification</li>
                <li>• Verification typically takes 1-2 business days</li>
                <li>• You'll receive an email notification once verified</li>
                <li>• Only verified users can list vehicles on AddisWheels</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !documentType || !documentFile}
            >
              {isLoading ? "Submitting..." : "Submit for Verification"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
} 