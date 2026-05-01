'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/utils/store';
import Link from 'next/link';
import { paymentAPI } from '@/utils/api';
import AdminSidebar from '@/components/dashboard/AdminSidebar';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    processingOrders: 0,
    failedOrders: 0,
    averageOrderValue: 0,
  });

  const getOrderAmount = (order) => Number(order?.amount || 0);

  // Check if user is admin
  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, isInitializing, user, router]);

  // Fetch all orders
  useEffect(() => {
    if (isInitializing || !isAuthenticated || !user || user.role !== 'admin') {
      return;
    }
    fetchOrders();
  }, [isAuthenticated, isInitializing, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      try {
        const response = await paymentAPI.getAllOrders();
        if (response?.data) {
          const allOrders = Array.isArray(response.data)
            ? response.data
            : response.data.orders || [];
          setOrders(allOrders);
          calculateStats(
            allOrders,
            response.data.stats || null
          );
        }
      } catch (e) {
        console.log('[ADMIN] getAllOrders failed:', e.message);
        setOrders([]);
      }
    } catch (err) {
      console.error('[ADMIN] Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderList, apiStats = null) => {
    if (apiStats) {
      setStats(apiStats);
      return;
    }

    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce(
      (sum, order) => sum + getOrderAmount(order),
      0
    );
    const uniqueCustomers = new Set(orderList.map(o => o.email || o.customer_email)).size;
    const pending = orderList.filter(o => o.status === 'pending').length;
    const completed = orderList.filter(o => o.status === 'completed').length;
    const processing = orderList.filter(o => o.status === 'processing').length;
    const failed = orderList.filter(o => o.status === 'failed' || o.status === 'cancelled').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalOrders,
      totalRevenue,
      totalCustomers: uniqueCustomers,
      pendingOrders: pending,
      completedOrders: completed,
      processingOrders: processing,
      failedOrders: failed,
      averageOrderValue,
    });
  };

  if (loading || isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isInitializing && (!isAuthenticated || (user && user.role !== 'admin'))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar user={user} />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⚙️ Admin Dashboard</h1>
          <p className="text-gray-600">Manage all orders and customer data</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Total Orders</h3>
              <span className="text-3xl">📦</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500 mt-2">All time orders</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Total Revenue</h3>
              <span className="text-3xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">${(stats.totalRevenue || 0).toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Total earnings</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Avg Order Value</h3>
              <span className="text-3xl">💳</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">${(stats.averageOrderValue || 0).toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Average per order</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Total Customers</h3>
              <span className="text-3xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
            <p className="text-sm text-gray-500 mt-2">Unique customers</p>
          </div>
        </div>

        {/* Order Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Pending Orders</h3>
              <span className="text-3xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Awaiting fulfillment</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Processing</h3>
              <span className="text-3xl">⚙️</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.processingOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Currently being processed</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Completed</h3>
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Successfully delivered</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Failed/Cancelled</h3>
              <span className="text-3xl">❌</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.failedOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Failed or cancelled</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-600 text-red-700">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 mb-4">No orders yet</p>
              <p className="text-sm text-gray-400">Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Est. Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    const createdDate = order.created_at ? new Date(order.created_at) : new Date();
                    const estimatedDelivery = new Date(createdDate.getTime() + (60 * 60 * 1000)); // 1 hour delivery estimate
                    
                    return (
                      <tr key={order.id || index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {order.id?.substring(0, 8) || 'N/A'}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.customer_name || order.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.email || order.customer_email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {(order.currency || 'USD').toUpperCase()} {getOrderAmount(order).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'failed' || order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : new Date().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {estimatedDelivery.toLocaleDateString()} {estimatedDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">� Admin Dashboard Overview</h3>
          <p className="text-sm text-blue-800 mb-4">
            This dashboard provides a comprehensive view of all orders and business metrics:
          </p>
          <ul className="text-sm text-blue-800 space-y-2 ml-4">
            <li>✓ <strong>Total Orders:</strong> All orders placed by customers</li>
            <li>✓ <strong>Revenue Metrics:</strong> Total earnings and average order value</li>
            <li>✓ <strong>Order Status Breakdown:</strong> Pending, Processing, Completed, and Failed orders</li>
            <li>✓ <strong>Estimated Delivery:</strong> Automated 1-hour delivery estimate from order creation</li>
            <li>✓ <strong>Customer Tracking:</strong> Unique customers and their purchase history</li>
          </ul>
        </div>
        </div>
      </div>
    </div>
  );
}
