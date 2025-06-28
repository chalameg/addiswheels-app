import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Message {
  id: number;
  text: string;
  timestamp: string;
  sender: {
    id: number;
    name: string;
  };
  receiver: {
    id: number;
    name: string;
  };
  vehicle: {
    id: number;
    brand: string;
    model: string;
  };
}

export function useMessages() {
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Start polling for new messages
    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/messages/recent', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const messages = data.messages || [];
          
          // Check for new messages
          if (messages.length > 0) {
            const latestMessage = messages[0];
            if (lastMessageId === null) {
              setLastMessageId(latestMessage.id);
            } else if (latestMessage.id > lastMessageId) {
              // New message received
              const newMessages = messages.filter((msg: Message) => msg.id > lastMessageId);
              
              newMessages.forEach((message: Message) => {
                // Only show notification if the current user is the receiver
                const currentUserId = JSON.parse(atob(token.split(".")[1])).userId;
                if (message.receiver.id === currentUserId) {
                  toast.success(
                    `New message from ${message.sender.name} about ${message.vehicle.brand} ${message.vehicle.model}`,
                    {
                      duration: 5000,
                      icon: '💬',
                    }
                  );
                }
              });
              
              setLastMessageId(latestMessage.id);
            }
          }
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [lastMessageId]);

  return { isPolling };
} 