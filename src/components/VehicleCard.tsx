"use client";
import React from "react";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
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

interface VehicleCardProps {
  vehicle: Vehicle;
  isSaved?: boolean;
  onSave?: (vehicleId: number, e: React.MouseEvent) => void;
  saving?: boolean;
  showFeaturedBadge?: boolean;
}

export default function VehicleCard({ 
  vehicle, 
  isSaved = false, 
  onSave, 
  saving = false,
  showFeaturedBadge = true 
}: VehicleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all duration-200 border border-gray-200 relative">
      {/* Featured Badge */}
      {vehicle.featured && showFeaturedBadge && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <FaStar className="w-3 h-3" />
            Featured
          </div>
        </div>
      )}

      {/* Save/Unsave Button */}
      {onSave && (
        <button
          onClick={(e) => onSave(vehicle.id, e)}
          disabled={saving}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 z-10"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
          ) : isSaved ? (
            <FaHeart className="text-red-500 text-lg" />
          ) : (
            <FaRegHeart className="text-gray-600 text-lg hover:text-red-500" />
          )}
        </button>
      )}
      
      <Link
        href={`/vehicles/${vehicle.id}`}
        className="flex flex-col flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        tabIndex={0}
        aria-label={`View details for ${vehicle.brand} ${vehicle.model}`}
      >
        {vehicle.images && vehicle.images.length > 0 ? (
          <img
            src={vehicle.images[0]}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-48 object-cover sm:h-56 md:h-64"
          />
        ) : (
          <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 flex items-center justify-center text-gray-500">
            <span className="font-medium">No Image</span>
          </div>
        )}
        <div className="p-4 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold mb-1 break-words text-gray-900">
            {vehicle.brand} {vehicle.model}
          </h2>
          <div className="text-base font-semibold text-gray-700 mb-2">
            {vehicle.type === "CAR" ? "Car" : "Motorbike"} • <span className="text-gray-900">{vehicle.year}</span>
          </div>
          <div className="mt-auto">
            <PriceDisplay etbPrice={vehicle.pricePerDay} size="medium" />
            <span className="text-gray-700 ml-1 font-medium">/day</span>
          </div>
        </div>
      </Link>
    </div>
  );
} 