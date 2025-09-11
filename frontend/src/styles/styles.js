const styles = {
  // Layout & Container
  custom_container: "w-11/12 max-w-7xl hidden sm:block",
  section: "w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  
  // Typography - Unacademy Style
  heading: "text-3xl md:text-4xl lg:text-5xl font-bold font-Inter text-text-primary leading-tight",
  subheading: "text-xl md:text-2xl font-semibold font-Inter text-text-secondary leading-relaxed",
  body_text: "text-base font-normal font-Inter text-text-secondary leading-relaxed",
  small_text: "text-sm font-medium font-Inter text-text-muted",
  
  // Product Specific
  productTitle: "text-2xl font-semibold font-Inter text-text-primary hover:text-primary-500 transition-colors duration-200",
  productDiscountPrice: "font-bold text-xl text-primary-500 font-Inter",
  price: "font-medium text-base text-text-muted line-through pl-2",
  shop_name: "pt-2 text-sm text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200",
  
  // Navigation & Indicators
  active_indicator: "absolute bottom-0 left-0 h-1 w-full bg-primary-500 rounded-t-md transition-all duration-300",
  
  // Buttons - Modern Unacademy Style
  button: "inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md hover:transform hover:scale-105",
  
  button_secondary: "inline-flex items-center justify-center px-6 py-3 bg-white text-primary-500 font-medium rounded-lg border border-primary-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200",
  
  button_outline: "inline-flex items-center justify-center px-6 py-3 bg-transparent text-text-primary font-medium rounded-lg border border-secondary-300 hover:bg-secondary-50 hover:border-secondary-400 focus:outline-none focus:ring-2 focus:ring-secondary-300 focus:ring-offset-2 transition-all duration-200",
  
  // Cart & Shopping
  cart_button: "inline-flex items-center justify-center px-5 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 shadow-sm hover:shadow-md",
  cart_button_text: "text-white text-sm font-semibold",
  
  // Form Elements
  input: "w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 placeholder-text-muted bg-white",
  
  // Status & Indicators
  activeStatus: "w-3 h-3 rounded-full absolute top-1 right-1 bg-green-400 border-2 border-white shadow-sm",
  
  // Layout Utilities
  noramlFlex: "flex items-center",
  centerFlex: "flex items-center justify-center",
  spaceBetween: "flex items-center justify-between",
  
  // Cards & Containers
  card: "bg-white rounded-xl shadow-unacademy hover:shadow-unacademy-md transition-all duration-200 border border-secondary-100 overflow-hidden",
  card_padding: "p-6",
  
  // Navigation
  nav_link: "text-text-secondary hover:text-primary-500 font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-primary-50",
  nav_link_active: "text-primary-500 font-semibold bg-primary-50 px-3 py-2 rounded-md",
  
  // Badges & Labels
  badge: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
  badge_primary: "bg-primary-100 text-primary-800",
  badge_success: "bg-green-100 text-green-800",
  badge_warning: "bg-yellow-100 text-yellow-800",
  badge_error: "bg-red-100 text-red-800",
  
  // Animations & Effects
  hover_lift: "transition-transform duration-200 hover:transform hover:scale-105",
  fade_in: "animate-fadeIn",
  
  // Spacing & Layout
  section_padding: "py-12 md:py-16 lg:py-20",
  container_padding: "px-4 sm:px-6 lg:px-8",
  
  // Search
  search_container: "relative w-full max-w-2xl",
  search_input: "w-full px-4 py-3 pl-12 pr-4 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 placeholder-text-muted bg-white",
  search_icon: "absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted",
  search_results: "absolute top-full left-0 right-0 mt-2 bg-white border border-secondary-200 rounded-lg shadow-unacademy-lg z-50 max-h-96 overflow-y-auto",
  
  // Mobile
  mobile_menu: "fixed inset-0 z-50 bg-white",
  mobile_overlay: "fixed inset-0 bg-black bg-opacity-50 z-40",
};

export default styles;
