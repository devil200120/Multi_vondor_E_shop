import React, { useState, useRef, useEffect } from "react";
import {
  AiOutlineMessage,
  AiOutlineClose,
  AiOutlineSend,
  AiOutlineRobot,
  AiOutlineStar,
  AiOutlineThunderbolt,
} from "react-icons/ai";
import { BsRobot, BsLightning } from "react-icons/bs";
import { HiOutlineSparkles } from "react-icons/hi";
import geminiService from "../../services/geminiService";

const FloatingAIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm your intelligent shopping assistant. I can help you find products, track orders, and answer any questions about your shopping experience!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [isOpen]);

  // Hide welcome message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const botResponse = await geminiService.generateResponse(inputMessage);

      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: botResponse,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 800); // Simulate typing delay
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(!isOpen);
      setIsAnimating(false);
    }, 150);
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp);
  };

  return (
    <>
      {/* Welcome Tooltip */}
      {showWelcome && !isOpen && (
        <div className="fixed bottom-24 right-6 z-40 animate-fadeInUp">
          <div className="relative">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 max-w-xs backdrop-blur-sm bg-opacity-95">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiOutlineSparkles className="text-white text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    Need help shopping?
                  </p>
                  <p className="text-xs text-gray-600">
                    Ask me anything about products, orders, or recommendations!
                  </p>
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <AiOutlineClose className="text-xs" />
                </button>
              </div>
            </div>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100"></div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Window */}
        {isOpen && (
          <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col animate-slideUpBounce overflow-hidden">
            {/* Header with Glassmorphism */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-4 rounded-t-2xl overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-2 left-4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
                <div className="absolute top-6 right-8 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
                <div className="absolute bottom-3 left-12 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping"></div>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <AiOutlineRobot className="text-xl text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-base flex items-center space-x-1">
                      <span>AI Assistant</span>
                      <HiOutlineSparkles className="text-yellow-300 text-sm animate-pulse" />
                    </h3>
                    <p className="text-xs text-white/80 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Online & Ready to Help</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleChat}
                  className="text-white/80 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90 p-1 rounded-full hover:bg-white/10"
                >
                  <AiOutlineClose className="text-xl" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/80 backdrop-blur-sm custom-scrollbar">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  } animate-messageSlide`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-lg">
                      <BsRobot className="text-white text-sm" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl text-sm shadow-lg ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md transform hover:scale-105 transition-transform"
                        : "bg-white/90 text-gray-800 border border-gray-100 rounded-bl-md backdrop-blur-sm hover:shadow-xl transition-shadow"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.text}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        message.sender === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center ml-2 flex-shrink-0 shadow-lg">
                      <span className="text-white text-xs font-bold">You</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Enhanced Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-lg animate-pulse">
                    <BsRobot className="text-white text-sm" />
                  </div>
                  <div className="bg-white/90 text-gray-800 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm backdrop-blur-sm shadow-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">AI is thinking</span>
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input Section */}
            <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100 rounded-b-2xl">
              <div className="flex space-x-3 items-end">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about shopping..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 bg-white/90 backdrop-blur-sm hover:border-blue-300"
                    disabled={isLoading}
                  />
                  {inputMessage && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <BsLightning className="text-blue-500 text-sm animate-pulse" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  <AiOutlineSend className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Floating Button */}
        <div className="relative">
          {/* Pulse Ring Animation */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20 ${
              isOpen ? "hidden" : ""
            }`}
          ></div>
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse opacity-30 ${
              isOpen ? "hidden" : ""
            }`}
          ></div>

          <button
            onClick={toggleChat}
            className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-500 transform ${
              isAnimating ? "scale-90" : "hover:scale-110"
            } ${
              isOpen
                ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rotate-180"
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 hover:shadow-blue-500/25"
            } active:scale-95`}
          >
            {/* Background Animation */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-white/5 animate-spin opacity-50"></div>

            {/* Icon with Animation */}
            <div className="relative z-10">
              {isOpen ? (
                <AiOutlineClose className="text-2xl transition-transform duration-300" />
              ) : (
                <div className="relative">
                  <AiOutlineMessage className="text-2xl transition-transform duration-300" />
                  {/* Notification Dot */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              )}
            </div>

            {/* Sparkle Effects */}
            {!isOpen && (
              <>
                <AiOutlineStar className="absolute -top-1 -left-1 text-yellow-300 text-xs animate-ping opacity-60" />
                <HiOutlineSparkles className="absolute -bottom-1 -right-1 text-yellow-300 text-xs animate-pulse opacity-70" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingAIChatbot;
