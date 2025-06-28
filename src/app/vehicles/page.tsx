"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaSearch, FaFilter } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import VehicleCard from "@/components/VehicleCard";
import PriceDisplay from "@/components/PriceDisplay";

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

const FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Cars", value: "CAR" },
  { label: "Motorbikes", value: "MOTORBIKE" },
];

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

const PAGE_SIZE = 12;

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [prevCursors, setPrevCursors] = useState<number[]>([]);
  const [currentCursor, setCurrentCursor] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedVehicles, setSavedVehicles] = useState<Set<number>>(new Set());
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});
  const [showFilters, setShowFilters] = useState(false);

  // Filter/search state
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const fetchVehicles = (cursor: number | null, filterType: string) => {
    setLoading(true);
    let url = `/api/vehicles?limit=${PAGE_SIZE}&status=APPROVED`;
    if (cursor) url += `&cursor=${cursor}`;
    if (filterType !== "ALL") url += `&type=${filterType}`;
    if (typeFilter !== "ALL") url += `&type=${typeFilter}`;
    if (minPrice) url += `&minPrice=${minPrice}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data.vehicles || []);
        setNextCursor(data.nextCursor || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching vehicles:", error);
        setLoading(false);
      });

    // Fetch total count for page indicator
    let countUrl = `/api/vehicles/count?status=APPROVED`;
    if (filterType !== "ALL") countUrl += `&type=${filterType}`;
    if (typeFilter !== "ALL") countUrl += `${countUrl.includes("?") ? "&" : "?"}type=${typeFilter}`;
    if (minPrice) countUrl += `${countUrl.includes("?") ? "&" : "?"}minPrice=${minPrice}`;
    if (maxPrice) countUrl += `${countUrl.includes("?") ? "&" : "?"}maxPrice=${maxPrice}`;
    
    fetch(countUrl)
      .then((res) => res.json())
      .then((data) => setTotal(data.count || null))
      .catch((error) => console.error("Error fetching count:", error));
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
    setPrevCursors([]);
    setCurrentCursor(null);
    setPage(1);
    fetchVehicles(null, filter);
    
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }
  }, [filter, minPrice, maxPrice, typeFilter]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedVehicles();
    }
  }, [isLoggedIn]);

  const handleNext = () => {
    if (vehicles.length > 0 && nextCursor) {
      setPrevCursors((prev) => [...prev, vehicles[0].id]);
      setCurrentCursor(nextCursor);
      setPage((p) => p + 1);
      fetchVehicles(nextCursor, filter);
    }
  };

  const handlePrev = () => {
    if (prevCursors.length > 0) {
      const prev = [...prevCursors];
      const prevCursor = prev.pop() || null;
      setPrevCursors(prev);
      setCurrentCursor(prevCursor);
      setPage((p) => p - 1);
      fetchVehicles(prevCursor, filter);
    }
  };

  const handleFilter = (value: string) => {
    setFilter(value);
  };

  // Filter vehicles by year and search client-side
  const filteredVehicles = vehicles.filter((v) => {
    if (minYear && v.year < Number(minYear)) return false;
    if (maxYear && v.year > Number(maxYear)) return false;
    if (search && !(`${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const totalPages = total ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : null;

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
      
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              All Vehicles
            </h1>
            <p className="text-lg text-gray-600">
              Browse our complete collection of approved vehicles available for rent
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by brand or model..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="text-gray-600" />
                <span className="text-gray-700 font-medium">Filters</span>
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="ALL">All Types</option>
                      <option value="CAR">Cars</option>
                      <option value="MOTORBIKE">Motorbikes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      min={0}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      min={0}
                      placeholder="∞"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Year</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      value={minYear}
                      onChange={(e) => setMinYear(e.target.value)}
                      min={1900}
                      max={new Date().getFullYear()}
                      placeholder="1900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-600">
              {total !== null && (
                <span>Showing {filteredVehicles.length} of {total} vehicles</span>
              )}
            </div>
            <div className="flex gap-2">
              {FILTERS.map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => handleFilter(filterOption.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterOption.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <VehicleSkeleton key={i} />
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => {
                  setSearch("");
                  setMinPrice("");
                  setMaxPrice("");
                  setMinYear("");
                  setMaxYear("");
                  setTypeFilter("ALL");
                  setFilter("ALL");
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredVehicles.map((vehicle) => (
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

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                {totalPages && (
                  <div className="text-gray-600 text-sm">
                    Page {page} of {totalPages}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePrev}
                    disabled={prevCursors.length === 0}
                  >
                    Previous
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleNext}
                    disabled={!nextCursor}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
} 