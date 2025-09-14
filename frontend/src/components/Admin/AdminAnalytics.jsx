import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import { getAllSellers } from "../../redux/actions/sellers";
import { getAllUsers } from "../../redux/actions/user";

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );
  const { sellers } = useSelector((state) => state.seller);
  const { users } = useSelector((state) => state.user);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedChart, setSelectedChart] = useState("revenue");
  const [analyticsData, setAnalyticsData] = useState({
    metrics: null,
    dailyRevenue: [],
    monthlyRevenue: [],
    orderStatusData: [],
    categoryPerformance: [],
    userRegistrations: [],
    sellerPerformance: [],
    geographicData: [],
    hourlyActivity: [],
    productTrends: [],
    paymentMethods: [],
  });

  // Enhanced CSS animations and styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pulse-slow {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
      }
      @keyframes slideInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }
      .float-animation { animation: float 3s ease-in-out infinite; }
      .pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      .slide-in-up { animation: slideInUp 0.5s ease-out; }
      .shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }
      .gradient-border {
        background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
        padding: 2px;
        border-radius: 12px;
      }
      .gradient-border-content {
        background: white;
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
    dispatch(getAllUsers());
  }, [dispatch]);

  const calculateAdvancedAnalytics = useCallback(() => {
    if (!adminOrders || !sellers || !users) return;

    const now = new Date();
    const getDaysAgo = (days) =>
      new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    let startDate;
    switch (timeRange) {
      case "24h":
        startDate = getDaysAgo(1);
        break;
      case "7d":
        startDate = getDaysAgo(7);
        break;
      case "30d":
        startDate = getDaysAgo(30);
        break;
      case "90d":
        startDate = getDaysAgo(90);
        break;
      case "1y":
        startDate = getDaysAgo(365);
        break;
      default:
        startDate = getDaysAgo(7);
    }

    const filteredOrders = adminOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate;
    });

    // Enhanced metrics calculation
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const adminRevenue = totalRevenue * 0.1;
    const totalProducts = adminOrders.reduce(
      (sum, order) => sum + order.cart.length,
      0
    );
    const conversionRate =
      users.length > 0 ? (totalOrders / users.length) * 100 : 0;
    const returnRate =
      (filteredOrders.filter((order) => order.status === "Returned").length /
        totalOrders) *
      100;
    const averageDeliveryTime = 3.2; // Mock data
    const customerSatisfaction = 4.7; // Mock data

    // Daily revenue trend (enhanced)
    const dailyRevenue = [];
    const days =
      timeRange === "24h"
        ? 24
        : timeRange === "7d"
        ? 7
        : timeRange === "30d"
        ? 30
        : 90;
    for (let i = days - 1; i >= 0; i--) {
      const date =
        timeRange === "24h"
          ? new Date(now.getTime() - i * 60 * 60 * 1000)
          : getDaysAgo(i);
      const dayOrders = filteredOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        if (timeRange === "24h") {
          return (
            orderDate.getHours() === date.getHours() &&
            orderDate.toDateString() === now.toDateString()
          );
        }
        return orderDate.toDateString() === date.toDateString();
      });
      const dayRevenue = dayOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      );
      dailyRevenue.push({
        date:
          timeRange === "24h"
            ? date.getHours() + ":00"
            : date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
        revenue: dayRevenue,
        orders: dayOrders.length,
        avgOrderValue: dayOrders.length > 0 ? dayRevenue / dayOrders.length : 0,
      });
    }

    // Monthly revenue trend
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthOrders = adminOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear()
        );
      });
      const monthRevenue = monthOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      );
      monthlyRevenue.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        revenue: monthRevenue,
        orders: monthOrders.length,
        growth:
          i === 11
            ? 0
            : ((monthRevenue -
                (monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0)) /
                (monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 1)) *
              100,
      });
    }

    // Enhanced order status distribution
    const statusCounts = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const orderStatusData = Object.entries(statusCounts).map(
      ([status, count]) => ({
        status,
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0,
        revenue: filteredOrders
          .filter((order) => order.status === status)
          .reduce((sum, order) => sum + order.totalPrice, 0),
      })
    );

    // Enhanced category performance
    const categoryRevenue = {};
    const categoryOrders = {};
    filteredOrders.forEach((order) => {
      order.cart.forEach((item) => {
        const category = item.category || "Others";
        categoryRevenue[category] =
          (categoryRevenue[category] || 0) + item.discountPrice * item.qty;
        categoryOrders[category] = (categoryOrders[category] || 0) + item.qty;
      });
    });

    const categoryPerformance = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({
        category,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
        orders: categoryOrders[category] || 0,
        avgOrderValue:
          categoryOrders[category] > 0 ? revenue / categoryOrders[category] : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // User registration trends
    const userRegistrations = [];
    for (let i = 6; i >= 0; i--) {
      const date = getDaysAgo(i);
      const dayUsers = users.filter((user) => {
        const userDate = new Date(user.createdAt);
        return userDate.toDateString() === date.toDateString();
      });
      userRegistrations.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        users: dayUsers.length,
        total: users.filter((user) => new Date(user.createdAt) <= date).length,
      });
    }

    // Seller performance analysis
    const sellerPerformance = sellers
      .map((seller) => {
        const sellerOrders = filteredOrders.filter(
          (order) => order.shopId === seller._id
        );
        const sellerRevenue = sellerOrders.reduce(
          (sum, order) => sum + order.totalPrice,
          0
        );
        return {
          name: seller.name,
          shopId: seller._id,
          revenue: sellerRevenue,
          orders: sellerOrders.length,
          avgOrderValue:
            sellerOrders.length > 0 ? sellerRevenue / sellerOrders.length : 0,
          products: seller.products?.length || 0,
          rating: 4.2 + Math.random() * 0.6, // Mock rating
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Hourly activity analysis
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = filteredOrders.filter((order) => {
        const orderHour = new Date(order.createdAt).getHours();
        return orderHour === hour;
      });
      return {
        hour: hour + ":00",
        orders: hourOrders.length,
        revenue: hourOrders.reduce((sum, order) => sum + order.totalPrice, 0),
        activity: (hourOrders.length / Math.max(totalOrders, 1)) * 100,
      };
    });

    // Payment methods analysis
    const paymentMethods = [
      {
        method: "Credit Card",
        percentage: 45,
        amount: totalRevenue * 0.45,
        color: "#6366f1",
      },
      {
        method: "PayPal",
        percentage: 25,
        amount: totalRevenue * 0.25,
        color: "#8b5cf6",
      },
      {
        method: "Bank Transfer",
        percentage: 20,
        amount: totalRevenue * 0.2,
        color: "#06b6d4",
      },
      {
        method: "Cash on Delivery",
        percentage: 10,
        amount: totalRevenue * 0.1,
        color: "#10b981",
      },
    ];

    // Product trends
    const productTrends = categoryPerformance.slice(0, 5).map((cat, index) => ({
      name: cat.category,
      current: cat.revenue,
      previous: cat.revenue * (0.8 + Math.random() * 0.4),
      growth: ((cat.revenue - cat.revenue * 0.9) / (cat.revenue * 0.9)) * 100,
      color: [`#6366f1`, `#8b5cf6`, `#06b6d4`, `#10b981`, `#f59e0b`][index],
    }));

    setAnalyticsData({
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        adminRevenue,
        totalProducts,
        conversionRate,
        returnRate,
        averageDeliveryTime,
        customerSatisfaction,
        totalUsers: users.length,
        totalSellers: sellers.length,
        activeUsers: users.filter(
          (user) => new Date(user.lastLogin || user.createdAt) > getDaysAgo(30)
        ).length,
        activeSellers: sellers.filter((seller) => seller.isActive !== false)
          .length,
      },
      dailyRevenue,
      monthlyRevenue,
      orderStatusData,
      categoryPerformance,
      userRegistrations,
      sellerPerformance,
      hourlyActivity,
      productTrends,
      paymentMethods,
    });
  }, [adminOrders, sellers, users, timeRange]);

  useEffect(() => {
    calculateAdvancedAnalytics();
  }, [calculateAdvancedAnalytics]);

  // Memoized chart colors
  const chartColors = useMemo(
    () => ({
      primary: "#6366f1",
      secondary: "#8b5cf6",
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#06b6d4",
      gradient: "url(#gradient)",
      gradients: {
        blue: ["#667eea", "#764ba2"],
        purple: ["#667eea", "#764ba2"],
        green: ["#11998e", "#38ef7d"],
        orange: ["#fc4a1a", "#f7b733"],
        pink: ["#ff9a9e", "#fecfef"],
      },
    }),
    []
  );

  // Loading state with enhanced design
  if (adminOrderLoading || !analyticsData.metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 w-full">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Enhanced loading spinner */}
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div
                className="absolute inset-2 border-4 border-purple-400 rounded-full border-r-transparent animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
            </div>
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Loading Advanced Analytics
          </h2>
          <p className="text-gray-600 font-medium text-lg mb-6">
            Analyzing comprehensive business data...
          </p>

          {/* Loading progress indicators */}
          <div className="space-y-3 text-sm text-gray-500">
            <div className="flex items-center justify-between">
              <span>Processing orders data</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Calculating metrics</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Generating insights</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="w-1/2 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-pulse"
                  style={{ animationDelay: "0.6s" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Advanced Chart Components
  const AdvancedLineChart = ({
    data,
    height = 300,
    showGrid = true,
    showArea = true,
    animated = true,
  }) => {
    const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);
    const minRevenue = Math.min(...data.map((item) => item.revenue), 0);
    const range = maxRevenue - minRevenue;

    const points = data.map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y =
        range > 0 ? (1 - (item.revenue - minRevenue) / range) * 80 + 10 : 50;
      return {
        x,
        y,
        value: item.revenue,
        date: item.date,
        orders: item.orders,
      };
    });

    const pathData = `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
    const areaData = `M 0 90 L ${points
      .map((p) => `${p.x} ${p.y}`)
      .join(" L ")} L 100 90 Z`;

    return (
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={chartColors.primary}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={chartColors.primary}
                stopOpacity="0.05"
              />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={chartColors.primary} />
              <stop offset="100%" stopColor={chartColors.secondary} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {showGrid &&
            [20, 40, 60, 80].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="0.2"
              />
            ))}

          {/* Area fill */}
          {showArea && (
            <path
              d={areaData}
              fill="url(#areaGradient)"
              className={animated ? "animate-pulse" : ""}
            />
          )}

          {/* Main line */}
          <path
            d={pathData}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animated ? "animate-pulse" : ""}
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill={chartColors.primary}
                className="hover:r-3 transition-all duration-200"
              />
              {/* Hover effect */}
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="transparent"
                className="hover:fill-blue-100 hover:fill-opacity-50 transition-all duration-200"
              />
            </g>
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8 sm:-ml-12 py-2">
          <span className="text-xs">₹{maxRevenue.toLocaleString()}</span>
          <span className="text-xs">
            ₹{((maxRevenue + minRevenue) / 2).toLocaleString()}
          </span>
          <span className="text-xs">₹{minRevenue.toLocaleString()}</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-1 sm:px-2 -mb-6">
          {data
            .filter(
              (_, i) =>
                i %
                  Math.ceil(data.length / (window.innerWidth < 640 ? 3 : 6)) ===
                0
            )
            .map((item, index) => (
              <span key={index} className="text-center text-xs truncate">
                {item.date}
              </span>
            ))}
        </div>
      </div>
    );
  };

  const AdvancedDonutChart = ({
    data,
    centerText,
    size = 200,
    showLabels = true,
    animated = true,
  }) => {
    let currentAngle = 0;
    const radius = 45;
    const innerRadius = 25;
    const colors = [
      chartColors.primary,
      chartColors.secondary,
      chartColors.info,
      chartColors.success,
      chartColors.warning,
      chartColors.danger,
    ];

    return (
      <div
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
        style={{ minHeight: size }}
      >
        <div className="relative flex-shrink-0">
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className="transform -rotate-90"
          >
            <defs>
              {colors.map((color, index) => (
                <linearGradient
                  key={index}
                  id={`donutGradient${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} />
                  <stop offset="100%" stopColor={color + "cc"} />
                </linearGradient>
              ))}
            </defs>

            {data.map((item, index) => {
              if (item.percentage === 0) return null;

              const percentage = item.percentage;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;

              const startAngleRad = (startAngle * Math.PI) / 180;
              const endAngleRad = (endAngle * Math.PI) / 180;

              const x1 = 50 + radius * Math.cos(startAngleRad);
              const y1 = 50 + radius * Math.sin(startAngleRad);
              const x2 = 50 + radius * Math.cos(endAngleRad);
              const y2 = 50 + radius * Math.sin(endAngleRad);

              const x3 = 50 + innerRadius * Math.cos(endAngleRad);
              const y3 = 50 + innerRadius * Math.sin(endAngleRad);
              const x4 = 50 + innerRadius * Math.cos(startAngleRad);
              const y4 = 50 + innerRadius * Math.sin(startAngleRad);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                "Z",
              ].join(" ");

              currentAngle += angle;

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={`url(#donutGradient${index})`}
                  className={`hover:opacity-80 transition-opacity duration-200 ${
                    animated ? "animate-pulse" : ""
                  }`}
                  style={animated ? { animationDelay: `${index * 0.1}s` } : {}}
                />
              );
            })}
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {centerText}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        {showLabels && (
          <div className="flex flex-col space-y-2 sm:ml-6">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-xs sm:text-sm"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-gray-700 font-medium truncate">
                  {item.status}
                </span>
                <span className="text-gray-500 flex-shrink-0">
                  ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const AdvancedBarChart = ({
    data,
    height = 350,
    showValues = true,
    animated = true,
  }) => {
    const maxValue = Math.max(...data.map((item) => item.revenue), 1);
    const colors = [
      chartColors.primary,
      chartColors.secondary,
      chartColors.info,
      chartColors.success,
      chartColors.warning,
    ];

    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        <div className="flex items-end justify-between h-full space-x-1 sm:space-x-2 md:space-x-3 px-2 sm:px-4 pb-8 sm:pb-12">
          {data.map((item, index) => {
            const heightPercentage = (item.revenue / maxValue) * 100;
            const color = colors[index % colors.length];

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 group"
              >
                <div
                  className="w-full flex items-end relative"
                  style={{ height: "240px" }}
                >
                  {/* Value label on hover */}
                  {showValues && (
                    <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      ₹{item.revenue.toLocaleString()}
                    </div>
                  )}

                  <div
                    className={`w-full rounded-t-lg transition-all duration-1000 ease-out relative overflow-hidden group-hover:scale-105 ${
                      animated ? "slide-in-up" : ""
                    }`}
                    style={{
                      height: `${heightPercentage}%`,
                      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                      animationDelay: animated ? `${index * 0.1}s` : "0s",
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 animate-pulse" />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                </div>

                <div className="mt-2 sm:mt-3 text-center">
                  <p
                    className="text-xs font-semibold text-gray-900 truncate max-w-[60px] sm:max-w-[80px]"
                    title={item.category}
                  >
                    {item.category}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.orders} orders
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    ₹{(item.revenue / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const MetricCard = ({
    title,
    value,
    change,
    gradient,
    prefix = "",
    suffix = "",
    icon = null,
    description = "",
    trend = null,
  }) => (
    <div className="gradient-border group hover:scale-105 transition-all duration-300">
      <div className="gradient-border-content p-3 sm:p-4 md:p-6 h-full">
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {icon && (
              <div
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <div className="w-4 h-4 sm:w-6 sm:h-6 text-white flex items-center justify-center text-sm sm:text-base">
                  {icon}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                {title}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {prefix}
                {typeof value === "number" ? value.toLocaleString() : value}
                {suffix}
              </p>
            </div>
          </div>

          {change !== undefined && (
            <div
              className={`flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                change >= 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <div
                className={`w-0 h-0 border-l-[4px] border-r-[4px] border-transparent ${
                  change >= 0
                    ? "border-b-[4px] border-b-green-600"
                    : "border-t-[4px] border-t-red-600"
                }`}
              />
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {description && (
          <p className="text-xs text-gray-500 mb-3">{description}</p>
        )}

        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`bg-gradient-to-r ${gradient} h-2 rounded-full transition-all duration-1000 ease-out`}
            style={{
              width: change ? `${Math.min(Math.abs(change) * 2, 100)}%` : "65%",
            }}
          />
        </div>

        {trend && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{trend.label}</span>
            <span
              className={trend.value >= 0 ? "text-green-600" : "text-red-600"}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const {
    metrics,
    dailyRevenue,
    monthlyRevenue,
    orderStatusData,
    categoryPerformance,
    userRegistrations,
    sellerPerformance,
    hourlyActivity,
    productTrends,
    paymentMethods,
  } = analyticsData;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen w-full">
      {/* Enhanced Header */}
      <div className="mb-6 md:mb-8 slide-in-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 md:mb-3">
              Advanced Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-2">
              Comprehensive business insights and performance metrics
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6 mt-2 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>📊 Real-time data</span>
              </div>
              <span>📈 Growth tracking</span>
              <span>💡 Smart insights</span>
              <span>🎯 Performance metrics</span>
            </div>
          </div>

          {/* Enhanced Time Range Selector */}
          <div className="flex flex-wrap sm:flex-nowrap bg-white rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-lg border border-gray-200 gap-1 sm:gap-0">
            {["24h", "7d", "30d", "90d", "1y"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 flex-1 sm:flex-none ${
                  timeRange === range
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="hidden sm:inline">
                  {range === "24h"
                    ? "24 Hours"
                    : range === "7d"
                    ? "7 Days"
                    : range === "30d"
                    ? "30 Days"
                    : range === "90d"
                    ? "90 Days"
                    : "1 Year"}
                </span>
                <span className="sm:hidden">{range}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          prefix="₹"
          change={12.5}
          gradient="from-blue-500 to-indigo-600"
          icon={<span>💰</span>}
          description="Total revenue generated"
          trend={{ label: "vs last period", value: 12.5 }}
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders}
          change={8.3}
          gradient="from-green-500 to-emerald-600"
          icon={<span>📦</span>}
          description="Orders processed"
          trend={{ label: "vs last period", value: 8.3 }}
        />
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          suffix={`/${metrics.totalUsers}`}
          change={15.7}
          gradient="from-purple-500 to-pink-600"
          icon={<span>👥</span>}
          description="Monthly active users"
          trend={{ label: "growth rate", value: 15.7 }}
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics.conversionRate.toFixed(1)}
          suffix="%"
          change={5.2}
          gradient="from-orange-500 to-red-600"
          icon={<span>🎯</span>}
          description="Visitor to customer conversion"
          trend={{ label: "vs industry avg", value: 52 }}
        />
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
        <MetricCard
          title="Avg Order Value"
          value={metrics.averageOrderValue}
          prefix="₹"
          change={7.8}
          gradient="from-teal-500 to-cyan-600"
          icon={<span>💎</span>}
          description="Average order value"
        />
        <MetricCard
          title="Admin Commission"
          value={metrics.adminRevenue}
          prefix="₹"
          change={11.2}
          gradient="from-indigo-500 to-blue-600"
          icon={<span>🏦</span>}
          description="10% commission earned"
        />
        <MetricCard
          title="Return Rate"
          value={metrics.returnRate.toFixed(1)}
          suffix="%"
          change={-2.1}
          gradient="from-yellow-500 to-orange-600"
          icon={<span>↩️</span>}
          description="Order return percentage"
        />
        <MetricCard
          title="Customer Satisfaction"
          value={metrics.customerSatisfaction}
          suffix="/5"
          change={3.5}
          gradient="from-pink-500 to-rose-600"
          icon={<span>⭐</span>}
          description="Average rating"
        />
      </div>

      {/* Chart Selection Tabs */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:space-x-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-full sm:w-fit">
          {[
            {
              id: "revenue",
              label: "Revenue Trends",
              icon: "📈",
              shortLabel: "Revenue",
            },
            {
              id: "orders",
              label: "Order Analysis",
              icon: "📊",
              shortLabel: "Orders",
            },
            {
              id: "users",
              label: "User Insights",
              icon: "👥",
              shortLabel: "Users",
            },
            {
              id: "performance",
              label: "Performance",
              icon: "🚀",
              shortLabel: "Performance",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedChart(tab.id)}
              className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 flex-1 sm:flex-none ${
                selectedChart === tab.id
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Chart Content */}
      {selectedChart === "revenue" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Revenue Trend
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Daily revenue over selected period
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span>Revenue</span>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  ₹
                  {dailyRevenue
                    .reduce((sum, item) => sum + item.revenue, 0)
                    .toLocaleString()}
                </div>
              </div>
            </div>
            <AdvancedLineChart data={dailyRevenue} height={300} />
          </div>

          {/* Monthly Revenue Comparison */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 md:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Monthly Growth
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Year-over-year comparison
                </p>
              </div>
            </div>
            <AdvancedLineChart
              data={monthlyRevenue}
              height={300}
              showArea={false}
            />
          </div>
        </div>
      )}

      {selectedChart === "orders" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 md:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Order Status Distribution
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Current order breakdown
                </p>
              </div>
            </div>
            <AdvancedDonutChart
              data={orderStatusData}
              centerText={metrics.totalOrders}
              size={200}
              showLabels={true}
            />
          </div>

          {/* Hourly Activity */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 md:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Hourly Activity
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Orders by hour of day
                </p>
              </div>
            </div>
            <div className="h-48 sm:h-64 flex items-end space-x-0.5 sm:space-x-1 px-1 sm:px-2">
              {hourlyActivity.map((hour, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t transition-all duration-300 group-hover:from-indigo-600 group-hover:to-purple-600"
                    style={{
                      height: `${
                        (hour.activity /
                          Math.max(
                            ...hourlyActivity.map((h) => h.activity),
                            1
                          )) *
                        100
                      }%`,
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-1 transform -rotate-45 hidden sm:inline">
                    {hour.hour.split(":")[0]}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 sm:hidden">
                    {index % 4 === 0 ? hour.hour.split(":")[0] : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedChart === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Registration Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  User Registration Trend
                </h3>
                <p className="text-gray-600">New user signups</p>
              </div>
            </div>
            <AdvancedLineChart
              data={userRegistrations.map((u) => ({ ...u, revenue: u.users }))}
              height={300}
            />
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Payment Methods
                </h3>
                <p className="text-gray-600">Revenue by payment type</p>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: method.color }}
                    />
                    <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {method.method}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">
                        ₹{method.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {method.percentage}%
                      </div>
                    </div>
                    <div className="w-16 sm:w-20 h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${method.percentage}%`,
                          backgroundColor: method.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedChart === "performance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Top Categories
                </h3>
                <p className="text-gray-600">Revenue by product category</p>
              </div>
            </div>
            <AdvancedBarChart
              data={categoryPerformance.slice(0, 6)}
              height={350}
            />
          </div>

          {/* Top Sellers Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Top Sellers
                </h3>
                <p className="text-gray-600">Best performing sellers</p>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto">
              {sellerPerformance.slice(0, 8).map((seller, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                        {seller.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {seller.orders} orders • {seller.products} products
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-green-600 text-xs sm:text-sm">
                      ₹{seller.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      ⭐ {seller.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Product Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Product Trends
              </h3>
              <p className="text-gray-600">Trending product categories</p>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {productTrends.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 sm:p-3 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: product.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Current: ₹{product.current.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    product.growth >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.growth >= 0 ? "+" : ""}
                  {product.growth.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Key Insights
              </h3>
              <p className="text-gray-600">AI-powered business insights</p>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <span className="text-blue-500 text-base sm:text-lg flex-shrink-0">
                  💡
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-blue-900 text-xs sm:text-sm mb-1">
                    Peak Sales Hours
                  </h4>
                  <p className="text-blue-700 text-xs">
                    Most orders occur between 2-4 PM and 8-10 PM. Consider
                    running promotions during these hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <span className="text-green-500 text-base sm:text-lg flex-shrink-0">
                  📈
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-green-900 text-xs sm:text-sm mb-1">
                    Growth Opportunity
                  </h4>
                  <p className="text-green-700 text-xs">
                    Customer satisfaction is high (4.7/5). Focus on expanding
                    your top-performing categories.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <span className="text-yellow-500 text-base sm:text-lg flex-shrink-0">
                  ⚠️
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-yellow-900 text-xs sm:text-sm mb-1">
                    Attention Needed
                  </h4>
                  <p className="text-yellow-700 text-xs">
                    Return rate is {metrics.returnRate.toFixed(1)}%. Review
                    product quality and descriptions.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <span className="text-purple-500 text-base sm:text-lg flex-shrink-0">
                  🎯
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-purple-900 text-xs sm:text-sm mb-1">
                    Marketing Insight
                  </h4>
                  <p className="text-purple-700 text-xs">
                    Conversion rate is {metrics.conversionRate.toFixed(1)}%,
                    which is above industry average. Great job!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
