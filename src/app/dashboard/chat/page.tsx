'use client';

import { useState, useEffect } from 'react';
import { FaComments, FaUser, FaCar, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import ChatModal from '@/components/ChatModal';
import DashboardLayout from '@/components/DashboardLayout';

interface Conversation {
  vehicleId: number;
  vehicleName: string;
  otherUserId: number;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedChat, setSelectedChat] = useState<{
    vehicleId: number;
    vehicleName: string;
    otherUserId: number;
    otherUserName: string;
  } | null>(null);

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.userId);
      } catch {
        toast.error('Please log in to view chats');
        return;
      }
    } else {
      toast.error('Please log in to view chats');
      return;
    }

    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view chats');
        return;
      }

      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        toast.error('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const openChat = (conversation: Conversation) => {
    setSelectedChat(conversation);
    // Mark messages as read when opening chat
    markMessagesAsRead(conversation.vehicleId, conversation.otherUserId);
  };

  const markMessagesAsRead = async (vehicleId: number, otherUserId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId,
          otherUserId
        })
      });

      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading conversations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaComments className="text-blue-600 text-2xl" />
            <h1 className="text-3xl font-bold text-gray-900">My Conversations</h1>
          </div>
          <p className="text-gray-600">
            Chat with vehicle owners and renters about specific vehicles.
          </p>
        </div>

        {/* Warning Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <FaExclamationTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Important Reminder</h3>
              <p className="text-yellow-800 text-sm leading-relaxed">
                <strong>⚠️ AddisWheels does not handle payments.</strong> Please be cautious when sharing personal information or arranging rentals. All transactions are between you and the other party.
              </p>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaComments className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Conversations Yet</h2>
            <p className="text-gray-600 mb-6">
              Start chatting with vehicle owners or renters by visiting a vehicle's detail page and clicking "Start Chat".
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Vehicles
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={`${conversation.vehicleId}-${conversation.otherUserId}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => openChat(conversation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FaCar className="text-blue-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {conversation.vehicleName}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <FaUser className="w-4 h-4" />
                        <span>{conversation.otherUserName}</span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {truncateText(conversation.lastMessage)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                      <FaClock className="w-3 h-3" />
                      <span>{formatTime(conversation.lastMessageTime)}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openChat(conversation);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Open Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Modal */}
        {selectedChat && currentUserId && (
          <ChatModal
            isOpen={!!selectedChat}
            onClose={() => setSelectedChat(null)}
            vehicleId={selectedChat.vehicleId}
            vehicleName={selectedChat.vehicleName}
            otherUserId={selectedChat.otherUserId}
            otherUserName={selectedChat.otherUserName}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </DashboardLayout>
  );
} 