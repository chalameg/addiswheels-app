"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import VehicleCard from "@/components/VehicleCard";

interface Vehicle {
  id: number;
  type: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  images?: string[];
  featured?: boolean;
}

function VehicleSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-1" />
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
        <div className="h-6 bg-gray-100 rounded w-1/4 mt-auto" />
      </div>
    </div>
  );
}

export default function HomePageClient() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedVehicles, setSavedVehicles] = useState<Set<number>>(new Set());
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});

  const fetchFeaturedVehicles = () => {
    setLoading(true);
    fetch('/api/vehicles?limit=4&status=APPROVED&featured=true')
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data.vehicles || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching featured vehicles:", error);
        setLoading(false);
      });
  };

  const fetchSavedVehicles = async () => {
    if (!isLoggedIn) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/vehicles/saved", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const savedIds = new Set(Array.from(data.vehicles, (v: any) => Number(v.id)));
        setSavedVehicles(savedIds);
      }
    } catch (error) {
      console.error("Error fetching saved vehicles:", error);
    }
  };

  const handleSaveVehicle = async (vehicleId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error("Please log in to save vehicles");
      return;
    }

    setSavingStates(prev => ({ ...prev, [vehicleId]: true }));
    const token = localStorage.getItem("token");

    try {
      const isCurrentlySaved = savedVehicles.has(vehicleId);
      
      if (isCurrentlySaved) {
        // Unsave vehicle
        const response = await fetch(`/api/vehicles/save?vehicleId=${vehicleId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setSavedVehicles(prev => {
            const newSet = new Set(prev);
            newSet.delete(vehicleId);
            return newSet;
          });
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
            setSavedVehicles(prev => new Set([...prev, vehicleId]));
            toast.success(data.message);
          } else {
            setSavedVehicles(prev => new Set([...prev, vehicleId]));
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

  useEffect(() => {
    fetchFeaturedVehicles();
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setIsAdmin(payload.role === "admin");
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedVehicles();
    }
  }, [isLoggedIn]);

  return (
    <>
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
      
      {/* Featured Vehicles Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Vehicles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium vehicles available for rent
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <VehicleSkeleton key={i} />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No featured vehicles available</h3>
            <p className="text-gray-600 mb-6">Check back soon for our latest featured vehicles</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSaved={savedVehicles.has(vehicle.id)}
                  onSave={handleSaveVehicle}
                  saving={savingStates[vehicle.id]}
                  showFeaturedBadge={true}
                />
              ))}
            </div>
            
            {/* See All Vehicles Button */}
            <div className="text-center mt-12">
              <Link
                href="/vehicles"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="text-xl">🚗</span>
                <span>See All Vehicles</span>
              </Link>
            </div>
          </>
        )}
      </section>
    </>
  );
} 