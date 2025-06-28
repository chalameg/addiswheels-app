"use client";
import React from "react";
import Link from "next/link";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
          <p className="text-gray-700 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 mb-4">
              This Cookie Policy explains how AddisWheels uses cookies and similar technologies to recognize you when you visit our platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are stored on your device when you visit a website. They help us provide you with a better experience and understand how you use our platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Essential Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies are necessary for the platform to function properly. They enable basic functions like page navigation, access to secure areas, and form submissions.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-medium">Examples:</p>
              <ul className="text-gray-700 mt-2 space-y-1">
                <li>• Authentication cookies</li>
                <li>• Session management</li>
                <li>• Security features</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Analytics Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-medium">Examples:</p>
              <ul className="text-gray-700 mt-2 space-y-1">
                <li>• Page views and time spent</li>
                <li>• User journey tracking</li>
                <li>• Performance monitoring</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Preference Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies remember your choices and preferences to provide a more personalized experience.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-medium">Examples:</p>
              <ul className="text-gray-700 mt-2 space-y-1">
                <li>• Language preferences</li>
                <li>• Currency settings</li>
                <li>• Saved searches</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Marketing Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies are used to track visitors across websites to display relevant advertisements.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-medium">Examples:</p>
              <ul className="text-gray-700 mt-2 space-y-1">
                <li>• Ad targeting</li>
                <li>• Campaign tracking</li>
                <li>• Social media integration</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of our platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              We may use third-party services that set their own cookies. These services include:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Google Analytics for website analytics</li>
              <li>Payment processors for secure transactions</li>
              <li>Social media platforms for sharing features</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Choices</h2>
            <p className="text-gray-700 mb-4">
              You can opt out of certain cookies by:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Adjusting your browser settings</li>
              <li>Using our cookie consent banner</li>
              <li>Contacting us directly</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Useful Links</h2>
            <p className="text-gray-700 mb-4">
              To learn more about cookies and how to manage them:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:text-blue-700">Google Analytics Opt-out</a></li>
              <li><a href="https://www.youronlinechoices.com/" className="text-blue-600 hover:text-blue-700">Your Online Choices</a></li>
              <li><a href="https://optout.networkadvertising.org/" className="text-blue-600 hover:text-blue-700">Network Advertising Initiative</a></li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time. Please check back periodically for any changes.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-medium">AddisWheels</p>
              <p className="text-gray-700">Email: privacy@addiswheels.com</p>
              <p className="text-gray-700">Phone: +251 900 000 000</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 