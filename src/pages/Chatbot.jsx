import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { chatbotAPI } from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
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
        const contextHistory = [];
        
        history.forEach((chat) => {
          formattedMessages.push(
            { 
              type: 'user', 
              text: chat.userMessage, 
              id: chat._id + '_user',
              timestamp: chat.createdAt
            },
            { 
              type: 'bot', 
              text: chat.botResponse, 
              id: chat._id + '_bot', 
              chatId: chat._id,
              intent: chat.intent,
              timestamp: chat.createdAt
            }
          );

          // Build context for Gemini
          contextHistory.push({
            role: 'user',
            content: chat.userMessage
          });
        });
        
        setMessages(formattedMessages);
        setConversationHistory(contextHistory);
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

    // Add user message immediately
    const tempUserMsg = { 
      type: 'user', 
      text: userMessage, 
      id: Date.now(),
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      // Send to Gemini-powered backend with conversation history
      const response = await chatbotAPI.sendMessage({ 
        message: userMessage,
        conversationHistory: conversationHistory.slice(-6) // Last 6 messages for context
      });
      
      if (response.data.success) {
        const botMessage = {
          type: 'bot',
          text: response.data.data.message,
          id: response.data.data.chatId,
          chatId: response.data.data.chatId,
          intent: response.data.data.intent,
          aiPowered: response.data.data.aiPowered,
          timestamp: response.data.data.timestamp
        };

        setMessages((prev) => [...prev, botMessage]);

        // Update conversation history for context
        setConversationHistory((prev) => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: response.data.data.message }
        ]);
      }
    } catch (err) {
      console.error('Send message error:', err);
      
      let errorMsg = 'Sorry, I encountered an error. ';
      if (err.response?.status === 401) {
        errorMsg += 'Please login again to continue chatting.';
      } else if (err.response?.data?.message) {
        errorMsg += err.response.data.message;
      } else {
        errorMsg += 'Please check your connection and try again.';
      }

      setMessages((prev) => [...prev, {
        type: 'bot',
        text: errorMsg,
        id: Date.now(),
        error: true,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "Can I afford to buy a ₹50,000 laptop?",
    "How can I save more money this month?",
    "Best tax-saving schemes under 80C",
    "Analyze my spending patterns",
    "Compare PPF vs Sukanya Samriddhi",
    "Should I invest in mutual funds?",
    "How to reduce my expenses?",
    "Best government schemes for me"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const clearHistory = async () => {
    if (window.confirm('Clear all chat history? (Starred chats will be preserved)')) {
      try {
        await chatbotAPI.clearHistory();
        setMessages([]);
        setConversationHistory([]);
      } catch (err) {
        console.error('Failed to clear history:', err);
        alert('Failed to clear chat history. Please try again.');
      }
    }
  };

  const formatMessage = (text) => {
    // Format message with proper line breaks and spacing
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (historyLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">Loading your AI assistant...</p>
            <p className="text-sm text-gray-500 mt-2">Powered by Gemini AI</p>
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
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-6 shadow-lg">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Finsarthi AI Assistant
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-normal">
                    Powered by Gemini
                  </span>
                </h1>
                <p className="text-white/90 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Your personal financial advisor - Ask me anything!
                </p>
              </div>
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all border border-white/20"
            >
              <Trash2 className="w-5 h-5" />
              Clear Chat
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {messages.length === 0 ? (
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageSquare className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Finsarthi AI! 👋</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                I'm your intelligent financial companion powered by <strong>Google Gemini AI</strong>. 
                I can analyze your expenses, provide personalized investment advice, and help you make smarter money decisions.
              </p>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
                <p className="text-sm font-semibold text-gray-700 text-left mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  Try these AI-powered questions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-left px-5 py-3.5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-gray-700 group-hover:text-primary-700 font-medium">
                        {question}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Gemini AI Active
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Context-Aware
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Personalized Advice
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-3xl px-6 py-4 rounded-2xl shadow-md ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                        : message.error
                        ? 'bg-red-50 border-2 border-red-200 text-red-700'
                        : 'bg-white border-2 border-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
                      {formatMessage(message.text)}
                    </p>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20">
                      <span className={`text-xs ${message.type === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.aiPowered && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          ✨ Gemini AI
                        </span>
                      )}
                      {message.intent && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {message.intent.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Animation */}
              {loading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white border-2 border-gray-100 rounded-2xl px-6 py-5 shadow-md">
                    <div className="flex gap-2 items-center">
                      <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <span className="ml-2 text-sm text-gray-600 font-medium">Gemini AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t-2 border-gray-200 p-6 shadow-lg">
          <div className="max-w-5xl mx-auto">
            {/* Quick Questions (when chat started) */}
            {messages.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {quickQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-50 hover:from-primary-50 hover:to-purple-50 border border-gray-300 hover:border-primary-400 rounded-full whitespace-nowrap transition-all shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your finances... (e.g., Can I afford a ₹30,000 phone?)"
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-base shadow-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="btn-primary px-8 py-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <Loader className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span className="font-semibold">Send</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              Powered by Google Gemini AI • Context-aware financial guidance based on your actual data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;