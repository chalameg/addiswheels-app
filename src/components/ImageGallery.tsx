"use client";
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes, FaExpand } from "react-icons/fa";

interface ImageGalleryProps {
  images: string[];
  vehicleName: string;
}

export default function ImageGallery({ images, vehicleName }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [modalImageLoading, setModalImageLoading] = useState(true);

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[selectedImageIndex] : null;

  // Reset image loading when selected image changes
  useEffect(() => {
    setImageLoading(true);
  }, [selectedImageIndex]);

  // Initialize loading state when images are first loaded
  useEffect(() => {
    if (hasImages) {
      setImageLoading(true);
    }
  }, [hasImages]);

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setShowImageModal(true);
    setModalImageLoading(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    if (!images) return;
    setModalImageIndex((prev) => (prev + 1) % images.length);
    setModalImageLoading(true);
  };

  const prevImage = () => {
    if (!images) return;
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setModalImageLoading(true);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showImageModal) return;
    
    switch (e.key) {
      case 'Escape':
        closeImageModal();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
    }
  };

  useEffect(() => {
    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);

  if (!hasImages) {
    return (
      <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-gray-500 text-lg">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          <img
            src={currentImage}
            alt={`${vehicleName} - Main view`}
            className="w-full h-64 sm:h-80 lg:h-96 object-cover relative z-10"
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {/* Overlay with expand button */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={() => openImageModal(selectedImageIndex)}
              className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-opacity-100 hover:scale-110"
            >
              <FaExpand className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>
        
        {/* Navigation arrows for main image */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <FaChevronLeft className="w-4 h-4 text-gray-800" />
            </button>
            <button
              onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <FaChevronRight className="w-4 h-4 text-gray-800" />
            </button>
          </>
        )}
      </div>
      
      {/* Enhanced Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative group overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                index === selectedImageIndex 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="relative w-full h-16 sm:h-20">
                {/* Loading state for thumbnail */}
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
                
                <img
                  src={image}
                  alt={`${vehicleName} - Image ${index + 1}`}
                  className="w-full h-full object-cover relative z-10 transition-transform duration-200 group-hover:scale-105"
                  onLoad={(e) => {
                    // Hide loading state when image loads
                    const target = e.target as HTMLImageElement;
                    const loadingDiv = target.previousElementSibling as HTMLElement;
                    if (loadingDiv) {
                      loadingDiv.style.display = 'none';
                    }
                  }}
                  onError={(e) => {
                    // Hide loading state on error
                    const target = e.target as HTMLImageElement;
                    const loadingDiv = target.previousElementSibling as HTMLElement;
                    if (loadingDiv) {
                      loadingDiv.style.display = 'none';
                    }
                  }}
                />
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <FaExpand className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              
              {/* Image counter */}
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Image counter */}
      <div className="text-center text-sm text-gray-600">
        {selectedImageIndex + 1} of {images.length} images
      </div>

      {/* Enhanced Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 p-3 rounded-full hover:bg-opacity-30 transition-all duration-200"
            >
              <FaTimes className="w-6 h-6 text-white" />
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-20 p-4 rounded-full hover:bg-opacity-30 transition-all duration-200"
                >
                  <FaChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-20 p-4 rounded-full hover:bg-opacity-30 transition-all duration-200"
                >
                  <FaChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Main image */}
            <div className="relative max-w-full max-h-full">
              {modalImageLoading && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              <img
                src={images[modalImageIndex]}
                alt={`${vehicleName} - Image ${modalImageIndex + 1}`}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  modalImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setModalImageLoading(false)}
                onError={() => setModalImageLoading(false)}
              />
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
              {modalImageIndex + 1} of {images.length}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setModalImageIndex(index);
                      setModalImageLoading(true);
                    }}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === modalImageIndex 
                        ? 'border-white' 
                        : 'border-white border-opacity-50 hover:border-opacity-75'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 