import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const lastNotificationId = useRef<number | null>(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newNotifications = data.notifications || [];
        
        // Check for new notifications (not read and not seen before)
        const unreadNotifications = newNotifications.filter(
          (notification: Notification) => !notification.read
        );

        // Show toast for new notifications
        unreadNotifications.forEach((notification: Notification) => {
          if (lastNotificationId.current === null || notification.id > lastNotificationId.current) {
            toast(notification.message, {
              icon: '🔔',
              duration: 5000,
              style: {
                background: '#fff',
                color: '#222',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
              },
            });
          }
        });

        // Update last seen notification ID
        if (newNotifications.length > 0) {
          lastNotificationId.current = Math.max(
            lastNotificationId.current || 0,
            ...newNotifications.map((n: Notification) => n.id)
          );
        }

        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state to mark all as read
        setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Poll for notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    unreadCount: notifications.filter(n => !n.read).length
  };
} 