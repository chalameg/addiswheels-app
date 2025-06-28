"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = "" }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsLoggedIn(true);
        setIsAdmin(payload.role === "admin");
        
        // Fetch user profile to get the actual name
        fetchUserProfile();
      } catch (error) {
        console.error("Error parsing token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserName(data.user.name || "User");
      } else {
        console.error("Failed to fetch user profile");
        setUserName("User");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserName("User");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName("");
    window.location.href = "/";
  };

  return (
    <nav className={`sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-2xl font-extrabold text-blue-600 tracking-tight hover:text-blue-700 transition-colors">
          <img src="/logo-simple.svg" alt="AddisWheels" className="h-8 w-auto" />
          <span className="sr-only">AddisWheels Home</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 lg:gap-6">
          <Link href="/vehicles" className="px-3 py-2 rounded font-medium text-gray-900 hover:text-blue-600 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700 transition-colors active:text-blue-800">
            Vehicles
          </Link>
          {isHomePage && (
            <>
              <a href="#how-it-works" className="px-3 py-2 rounded font-medium text-gray-900 hover:text-blue-600 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700 transition-colors active:text-blue-800">
                How It Works
              </a>
              <a href="#about" className="px-3 py-2 rounded font-medium text-gray-900 hover:text-blue-600 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700 transition-colors active:text-blue-800">
                About Us
              </a>
              <a href="#contact" className="px-3 py-2 rounded font-medium text-gray-900 hover:text-blue-600 hover:bg-blue-50 focus:bg-blue-100 focus:text-blue-700 transition-colors active:text-blue-800">
                Contact
              </a>
            </>
          )}
          
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="ml-4 px-4 py-2 rounded font-semibold border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700 transition-colors">
                Login
              </Link>
              <Link href="/register" className="ml-2 px-4 py-2 rounded font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-800 transition-colors">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {isAdmin ? (
                <Link href="/admin/dashboard" className="ml-4 px-4 py-2 rounded font-semibold border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700 transition-colors">
                  Admin Dashboard
                </Link>
              ) : (
                <Link href="/dashboard" className="ml-4 px-4 py-2 rounded font-semibold border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700 transition-colors">
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-2 ml-2">
                <div className="relative group">
                  <button
                    className="px-4 py-2 rounded font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200 focus:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <FaUser className="w-4 h-4" />
                    <span>{userName}</span>
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-900 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors border border-red-200 hover:border-red-300"
                  title="Sign Out"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center px-3 py-2 border border-blue-600 rounded text-blue-600 hover:bg-blue-50 focus:bg-blue-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow px-4 pb-4 flex flex-col gap-2">
          <div className="py-2">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-900 hover:bg-gray-50 rounded-lg font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/vehicles"
              className="block px-3 py-2 text-gray-900 hover:bg-gray-50 rounded-lg font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Vehicles
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-900 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/my-vehicles"
                  className="block px-3 py-2 text-gray-900 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Vehicles
                </Link>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-gray-900 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-gray-900 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 