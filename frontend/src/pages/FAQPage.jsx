import React, { useState, useEffect } from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import useFAQ from "../hooks/useFAQ";
import { toast } from "react-toastify";

// Custom CSS Animations for smooth FAQ interactions
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate3d(0, 30px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      max-height: 1000px;
      transform: translateY(0);
    }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -8px, 0);
    }
    70% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -4px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  }
`;

// Inject styles into the head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  if (!document.head.querySelector("style[data-faq-animations]")) {
    styleSheet.setAttribute("data-faq-animations", "true");
    document.head.appendChild(styleSheet);
  }
}

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header activeHeading={6} />
      <Faq />
      <Footer />
    </div>
  );
};

const Faq = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const {
    faqs,
    loading,
    error,
    fetchFAQs,
    fetchCategories,
    incrementView,
    markHelpful,
    markNotHelpful,
  } = useFAQ();

  // Handle search input change - ONLY update local state
  const handleSearchChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    setSearchTerm(value);
    // Don't do anything else to prevent re-renders
  };

  // Manual search trigger (could be triggered by button or enter key)
  const triggerSearch = () => {
    if (!isSearching) {
      performSearch(searchTerm, selectedCategory);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch();
    }
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    performSearch(searchTerm, category);
  };

  // Perform search function
  const performSearch = async (search, category) => {
    if (isSearching) return; // Prevent multiple simultaneous searches

    try {
      setIsSearching(true);
      const params = {};
      if (category && category !== "all") {
        params.category = category;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }

      console.log("Searching with params:", params);
      await fetchFAQs(params);
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initialize = async () => {
      if (!isInitialized) {
        try {
          // Load categories
          const categoriesData = await fetchCategories();
          setCategories(categoriesData);

          // Load initial FAQs
          await fetchFAQs({});

          setIsInitialized(true);
        } catch (err) {
          console.error("Failed to initialize FAQ page:", err);
          toast.error("Failed to load FAQ data");
        }
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const toggleTab = async (index, faqId) => {
    if (activeTab === index) {
      setActiveTab(null);
    } else {
      setActiveTab(index);
      // Increment view count when FAQ is opened
      if (faqId) {
        await incrementView(faqId);
      }
    }
  };

  const handleHelpful = async (faqId, e) => {
    e.stopPropagation();
    try {
      await markHelpful(faqId);
      toast.success("Thank you for your feedback!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      // Error toast already shown in useFAQ hook
      console.error("Voting error:", error);
    }
  };

  const handleNotHelpful = async (faqId, e) => {
    e.stopPropagation();
    try {
      await markNotHelpful(faqId);
      toast.success("Thank you for your feedback!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      // Error toast already shown in useFAQ hook
      console.error("Voting error:", error);
    }
  };

  const formatCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (loading) {
    return (
      <div className={`${styles.section} py-16`}>
        <div className="flex justify-center items-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.section} py-16`}>
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Unable to Load FAQs
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() =>
                fetchFAQs({ category: selectedCategory, search: searchTerm })
              }
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.section} py-6`}>
      {/* Hero Section */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-3">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
          Find answers to common questions about our services, orders, and
          policies. Can't find what you're looking for?
          <span className="text-blue-600 font-medium">
            {" "}
            Contact our support team.
          </span>
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-8 pr-12 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-sm placeholder-gray-400"
                  autoComplete="off"
                  spellCheck="false"
                />
                <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={triggerSearch}
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                >
                  {isSearching ? "..." : "Search"}
                </button>
              </div>
            </div>
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-sm bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {formatCategoryName(category.name)} ({category.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryChange(category.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedCategory === category.name
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {formatCategoryName(category.name)} ({category.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto">
        {faqs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.901-6.06 2.379L5.5 17.5H4a2 2 0 01-2-2v-1.382c0-.212.041-.42.118-.613M12 5a7.963 7.963 0 00-6.06 2.379L5.5 6.5H4c-1.105 0-2 .895-2 2v1.382c0 .212.041.42.118.613M12 5a7.963 7.963 0 016.06 2.379L18.5 6.5H20c1.105 0 2 .895 2 2v1.382a1 1 0 01-.118.613"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No FAQs Found
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {searchTerm
                ? "We couldn't find any FAQs matching your search. Try different keywords or browse all categories."
                : "No FAQs are available in this category at the moment."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={faq._id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 100}ms both`,
                }}
              >
                <button
                  className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-300 ease-out hover:bg-gray-50 group"
                  onClick={() => toggleTab(index, faq._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                          {faq.question}
                        </h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {formatCategoryName(faq.category)}
                        </span>
                      </div>

                      {faq.tags && faq.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {faq.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {faq.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{faq.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      )}

                      {faq.views > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span>{faq.views} views</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <div
                        className={`transform transition-all duration-500 ease-out ${
                          activeTab === index
                            ? "rotate-180 scale-110"
                            : "rotate-0 scale-100"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 transition-colors duration-300 ${
                            activeTab === index
                              ? "text-blue-600"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Enhanced Answer Section with Smooth Sliding Animation */}
                <div
                  className={`transition-all duration-700 ease-out transform origin-top ${
                    activeTab === index
                      ? "max-h-screen opacity-100 scale-y-100 translate-y-0"
                      : "max-h-0 opacity-0 scale-y-95 -translate-y-2"
                  } overflow-hidden`}
                >
                  <div
                    className={`px-4 pb-4 transition-all duration-500 ${
                      activeTab === index
                        ? "transform translate-y-0 opacity-100 delay-100"
                        : "transform translate-y-4 opacity-0"
                    }`}
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
                      <div className="prose max-w-none">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Feedback Section with Staggered Animation */}
                    <div
                      className={`mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-400 ${
                        activeTab === index
                          ? "transform translate-y-0 opacity-100 delay-200"
                          : "transform translate-y-2 opacity-0"
                      }`}
                    >
                      <span className="text-gray-700 font-medium text-sm">
                        Was this helpful?
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleHelpful(faq._id, e)}
                          className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 hover:shadow-sm ${
                            faq.userVote === "helpful"
                              ? "bg-green-100 text-green-700 border border-green-300 shadow-sm"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          <svg
                            className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span className="font-medium">
                            Yes ({faq.helpful || 0})
                          </span>
                        </button>
                        <button
                          onClick={(e) => handleNotHelpful(faq._id, e)}
                          className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 hover:shadow-sm ${
                            faq.userVote === "notHelpful"
                              ? "bg-red-100 text-red-700 border border-red-300 shadow-sm"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                        >
                          <svg
                            className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                          <span className="font-medium">
                            No ({faq.notHelpful || 0})
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQPage;
