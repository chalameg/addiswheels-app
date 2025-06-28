"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUsers, FaCar, FaClock, FaIdCard, FaCreditCard, FaCrown } from "react-icons/fa";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    pendingApprovals: 0,
    pendingVerifications: 0,
    pendingPayments: 0,
    pendingSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const [usersRes, vehiclesRes, paymentsRes, subscriptionsRes] = await Promise.all([
        fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/vehicles", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/admin/payments?status=PENDING", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/admin/subscriptions?status=PENDING", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const usersData = await usersRes.json();
      const vehiclesData = await vehiclesRes.json();
      const paymentsData = await paymentsRes.json();
      const subscriptionsData = await subscriptionsRes.json();

      const users = usersData.users || [];
      const vehicles = vehiclesData.vehicles || [];
      const pendingVehicles = vehicles.filter((v: any) => v.status === 'PENDING');
      const pendingVerifications = users.filter((u: any) => u.verificationStatus === 'PENDING');
      const pendingPayments = paymentsData.payments?.length || 0;
      const pendingSubscriptions = subscriptionsData.subscriptions?.length || 0;

      setAnalytics({
        totalUsers: users.length,
        totalVehicles: vehicles.length,
        pendingApprovals: pendingVehicles.length,
        pendingVerifications: pendingVerifications.length,
        pendingPayments,
        pendingSubscriptions
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout isAdmin={true}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your platform&apos;s key metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <FaUsers className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalVehicles}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <FaCar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.pendingApprovals}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <FaClock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.pendingVerifications}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <FaIdCard className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.pendingPayments}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <FaCreditCard className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.pendingSubscriptions}</p>
              </div>
              <div className="p-3 rounded-full bg-indigo-50">
                <FaCrown className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                <p className="text-gray-600">Manage user accounts</p>
              </div>
            </Link>

            <Link
              href="/admin/vehicles"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Vehicles</h3>
                <p className="text-gray-600">Manage vehicle listings</p>
              </div>
            </Link>

            <Link
              href="/admin/verifications"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Verifications</h3>
                <p className="text-gray-600">Review user documents</p>
              </div>
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
                <p className="text-gray-600">Review payment submissions</p>
              </div>
            </Link>

            <Link
              href="/admin/subscriptions"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM14 5h6V1h-6v4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Subscriptions</h3>
                <p className="text-gray-600">Manage subscription plans</p>
              </div>
            </Link>

            <Link
              href="/admin/vehicles/pending"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending Vehicles</h3>
                <p className="text-gray-600">Review pending approvals</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 