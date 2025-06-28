'use client';

import { useState } from 'react';
import { FaCrown, FaCreditCard } from 'react-icons/fa';

interface PaymentChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChooseSubscription: () => void;
  onChoosePayment: () => void;
  currentListings: number;
  allowedListings: number;
}

export default function PaymentChoiceModal({ 
  isOpen, 
  onClose, 
  onChooseSubscription, 
  onChoosePayment,
  currentListings, 
  allowedListings 
}: PaymentChoiceModalProps) {
  const listingsNeeded = Math.max(1, currentListings - allowedListings + 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Option</h2>
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
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Current Status</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Current listings: {currentListings}</p>
                <p>• Free listings allowed: {allowedListings}</p>
                <p>• Additional listings needed: {listingsNeeded}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* One-Time Payment Option */}
            <div className="border-2 border-gray-200 rounded-md p-6 hover:border-blue-300 transition-all cursor-pointer"
                 onClick={onChoosePayment}>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <FaCreditCard className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">One-Time Payment</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {listingsNeeded * 500} ETB
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Pay only for the listings you need
                </p>
                <div className="text-sm text-gray-700 space-y-1 text-left">
                  <p>• {listingsNeeded} additional listing{listingsNeeded > 1 ? 's' : ''}</p>
                  <p>• 500 ETB per listing</p>
                  <p>• One-time payment</p>
                  <p>• No recurring fees</p>
                </div>
                <button className="w-full mt-4 bg-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  Choose One-Time Payment
                </button>
              </div>
            </div>

            {/* Subscription Option */}
            <div className="border-2 border-gray-200 rounded-md p-6 hover:border-purple-300 transition-all cursor-pointer"
                 onClick={onChooseSubscription}>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-purple-100">
                    <FaCrown className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscription</h3>
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  From 1,500 ETB
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Unlimited listings for a period
                </p>
                <div className="text-sm text-gray-700 space-y-1 text-left">
                  <p>• Unlimited vehicle listings</p>
                  <p>• Monthly, Quarterly, or Yearly plans</p>
                  <p>• Priority support</p>
                  <p>• Early access to features</p>
                </div>
                <button className="w-full mt-4 bg-purple-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
                  Choose Subscription
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 