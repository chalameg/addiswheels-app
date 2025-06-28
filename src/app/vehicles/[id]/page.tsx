"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaExclamationTriangle, FaHeart, FaRegHeart } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import PriceDisplay from "@/components/PriceDisplay";
import ChatModal from "@/components/ChatModal";
import ImageGallery from "@/components/ImageGallery";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: "CAR" | "MOTORBIKE";
  pricePerDay: number;
  images?: string[];
  available: boolean;
  owner?: {
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
}

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params?.id as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setIsAdmin(payload.role === "admin");
          setCurrentUserId(payload.userId);
        } catch {
          setIsAdmin(false);
          setCurrentUserId(null);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setCurrentUserId(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!vehicleId) return;
    fetch(`/api/vehicles/${vehicleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vehicles && data.vehicles.length > 0) {
          setVehicle(data.vehicles[0]);
        }
        setLoading(false);
      });
  }, [vehicleId]);

  // Check if vehicle is saved when logged in
  useEffect(() => {
    if (isLoggedIn && vehicleId) {
      checkSavedStatus();
    }
  }, [isLoggedIn, vehicleId]);

  const checkSavedStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/vehicles/saved", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const isVehicleSaved = data.vehicles.some((v: Vehicle) => v.id === vehicleId);
        setIsSaved(isVehicleSaved);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSaveVehicle = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to save vehicles");
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      if (isSaved) {
        // Unsave vehicle
        const response = await fetch(`/api/vehicles/save?vehicleId=${vehicleId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsSaved(false);
          toast.success("Vehicle removed from saved list");
        } else {
          toast.error("Failed to remove vehicle from saved list");
        }
      } else {
        // Save vehicle
        const response = await fetch("/api/vehicles/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ vehicleId }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.alreadySaved) {
            // Vehicle was already saved, update the UI state
            setIsSaved(true);
            toast.success(data.message);
          } else {
            // Vehicle was newly saved
            setIsSaved(true);
            toast.success("Vehicle saved successfully");
          }
        } else {
          toast.error(data.error || "Failed to save vehicle");
        }
      }
    } catch (error) {
      console.error("Error saving/unsaving vehicle:", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-700 mb-4">The vehicle you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#374151',
            color: '#fff',
            fontWeight: '500',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <Link href="/vehicles" className="hover:text-blue-600 transition-colors">
                  Vehicles
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li className="text-gray-900 font-medium">
                {vehicle.brand} {vehicle.model}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Vehicle Images */}
            <div className="space-y-6">
              <ImageGallery 
                images={vehicle.images || []} 
                vehicleName={`${vehicle.brand} ${vehicle.model}`}
              />
              
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{vehicle.year}</div>
                    <div className="text-sm text-gray-600">Year</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 capitalize">{vehicle.type}</div>
                    <div className="text-sm text-gray-600">Type</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                      {vehicle.brand} {vehicle.model}
                    </h1>
                    <p className="text-lg text-gray-600">Year: {vehicle.year}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      <PriceDisplay etbPrice={vehicle.pricePerDay} size="large" />
                    </div>
                    <span className="text-gray-500 text-sm">per day</span>
                  </div>
                </div>
                
                {/* Availability Badge */}
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${vehicle.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${vehicle.available ? 'text-green-700' : 'text-red-700'}`}>
                    {vehicle.available ? 'Available for Rent' : 'Currently Rented'}
                  </span>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{vehicle.type}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Brand</p>
                    <p className="font-semibold text-gray-900">{vehicle.brand}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Model</p>
                    <p className="font-semibold text-gray-900">{vehicle.model}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Year</p>
                    <p className="font-semibold text-gray-900">{vehicle.year}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isLoggedIn && currentUserId && vehicle.owner && vehicle.owner.id && currentUserId !== vehicle.owner.id && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  
                  {/* Start Chat Button */}
                  <button
                    onClick={() => setShowChatModal(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Start Chat with Owner</span>
                  </button>
                  
                  {/* Save Vehicle Button */}
                  <button
                    onClick={() => handleSaveVehicle()}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        {isSaved ? (
                          <FaHeart className="text-red-500" />
                        ) : (
                          <FaRegHeart />
                        )}
                        {isSaved ? 'Saved' : 'Save Vehicle'}
                      </>
                    )}
                  </button>
                </div>
              )}

              {!isLoggedIn && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Get Started</h3>
                  <p className="text-gray-600 text-center mb-4">Please log in to book this vehicle or chat with the owner.</p>
                  
                  {/* Chat Button for non-logged in users */}
                  {vehicle.owner && vehicle.owner.name && (
                    <button
                      onClick={() => toast.error("Please log in to chat with the owner")}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mb-3"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Chat with Owner (Login Required)</span>
                    </button>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 text-center"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer Warning */}
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-100 p-2 rounded-lg flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-900 mb-2">Important Disclaimer</h3>
                <p className="text-yellow-800 text-sm leading-relaxed">
                  <strong>AddisWheels is not involved in payment or rental arrangements.</strong> We only provide a platform for vehicle listings. All transactions, payments, and rental agreements are between you and the vehicle owner. Please exercise caution and verify all details before proceeding.
                </p>
              </div>
            </div>
          </div>

          {/* Owner Contact Information */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Contact Owner
            </h2>
            {vehicle.owner && vehicle.owner.name ? (
              <div className="space-y-6">
                {/* Chat Button - Only show if logged in and not the owner */}
                {isLoggedIn && currentUserId && vehicle.owner.id && currentUserId !== vehicle.owner.id && (
                  <button
                    onClick={() => setShowChatModal(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Start Chat with Owner</span>
                  </button>
                )}

                {/* Owner Name */}
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Owner</p>
                    <p className="font-semibold text-gray-900">{vehicle.owner.name}</p>
                  </div>
                </div>

                {/* Phone Number */}
                {vehicle.owner.phone && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <a 
                        href={`tel:${vehicle.owner.phone}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {vehicle.owner.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {vehicle.owner.email && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <a 
                        href={`mailto:${vehicle.owner.email}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {vehicle.owner.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {vehicle.owner.whatsapp && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">WhatsApp</p>
                      <a 
                        href={`https://wa.me/${vehicle.owner.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                      >
                        {vehicle.owner.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                {/* Contact Instructions */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to Contact
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Call or message the owner directly using the contact information above</li>
                    <li>• Discuss rental terms, pricing, and availability</li>
                    <li>• Arrange payment and pickup/delivery details</li>
                    <li>• Always meet in a safe, public location</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-gray-100 p-6 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Owner Information Not Available
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Contact information for this vehicle owner is not currently available. Please check back later or contact AddisWheels support.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Features Card */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vehicle Features
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Well-maintained vehicle</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Competitive daily rate</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Flexible rental terms</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Direct owner communication</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Chat Modal */}
      {showChatModal && currentUserId && vehicle?.owner?.id && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          vehicleId={parseInt(vehicleId)}
          vehicleName={`${vehicle.brand} ${vehicle.model}`}
          otherUserId={vehicle.owner.id}
          otherUserName={vehicle.owner.name || 'Owner'}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
} 