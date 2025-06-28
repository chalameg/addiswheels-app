"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaHeart,
  FaRegHeart,
  FaCar
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

interface SavedVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: "CAR" | "MOTORBIKE";
  pricePerDay: number;
  images?: string[];
  available: boolean;
  owner?: {
    name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
}

export default function DashboardPage() {
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchSavedVehicles();
  }, [router]);

  const fetchSavedVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/vehicles/saved", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedVehicles(data.vehicles || []);
      } else {
        console.error("Failed to fetch saved vehicles");
        setSavedVehicles([]);
      }
    } catch (error) {
      console.error("Error fetching saved vehicles:", error);
      setSavedVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVehicle = async (vehicleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to save vehicles");
      return;
    }

    const isCurrentlySaved = savedVehicles.some(v => v.id === vehicleId);
    setSavingStates(prev => ({ ...prev, [vehicleId]: true }));

    try {
      if (isCurrentlySaved) {
        // Unsave vehicle
        const response = await fetch(`/api/vehicles/save?vehicleId=${vehicleId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setSavedVehicles(prev => prev.filter(v => v.id !== vehicleId));
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
            // Vehicle was already saved, refresh the list to show updated state
            fetchSavedVehicles();
            toast.success(data.message);
          } else {
            // Vehicle was newly saved, refresh the list
            fetchSavedVehicles();
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
      setSavingStates(prev => ({ ...prev, [vehicleId]: false }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your saved vehicles...</p>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your saved vehicles and account</p>
        </div>

        {savedVehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved vehicles yet</h3>
            <p className="text-gray-600 mb-6">Start exploring vehicles and save your favorites to see them here.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Vehicles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FaCar className="text-4xl text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={(e) => handleSaveVehicle(vehicle.id, e)}
                    disabled={savingStates[vehicle.id]}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {savingStates[vehicle.id] ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    ) : savedVehicles.some(v => v.id === vehicle.id) ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-gray-600 text-lg hover:text-red-500" />
                    )}
                  </button>
                  {vehicle.images && vehicle.images.length > 1 && (
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      +{vehicle.images.length - 1} more
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {vehicle.year} • {vehicle.type}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaCar className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600 ml-1 text-sm">/day</span>
                    </div>
                    <Link
                      href={`/vehicles/${vehicle.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 