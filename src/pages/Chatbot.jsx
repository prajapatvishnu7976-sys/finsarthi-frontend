import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, Trash2, MessageSquare } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { chatbotAPI } from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await chatbotAPI.getChatHistory({ limit: 20 });
      if (response.data.success) {
        const history = response.data.data.reverse();
        const formattedMessages = [];
        
        history.forEach((chat) => {
          formattedMessages.push(
            { type: 'user', text: chat.userMessage, id: chat._id + '_user' },
            { type: 'bot', text: chat.botResponse, id: chat._id + '_bot', chatId: chat._id }
          );
        });
        
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const tempUserMsg = { type: 'user', text: userMessage, id: Date.now() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const response = await chatbotAPI.sendMessage({ message: userMessage });
      
      if (response.data.success) {
        setMessages((prev) => [...prev, {
          type: 'bot',
          text: response.data.data.message,
          id: response.data.data.chatId,
          chatId: response.data.data.chatId
        }]);
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessages((prev) => [...prev, {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        id: Date.now(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "Should I buy ₹50,000 laptop?",
    "How can I save more money?",
    "Best investment options?",
    "Analyze my expenses",
    "PPF scheme details"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const clearHistory = async () => {
    if (window.confirm('Clear all chat history?')) {
      try {
        await chatbotAPI.clearHistory();
        setMessages([]);
      } catch (err) {
        console.error('Failed to clear history:', err);
      }
    }
  };

  if (historyLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading chat history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FinBot AI Assistant</h1>
                <p className="text-sm text-gray-600">Ask me anything about your finances</p>
              </div>
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Clear History
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-12">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to FinBot!</h2>
              <p className="text-gray-600 mb-8">Your personal AI financial advisor. Ask me anything about money, investments, savings, or financial planning.</p>
              
              <div className="grid grid-cols-1 gap-3">
                <p className="text-sm font-medium text-gray-700 text-left">Try asking:</p>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : message.error
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            {messages.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about your finances..."
                className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-lg"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="btn-primary px-8 py-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    Send
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-3 text-center">
              FinBot AI may make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;