"use client";
import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-700 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 mb-4">
              Welcome to AddisWheels. By using our platform, you agree to these Terms of Service. Please read them carefully.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using AddisWheels, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. User Accounts</h2>
            <p className="text-gray-700 mb-4">When creating an account, you must:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be at least 18 years old</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Vehicle Listings</h2>
            <p className="text-gray-700 mb-4">Vehicle owners must:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Provide accurate vehicle information</li>
              <li>Upload clear, recent photos</li>
              <li>Set fair and competitive prices</li>
              <li>Maintain vehicles in good condition</li>
              <li>Respond promptly to rental requests</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Rental Process</h2>
            <p className="text-gray-700 mb-4">Renters must:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Have a valid driver's license</li>
              <li>Be at least 18 years old</li>
              <li>Provide accurate contact information</li>
              <li>Return vehicles on time and in good condition</li>
              <li>Follow all traffic laws and safety guidelines</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Payment Terms</h2>
            <p className="text-gray-700 mb-4">
              All payments are processed securely through our platform. Prices are listed in Ethiopian Birr (ETB) and include applicable taxes.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Use the platform for illegal purposes</li>
              <li>Harass or discriminate against other users</li>
              <li>Provide false or misleading information</li>
              <li>Attempt to circumvent our security measures</li>
              <li>Use vehicles for unauthorized purposes</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Liability and Insurance</h2>
            <p className="text-gray-700 mb-4">
              AddisWheels acts as a platform connecting vehicle owners and renters. We are not responsible for accidents, damages, or disputes between users. All users should have appropriate insurance coverage.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account at any time for violations of these terms or for any other reason at our discretion.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We may update these terms from time to time. Continued use of the platform constitutes acceptance of any changes.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these terms, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-medium">AddisWheels</p>
              <p className="text-gray-700">Email: legal@addiswheels.com</p>
              <p className="text-gray-700">Phone: +251 900 000 000</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 