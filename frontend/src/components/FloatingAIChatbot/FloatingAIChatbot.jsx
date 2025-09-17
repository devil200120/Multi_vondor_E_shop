import React, { useState, useRef, useEffect } from "react";
import {
  AiOutlineMessage,
  AiOutlineClose,
  AiOutlineSend,
  AiOutlineRobot,
  AiOutlineStar,
  AiOutlineThunderbolt,
  AiOutlineShoppingCart,
  AiOutlineEye,
  AiOutlineCalendar,
} from "react-icons/ai";
import { BsRobot, BsLightning } from "react-icons/bs";
import { HiOutlineSparkles } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { backend_url } from "../../server";
import geminiService from "../../services/geminiService";

const FloatingAIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm your intelligent shopping assistant. I can help you with:\n\n🛍️ Product recommendations & price comparisons\n🏢 Seller information & best sellers\n📊 Platform statistics & insights\n📦 Order tracking & shopping guidance\n\nTry asking: 'How many sellers are there?' or 'Who is the best seller?' or 'Show me products under ₹500'",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Access products data from Redux
  const { allProducts } = useSelector((state) => state.products);
  const { allEvents } = useSelector((state) => state.events);
  const { sellers } = useSelector((state) => state.seller);

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

  // Intelligent product query processing
  const processProductQuery = (query) => {
    if (!allProducts || allProducts.length === 0) {
      return {
        isProductQuery: false,
        response:
          "I don't have access to product data right now. Please try again later.",
      };
    }

    const lowerQuery = query.toLowerCase();
    let isProductQuery = false;
    let response = "";
    let products = [];
    let statistics = null;

    // Check for seller-related queries
    if (
      lowerQuery.includes("seller") ||
      lowerQuery.includes("shop") ||
      lowerQuery.includes("vendor") ||
      lowerQuery.includes("merchant")
    ) {
      isProductQuery = true;

      if (
        lowerQuery.includes("how many") ||
        lowerQuery.includes("count") ||
        lowerQuery.includes("number of")
      ) {
        const sellerCount = sellers ? sellers.length : 0;
        const uniqueShops = allProducts
          ? [...new Set(allProducts.map((p) => p.shop?.name).filter(Boolean))]
              .length
          : 0;

        response = `🏢 Platform Statistics:\n\n📈 Total Registered Sellers: ${sellerCount}\n🏪 Active Shops: ${uniqueShops}\n📦 Total Products: ${
          allProducts.length
        }\n🎆 Active Events: ${allEvents ? allEvents.length : 0}`;

        statistics = {
          totalSellers: sellerCount,
          activeShops: uniqueShops,
          totalProducts: allProducts.length,
          totalEvents: allEvents ? allEvents.length : 0,
        };
      } else if (
        lowerQuery.includes("best") ||
        lowerQuery.includes("top") ||
        lowerQuery.includes("most popular") ||
        lowerQuery.includes("leading")
      ) {
        // Find best sellers by product count and sales
        const shopStats = {};
        allProducts.forEach((product) => {
          const shopName = product.shop?.name;
          if (shopName) {
            if (!shopStats[shopName]) {
              shopStats[shopName] = {
                name: shopName,
                productCount: 0,
                totalSales: 0,
                avgRating: 0,
                totalReviews: 0,
              };
            }
            shopStats[shopName].productCount++;
            shopStats[shopName].totalSales += product.sold_out || 0;

            if (product.reviews && product.reviews.length > 0) {
              const productAvgRating =
                product.reviews.reduce(
                  (sum, review) => sum + review.rating,
                  0
                ) / product.reviews.length;
              shopStats[shopName].avgRating += productAvgRating;
              shopStats[shopName].totalReviews += product.reviews.length;
            }
          }
        });

        const topShops = Object.values(shopStats)
          .map((shop) => ({
            ...shop,
            avgRating:
              shop.totalReviews > 0
                ? (shop.avgRating / shop.productCount).toFixed(1)
                : "No reviews",
          }))
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, 5);

        if (topShops.length > 0) {
          response = `🏆 Top Performing Sellers:\n\n${topShops
            .map(
              (shop, index) =>
                `${index + 1}. **${shop.name}**\n   📦 ${
                  shop.productCount
                } products | 📋 ${shop.totalSales} sales | ⭐ ${
                  shop.avgRating
                } rating`
            )
            .join("\n\n")}`;
        } else {
          response = "I couldn't find seller performance data right now.";
        }
      } else {
        // General seller info
        const shopNames = [
          ...new Set(allProducts.map((p) => p.shop?.name).filter(Boolean)),
        ];
        const randomShops = shopNames
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);

        response = `🏪 Here are some of our active sellers:\n\n${randomShops
          .map((shop, index) => `${index + 1}. **${shop}**`)
          .join("\n")}`;
      }

      return {
        isProductQuery: true,
        response,
        products: [],
        statistics,
        isStatisticsResponse: !!statistics,
      };
    }

    // Check for platform statistics queries
    if (
      lowerQuery.includes("statistic") ||
      lowerQuery.includes("total") ||
      lowerQuery.includes("platform") ||
      lowerQuery.includes("overview") ||
      lowerQuery.includes("summary")
    ) {
      isProductQuery = true;

      const totalProducts = allProducts.length;
      const totalEvents = allEvents ? allEvents.length : 0;
      const totalSellers = sellers ? sellers.length : 0;
      const uniqueShops = [
        ...new Set(allProducts.map((p) => p.shop?.name).filter(Boolean)),
      ].length;
      const totalSales = allProducts.reduce(
        (sum, product) => sum + (product.sold_out || 0),
        0
      );
      const avgPrice =
        totalProducts > 0
          ? (
              allProducts.reduce(
                (sum, product) => sum + product.discountPrice,
                0
              ) / totalProducts
            ).toFixed(2)
          : 0;

      const categories = [
        ...new Set(allProducts.map((p) => p.category).filter(Boolean)),
      ];

      response =
        `📊 **Platform Overview**\n\n` +
        `📦 **Products:** ${totalProducts} items\n` +
        `🏪 **Active Shops:** ${uniqueShops}\n` +
        `👥 **Registered Sellers:** ${totalSellers}\n` +
        `🎆 **Live Events:** ${totalEvents}\n` +
        `📋 **Total Sales:** ${totalSales} items sold\n` +
        `💰 **Average Price:** ₹${avgPrice}\n` +
        `🏷️ **Categories:** ${categories.length} categories`;

      statistics = {
        totalProducts,
        totalEvents,
        totalSellers,
        uniqueShops,
        totalSales,
        avgPrice,
        totalCategories: categories.length,
      };

      return {
        isProductQuery: true,
        response,
        products: [],
        statistics,
        isStatisticsResponse: true,
      };
    }

    // Check for event-related queries
    if (
      lowerQuery.includes("event") ||
      lowerQuery.includes("sale") ||
      lowerQuery.includes("discount") ||
      lowerQuery.includes("deal") ||
      lowerQuery.includes("offer") ||
      lowerQuery.includes("promotion")
    ) {
      isProductQuery = true;

      if (
        lowerQuery.includes("upcoming") ||
        lowerQuery.includes("future") ||
        lowerQuery.includes("next") ||
        lowerQuery.includes("coming")
      ) {
        // Show upcoming events
        const currentDate = new Date();
        const upcomingEvents = allEvents
          ? allEvents
              .filter((event) => {
                const startDate = new Date(event.start_Date);
                return startDate > currentDate;
              })
              .sort((a, b) => new Date(a.start_Date) - new Date(b.start_Date))
              .slice(0, 5)
          : [];

        if (upcomingEvents.length > 0) {
          response = `🎆 Upcoming Events & Sales:\n\n${upcomingEvents
            .map((event, index) => {
              const startDate = new Date(event.start_Date).toLocaleDateString();
              const endDate = new Date(event.Finish_Date).toLocaleDateString();
              const discount =
                event.originalPrice > event.discountPrice
                  ? Math.round(
                      ((event.originalPrice - event.discountPrice) /
                        event.originalPrice) *
                        100
                    )
                  : 0;
              return `${index + 1}. **${
                event.name
              }**\n   📅 ${startDate} - ${endDate}\n   💰 ₹${
                event.discountPrice
              } ${discount > 0 ? `(${discount}% OFF)` : ""}\n   📦 ${
                event.sold_out || 0
              } sold`;
            })
            .join("\n\n")}`;

          // Format events for display
          const formattedEvents = upcomingEvents.map((event) => ({
            id: event._id,
            name: event.name,
            price: event.discountPrice,
            originalPrice: event.originalPrice,
            image: event.images?.[0],
            startDate: event.start_Date,
            endDate: event.Finish_Date,
            sold: event.sold_out || 0,
            discount:
              event.originalPrice > event.discountPrice
                ? Math.round(
                    ((event.originalPrice - event.discountPrice) /
                      event.originalPrice) *
                      100
                  )
                : 0,
          }));

          return {
            isProductQuery: true,
            response,
            events: formattedEvents,
            isEventResponse: true,
          };
        } else {
          response =
            "🎆 No upcoming events scheduled at the moment. Check back soon for exciting new deals and promotions!";
        }
      } else if (
        lowerQuery.includes("active") ||
        lowerQuery.includes("live") ||
        lowerQuery.includes("current") ||
        lowerQuery.includes("now")
      ) {
        // Show currently active events
        const currentDate = new Date();
        const activeEvents = allEvents
          ? allEvents
              .filter((event) => {
                const startDate = new Date(event.start_Date);
                const endDate = new Date(event.Finish_Date);
                return currentDate >= startDate && currentDate <= endDate;
              })
              .slice(0, 5)
          : [];

        if (activeEvents.length > 0) {
          response = `🔥 Live Events & Sales:\n\n${activeEvents
            .map((event, index) => {
              const endDate = new Date(event.Finish_Date).toLocaleDateString();
              const discount =
                event.originalPrice > event.discountPrice
                  ? Math.round(
                      ((event.originalPrice - event.discountPrice) /
                        event.originalPrice) *
                        100
                    )
                  : 0;
              return `${index + 1}. **${
                event.name
              }**\n   ⏰ Ends: ${endDate}\n   💰 ₹${event.discountPrice} ${
                discount > 0 ? `(${discount}% OFF)` : ""
              }\n   📦 ${event.sold_out || 0} sold`;
            })
            .join("\n\n")}`;

          const formattedEvents = activeEvents.map((event) => ({
            id: event._id,
            name: event.name,
            price: event.discountPrice,
            originalPrice: event.originalPrice,
            image: event.images?.[0],
            startDate: event.start_Date,
            endDate: event.Finish_Date,
            sold: event.sold_out || 0,
            discount:
              event.originalPrice > event.discountPrice
                ? Math.round(
                    ((event.originalPrice - event.discountPrice) /
                      event.originalPrice) *
                      100
                  )
                : 0,
          }));

          return {
            isProductQuery: true,
            response,
            events: formattedEvents,
            isEventResponse: true,
          };
        } else {
          response =
            "🎆 No active events running right now. But we have exciting upcoming events - ask me about 'upcoming events'!";
        }
      } else if (
        (lowerQuery.includes("how many") ||
          lowerQuery.includes("count") ||
          lowerQuery.includes("total") ||
          lowerQuery.includes("statistics")) &&
        (lowerQuery.includes("event") || lowerQuery.includes("sale"))
      ) {
        // Event statistics
        const totalEvents = allEvents ? allEvents.length : 0;
        const currentDate = new Date();

        const activeEvents = allEvents
          ? allEvents.filter((event) => {
              const startDate = new Date(event.start_Date);
              const endDate = new Date(event.Finish_Date);
              return currentDate >= startDate && currentDate <= endDate;
            }).length
          : 0;

        const upcomingEvents = allEvents
          ? allEvents.filter((event) => {
              const startDate = new Date(event.start_Date);
              return startDate > currentDate;
            }).length
          : 0;

        const pastEvents = allEvents
          ? allEvents.filter((event) => {
              const endDate = new Date(event.Finish_Date);
              return endDate < currentDate;
            }).length
          : 0;

        response = `📊 **Event Statistics:**\n\n🎆 **Total Events:** ${totalEvents}\n🔥 **Active Events:** ${activeEvents}\n⏳ **Upcoming Events:** ${upcomingEvents}\n✅ **Past Events:** ${pastEvents}`;

        const eventStatistics = {
          totalEvents,
          activeEvents,
          upcomingEvents,
          pastEvents,
        };

        return {
          isProductQuery: true,
          response,
          statistics: eventStatistics,
          isStatisticsResponse: true,
          isEventStatistics: true,
        };
      } else {
        // General event information
        const allEventsData = allEvents ? allEvents.slice(0, 5) : [];

        if (allEventsData.length > 0) {
          response = `🎆 All Events:\n\n${allEventsData
            .map((event, index) => {
              const startDate = new Date(event.start_Date).toLocaleDateString();
              const discount =
                event.originalPrice > event.discountPrice
                  ? Math.round(
                      ((event.originalPrice - event.discountPrice) /
                        event.originalPrice) *
                        100
                    )
                  : 0;
              return `${index + 1}. **${
                event.name
              }**\n   📅 Starts: ${startDate}\n   💰 ₹${event.discountPrice} ${
                discount > 0 ? `(${discount}% OFF)` : ""
              }`;
            })
            .join("\n\n")}`;

          const formattedEvents = allEventsData.map((event) => ({
            id: event._id,
            name: event.name,
            price: event.discountPrice,
            originalPrice: event.originalPrice,
            image: event.images?.[0],
            startDate: event.start_Date,
            endDate: event.Finish_Date,
            sold: event.sold_out || 0,
            discount:
              event.originalPrice > event.discountPrice
                ? Math.round(
                    ((event.originalPrice - event.discountPrice) /
                      event.originalPrice) *
                      100
                  )
                : 0,
          }));

          return {
            isProductQuery: true,
            response,
            events: formattedEvents,
            isEventResponse: true,
          };
        } else {
          response =
            "🎆 No events available at the moment. Stay tuned for exciting upcoming events and promotions!";
        }
      }

      return {
        isProductQuery: true,
        response,
        events: [],
        isEventResponse: false,
      };
    }

    // Check for price-related queries
    if (
      lowerQuery.includes("cheap") ||
      lowerQuery.includes("low price") ||
      lowerQuery.includes("lowest price") ||
      lowerQuery.includes("under") ||
      lowerQuery.includes("below") ||
      lowerQuery.includes("less than")
    ) {
      isProductQuery = true;

      // Extract price if mentioned
      const priceMatch = lowerQuery.match(
        /(?:under|below|less than)\s*₹?\s*(\d+)/
      );
      const maxPrice = priceMatch ? parseInt(priceMatch[1]) : 1000;

      products = allProducts
        .filter((product) => product.discountPrice <= maxPrice)
        .sort((a, b) => a.discountPrice - b.discountPrice);

      if (products.length > 0) {
        response = `🔥 Found ${products.length} product${
          products.length > 1 ? "s" : ""
        } ${
          priceMatch ? `under ₹${maxPrice}` : "available"
        }. Here are all the options sorted by price:`;
      } else {
        response = `I couldn't find any products ${
          priceMatch ? `under ₹${maxPrice}` : "in that price range"
        }. Let me show you our cheapest options:`;
        products = allProducts.sort(
          (a, b) => a.discountPrice - b.discountPrice
        );
      }
    }
    // Check for higher price range queries
    else if (
      lowerQuery.includes("above") ||
      lowerQuery.includes("over") ||
      lowerQuery.includes("more than") ||
      lowerQuery.includes("higher than") ||
      lowerQuery.includes("expensive")
    ) {
      isProductQuery = true;

      // Extract price if mentioned
      const priceMatch = lowerQuery.match(
        /(?:above|over|more than|higher than)\s*₹?\s*(\d+)/
      );
      const minPrice = priceMatch ? parseInt(priceMatch[1]) : 1000;

      products = allProducts
        .filter((product) => product.discountPrice >= minPrice)
        .sort((a, b) => b.discountPrice - a.discountPrice);

      if (products.length > 0) {
        response = `💎 Found ${products.length} premium product${
          products.length > 1 ? "s" : ""
        } ${
          priceMatch ? `above ₹${minPrice}` : "in higher price range"
        }. Here are all the options sorted by price:`;
      } else {
        response = `I couldn't find any products ${
          priceMatch ? `above ₹${minPrice}` : "in that price range"
        }. Let me show you our most expensive options:`;
        products = allProducts.sort(
          (a, b) => b.discountPrice - a.discountPrice
        );
      }
    }
    // Check for category queries
    else if (
      lowerQuery.includes("category") ||
      lowerQuery.includes("type of") ||
      lowerQuery.includes("cement") ||
      lowerQuery.includes("construction") ||
      lowerQuery.includes("electronics") ||
      lowerQuery.includes("clothing")
    ) {
      isProductQuery = true;

      // Extract category from query
      let category = "";
      if (lowerQuery.includes("cement")) category = "Cement";
      else if (lowerQuery.includes("construction")) category = "Construction";
      else if (lowerQuery.includes("electronics")) category = "Electronics";

      if (category) {
        products = allProducts.filter((product) =>
          product.category?.toLowerCase().includes(category.toLowerCase())
        );
        response = `📦 Found ${products.length} product${
          products.length > 1 ? "s" : ""
        } in the ${category} category:`;
      } else {
        products = allProducts;
        response = "📦 Here are some popular products from various categories:";
      }
    }
    // Check for rating/quality queries
    else if (
      lowerQuery.includes("best") ||
      lowerQuery.includes("top rated") ||
      lowerQuery.includes("highest rating") ||
      lowerQuery.includes("quality")
    ) {
      isProductQuery = true;

      products = allProducts
        .filter((product) => product.reviews && product.reviews.length > 0)
        .map((product) => ({
          ...product,
          avgRating:
            product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length,
        }))
        .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));

      response = `⭐ Found ${products.length} top-rated product${
        products.length > 1 ? "s" : ""
      }:`;
    }
    // Check for popular/bestseller queries
    else if (
      lowerQuery.includes("popular") ||
      lowerQuery.includes("bestseller") ||
      lowerQuery.includes("best selling") ||
      lowerQuery.includes("trending")
    ) {
      isProductQuery = true;

      products = allProducts.sort(
        (a, b) => (b.sold_out || 0) - (a.sold_out || 0)
      );

      response = `🏆 Found ${products.length} popular product${
        products.length > 1 ? "s" : ""
      }:`;
    }
    // Check for general product search
    else if (
      lowerQuery.includes("product") ||
      lowerQuery.includes("show me") ||
      lowerQuery.includes("recommend") ||
      lowerQuery.includes("suggest")
    ) {
      isProductQuery = true;

      products = allProducts.sort(() => 0.5 - Math.random()); // Random selection

      response = "🛍️ Here are some great products I recommend:";
    }

    return {
      isProductQuery,
      response,
      products,
    };
  };

  // Format product response with UI
  const formatProductResponse = (response, products) => {
    if (!products || products.length === 0) {
      return (
        response +
        "\n\nSorry, I couldn't find any products matching your criteria."
      );
    }

    return {
      text: response,
      products: products.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.discountPrice,
        originalPrice: product.originalPrice,
        image: product.images?.[0],
        rating:
          product.reviews?.length > 0
            ? (
                product.reviews.reduce(
                  (sum, review) => sum + review.rating,
                  0
                ) / product.reviews.length
              ).toFixed(1)
            : "No reviews",
        reviewCount: product.reviews?.length || 0,
        sold: product.sold_out || 0,
      })),
    };
  };

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
      // First, check if it's a product-related query
      const productQuery = processProductQuery(inputMessage);

      if (productQuery.isProductQuery) {
        if (productQuery.statistics && productQuery.isStatisticsResponse) {
          // Handle statistics response
          setTimeout(() => {
            const botMessage = {
              id: Date.now() + 1,
              text: productQuery.response,
              sender: "bot",
              timestamp: new Date(),
              statistics: productQuery.statistics,
              isStatisticsResponse: true,
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
          }, 800);
        } else if (productQuery.products && productQuery.products.length > 0) {
          // Handle product recommendations
          const formattedProducts = productQuery.products.map((product) => ({
            id: product._id,
            name: product.name,
            price: product.discountPrice,
            originalPrice: product.originalPrice,
            image: product.images?.[0],
            rating:
              product.reviews?.length > 0
                ? (
                    product.reviews.reduce(
                      (sum, review) => sum + review.rating,
                      0
                    ) / product.reviews.length
                  ).toFixed(1)
                : "No reviews",
            reviewCount: product.reviews?.length || 0,
            sold: product.sold_out || 0,
          }));

          setTimeout(() => {
            const botMessage = {
              id: Date.now() + 1,
              text: productQuery.response,
              sender: "bot",
              timestamp: new Date(),
              products: formattedProducts,
              isProductResponse: true,
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
          }, 800);
        } else if (productQuery.events && productQuery.isEventResponse) {
          // Handle event responses
          setTimeout(() => {
            const botMessage = {
              id: Date.now() + 1,
              text: productQuery.response,
              sender: "bot",
              timestamp: new Date(),
              events: productQuery.events,
              isEventResponse: true,
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
          }, 800);
        } else {
          // Handle text-only responses (seller info, etc.)
          setTimeout(() => {
            const botMessage = {
              id: Date.now() + 1,
              text: productQuery.response,
              sender: "bot",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
          }, 800);
        }
      } else {
        // For non-product queries, use AI service
        const enhancedQuery = `${inputMessage}\n\nContext: This is a multi-vendor e-commerce platform. If this is about products, I have access to product data and can provide specific recommendations.`;
        const botResponse = await geminiService.generateResponse(enhancedQuery);

        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: botResponse,
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsTyping(false);
        }, 800);
      }
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
                <div key={message.id} className="space-y-3">
                  <div
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
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
                        <span className="text-white text-xs font-bold">
                          You
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Statistics Display */}
                  {message.sender === "bot" && message.statistics && (
                    <div className="ml-10">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 shadow-md backdrop-blur-sm animate-fadeIn">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                          <span className="text-lg mr-2">📊</span>
                          Platform Analytics
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {message.statistics.totalProducts !== undefined && (
                            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                              <div className="text-lg font-bold text-blue-600">
                                {message.statistics.totalProducts}
                              </div>
                              <div className="text-xs text-gray-600">
                                Products
                              </div>
                            </div>
                          )}
                          {message.statistics.totalSellers !== undefined && (
                            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                              <div className="text-lg font-bold text-green-600">
                                {message.statistics.totalSellers}
                              </div>
                              <div className="text-xs text-gray-600">
                                Sellers
                              </div>
                            </div>
                          )}
                          {message.statistics.activeShops !== undefined && (
                            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                              <div className="text-lg font-bold text-purple-600">
                                {message.statistics.activeShops}
                              </div>
                              <div className="text-xs text-gray-600">
                                Active Shops
                              </div>
                            </div>
                          )}
                          {message.statistics.totalEvents !== undefined && (
                            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                              <div className="text-lg font-bold text-orange-600">
                                {message.statistics.totalEvents}
                              </div>
                              <div className="text-xs text-gray-600">
                                Events
                              </div>
                            </div>
                          )}
                          {message.statistics.totalSales !== undefined && (
                            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                              <div className="text-lg font-bold text-red-600">
                                {message.statistics.totalSales}
                              </div>
                              <div className="text-xs text-gray-600">
                                Total Sales
                              </div>
                            </div>
                          )}
                          {message.statistics.avgPrice !== undefined && (
                            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                              <div className="text-lg font-bold text-yellow-600">
                                ₹{message.statistics.avgPrice}
                              </div>
                              <div className="text-xs text-gray-600">
                                Avg Price
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Recommendations */}
                  {message.sender === "bot" && message.products && (
                    <div className="ml-10 space-y-2">
                      {message.products.map((product, productIndex) => (
                        <div
                          key={product.id}
                          className="bg-white/95 border border-gray-200 rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm animate-fadeIn"
                          style={{ animationDelay: `${productIndex * 150}ms` }}
                        >
                          <div className="flex space-x-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.image ? (
                                <img
                                  src={`${backend_url}${product.image}`}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <AiOutlineShoppingCart className="text-xl" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-lg font-bold text-blue-600">
                                  ₹{product.price}
                                </span>
                                {product.originalPrice > product.price && (
                                  <span className="text-xs text-gray-500 line-through">
                                    ₹{product.originalPrice}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center space-x-1">
                                  <AiOutlineStar className="text-yellow-500 text-sm" />
                                  <span className="text-xs text-gray-600">
                                    {product.rating}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  ({product.reviewCount} reviews)
                                </span>
                                {product.sold > 0 && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    {product.sold} sold
                                  </span>
                                )}
                              </div>
                              <div className="flex space-x-2 mt-2">
                                <Link
                                  to={`/product/${product.id}`}
                                  className="flex-1 bg-blue-600 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                                >
                                  <AiOutlineEye className="inline mr-1" />
                                  View
                                </Link>
                                <button className="flex-1 bg-gray-100 text-gray-700 text-xs py-1.5 px-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                  <AiOutlineShoppingCart className="inline mr-1" />
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Quick Actions */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-3 mt-3">
                        <p className="text-sm text-gray-700 mb-2 font-medium">
                          💡 Try asking me:
                        </p>
                        <div className="space-y-1">
                          <button
                            onClick={() =>
                              setInputMessage("Show me products under ₹200")
                            }
                            className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            • "Show me products under ₹200"
                          </button>
                          <button
                            onClick={() =>
                              setInputMessage("How many sellers are there?")
                            }
                            className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            • "How many sellers are there?"
                          </button>
                          <button
                            onClick={() =>
                              setInputMessage("Who is the best seller?")
                            }
                            className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            • "Who is the best seller?"
                          </button>
                          <button
                            onClick={() =>
                              setInputMessage("Show me platform statistics")
                            }
                            className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            • "Show me platform statistics"
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Recommendations */}
                  {message.sender === "bot" && message.events && (
                    <div className="ml-10 space-y-2">
                      {message.events.map((event, eventIndex) => (
                        <div
                          key={event.id}
                          className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm animate-fadeIn"
                          style={{ animationDelay: `${eventIndex * 150}ms` }}
                        >
                          <div className="flex space-x-3">
                            <div className="w-16 h-16 bg-orange-100 rounded-lg overflow-hidden flex-shrink-0">
                              {event.image ? (
                                <img
                                  src={`${backend_url}${event.image}`}
                                  alt={event.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-orange-400 text-2xl">
                                  🎆
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">
                                {event.name}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-lg font-bold text-orange-600">
                                  ₹{event.price}
                                </span>
                                {event.originalPrice > event.price && (
                                  <>
                                    <span className="text-xs text-gray-500 line-through">
                                      ₹{event.originalPrice}
                                    </span>
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                      {event.discount}% OFF
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center space-x-1">
                                  <AiOutlineCalendar className="text-orange-500 text-sm" />
                                  <span className="text-xs text-gray-600">
                                    {new Date(
                                      event.startDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                {event.sold > 0 && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    {event.sold} sold
                                  </span>
                                )}
                              </div>
                              <div className="flex space-x-2 mt-2">
                                <Link
                                  to={`/product/${event.id}`}
                                  className="flex-1 bg-orange-600 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-orange-700 transition-colors text-center font-medium"
                                >
                                  <AiOutlineEye className="inline mr-1" />
                                  View Event
                                </Link>
                                <button className="flex-1 bg-gray-100 text-gray-700 text-xs py-1.5 px-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                  <AiOutlineShoppingCart className="inline mr-1" />
                                  Get Deal
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Event Quick Actions */}
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-3 mt-3">
                        <p className="text-sm text-gray-700 mb-2 font-medium">
                          🎯 Try asking me:
                        </p>
                        <div className="space-y-1">
                          <button
                            onClick={() =>
                              setInputMessage("Show upcoming events")
                            }
                            className="block w-full text-left text-xs text-orange-600 hover:text-orange-800 transition-colors"
                          >
                            • "Show upcoming events"
                          </button>
                          <button
                            onClick={() =>
                              setInputMessage("Active sales today")
                            }
                            className="block w-full text-left text-xs text-orange-600 hover:text-orange-800 transition-colors"
                          >
                            • "Active sales today"
                          </button>
                          <button
                            onClick={() =>
                              setInputMessage("How many events are there?")
                            }
                            className="block w-full text-left text-xs text-orange-600 hover:text-orange-800 transition-colors"
                          >
                            • "How many events are there?"
                          </button>
                        </div>
                      </div>
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
