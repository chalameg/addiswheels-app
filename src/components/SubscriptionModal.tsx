'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { config } from '@/utils/config';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentListings: number;
  allowedListings: number;
}

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  currentListings, 
  allowedListings 
}: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [formData, setFormData] = useState({
    paymentMethod: '',
    referenceNumber: '',
    screenshot: null as File | null
  });
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');

  const listingsNeeded = Math.max(1, currentListings - allowedListings + 1);
  const selectedPlanData = config.subscriptionPlans.find(plan => plan.id === selectedPlan);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, screenshot: file }));
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan || !formData.paymentMethod || !formData.referenceNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to submit subscription');
        return;
      }

      // Upload screenshot if provided
      let screenshotUrl = '';
      if (formData.screenshot) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', formData.screenshot);
        formDataUpload.append('upload_preset', 'bikerent_unsigned');
        
        const uploadRes = await fetch('https://api.cloudinary.com/v1_1/do394twgw/image/upload', {
          method: 'POST',
          body: formDataUpload,
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) {
          throw new Error(uploadData.error?.message || 'Screenshot upload failed');
        }
        
        screenshotUrl = uploadData.secure_url;
      }

      // Submit subscription
      const response = await fetch('/api/subscriptions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType: selectedPlan,
          amount: selectedPlanData?.price,
          paymentMethod: formData.paymentMethod,
          referenceNumber: formData.referenceNumber,
          screenshot: screenshotUrl
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Subscription submitted successfully! It will be reviewed by our team.');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to submit subscription');
      }
    } catch (error) {
      console.error('Subscription submission error:', error);
      toast.error('An error occurred while submitting subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Choose Subscription Plan</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Current Status</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Current listings: {currentListings}</p>
                <p>• Free listings allowed: {allowedListings}</p>
                <p>• Additional listings needed: {listingsNeeded}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-2">Subscription Benefits</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>• Unlimited vehicle listings during subscription period</p>
                <p>• No per-listing fees</p>
                <p>• Priority support</p>
                <p>• Early access to new features</p>
              </div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                    <div className="text-2xl font-bold text-blue-600 mt-2">
                      {plan.price} ETB
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {plan.duration} days
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{plan.description}</p>
                    {(plan as any).savings && (
                      <div className="text-sm text-green-600 font-medium mt-2">
                        {(plan as any).savings}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedPlan && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Selected Plan: {selectedPlanData?.name}</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>• Amount: {selectedPlanData?.price} ETB</p>
                  <p>• Duration: {selectedPlanData?.duration} days</p>
                  <p>• Use the provided account details for your selected payment method</p>
                  <p>• Include your payment reference number</p>
                  <p>• Upload a screenshot of your payment confirmation</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  required
                >
                  <option value="">Select payment method</option>
                  {config.paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.paymentMethod && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Details for {config.paymentMethods.find(m => m.value === formData.paymentMethod)?.label}</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    {formData.paymentMethod === 'TELEBIRR' && (
                      <div>
                        <p><strong>Phone Number:</strong> {config.paymentDetails.telebirr.number}</p>
                        <p><strong>Account Name:</strong> {config.paymentDetails.telebirr.name}</p>
                      </div>
                    )}
                    
                    {formData.paymentMethod === 'CBE' && (
                      <div>
                        <p><strong>Account Number:</strong> {config.paymentDetails.cbe.accountNumber}</p>
                        <p><strong>Account Name:</strong> {config.paymentDetails.cbe.accountName}</p>
                        <p><strong>Bank:</strong> {config.paymentDetails.cbe.bankName}</p>
                      </div>
                    )}
                    
                    {formData.paymentMethod === 'AMOLE' && (
                      <div>
                        <p><strong>Phone Number:</strong> {config.paymentDetails.amole.number}</p>
                        <p><strong>Account Name:</strong> {config.paymentDetails.amole.name}</p>
                      </div>
                    )}
                    
                    {formData.paymentMethod === 'BANK_TRANSFER' && (
                      <div>
                        <p><strong>Account Number:</strong> {config.paymentDetails.bankTransfer.accountNumber}</p>
                        <p><strong>Account Name:</strong> {config.paymentDetails.bankTransfer.accountName}</p>
                        <p><strong>Bank:</strong> {config.paymentDetails.bankTransfer.bankName}</p>
                        <p><strong>Branch:</strong> {config.paymentDetails.bankTransfer.branch}</p>
                      </div>
                    )}
                    
                    {formData.paymentMethod === 'CASH' && (
                      <div>
                        <p><strong>Contact:</strong> {config.paymentDetails.contact.phone}</p>
                        <p><strong>Email:</strong> {config.paymentDetails.contact.email}</p>
                        <p>Please contact us to arrange cash payment.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference Number *
                </label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter your payment reference number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Screenshot
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload a screenshot of your payment (optional but recommended)
                </p>
              </div>

              {screenshotPreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Screenshot Preview
                  </label>
                  <div className="border border-gray-300 rounded-md p-2">
                    <img 
                      src={screenshotPreview} 
                      alt="Payment screenshot" 
                      className="max-w-full h-auto max-h-32 mx-auto rounded-md"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit Subscription'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 