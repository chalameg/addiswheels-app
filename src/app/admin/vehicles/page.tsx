"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCar, FaCheck, FaTimes, FaEye, FaTrash, FaSearch } from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import Pagination from "@/components/Pagination";
import PriceDisplay from "@/components/PriceDisplay";

interface Vehicle {
  id: number;
  type: "CAR" | "MOTORBIKE";
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  featured: boolean;
  images?: string[];
  createdAt: string;
  owner: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalVehicles: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [updatingFeatured, setUpdatingFeatured] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10"
      });

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/admin/vehicles?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
        setPagination(data.pagination);
      } else {
        console.error("Failed to fetch vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (vehicleId: number, newStatus: "APPROVED" | "REJECTED") => {
    setUpdatingStatus(vehicleId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setVehicles(prev => prev.map(vehicle => 
          vehicle.id === vehicleId ? { ...vehicle, status: newStatus } : vehicle
        ));
      } else {
        console.error("Failed to update vehicle status");
      }
    } catch (error) {
      console.error("Error updating vehicle status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleFeaturedToggle = async (vehicleId: number) => {
    setUpdatingFeatured(vehicleId);
    try {
      const token = localStorage.getItem("token");
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ featured: !vehicle.featured })
      });

      if (response.ok) {
        setVehicles(prev => prev.map(v => 
          v.id === vehicleId ? { ...v, featured: !v.featured } : v
        ));
      } else {
        console.error("Failed to update vehicle featured status");
      }
    } catch (error) {
      console.error("Error updating vehicle featured status:", error);
    } finally {
      setUpdatingFeatured(null);
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
        fetchVehicles();
      } else {
        console.error("Failed to delete vehicle");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case "REJECTED":
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      case "PENDING":
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout isAdmin={true}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading vehicles...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Management</h1>
          <p className="text-gray-600">Manage all vehicles and their approval status</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by brand, model, or owner name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button
              type="submit"
              className="px-4 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCar className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  All Vehicles ({pagination?.totalVehicles || 0})
                </h2>
              </div>
              {pagination && (
                <div className="text-sm text-gray-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {vehicle.images && vehicle.images.length > 0 ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={vehicle.images[0]}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <FaCar className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.brand} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.year} • {vehicle.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vehicle.owner?.name || 'Unknown Owner'}</div>
                        <div className="text-sm text-gray-500">{vehicle.owner?.email || 'No email'}</div>
                        {vehicle.owner?.phone && (
                          <div className="text-sm text-gray-500">📞 {vehicle.owner.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(vehicle.status)}
                        {vehicle.featured && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <PriceDisplay etbPrice={vehicle.pricePerDay} size="small" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        
                        {vehicle.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(vehicle.id, "APPROVED")}
                              disabled={updatingStatus === vehicle.id}
                              className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                              title="Approve vehicle"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(vehicle.id, "REJECTED")}
                              disabled={updatingStatus === vehicle.id}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                              title="Reject vehicle"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {vehicle.status === "APPROVED" && (
                          <button
                            onClick={() => handleFeaturedToggle(vehicle.id)}
                            disabled={updatingFeatured === vehicle.id}
                            className={`transition-colors disabled:opacity-50 ${
                              vehicle.featured 
                                ? "text-yellow-600 hover:text-yellow-900" 
                                : "text-gray-400 hover:text-yellow-600"
                            }`}
                            title={vehicle.featured ? "Remove from featured" : "Mark as featured"}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete vehicle"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {vehicles.length === 0 && (
            <div className="text-center py-12">
              <FaCar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter ? 'No vehicles found matching your criteria' : 'No vehicles found'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 