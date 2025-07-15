'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/gemini';

interface ChatbotProps {
  className?: string;
}

// Component to format chatbot messages with proper styling
const MessageFormatter: React.FC<{ content: string }> = ({ content }) => {
  const formatContent = (text: string) => {
    // Split content into lines
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Handle numbered lists (1. 2. 3. etc.)
      const numberedListMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numberedListMatch) {
        // Process bold text within the numbered list content
        const content = numberedListMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <div key={lineIndex} className="flex items-start space-x-2 mb-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
              {numberedListMatch[1]}
            </span>
            <span 
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        );
      }
      
      // Handle bullet points (* or -)
      const bulletMatch = line.match(/^[\*\-]\s+(.+)$/);
      if (bulletMatch) {
        // Process bold text within bullet point content
        const content = bulletMatch[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <div key={lineIndex} className="flex items-start space-x-2 mb-2">
            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
            <span 
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        );
      }

      // Handle section headers (lines that end with :)
      if (line.trim().endsWith(':') && line.trim().length > 3) {
        return (
          <h4 key={lineIndex} className="font-semibold text-sm mb-2 mt-3 text-blue-700">
            {line}
          </h4>
        );
      }
      
      // Handle bold text that ends with colon (**text:**)
      const boldHeaderMatch = line.match(/^\*\*(.*?)\*\*:\s*(.*)$/);
      if (boldHeaderMatch) {
        return (
          <div key={lineIndex} className="mb-2">
            <h4 className="font-semibold text-sm text-blue-700">{boldHeaderMatch[1]}:</h4>
            {boldHeaderMatch[2] && (
              <p className="text-sm mt-1">{boldHeaderMatch[2]}</p>
            )}
          </div>
        );
      }
      
      // Handle important notes (lines starting with "Important" or containing "!")
      if (line.trim().startsWith('Important') || (line.includes('!') && line.length < 100)) {
        return (
          <div key={lineIndex} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 rounded-r">
            <p className="text-sm text-yellow-800 font-medium">{line}</p>
          </div>
        );
      }
      
      // Handle sub-bullet points (indented with spaces)
      const subBulletMatch = line.match(/^\s+[\*\-]\s+(.+)$/);
      if (subBulletMatch) {
        // Process bold text within sub-bullet point content
        const content = subBulletMatch[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <div key={lineIndex} className="flex items-start space-x-2 mb-2 ml-4">
            <span className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></span>
            <span 
              className="text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        );
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <div key={lineIndex} className="h-2"></div>;
      }
      
      // Handle bold text (**text**) - process this last to avoid conflicts
      if (line.includes('**')) {
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <p 
            key={lineIndex} 
            className="text-sm mb-2"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }
      
      // Regular text
      return (
        <p key={lineIndex} className="text-sm mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="space-y-1">
      {formatContent(content)}
    </div>
  );
};

export default function Chatbot({ className = '' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if chatbot is enabled
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_CHATBOT === 'true';

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      });

      const data = await response.json();

      if (response.ok && data.content) {
        const assistantMessage: ChatMessage = {
          role: 'model', // Gemini expects 'model' for assistant
          content: data.content
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Handle error
        const errorMessage: ChatMessage = {
          role: 'model', // Error from assistant
          content: `Sorry, I encountered an error: ${data.error || 'Unknown error'}`
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Don't render if chatbot is disabled
  if (!isEnabled) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">AddisWheels Assistant</h3>
                <p className="text-xs text-blue-100">Ask me about bookings, vehicles, payments, and more!</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-blue-100 hover:text-white transition-colors"
              title="Clear chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">How can I help you today?</p>
                <p className="text-xs mt-2">Ask about vehicle bookings, payments, or subscriptions</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <MessageFormatter content={message.content} />
                  </div>
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 