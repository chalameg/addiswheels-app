'use client';
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  FaCarSide, 
  FaListAlt, 
  FaUser, 
  FaSignOutAlt, 
  FaUsers,
  FaCar,
  FaChartBar,
  FaHome,
  FaClock,
  FaIdCard,
  FaCreditCard,
  FaCrown,
  FaBell,
  FaComments
} from "react-icons/fa";
import { useNotifications } from '@/hooks/useNotifications';
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export default function DashboardLayout({ children, isAdmin = false }: DashboardLayoutProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUserRole(payload.role);
          
          // Redirect admin users to admin dashboard if they're on regular dashboard
          if (payload.role === 'admin' && pathname === '/dashboard') {
            router.replace('/admin/dashboard');
          }
          
          // Redirect regular users away from admin routes
          if (payload.role !== 'admin' && pathname.startsWith('/admin')) {
            router.replace('/dashboard');
          }
        } catch {
          setIsLoggedIn(false);
          setUserRole('user');
        }
      } else {
        setIsLoggedIn(false);
        setUserRole('user');
        router.push('/login');
      }
    }
  }, [pathname, router]);

  // Fetch unread message count
  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      fetchUnreadMessageCount();
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadMessageCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isAdmin]);

  const fetchUnreadMessageCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const conversations = data.conversations || [];
        const totalUnread = conversations.reduce((sum: number, conv: any) => sum + conv.unreadCount, 0);
        setUnreadMessageCount(totalUnread);
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserRole('user');
    router.push("/");
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const adminNavItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: FaUsers },
    { label: "Users", href: "/admin/users", icon: FaUsers },
    { label: "Vehicles", href: "/admin/vehicles", icon: FaCar },
    { label: "Pending Vehicles", href: "/admin/vehicles/pending", icon: FaClock },
    { label: "Verifications", href: "/admin/verifications", icon: FaIdCard },
    { label: "Payments", href: "/admin/payments", icon: FaCreditCard },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: FaCrown },
  ];

  const userNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: FaListAlt },
    { href: '/profile', label: 'Profile', icon: FaUser },
    { href: '/vehicles/create', label: 'Create Vehicle', icon: FaCarSide },
    { href: '/my-vehicles', label: 'My Vehicles', icon: FaCar },
    { href: '/dashboard/chat', label: 'Chat', icon: FaComments, unreadCount: unreadMessageCount },
    { href: '/dashboard/notifications', label: 'Notifications', icon: FaBell },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0`}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/logo-simple.svg" alt="AddisWheels" className="h-6 sm:h-8 w-auto" />
              <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'User'} </span>Dashboard
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-full">
          {/* Back to Home Link */}
          <Link
            href="/"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-4 text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-b border-gray-100 pb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Back to Home</span>
          </Link>

          {isAdmin ? (
            // Admin Navigation
            <>
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 ${
                  pathname === '/admin/dashboard'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/users"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 ${
                  pathname === '/admin/users'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Users</span>
              </Link>
              <Link
                href="/admin/vehicles"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 ${
                  pathname === '/admin/vehicles'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Vehicles</span>
              </Link>
              <Link
                href="/admin/verifications"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 ${
                  pathname === '/admin/verifications'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Verifications</span>
              </Link>
              <Link
                href="/admin/payments"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 ${
                  pathname === '/admin/payments'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Payments</span>
              </Link>
              <Link
                href="/admin/subscriptions"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 ${
                  pathname === '/admin/subscriptions'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM14 5h6V1h-6v4z" />
                </svg>
                <span>Subscriptions</span>
              </Link>
            </>
          ) : (
            // User Navigation
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 ${
                  pathname === '/dashboard'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                <span>Dashboard</span>
              </Link>
              <Link
                href="/my-vehicles"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 ${
                  pathname === '/my-vehicles'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>My Vehicles</span>
              </Link>
              <Link
                href="/dashboard/chat"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 relative ${
                  pathname === '/dashboard/chat'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Chat</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard/notifications"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 relative ${
                  pathname === '/dashboard/notifications'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM14 5h6V1h-6v4z" />
                </svg>
                <span>Notifications</span>
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors mb-2 ${
                  pathname === '/profile'
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-900 hidden sm:block">AddisWheels</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
} 